import os
from flask import Flask, request, jsonify
from predict import predict_risk, load_artifacts, get_model_metadata
from model_comparison import run_model_comparison

app = Flask(__name__)

# Preload model and scaler on startup to prevent request timeouts on first call
try:
    load_artifacts()
    app.logger.info("ML model, feature pipeline, and calibrated classifier preloaded successfully.")
except Exception as e:
    app.logger.error(f"Failed to preload ML artifacts: {e}")

@app.route('/health', methods=['GET'])
def health():
    try:
        load_artifacts()
        metadata = get_model_metadata()
        return jsonify({
            'success': True,
            'service': 'fraud-ml',
            'model': 'loaded',
            'modelVersion': metadata.get('modelVersion', 'fraud-model-v2.0'),
            'modelType': metadata.get('modelType', 'LogisticRegression')
        }), 200
    except Exception:
        return jsonify({
            'success': False,
            'service': 'fraud-ml',
            'model': 'not_loaded'
        }), 503

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'message': 'Invalid input: No JSON body received'
            }), 400
            
        prediction = predict_risk(data)
        return jsonify(prediction), 200
        
    except FileNotFoundError as fnf_err:
        return jsonify({
            'success': False,
            'message': str(fnf_err)
        }), 503
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to process prediction: {str(e)}'
        }), 400

@app.route('/model/metadata', methods=['GET'])
def metadata():
    try:
        data = get_model_metadata()
        return jsonify({
            'success': True,
            'metadata': data
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to fetch model metadata: {str(e)}'
        }), 500

@app.route('/model/compare', methods=['POST'])
def trigger_comparison():
    try:
        comparison_metadata = run_model_comparison()
        load_artifacts()
        return jsonify({
            'success': True,
            'message': 'Model comparison and calibration completed successfully.',
            'metadata': comparison_metadata
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Model comparison failed: {str(e)}'
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port)
