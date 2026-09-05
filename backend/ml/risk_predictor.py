import os
import joblib
import pandas as pd


# =========================================================
# PATH
# =========================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "ml",
    "models",
    "risk_model.pkl"
)


# =========================================================
# LOAD COMPLETE PIPELINE
# =========================================================

model = joblib.load(MODEL_PATH)


# =========================================================
# FEATURES
# =========================================================

FEATURES = [

    "state",

    "crop",

    "nitrogen",

    "phosphorus",

    "potassium",

    "ph",

    "temperature",

    "humidity",

    "rainfall",

    "wind",

    "predicted_yield_tonnes_ha"
]


# =========================================================
# CLAMP
# =========================================================

def clamp(
    value,
    minimum=0,
    maximum=100
):

    return max(
        minimum,
        min(
            maximum,
            float(value)
        )
    )


# =========================================================
# AI RISK PREDICTION
# =========================================================

def predict_risk(

    state,

    crop,

    nitrogen,

    phosphorus,

    potassium,

    ph,

    temperature,

    humidity,

    rainfall,

    wind,

    predicted_yield_tonnes_ha

):

    # =====================================================
    # INPUT DATA
    # =====================================================

    values = {

        "state": str(state),

        "crop": str(crop),

        "nitrogen": float(nitrogen),

        "phosphorus": float(phosphorus),

        "potassium": float(potassium),

        "ph": float(ph),

        "temperature": float(temperature),

        "humidity": float(humidity),

        "rainfall": float(rainfall),

        "wind": float(wind),

        "predicted_yield_tonnes_ha":
            float(predicted_yield_tonnes_ha)
    }


    # =====================================================
    # DATAFRAME
    #
    # Important:
    # This dataframe has the same feature names used
    # during model training.
    # =====================================================

    X = pd.DataFrame(

        [[
            values[feature]
            for feature in FEATURES
        ]],

        columns=FEATURES
    )


    # =====================================================
    # MODEL CLASSIFICATION
    # =====================================================

    prediction = model.predict(X)[0]


    if prediction == -1:

        model_prediction = "Anomalous"

    else:

        model_prediction = "Normal"


    # =====================================================
    # ISOLATION FOREST DECISION SCORE
    # =====================================================

    decision_score = float(
        model.decision_function(X)[0]
    )


    # =====================================================
    # AI RISK SCORE
    #
    # Isolation Forest:
    #
    # Higher decision score = more normal
    # Lower decision score = more anomalous
    #
    # Convert model score into 0-100 risk.
    #
    # No agricultural if/else thresholds are used here.
    # =====================================================

    risk_score = (
        50 -
        (decision_score * 100)
    )

    risk_score = clamp(
        risk_score
    )


    # =====================================================
    # DATA-DRIVEN RISK LEVEL
    #
    # This uses the model's anomaly classification
    # together with the continuous AI score.
    # =====================================================

    if model_prediction == "Anomalous":

        if risk_score >= 60:

            overall_risk = "HIGH"

        else:

            overall_risk = "MEDIUM"

    else:

        if risk_score >= 60:

            overall_risk = "MEDIUM"

        else:

            overall_risk = "LOW"


    # =====================================================
    # RETURN
    # =====================================================

    return {

        "risk_score":
            round(
                risk_score,
                2
            ),

        "overall_risk":
            overall_risk,

        "model_prediction":
            model_prediction,

        "model":
            "Isolation Forest",

        "decision_score":
            round(
                decision_score,
                4
            ),

        "features":
            values
    }