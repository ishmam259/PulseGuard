# PulseGuard - RAG & Chat Service

PulseGuard is a high-performance backend service built with **Quarkus**, providing real-time chat capabilities and a **Retrieval-Augmented Generation (RAG)** system powered by **pgvector** and **Google Gemini**.

## Features
- **Real-time Chat**: WebSocket-based chat with persistence.
- **RAG System**: Store, retrieve, and query information using vector embeddings.
- **Topic Isolation**: Keep information partitioned by topics (e.g., `medical`, `nutrition`, `safety`).
- **Gemini Integration**: Uses `gemini-2.5-flash` for high-quality embeddings and chat completions.

## Prerequisites
- **Docker & Docker Compose**: For running the PostgreSQL databases (`chatdb` and `ragdb`).
- **Java 21**: For local development.
- **Gemini API Key**: Must be set in your environment as `GEMINI_API_KEY`.

---

## RAG API Endpoints

The RAG API allows you to store knowledge and ask questions based on that knowledge. All endpoints are under `/api/rag`.

### 1. Store Knowledge
Embeds a piece of text and stores it in the vector database.

- **URL**: `POST /api/rag/store`
- **Payload**:
  ```json
  {
    "topic": "nutrition",
    "content": "Vitamin C is essential for immune function and skin health."
  }
  ```
- **Example (httpie)**:
  ```bash
  http POST :8080/api/rag/store topic=nutrition content="Vitamin C is essential for immune function."
  ```

### 2. Retrieve Context
Finds the top 3 most relevant documents for a query within a specific topic.

- **URL**: `GET /api/rag/retrieve`
- **Query Params**:
  - `topic`: The category to search in.
  - `q`: your search query.
- **Example (httpie)**:
  ```bash
  http GET :8080/api/rag/retrieve topic==nutrition q=="What is good for immunity?"
  ```

### 3. Ask a Question (RAG)
Retrieves context from the database and uses Gemini to generate a factual answer based **only** on that context.

- **URL**: `GET /api/rag/ask`
- **Query Params**:
  - `topic`: The category to use as context.
  - `q`: Your question.
- **Example (httpie)**:
  ```bash
  http GET :8080/api/rag/ask topic==nutrition q=="Why should I take Vitamin C?"
  ```

### 4. Raw Embedding
Get the 3072-dimensional vector embedding for any text.

- **URL**: `POST /api/rag/embedding`
- **Payload**: Raw String
- **Example (httpie)**:
  ```bash
  echo "Search query" | http POST :8080/api/rag/embedding
  ```

---

## Development & Deployment

### Run in Dev Mode
Ensure your Docker containers are running (`docker compose up -d ragdb chatdb`), then start Quarkus:
```bash
./mvnw quarkus:dev
```

### Build & Package
```bash
./mvnw package
```

### Docker Deployment
The project includes a `docker-compose.yml` in the root directory that orchestrates the entire PulseGuard stack, including this service.
