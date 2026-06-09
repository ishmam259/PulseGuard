package org.pulseguard.chat;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.pulseguard.chat.ChatItem.ChatItemType;

import io.quarkus.websockets.next.OnClose;
import io.quarkus.websockets.next.OnOpen;
import io.quarkus.websockets.next.OnTextMessage;
import io.quarkus.websockets.next.PathParam;
import io.quarkus.websockets.next.WebSocket;
import io.quarkus.websockets.next.WebSocketConnection;
import jakarta.transaction.Transactional;

@WebSocket(path = "/chat/{room}")
public class ChatSocket {
    private final Map<String, Set<WebSocketConnection>> rooms = new ConcurrentHashMap<>();

    @OnOpen
    void onOpen(WebSocketConnection connection, @PathParam("room") String room) {
        rooms.computeIfAbsent(room, k -> ConcurrentHashMap.newKeySet())
            .add(connection);
    }

    @OnClose
    void onClose(WebSocketConnection connection, @PathParam("room") String room) {
        rooms.getOrDefault(room, Set.of())
            .remove(connection);
    }

    @OnTextMessage
    @Transactional
    void onMessage(ChatItemDTO message, WebSocketConnection sender, @PathParam("room") String room) {
        if(message.type != ChatItemType.TYPING) {
            ChatItem chatItem = new ChatItem(message);
            chatItem.room = room;
            chatItem.persist();
        }
        rooms.getOrDefault(room, Set.of())
            .forEach(client -> client.sendTextAndAwait(message));
    }
}
