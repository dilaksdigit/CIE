from flask import Flask, request, jsonify
import os
import sys

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from src.vector.validation import validate_cluster_match

app = Flask(__name__)

@app.route('/validate-vector', methods=['POST'])
def validate_vector():
    data = request.json
    description = data.get('description')
    cluster_id = data.get('cluster_id')
    sku_id = data.get('sku_id', 'unknown')
    
    # In the existing validation.py, validate_cluster_match takes (request_vector, cluster_id)
    # But wait, my previous view_file showed it takes (request_vector, cluster_id)
    # and embedding.cosine_similarity(request_vector, cluster_vec).
    # I need to get the embedding first.
    
    from src.vector.embedding import get_embedding
    
    try:
        sku_vector = get_embedding(description)
        result = validate_cluster_match(sku_vector, cluster_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'valid': False,
            'similarity': 0.0,
            'reason': str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
