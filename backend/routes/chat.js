// ═══════════════════════════════════════════════════════════
// PulseGuard AI — Community Chat (Matrix Conduit proxy)
// ═══════════════════════════════════════════════════════════
//
// All Conduit traffic flows through this route. The browser never
// talks to Conduit directly — keeps CORS simple and keeps
// CHAT_SECRET/JWT off the wire.

const { Router } = require("express");
const { randomUUID, randomBytes } = require("crypto");
const { authenticate, requireRole } = require("../middleware/auth");
const bcrypt = require("bcryptjs");
const pool = require("../db/pool");
const {
  ensureStarted,
  getPresenceSnapshot,
  getTypingSnapshot,
} = require("../services/conduitSync");

const router = Router();

const MATRIX_BASE_URL = (process.env.MATRIX_BASE_URL || "http://localhost:6167").replace(/\/$/, "");
const GLOBAL_CHAT_ROOM_ID = process.env.GLOBAL_CHAT_ROOM_ID || "!pulseguard-global:localhost";

console.log(`[chat] module loaded — MATRIX_BASE_URL=${MATRIX_BASE_URL} GLOBAL_CHAT_ROOM_ID=${GLOBAL_CHAT_ROOM_ID}`);

// ────────────────────────────────────────────────────────────
// Per-user Conduit access token cache. Process-local.
// TODO: swap to Redis when we run >1 Node instance.
// Each entry expires 60s before the Conduit token does, so a
// stale entry is never used.
// ────────────────────────────────────────────────────────────
const tokenCache = new Map(); // userId -> { conduitAccessToken, conduitUserId, expiresAt }

// Single-flight for global-room bootstrap.
const roomBootstrap = new Map(); // roomId -> Promise<string>

// Resolved room id cache. The first /rooms/join call returns the
// concrete room_id (e.g. "!R7xKfORUlzncK78yr7:localhost") which we
// cache so subsequent calls don't re-probe the directory and don't
// re-attempt createRoom (which would fail with M_ROOM_IN_USE).
let resolvedRoomId = null;

function patientConduitId(user) {
  return `patient_${user.id}`;
}

// ── Conduit HTTP helper ──────────────────────────────────────
async function conduitFetch(method, path, { body, token } = {}) {
  const url = `${MATRIX_BASE_URL}${path}`;
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 10_000);
  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: ac.signal,
    });
    const text = await res.text();
    let json = null;
    if (text) {
      try { json = JSON.parse(text); } catch { json = { raw: text }; }
    }
    return { ok: res.ok, status: res.status, body: json };
  } catch (err) {
    // Common cause: the `matrix-chat` container is not up, or its
    // CONDUIT_CONFIG is invalid. Surface enough context to debug.
    const err2 = new Error(
      `Conduit ${method} ${path} failed: ${err.cause?.code || err.code || err.name || "unknown"} ` +
      `connecting to ${MATRIX_BASE_URL}. Is the matrix-chat container up and healthy?`
    );
    err2.cause = err;
    err2.status = 502;
    throw err2;
  } finally {
    clearTimeout(timer);
  }
}

// ── Conduit credentials (server-managed, never sent to browser) ──
//
// Conduit v0.10 does not support `m.login.jwt`. We provision each
// PulseGuard patient with a strong random password at first chat use.
// The plaintext password is stored in the DB, AES-encrypted with a
// key derived from CHAT_SECRET, so the Conduit session survives
// process restarts. The browser never sees it.

const { createCipheriv, createDecipheriv, scryptSync } = require("crypto");

const PLAINTEXT_CACHE = new Map(); // userId -> plaintext password (in-memory only)

// AES-256-GCM encryption key derived from CHAT_SECRET.
function cryptoKey() {
  const secret = process.env.CHAT_SECRET || "oursecret";
  return scryptSync(secret, "pulseguard-conduit-v1", 32);
}

function encrypt(plaintext) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", cryptoKey(), iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ct]).toString("base64");
}

function decrypt(encoded) {
  const buf = Buffer.from(encoded, "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const ct = buf.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", cryptoKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
}

function genConduitPassword() {
  return randomBytes(32).toString("hex");
}

async function getOrCreateCredentials(user) {
  const userKey = String(user.id);
  const conduitUserId = patientConduitId(user);

  // Fast path: plaintext in process memory.
  if (PLAINTEXT_CACHE.has(userKey)) {
    return { conduitUserId, password: PLAINTEXT_CACHE.get(userKey) };
  }

  // Slow path: DB. If absent, mint a new password and persist.
  let row = (await pool.query(
    "SELECT conduit_user_id, password_ciphertext FROM conduit_credentials WHERE user_id = $1",
    [user.id]
  )).rows[0];

  if (!row) {
    const password = genConduitPassword();
    const ciphertext = encrypt(password);
    try {
      await pool.query(
        `INSERT INTO conduit_credentials (user_id, conduit_user_id, password_ciphertext)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id) DO NOTHING`,
        [user.id, conduitUserId, ciphertext]
      );
    } catch (err) {
      if (err.code !== "23505") throw err;
    }
    PLAINTEXT_CACHE.set(userKey, password);
    return { conduitUserId, password };
  }

  // Existing row — decrypt and return.
  const password = decrypt(row.password_ciphertext);
  PLAINTEXT_CACHE.set(userKey, password);
  return { conduitUserId, password };
}

// ── Login (idempotent) ───────────────────────────────────────
async function loginPatient(user) {
  const key = String(user.id);
  const cached = tokenCache.get(key);
  if (cached && cached.expiresAt > Date.now() + 60_000) {
    return cached;
  }

  const { conduitUserId, password } = await getOrCreateCredentials(user);

  // Strategy: ensure the Conduit user exists (idempotent register —
  // M_USER_INUSE means it's already there and we proceed), then log in.
  // Conduit returns 403 for both "no such user" and "wrong password",
  // so we cannot reliably distinguish them from the login response.
  // Registering first sidesteps the ambiguity.
  const reg = await conduitFetch("POST", "/_matrix/client/v3/register", {
    body: {
      auth: { type: "m.login.dummy" },
      username: conduitUserId,
      password,
      initial_device_display_name: "PulseGuard Web",
    },
  });
  if (!reg.ok && reg.body?.errcode !== "M_USER_IN_USE") {
    const err = new Error(`Conduit register failed: ${reg.status} ${JSON.stringify(reg.body)}`);
    err.status = 502;
    throw err;
  }

  const res = await conduitFetch("POST", "/_matrix/client/v3/login", {
    body: {
      type: "m.login.password",
      identifier: { type: "m.id.user", user: conduitUserId },
      password,
    },
  });

  if (!res.ok || !res.body || !res.body.access_token) {
    // Distinguish connectivity errors (502 — Conduit unreachable /
    //   network / protocol) from credential mismatches (500 — our
    //   stored password disagrees with Conduit's hash for this user).
    // 403 M_FORBIDDEN "wrong username or password" is the latter.
    const isCredMismatch =
      (res.status === 403 && errcode === "M_FORBIDDEN") ||
      (res.status === 401);
    const err = new Error(
      isCredMismatch
        ? `Chat credential mismatch for ${conduitUserId}: ${res.status} ${JSON.stringify(res.body)}. ` +
          `Clear the conduit_credentials row for this user to force a re-provision.`
        : `Conduit login failed: ${res.status} ${JSON.stringify(res.body)}`
    );
    err.status = isCredMismatch ? 500 : 502;
    throw err;
  }

  const entry = {
    conduitAccessToken: res.body.access_token,
    conduitUserId: res.body.user_id || conduitUserId,
    expiresAt: Date.now() + ((res.body.expires_in || 3600) * 1000),
  };
  tokenCache.set(key, entry);

  // First-ever login → kick off the server-side /sync loop. The loop
  // reuses any cached Conduit access token; we re-login a patient if
  // none is fresh.
  ensureStarted(MATRIX_BASE_URL, async () => {
    for (const v of tokenCache.values()) {
      if (v.conduitAccessToken && v.expiresAt > Date.now() + 60_000) {
        return { accessToken: v.conduitAccessToken, userId: v.conduitUserId };
      }
    }
    // Pick any patient whose plaintext password is still in memory and
    // re-login as them. The /sync loop only needs *a* valid Conduit
    // session; the data it sees is the global room's events, not anyone's
    // private data.
    for (const [uKey, pw] of PLAINTEXT_CACHE) {
      const cId = `patient_${uKey}`;
      const r = await conduitFetch("POST", "/_matrix/client/v3/login", {
        body: {
          type: "m.login.password",
          identifier: { type: "m.id.user", user: cId },
          password: pw,
        },
      });
      if (r.ok) {
        tokenCache.set(uKey, {
          conduitAccessToken: r.body.access_token,
          conduitUserId: r.body.user_id || cId,
          expiresAt: Date.now() + ((r.body.expires_in || 3600) * 1000),
        });
        return { accessToken: r.body.access_token, userId: r.body.user_id || cId };
      }
    }
    throw new Error("No Conduit session available for /sync loop");
  });

  return entry;
}

async function getConduitToken(user) {
  return loginPatient(user);
}

// Re-try once on 401 (token expired between mint and use).
async function conduitCall(method, path, opts, user) {
  let tokenEntry = await getConduitToken(user);
  let res = await conduitFetch(method, path, { ...opts, token: tokenEntry.conduitAccessToken });
  if (res.status === 401) {
    tokenCache.delete(String(user.id));
    tokenEntry = await getConduitToken(user);
    res = await conduitFetch(method, path, { ...opts, token: tokenEntry.conduitAccessToken });
  }
  return res;
}

// ── Global room bootstrap (single-flight) ────────────────────
//
// Strategy: the first patient whose request triggers bootstrap
// creates the room. Subsequent patients reuse the canonical id.
// We probe by alias first; on 404, we create the room using any
// already-cached Conduit token. In dev with one Node process this
// is fine; in prod you'd want a dedicated Conduit service user —
// see TODO in services/conduitSync.js.

async function ensureGlobalRoom() {
  // Fast path: we already resolved the room id in this process.
  if (resolvedRoomId) return resolvedRoomId;

  if (roomBootstrap.has(GLOBAL_CHAT_ROOM_ID)) {
    return roomBootstrap.get(GLOBAL_CHAT_ROOM_ID);
  }
  const p = (async () => {
    // The directory endpoint expects a Matrix alias (`#localpart:server`),
    // not a room id (`!`). Convert from the env form.
    const aliasLocalpart = GLOBAL_CHAT_ROOM_ID.replace(/^!/, "").split(":")[0];
    const alias = `#${aliasLocalpart}:${GLOBAL_CHAT_ROOM_ID.split(":")[1] || "localhost"}`;
    const aliasEncoded = encodeURIComponent(alias);

    // Probe the alias via the directory endpoint.
    const probe = await conduitFetch(
      "GET",
      `/_matrix/client/v3/directory/room/${aliasEncoded}`
    );
    if (probe.ok) {
      resolvedRoomId = probe.body?.room_id || GLOBAL_CHAT_ROOM_ID;
      return resolvedRoomId;
    }
    // Need a creator's Conduit token. Use any cached one.
    let creator = null;
    for (const entry of tokenCache.values()) {
      if (entry.conduitAccessToken) { creator = entry; break; }
    }
    if (!creator) {
      const err = new Error("No Conduit session available to create the global room. Call /api/chat/login first.");
      err.status = 503;
      throw err;
    }
    // Create the room under the canonical alias. Conduit uses
    // /_matrix/client/v3/createRoom, not /_matrix/client/v3/rooms.
    const create = await conduitFetch("POST", "/_matrix/client/v3/createRoom", {
      body: {
        room_alias_name: aliasLocalpart,
        name: "PulseGuard Community",
        preset: "public_chat",
        visibility: "public",
      },
      token: creator.conduitAccessToken,
    });
    if (!create.ok) {
      // M_ROOM_IN_USE means the alias is already taken — the room
      // exists, we just need to look it up via the directory.
      if (create.body?.errcode === "M_ROOM_IN_USE") {
        const reprobe = await conduitFetch(
          "GET",
          `/_matrix/client/v3/directory/room/${aliasEncoded}`
        );
        if (reprobe.ok) {
          resolvedRoomId = reprobe.body?.room_id || GLOBAL_CHAT_ROOM_ID;
          return resolvedRoomId;
        }
      }
      const err = new Error(`Conduit room create failed: ${create.status} ${JSON.stringify(create.body)}`);
      err.status = 502;
      throw err;
    }
    resolvedRoomId = create.body.room_id;
    console.log(`[chat] Global room created: ${resolvedRoomId} (alias ${alias})`);
    return resolvedRoomId;
  })();
  // Belt-and-braces: keep the rejection alive only inside the route
  // handler that awaits it. We attach a no-op catch so the bare promise
  // doesn't trigger Node's unhandled-rejection crash.
  p.catch(() => {});
  roomBootstrap.set(GLOBAL_CHAT_ROOM_ID, p);
  p.finally(() => roomBootstrap.delete(GLOBAL_CHAT_ROOM_ID));
  return p;
}

// ── Routes ───────────────────────────────────────────────────
router.use(authenticate, requireRole("patient"));

router.get("/get-chat-token", async (req, res) => {
  // Endpoint is kept for client convenience: it returns the canonical
  // conduit user_id and connection info. The JWT that previously lived
  // here is no longer needed (Conduit 0.10 has no JWT login) — we return
  // a placeholder so the existing frontend keeps working.
  try {
    res.json({
      chatToken: "not-used",
      matrixBaseUrl: MATRIX_BASE_URL,
      globalRoomId: GLOBAL_CHAT_ROOM_ID,
      userId: patientConduitId(req.user),
    });
  } catch (err) {
    console.error("get-chat-token error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const entry = await loginPatient(req.user);
    res.json({ ok: true, userId: entry.conduitUserId });
  } catch (err) {
    console.error("chat login error:", err);
    res.status(err.status || 502).json({ error: err.message || "Conduit login failed" });
  }
});

router.post("/rooms/join", async (req, res) => {
  try {
    const roomId = await ensureGlobalRoom();
    const join = await conduitCall("POST", `/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/join`, {}, req.user);
    if (!join.ok && join.status !== 409) {
      // 409 = already in room; treat as success.
      return res.status(join.status).json({ error: "Failed to join room", details: join.body });
    }
    res.json({ ok: true, roomId });
  } catch (err) {
    console.error("rooms/join error:", err);
    res.status(err.status || 502).json({ error: err.message || "Join failed" });
  }
});

router.get("/messages", async (req, res) => {
  try {
    const roomId = await ensureGlobalRoom();
    const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);
    const from = req.query.from || "";
    // `dir=b` (default) is backward pagination — used for initial
    // history load. `dir=f` is forward pagination — used for live
    // polling, where `from` is the last event id we already have.
    const dir = req.query.dir === "f" ? "f" : "b";
    const qs = new URLSearchParams({ dir, limit: String(limit) });
    if (from) qs.set("from", from);
    const r = await conduitCall("GET", `/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/messages?${qs.toString()}`, undefined, req.user);
    if (!r.ok) return res.status(r.status).json({ error: "Failed to fetch messages", details: r.body });

    const chunk = r.body.chunk || [];
    const messages = chunk
      .filter((ev) => ev.type === "m.room.message" && ev.content?.body)
      .map((ev) => ({
        id: ev.event_id,
        sender: ev.sender,
        body: ev.content.body,
        ts: ev.origin_server_ts || Date.now(),
      }));
    // Conduit returns `end` for backward pagination (the oldest token
    // we've seen) and `start` for forward pagination (the newest
    // token). For forward polling, the client needs `start` as the
    // next `from` cursor. We always echo both back so the client
    // doesn't have to care which direction it used.
    res.json({
      messages,
      end: r.body.end || null,
      start: r.body.start || null,
    });
  } catch (err) {
    console.error("messages get error:", err);
    res.status(err.status || 502).json({ error: err.message || "Fetch failed" });
  }
});

router.post("/messages", async (req, res) => {
  try {
    const { body, txnId } = req.body || {};
    if (!body || typeof body !== "string" || !body.trim()) {
      return res.status(400).json({ error: "Message body required" });
    }
    if (body.length > 4000) {
      return res.status(400).json({ error: "Message too long" });
    }
    const roomId = await ensureGlobalRoom();
    const tid = txnId || randomUUID();
    const r = await conduitCall(
      "PUT",
      `/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/send/m.room.message/${encodeURIComponent(tid)}`,
      { body: { msgtype: "m.text", body: body.trim() } },
      req.user
    );
    if (!r.ok) return res.status(r.status).json({ error: "Send failed", details: r.body });
    res.json({ id: r.body.event_id });
  } catch (err) {
    console.error("messages post error:", err);
    res.status(err.status || 502).json({ error: err.message || "Send failed" });
  }
});

router.post("/typing", async (req, res) => {
  try {
    const { typing } = req.body || {};
    if (typeof typing !== "boolean") {
      return res.status(400).json({ error: "`typing` must be a boolean" });
    }
    const entry = await getConduitToken(req.user);
    const roomId = await ensureGlobalRoom();
    const r = await conduitFetch("PUT", `/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/typing/${encodeURIComponent(entry.conduitUserId)}`, {
      body: { typing },
      token: entry.conduitAccessToken,
    });
    if (!r.ok) return res.status(r.status).json({ error: "Typing update failed", details: r.body });
    res.json({ ok: true });
  } catch (err) {
    console.error("typing error:", err);
    res.status(err.status || 502).json({ error: err.message || "Typing update failed" });
  }
});

router.get("/presence", async (req, res) => {
  try {
    const roomId = await ensureGlobalRoom();
    res.json({
      online: getPresenceSnapshot(),
      typing: getTypingSnapshot(roomId),
    });
  } catch (err) {
    console.error("presence error:", err);
    res.status(err.status || 502).json({ error: err.message || "Presence failed" });
  }
});

module.exports = router;
