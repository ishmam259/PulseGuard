package org.pulseguard.chat;

import java.time.LocalDateTime;
import java.util.List;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import io.quarkus.panache.common.Sort;
import io.quarkus.runtime.annotations.RegisterForReflection;
import jakarta.persistence.Entity;

@RegisterForReflection
@Entity
public class ChatItem extends PanacheEntity {
    public String userId;
    public String message;
    public String room;
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

    public ChatItem(ChatItemDTO dto) {
        this.userId = dto.userId;
        this.message = dto.message;
        this.timestamp = dto.timestamp;
        this.type = dto.type;
    }

    public static List<ChatItem> listRecent(String room) {
        return ChatItem.find("room = ?1",
                Sort.by("timestamp").descending(),
                room)
            .page(0, 20)
            .list();
    }
}
