# PulseGuard

## Requirements

- Docker
- Docker Compose
- Internet Connection (for CI and external services)

## Usage
You must create a `.env` file in the project directory containing `OPENROUTER_API_KEY` to get the LLM features. Otherwise it will fallback to mock AI responses.

Run the following in your terminal to get started
```
docker compose up -d
```