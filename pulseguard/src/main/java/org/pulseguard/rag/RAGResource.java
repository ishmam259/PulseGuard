package org.pulseguard.rag;

import java.util.List;

import io.quarkus.hibernate.orm.PersistenceUnit;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;

@Path("/api/rag")
public class RAGResource {
    private final IEmbedder embedder;
    private final GeminiChat chat;

    @Inject
    @PersistenceUnit("rag")
    EntityManager em;

    public RAGResource(GeminiEmbedder embedder, GeminiChat chat) {
        this.embedder = embedder;
        this.chat = chat;
    }

    @Path("/embedding")
    @Consumes(MediaType.APPLICATION_JSON)
    @POST
    public float[] getEmbedding(String text) {
        try {    
            return embedder.embed(text);
        } catch(Exception e) {
            return new float[]{};
        }
    }

    public static class StoreRequest {
        public String topic;
        public String content;
    }

    public static class StoreResponse {
        public String message;
        public boolean success;

        public StoreResponse(String message, boolean success) {
            this.message = message;
            this.success = success;
        }
    }

    public static class AskResponse {
        public String answer;
        public List<String> context;
    }

    @Path("/store")
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Transactional
    public StoreResponse store(StoreRequest request) {
        try {
            float[] vector = embedder.embed(request.content);
            String vectorStr = arrayToVectorString(vector);
            
            em.createNativeQuery("INSERT INTO rag_documents (topic, content, embedding) VALUES (:topic, :content, CAST(:embedding AS vector))")
                .setParameter("topic", request.topic)
                .setParameter("content", request.content)
                .setParameter("embedding", vectorStr)
                .executeUpdate();
            
            return new StoreResponse("Stored successfully in topic: " + request.topic, true);
        } catch (Exception e) {
            e.printStackTrace();
            return new StoreResponse("Error: " + e.getMessage(), false);
        }
    }

    @Path("/retrieve")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<String> retrieve(@QueryParam("topic") String topic, @QueryParam("q") String query) {
        try {
            float[] vector = embedder.embed(query);
            String vectorStr = arrayToVectorString(vector);

            @SuppressWarnings("unchecked")
            List<String> results = em.createNativeQuery(
                "SELECT content FROM rag_documents WHERE topic = :topic ORDER BY embedding <=> CAST(:embedding AS vector) LIMIT 3")
                .setParameter("topic", topic)
                .setParameter("embedding", vectorStr)
                .getResultList();
            
            return results;
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    @Path("/ask")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public AskResponse ask(@QueryParam("topic") String topic, @QueryParam("q") String query) {
        try {
            List<String> context = retrieve(topic, query);
            String contextStr = String.join("\n---\n", context);
            
            String prompt = String.format(
                "Use the following context to answer the question. If the answer is not in the context, say you don't know.\n\nContext:\n%s\n\nQuestion: %s",
                contextStr, query);
            
            AskResponse response = new AskResponse();
            response.answer = chat.ask(prompt);
            response.context = context;
            return response;
        } catch (Exception e) {
            e.printStackTrace();
            AskResponse error = new AskResponse();
            error.answer = "Error: " + e.getMessage();
            return error;
        }
    }

    private String arrayToVectorString(float[] array) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < array.length; i++) {
            sb.append(array[i]);
            if (i < array.length - 1) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }
}
