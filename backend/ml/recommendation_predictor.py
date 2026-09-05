import os
import joblib
import pandas as pd


# =========================================================
# PATHS
# =========================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "ml",
    "models",
    "crop_recommendation_model.pkl"
)


# =========================================================
# MODEL FEATURES
# =========================================================

FEATURES = [
    "N",
    "P",
    "K",
    "temperature",
    "humidity",
    "ph",
    "rainfall"
]


# =========================================================
# LOAD MODEL
# =========================================================

print("=" * 60)
print("LOADING CROP RECOMMENDATION MODEL")
print("=" * 60)

if not os.path.exists(MODEL_PATH):

    raise FileNotFoundError(
        f"Crop recommendation model not found: {MODEL_PATH}"
    )

model = joblib.load(MODEL_PATH)

print("Model loaded successfully")
print("Model path:", MODEL_PATH)

print("Expected features:")

if hasattr(model, "feature_names_in_"):

    print(
        list(model.feature_names_in_)
    )

else:

    print(FEATURES)

print("=" * 60)


# =========================================================
# INPUT VALIDATION
# =========================================================

def validate_inputs(
    nitrogen,
    phosphorus,
    potassium,
    temperature,
    humidity,
    ph,
    rainfall
):

    values = {

        "nitrogen": nitrogen,
        "phosphorus": phosphorus,
        "potassium": potassium,
        "temperature": temperature,
        "humidity": humidity,
        "ph": ph,
        "rainfall": rainfall
    }

    # -----------------------------------------------------
    # CHECK NUMERIC VALUES
    # -----------------------------------------------------

    for name, value in values.items():

        if value is None:

            raise ValueError(
                f"{name} is required"
            )

        try:

            float(value)

        except (TypeError, ValueError):

            raise ValueError(
                f"{name} must be a number"
            )


    # -----------------------------------------------------
    # SOIL VALUE VALIDATION
    # -----------------------------------------------------

    if nitrogen < 0:
        raise ValueError("Nitrogen cannot be negative")

    if phosphorus < 0:
        raise ValueError("Phosphorus cannot be negative")

    if potassium < 0:
        raise ValueError("Potassium cannot be negative")


    # -----------------------------------------------------
    # WEATHER VALIDATION
    # -----------------------------------------------------

    if humidity < 0 or humidity > 100:

        raise ValueError(
            "Humidity must be between 0 and 100"
        )

    if rainfall < 0:

        raise ValueError(
            "Rainfall cannot be negative"
        )


    # -----------------------------------------------------
    # SOIL PH VALIDATION
    # -----------------------------------------------------

    if ph < 0 or ph > 14:

        raise ValueError(
            "Soil pH must be between 0 and 14"
        )


# =========================================================
# CROP RECOMMENDATION
# =========================================================

def recommend_crops(
    nitrogen,
    phosphorus,
    potassium,
    temperature,
    humidity,
    ph,
    rainfall
):

    # =====================================================
    # VALIDATE INPUT
    # =====================================================

    validate_inputs(

        nitrogen,
        phosphorus,
        potassium,
        temperature,
        humidity,
        ph,
        rainfall
    )


    # =====================================================
    # CREATE MODEL INPUT
    # =====================================================

    input_data = pd.DataFrame(

        [[

            float(nitrogen),
            float(phosphorus),
            float(potassium),
            float(temperature),
            float(humidity),
            float(ph),
            float(rainfall)

        ]],

        columns=FEATURES
    )


    # =====================================================
    # CHECK MODEL FEATURE ORDER
    # =====================================================

    if hasattr(model, "feature_names_in_"):

        model_features = list(
            model.feature_names_in_
        )

        if model_features != FEATURES:

            raise ValueError(

                "Model feature mismatch. "
                f"Expected {FEATURES}, "
                f"but model uses {model_features}"
            )


    # =====================================================
    # PREDICT BEST CROP
    # =====================================================

    predicted_crop = model.predict(
        input_data
    )[0]


    # =====================================================
    # GET PROBABILITIES
    # =====================================================

    if not hasattr(model, "predict_proba"):

        return {

            "recommended_crop":
                str(predicted_crop),

            "recommendations": []

        }


    probabilities = model.predict_proba(
        input_data
    )[0]

    classes = model.classes_


    # =====================================================
    # CREATE RECOMMENDATION LIST
    # =====================================================

    recommendations = []

    for crop, probability in zip(
        classes,
        probabilities
    ):

        recommendations.append({

            "crop":
                str(crop),

            "confidence":
                round(
                    float(probability) * 100,
                    2
                )

        })


    # =====================================================
    # SORT BY MODEL CONFIDENCE
    # =====================================================

    recommendations.sort(

        key=lambda item:
            item["confidence"],

        reverse=True
    )


    # =====================================================
    # TOP 5
    # =====================================================

    top_recommendations = (
        recommendations[:5]
    )


    # =====================================================
    # RESPONSE
    # =====================================================

    return {

        "recommended_crop":
            str(predicted_crop),

        "recommendations":
            top_recommendations

    }