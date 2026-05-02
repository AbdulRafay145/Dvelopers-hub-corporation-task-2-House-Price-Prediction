"""
House Price AI - Flask Backend
Auto-trains ML models on startup, serves predictions via REST API.
"""

import os
import json
import threading
from flask import Flask, request, jsonify
from flask import make_response
from ml_engine import HousePriceMLEngine

app = Flask(__name__)

# --- CORS middleware ---
@app.after_request
def add_cors(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
    return response

@app.before_request
def handle_options():
    if request.method == 'OPTIONS':
        resp = make_response()
        resp.headers['Access-Control-Allow-Origin'] = '*'
        resp.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        resp.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
        return resp

# --- Global ML engine ---
DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'house_data.csv')
engine = HousePriceMLEngine(DATA_PATH)
training_status = {'status': 'pending', 'message': 'Training not started'}
training_lock = threading.Lock()


def run_training():
    global training_status
    with training_lock:
        try:
            training_status = {'status': 'training', 'message': 'Training models...'}
            results = engine.train()
            training_status = {
                'status': 'complete',
                'message': f'Best model: {engine.best_model_name}',
                'best_model': engine.best_model_name,
                'best_r2': results[engine.best_model_name]['r2']
            }
        except Exception as e:
            training_status = {'status': 'error', 'message': str(e)}
            print(f"Training error: {e}")


# --- Auto-train on startup ---
print("[Backend] Starting auto-training thread...")
t = threading.Thread(target=run_training, daemon=True)
t.start()


# --- Routes ---

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'trained': engine.trained})


@app.route('/training-status', methods=['GET'])
def get_training_status():
    return jsonify(training_status)


@app.route('/train-models', methods=['POST', 'GET'])
def train_models():
    if engine.trained:
        return jsonify({'message': 'Already trained', 'status': 'complete',
                        'best_model': engine.best_model_name})
    t = threading.Thread(target=run_training, daemon=True)
    t.start()
    return jsonify({'message': 'Training started', 'status': 'training'})


@app.route('/predict', methods=['POST'])
def predict():
    if not engine.trained:
        return jsonify({'error': 'Model not trained yet. Please wait.'}), 503
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No input data'}), 400
        result = engine.predict(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/metrics', methods=['GET'])
def metrics():
    if not engine.trained:
        return jsonify({'error': 'Model not trained yet'}), 503
    best = engine.model_results.get(engine.best_model_name, {})
    return jsonify({
        'best_model': engine.best_model_name,
        'metrics': best,
        'all_models': engine.model_results
    })


@app.route('/dashboard', methods=['GET'])
def dashboard():
    if not engine.trained:
        return jsonify({'error': 'Model not trained yet'}), 503
    data = engine.get_dashboard_data()
    return jsonify(data)


if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5000)
