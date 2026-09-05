import joblib
import pandas as pd
from pathlib import Path
# ============================================================
# MODEL DIRECTORY
# ============================================================
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "models"
print("=" * 60)
print("LOADING YIELD PREDICTION MODEL")
print("Model directory:", MODEL_DIR)
print("=" * 60)
# ============================================================
# LOAD MODEL
# ============================================================
model = joblib.load(MODEL_DIR / "model.pkl")
area_encoder = joblib.load(
    MODEL_DIR / "area_encoder.pkl"
)
item_encoder = joblib.load(
    MODEL_DIR / "item_encoder.pkl"
)
print("✅ Model loaded")
print("Model type:", type(model).__name__)

print("Areas:", len(area_encoder.classes_))
print("Crops:", len(item_encoder.classes_))

print("Sample areas:", area_encoder.classes_[:5])
print("Sample crops:", item_encoder.classes_[:5])

print("=" * 60)


# ============================================================
# PREDICTION FUNCTION
# ============================================================

def predict_yield(
    area,
    item,
    year,
    rainfall,
    pesticides,
    temperature,
):

    # --------------------------------------------------------
    # Check area
    # --------------------------------------------------------

    if area not in area_encoder.classes_:
        raise ValueError(
            f"Area '{area}' is not available in the trained dataset."
        )

    # --------------------------------------------------------
    # Check crop
    # --------------------------------------------------------

    if item not in item_encoder.classes_:
        raise ValueError(
            f"Crop '{item}' is not available in the trained dataset."
        )

    # --------------------------------------------------------
    # Encode categorical values
    # --------------------------------------------------------

    area_encoded = area_encoder.transform([area])[0]

    item_encoded = item_encoder.transform([item])[0]

    # --------------------------------------------------------
    # Create input DataFrame
    # IMPORTANT:
    # These column names must match training
    # --------------------------------------------------------

    input_data = pd.DataFrame(
        [[
            area_encoded,
            item_encoded,
            year,
            rainfall,
            pesticides,
            temperature,
        ]],
        columns=[
            "Area",
            "Item",
            "Year",
            "average_rain_fall_mm_per_year",
            "pesticides_tonnes",
            "avg_temp",
        ],
    )

    # --------------------------------------------------------
    # Predict
    # --------------------------------------------------------

    prediction = model.predict(input_data)[0]

    # --------------------------------------------------------
    # Return
    # --------------------------------------------------------

    return float(round(prediction, 2))