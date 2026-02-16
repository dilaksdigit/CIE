import numpy as np
import os

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
    text = text.replace("\n", " ")
    return _get_client().embeddings.create(input=[text], model=model).data[0].embedding

def cosine_similarity(v1, v2):
    return np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))
