package org.pulseguard.chat;

import java.time.LocalDateTime;
import io.quarkus.runtime.annotations.RegisterForReflection;

@RegisterForReflection
public class ChatItem {
    public String userId;
    public String message;
    public LocalDateTime timestamp;

    public enum ChatItemType {
        MESSAGE,
        TYPING,
        JOIN,
        LEAVE
    }

    public ChatItemType type;

    public ChatItem() {
        this.timestamp = LocalDateTime.now();
        this.type = ChatItemType.MESSAGE;
    }
}
