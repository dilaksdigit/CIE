from dotenv import load_dotenv
load_dotenv()

from flask import Flask, request, jsonify
import os
import sys
import uuid

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

#from src.vector.validation import validate_cluster_match
#from src.vector.embedding import get_embedding

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from src.vector.validation import validate_cluster_match
from src.vector.embedding import get_embedding

app = Flask(__name__)

# Store for in-memory audit queue (in production, use Redis)
audit_queue = {}
brief_queue = {}

@app.route('/', methods=['GET'])
def index():
    """Root endpoint"""
    return jsonify({
        'service': 'CIE Python Worker API',
        'status': 'running',
        'version': '1.0.0',
        'endpoints': [
            '/health',
            '/validate-vector',
            '/queue/audit',
            '/queue/brief-generation'
        ]
    }), 200

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'python-worker'}), 200

@app.route('/validate-vector', methods=['POST'])
def validate_vector():
    """Validate SKU description against cluster vectors"""
    data = request.json
    description = data.get('description')
    cluster_id = data.get('cluster_id')
    sku_id = data.get('sku_id', 'unknown')
    
    # Get embedding and validate
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

@app.route('/queue/audit', methods=['POST'])
def queue_audit():
    """Queue an AI audit job"""
    data = request.json
    sku_id = data.get('sku_id')
    
    if not sku_id:
        return jsonify({'error': 'sku_id required'}), 400
    
    audit_id = str(uuid.uuid4())
    audit_queue[audit_id] = {
        'sku_id': sku_id,
        'status': 'queued',
        'audit_id': audit_id
    }
    
    # TODO: In production, push to Redis queue
    # redis_client.lpush('audit:queue', json.dumps({'sku_id': sku_id, 'audit_id': audit_id}))
    
    return jsonify({
        'queued': True,
        'audit_id': audit_id,
        'message': 'Audit job queued'
    }), 202

@app.route('/queue/brief-generation', methods=['POST'])
def queue_brief_generation():
    """Queue a brief generation job"""
    data = request.json
    sku_id = data.get('sku_id')
    title = data.get('title')
    
    if not sku_id or not title:
        return jsonify({'error': 'sku_id and title required'}), 400
    
    brief_id = str(uuid.uuid4())
    brief_queue[brief_id] = {
        'sku_id': sku_id,
        'title': title,
        'status': 'queued',
        'brief_id': brief_id
    }
    
    # TODO: In production, push to Redis queue
    # redis_client.lpush('brief:queue', json.dumps({'sku_id': sku_id, 'title': title, 'brief_id': brief_id}))
    
    return jsonify({
        'queued': True,
        'brief_id': brief_id,
        'message': 'Brief generation job queued'
    }), 202

@app.route('/audits/<audit_id>', methods=['GET'])
def get_audit_result(audit_id):
    """Get audit result (polling endpoint)"""
    if audit_id in audit_queue:
        return jsonify(audit_queue[audit_id])
    
    # In production, check Redis/database for completed audits
    return jsonify({'status': 'pending'}), 202

@app.route('/briefs/<brief_id>', methods=['GET'])
def get_brief_result(brief_id):
    """Get brief generation result (polling endpoint)"""
    if brief_id in brief_queue:
        return jsonify(brief_queue[brief_id])
    
    # In production, check Redis/database for completed briefs
    return jsonify({'status': 'pending'}), 202

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=os.getenv('APP_DEBUG', False))
