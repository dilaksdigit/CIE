"""
OpenAI text-embedding-3-small (1536 dims) for CIE semantic validation (v2.3.1 §8.1).
"""
import os

import numpy as np

_client = None


def _get_client():
    global _client
    if _client is None:
        from openai import OpenAI
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key or api_key == 'sk-...':
            raise RuntimeError(
                "OPENAI_API_KEY is not configured. "
                "Set it in your .env file or as an environment variable."
            )
        _client = OpenAI(api_key=api_key)
    return _client


def get_embedding(text, model="text-embedding-3-small"):
    """Embed text with OpenAI text-embedding-3-small (1536 dimensions). Raises on API error."""
    text = text.replace("\n", " ")
    return _get_client().embeddings.create(input=[text], model=model).data[0].embedding


def cosine_similarity(v1, v2):
    """Cosine similarity between two vectors."""
    return float(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2)))
