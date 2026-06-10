package org.pulseguard.rag;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import org.eclipse.microprofile.config.inject.ConfigProperty;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class GeminiEmbedder implements IEmbedder {
    @ConfigProperty(name = "gemini.api.key")
    String geminiApiKey;

    @Override
    public float[] embed(String text) throws Exception {
        System.out.println("REQUEST HIT");
        System.out.println("TEXT = " + text);
        String apiKey = geminiApiKey;

        String body = """
        {
            "model": "models/gemini-embedding-001",
            "content": {
                "parts": [
                    { "text": "%s" }
                ]
            }
        }
        """.formatted(text.replace("\"", "\\\""));

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://generativelanguage.googleapis.com/v1/models/gemini-embedding-001:embedContent?key=" + apiKey))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(body))
            .build();

        HttpClient client = HttpClient.newHttpClient();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(response.body());

        System.out.println("GEMINI RESPONSE = " + response.body());

        JsonNode valuesNode = root
            .path("embedding")
            .path("values");

        float[] vector = new float[valuesNode.size()];

        for (int i = 0; i < valuesNode.size(); i++) {
            vector[i] = (float) valuesNode.get(i).asDouble();
        }

        return vector;
    }
}
