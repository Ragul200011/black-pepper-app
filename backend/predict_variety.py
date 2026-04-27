import os
import sys
import json
import numpy as np
from PIL import Image
import tensorflow as tf

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")

STAGEA_MODEL_PATH = os.path.join(MODEL_DIR, "stageA_saved_model")
VARIETY_MODEL_PATH = os.path.join(MODEL_DIR, "stageB_saved_model")

IMG_SIZE = (224, 224)

STAGEA_CLASSES = ["other", "pepper_leaf"]  # alphabetical order
VARIETY_CLASSES = ["Butawerala", "Dingirala", "Kohukuburerala"]

STAGEA_THRESHOLD = 0.80
VARIETY_THRESHOLD = 0.50


def load_models():
    try:
        if not os.path.exists(STAGEA_MODEL_PATH):
            raise FileNotFoundError(f"Missing Stage A model: {STAGEA_MODEL_PATH}")
        if not os.path.exists(VARIETY_MODEL_PATH):
            raise FileNotFoundError(f"Missing Variety model: {VARIETY_MODEL_PATH}")

        stageA_model = tf.saved_model.load(STAGEA_MODEL_PATH)
        variety_model = tf.saved_model.load(VARIETY_MODEL_PATH)

        return stageA_model, variety_model
    except Exception as e:
        print(json.dumps({
            "accepted": False,
            "error": f"Failed to load models: {str(e)}"
        }))
        sys.exit(1)


def prepare_raw_image(img_path):
    """Raw pixels [0-255] — Stage A model has preprocessing built in."""
    img = Image.open(img_path).convert("RGB")
    img = img.resize(IMG_SIZE)
    x = np.array(img, dtype=np.float32)
    x = np.expand_dims(x, axis=0)
    return x


def prepare_variety_image(img_path):
    """EfficientNet preprocessing for Stage B."""
    img = Image.open(img_path).convert("RGB")
    img = img.resize(IMG_SIZE)
    x = np.array(img, dtype=np.float32)
    x = tf.keras.applications.efficientnet.preprocess_input(x)
    x = np.expand_dims(x, axis=0)
    return x


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"accepted": False, "error": "Image path not provided"}))
        sys.exit(1)

    img_path = sys.argv[1]

    if not os.path.exists(img_path):
        print(json.dumps({"accepted": False, "error": "Image file not found"}))
        sys.exit(1)

    try:
        stageA_model, variety_model = load_models()

        # ── Stage A: pepper vs other ──────────────────────────────────────
        x_stageA = prepare_raw_image(img_path)
        stageA_probs = stageA_model.serve([x_stageA]).numpy()[0]

        stageA_idx = int(np.argmax(stageA_probs))
        stageA_label = STAGEA_CLASSES[stageA_idx]
        stageA_conf = float(stageA_probs[stageA_idx])

        result = {
            "accepted": True,
            "stageA": {
                "label": stageA_label,
                "confidence": round(stageA_conf * 100, 2)
            }
        }

        if stageA_label != "pepper_leaf":
            result["stageA_warning"] = "Stage A classified this image as non-pepper, but variety prediction was still attempted."
        elif stageA_conf < STAGEA_THRESHOLD:
            result["stageA_warning"] = "Pepper leaf detected with low confidence, but variety prediction was still attempted."

        # Stage B: variety classification
        x_variety = prepare_variety_image(img_path)
        variety_probs = variety_model.serve(x_variety).numpy()[0]

        variety_idx = int(np.argmax(variety_probs))
        variety_label = VARIETY_CLASSES[variety_idx]
        variety_conf = float(variety_probs[variety_idx])

        result["prediction"] = {
            "label": variety_label,
            "confidence": round(variety_conf * 100, 2)
        }
        result["probabilities"] = {
            VARIETY_CLASSES[i]: round(float(variety_probs[i]) * 100, 2)
            for i in range(len(VARIETY_CLASSES))
        }

        result["message"] = "ok" if variety_conf >= VARIETY_THRESHOLD else "Variety prediction confidence is low."

        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({"accepted": False, "error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()