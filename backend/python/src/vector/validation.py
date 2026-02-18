import logging
from . import cluster_cache
from . import embedding

logger = logging.getLogger(__name__)
SIMILARITY_THRESHOLD = 0.72


def validate_cluster_match(request_vector, cluster_id):
    """
    Validate request vector against cluster centroid.
    Fails soft if embedding API times out (allows request through with warning).
    """
    # Check if cluster vector exists
    cluster_vec = cluster_cache.get_cluster_vector(cluster_id)
    if not cluster_vec:
        logger.warning(f"Cluster {cluster_id} vectors not initialized")
        return {
            'valid': False,
            'similarity': 0.0,
            'reason': f'Cluster {cluster_id} vectors not initialized. Run cluster embedding initialization first.'
        }
    
    # Fail-soft: if request vector is None (embedding timeout), allow through
    if request_vector is None:
        logger.warning(f"Request embedding failed (timeout) - bypassing validation (fail-soft)")
        return {
            'valid': True,  # ALLOW REQUEST (fail-soft)
            'similarity': None,
            'reason': 'Embedding API timeout - validation bypassed (fail-soft mode)'
        }
    
    # Compute similarity
    try:
        similarity = embedding.cosine_similarity(request_vector, cluster_vec)
    except Exception as e:
        logger.error(f"Cosine similarity computation failed: {e}")
        return {
            'valid': False,
            'similarity': 0.0,
            'reason': f'Similarity computation error: {str(e)}'
        }
    
    # Audit log (required by CIE v2.3.2)
    logger.info(f"AUDIT: cluster_id={cluster_id} similarity={similarity:.4f}")
    
    # Check threshold
    if similarity < SIMILARITY_THRESHOLD:
        return {
            'valid': False,
            'similarity': similarity,
            'reason': (
                f'Content semantic mismatch (similarity={similarity:.2f}, '
                f'threshold={SIMILARITY_THRESHOLD}). '
                f'Ensure request content aligns with cluster {cluster_id} intent.'
            )
        }
    
    return {'valid': True, 'similarity': similarity, 'reason': 'Passed validation'}