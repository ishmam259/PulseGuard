// ═══════════════════════════════════════════════════════════
// PulseGuard AI — Conduit /sync loop
// ═══════════════════════════════════════════════════════════
//
// One process-singleton that long-polls Conduit's /sync and
// keeps an in-memory presence + typing snapshot, exposed to the
// /api/chat/presence route. Started lazily on the first patient
// login. If the loop is killed, ensureStarted() will respawn it
// the next time it's called.
//
// TODO: replace the per-process singleton with a Redis-backed
// pub/sub when we run more than one Node instance.

const TYPING_TTL_MS = 5_000; // matches Conduit's default typing-notification window
const PRESENCE_TTL_MS = 30_000;
const POLL_TIMEOUT_MS = 25_000;

let started = false;
let matrixBaseUrl = null;
let getToken = null; // async () => { accessToken, userId }

const onlineUsers = new Map(); // userId -> lastSeenMs
const typingByRoom = new Map(); // roomId -> Map(userId -> lastSeenMs)

function rememberPresence(userId) {
  if (!userId) return;
  onlineUsers.set(userId, Date.now());
}

function rememberTyping(roomId, userId) {
  if (!roomId || !userId) return;
  let m = typingByRoom.get(roomId);
  if (!m) { m = new Map(); typingByRoom.set(roomId, m); }
  m.set(userId, Date.now());
}

function rememberTypingStop(roomId, userId) {
  if (!roomId || !userId) return;
  const m = typingByRoom.get(roomId);
  if (m) m.delete(userId);
}

function sweep() {
  const now = Date.now();
  for (const [uid, last] of onlineUsers) {
    if (now - last > PRESENCE_TTL_MS) onlineUsers.delete(uid);
  }
  for (const [room, m] of typingByRoom) {
    for (const [uid, last] of m) {
      if (now - last > TYPING_TTL_MS) m.delete(uid);
    }
    if (m.size === 0) typingByRoom.delete(room);
  }
}

async function runOnce(nextBatch) {
  const { accessToken, userId: selfId } = await getToken();
  const qs = new URLSearchParams({ timeout: String(POLL_TIMEOUT_MS) });
  if (nextBatch) qs.set("since", nextBatch);
  else qs.set("filter", JSON.stringify({ presence: { types: ["m.presence"] } }));

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), POLL_TIMEOUT_MS + 5_000);
  try {
    const res = await fetch(`${matrixBaseUrl}/_matrix/client/v3/sync?${qs.toString()}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: ac.signal,
    });
    clearTimeout(timer);

    if (res.status === 401) {
      throw Object.assign(new Error("unauthorized"), { status: 401 });
    }
    if (!res.ok) {
      throw new Error(`sync failed: ${res.status}`);
    }
    const body = await res.json();

    // Presence events (first sync with filter dumps current state).
    for (const ev of Object.values(body.presence?.events || [])) {
      const { sender, content } = ev;
      if (!sender || !content) continue;
      if (content.presence === "online") rememberPresence(sender);
      else if (content.presence === "offline") onlineUsers.delete(sender);
    }

    // Mark the service token's own user as online — first poll only,
    // since subsequent presence changes arrive via events.
    if (!nextBatch && selfId) rememberPresence(selfId);

    // Ephemeral: typing notifications per joined room.
    for (const [roomId, evs] of Object.entries(body.rooms?.join || {})) {
      for (const ev of evs.ephemeral?.events || []) {
        if (ev.type !== "m.typing") continue;
        const uids = ev.content?.user_ids || [];
        if (uids.length === 0) {
          rememberTypingStop(roomId, selfId); // no one is typing in this room
        } else {
          for (const uid of uids) rememberTyping(roomId, uid);
        }
      }
    }

    sweep();
    return body.next_batch;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

async function loop() {
  let nextBatch = null;
  let backoff = 1000;
  while (started) {
    try {
      nextBatch = await runOnce(nextBatch);
      backoff = 1000;
    } catch (err) {
      console.warn(`[conduit-sync] loop error: ${err.message || err}; retrying in ${backoff}ms`);
      await new Promise((r) => setTimeout(r, backoff));
      backoff = Math.min(backoff * 2, 30_000);
      nextBatch = null; // restart from the beginning of the latest batch
    }
  }
}

function ensureStarted(baseUrl, tokenGetter) {
  if (started) return;
  if (!baseUrl) throw new Error("MATRIX_BASE_URL required");
  if (typeof tokenGetter !== "function") throw new Error("tokenGetter required");
  matrixBaseUrl = baseUrl.replace(/\/$/, "");
  getToken = tokenGetter;
  started = true;
  console.log(`[conduit-sync] starting (baseUrl=${matrixBaseUrl})`);
  // Don't await — fire and forget.
  loop().catch((err) => {
    console.error("[conduit-sync] loop crashed:", err);
    started = false;
  });
}

function getPresenceSnapshot() {
  sweep();
  return Array.from(onlineUsers.keys());
}

function getTypingSnapshot(roomId) {
  sweep();
  return Array.from(typingByRoom.get(roomId)?.keys() || []);
}

function _stopForTests() {
  started = false;
}

module.exports = {
  ensureStarted,
  getPresenceSnapshot,
  getTypingSnapshot,
  _stopForTests,
};
