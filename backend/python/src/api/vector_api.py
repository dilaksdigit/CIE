from flask import Flask, request, jsonify
from src.vector import embedding, validation
import logging

app = Flask(__name__)

@app.route('/validate-vector', methods=['POST'])
def validate_vector():
    data = request.get_json()
    description = data.get('description')
    cluster_id = data.get('cluster_id')
    if not description or not cluster_id:
        return jsonify({'error': 'Missing data'}), 400
    
    try:
        vector = embedding.get_embedding(description)
        result = validation.validate_cluster_match(vector, cluster_id)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
