from pathlib import Path
import joblib

MODEL = Path(__file__).resolve().parent / "models" / "crop_yield_prediction_model.pkl"

model = joblib.load(MODEL)

print("Model loaded successfully.")
print("Model type:", type(model).__name__)

if hasattr(model, "feature_names_in_"):
    print("Expected features:")
    for feature in model.feature_names_in_:
        print(" -", feature)
