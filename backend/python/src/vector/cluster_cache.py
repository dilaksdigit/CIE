import redis
import json
import os

r = redis.from_url(os.getenv('REDIS_URL', 'redis://localhost:6379/0'))

def get_cluster_vector(cluster_id):
    vec = r.get(f"cluster:{cluster_id}")
    if vec:
        return json.loads(vec)
    return None

def cache_cluster_vector(cluster_id, vector):
    r.set(f"cluster:{cluster_id}", json.dumps(vector))
