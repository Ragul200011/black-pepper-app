import sys
import json
import joblib
import numpy as np
import os
import warnings

warnings.filterwarnings("ignore")

# ── Find model_results_smote folder wherever it may be ───────────────────────
# Tries common locations relative to this script's location.
# predict.py is inside backend/, so we search:
#   backend/model_results_smote/          (models inside backend)
#   model_results_smote/                  (project root, one level up)
#   ../model_results_smote/               (sibling of backend)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

CANDIDATE_DIRS = [
    os.path.join(SCRIPT_DIR, "model_results_smote"),  # backend/model_results_smote/
    os.path.join(SCRIPT_DIR, "..", "model_results_smote"),  # project_root/model_results_smote/
    os.path.join(SCRIPT_DIR, "..", "..", "model_results_smote"),  # two levels up
    os.path.join(SCRIPT_DIR, "models"),  # backend/models/
]

MODEL_DIR = None
for candidate in CANDIDATE_DIRS:
    candidate = os.path.normpath(candidate)
    if os.path.isfile(os.path.join(candidate, "hybrid_ensemble_model.pkl")):
        MODEL_DIR = candidate
        break

if MODEL_DIR is None:
    checked = [os.path.normpath(c) for c in CANDIDATE_DIRS]
    print(
        json.dumps(
            {
                "error": "model_results_smote folder not found",
                "searched": checked,
                "fix": (
                    "Place model_results_smote/ folder next to backend/ folder, "
                    "OR inside backend/. It must contain: "
                    "hybrid_ensemble_model.pkl, scaler.pkl, label_encoder.pkl"
                ),
            }
        )
    )
    sys.exit(1)

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
        print(
            json.dumps(
                {
                    "error": f"Failed to load model files: {str(e)}",
                    "model_dir": MODEL_DIR,
                    "fix": "Ensure hybrid_ensemble_model.pkl, scaler.pkl, label_encoder.pkl exist in the folder above",
                }
            )
        )
        sys.exit(1)


def predict(model, scaler, encoder, data):
    try:
        # Feature order must match training: Temperature, Moisture, N, P, K, pH
        input_data = np.array(
            [
                [
                    float(data.get("Temperature", 0)),
                    float(data.get("Moisture", 0)),
                    float(data.get("Nitrogen", 0)),
                    float(data.get("Phosphorus", 0)),
                    float(data.get("Potassium", 0)),
                    float(data.get("pH", 0)),
                ]
            ]
        )

        scaled = scaler.transform(input_data)
        code = model.predict(scaled)[0]
        label = encoder.inverse_transform([code])[0]

        # Try to get individual model probabilities if available
        rf_label = xgb_label = svm_label = label
        try:
            estimators = {e[0]: e[1] for e in model.estimators}
            if "rf" in estimators:
                rf_label = encoder.inverse_transform([estimators["rf"].predict(scaled)[0]])[0]
            if "xgb" in estimators:
                xgb_label = encoder.inverse_transform([estimators["xgb"].predict(scaled)[0]])[0]
            if "svm" in estimators:
                svm_label = encoder.inverse_transform([estimators["svm"].predict(scaled)[0]])[0]
        except Exception:
            pass  # ensemble doesn't expose individual estimators — that's fine

        result = {
            "prediction": label,
            "consensus": label,
            "status": "Healthy" if label == "Healthy" else "Needs Attention",
            "rf": rf_label,
            "xgb": xgb_label,
            "svm": svm_label,
            "model_dir": MODEL_DIR,
            "rule_based": False,
        }
        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({"error": f"Prediction failed: {str(e)}"}))
        sys.exit(1)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No sensor data provided"}))
        sys.exit(1)
    try:
        sensor_data = json.loads(sys.argv[1])
        model, scaler, encoder = init()
        predict(model, scaler, encoder, sensor_data)
    except json.JSONDecodeError:
        print(json.dumps({"error": "Invalid JSON argument — expected a JSON object"}))
        sys.exit(1)
