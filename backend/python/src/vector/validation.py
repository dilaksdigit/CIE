import logging
from . import cluster_cache
from . import embedding

logger = logging.getLogger(__name__)
SIMILARITY_THRESHOLD = 0.72

def validate_cluster_match(request_vector, cluster_id):
    cluster_vec = cluster_cache.get_cluster_vector(cluster_id)
    if not cluster_vec:
        return {'valid': False, 'similarity': 0.0, 'reason': f'Cluster {cluster_id} vectors not initialized.'}
    
    try:
        similarity = embedding.cosine_similarity(request_vector, cluster_vec)
    except Exception as e:
        return {'valid': False, 'similarity': 0.0, 'reason': str(e)}
    
    logger.info(f"AUDIT: cluster_id={cluster_id} similarity={similarity:.4f}")
    
    if similarity < SIMILARITY_THRESHOLD:
        return {
            'valid': False,
            'similarity': similarity,
            'reason': f'Content semantic mismatch ({similarity:.2f} < {SIMILARITY_THRESHOLD}).'
        }
    
    return {'valid': True, 'similarity': similarity, 'reason': 'Passed validation'}
