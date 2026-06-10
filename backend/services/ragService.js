/**
 * PulseGuard RAG Service
 * Handles communication with the PulseGuard Chat/RAG service (Quarkus)
 */

const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || 'http://pulseguard-chat:8080';

/**
 * Stores a piece of knowledge in the RAG system.
 * @param {string} topic - The category/topic (e.g., username)
 * @param {string} content - The text content to store
 */
async function storeKnowledge(topic, content) {
  try {
    const response = await fetch(`${RAG_SERVICE_URL}/api/rag/store`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic, content }),
    });

    console.log(topic);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`RAG Service Error (${response.status}):`, errorText);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Failed to connect to RAG Service (store):', err.message);
    return false;
  }
}

/**
 * Retrieves context from the RAG system for a given query.
 * @param {string} topic - The topic to search in
 * @param {string} query - The search query
 * @returns {Promise<string[]>} - Array of relevant content chunks
 */
async function retrieveContext(topic, query) {
  try {
    const url = new URL(`${RAG_SERVICE_URL}/api/rag/retrieve`);
    url.searchParams.append('topic', topic);
    url.searchParams.append('q', query);

    console.log(topic);

    const response = await fetch(url.toString());
    if (!response.ok) {
      console.error(`RAG Service Error (retrieve ${response.status})`);
      return [];
    }

    const result = await response.json();
    return result.context || [];
  } catch (err) {
    console.error('Failed to connect to RAG Service (retrieve):', err.message);
    return [];
  }
}

module.exports = {
  storeKnowledge,
  retrieveContext,
};
