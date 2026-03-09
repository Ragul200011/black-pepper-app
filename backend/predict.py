import sys
import json
import joblib
import numpy as np
import os
import warnings

warnings.filterwarnings('ignore')

# Hardcoded paths expected relative to the backend folder (which is adjacent to model_results_smote)
MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "model_results_smote")
MODEL_PATH = os.path.join(MODEL_DIR, "hybrid_ensemble_model.pkl")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.pkl")
ENCODER_PATH = os.path.join(MODEL_DIR, "label_encoder.pkl")

def init():
    try:
        model = joblib.load(MODEL_PATH)
        scaler = joblib.load(SCALER_PATH)
        encoder = joblib.load(ENCODER_PATH)
        return model, scaler, encoder
    except Exception as e:
        print(json.dumps({"error": f"Failed to load AI models: {str(e)}", "path": MODEL_PATH}))
        sys.exit(1)

def predict(model, scaler, encoder, data):
    try:
        # Expected features based on app.py: Temp, Moist, N, P, K, pH
        # Data passed from Node should be a JSON object
        input_data = np.array([[
            float(data.get("Temperature", 0)),
            float(data.get("Moisture", 0)),
            float(data.get("Nitrogen", 0)),
            float(data.get("Phosphorus", 0)),
            float(data.get("Potassium", 0)),
            float(data.get("pH", 0))
        ]])

        scaled_features = scaler.transform(input_data)
        
        # Ensure we're using predict properly for VotingClassifier (ensemble)
        prediction_code = model.predict(scaled_features)[0]
        prediction_label = encoder.inverse_transform([prediction_code])[0]
        
        result = {
            "prediction": prediction_label,
            "status": "Healthy" if prediction_label == "Healthy" else "Needs Attention"
        }
        
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": f"Prediction failed: {str(e)}"}))
        sys.exit(1)

if __name__ == "__main__":
    # Expect JSON object passed as first argument
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No sensor data provided"}))
        sys.exit(1)
        
    try:
        sensor_data = json.loads(sys.argv[1])
        model, scaler, encoder = init()
        predict(model, scaler, encoder, sensor_data)
    except json.JSONDecodeError:
        print(json.dumps({"error": "Invalid JSON format"}))
        sys.exit(1)
