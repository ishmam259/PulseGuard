package org.pulseguard.chat;

import java.time.LocalDateTime;

import org.pulseguard.chat.ChatItem.ChatItemType;

import io.quarkus.runtime.annotations.RegisterForReflection;

@RegisterForReflection
public class ChatItemDTO {
    public String userId;
    public String message;
    public LocalDateTime timestamp;
    public ChatItemType type;

    public ChatItemDTO() {
        this.timestamp = LocalDateTime.now();
        this.type = ChatItemType.MESSAGE;
    }

    public ChatItemDTO(String userId, String message, LocalDateTime timestamp) {
        this.userId = userId;
        this.message = message;
        this.timestamp = timestamp;
        this.type = ChatItemType.MESSAGE;
    }

    public ChatItemDTO(ChatItem chatItem) {
        this.userId = chatItem.userId;
        this.message = chatItem.message;
        this.timestamp = chatItem.timestamp;
        this.type = chatItem.type;
    }
}
