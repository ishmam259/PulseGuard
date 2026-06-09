package org.pulseguard.chat;

import java.util.List;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;

@Path("/api/chat")
public class ChatResource {
    @GET
    @Path("/{room}")
    public List<ChatItem> listAll(String room) {
        return ChatItem.listRecent(room);
    }
}
