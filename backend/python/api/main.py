from flask import Flask, request, jsonify
import os
import sys
from dotenv import load_dotenv

# Add the backend/python directory to path so 'src' is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# Load environment variables from .env
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '..', '.env'))

from src.vector.validation import validate_cluster_match
from src.vector.embedding import get_embedding

app = Flask(__name__)

@app.route('/validate-vector', methods=['POST'])
def validate_vector():
    data = request.json
    description = data.get('description')
    cluster_id = data.get('cluster_id')

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

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'CIE Python Worker'})

if __name__ == '__main__':
    print("CIE Python Worker starting on http://0.0.0.0:5000")
    app.run(host='0.0.0.0', port=5000)
