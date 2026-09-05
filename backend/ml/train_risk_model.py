import os
import joblib
import pandas as pd

from sklearn.ensemble import IsolationForest
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline


# =========================================================
# PATHS
# =========================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

MODEL_DIR = os.path.join(
    BASE_DIR,
    "ml",
    "models"
)

os.makedirs(MODEL_DIR, exist_ok=True)

MODEL_PATH = os.path.join(
    MODEL_DIR,
    "risk_model.pkl"
)


# =========================================================
# TRAINING DATA
#
# State soil values are based on the supplied soil dataset.
#
# Weather / yield values are representative training
# observations used to train the anomaly model.
#
# State and crop are included as categorical features.
# =========================================================

data = [

    # state, crop, N, P, K, pH, temp, humidity, rainfall, wind, yield

    ["Andhra Pradesh", "Maize", 78, 45, 22, 6.8, 27, 65, 800, 8, 6.2],
    ["Arunachal Pradesh", "Rice", 55, 15, 35, 5.5, 24, 78, 1200, 6, 4.5],
    ["Assam", "Rice", 60, 18, 38, 5.8, 26, 82, 1400, 10, 4.2],
    ["Bihar", "Wheat", 85, 30, 25, 7.2, 30, 60, 700, 12, 5.5],
    ["Chhattisgarh", "Rice", 70, 35, 20, 6.5, 28, 68, 900, 9, 5.8],
    ["Delhi", "Wheat", 90, 40, 30, 7.5, 35, 45, 500, 15, 5.2],
    ["Goa", "Rice", 65, 25, 45, 6.2, 29, 75, 1100, 8, 6.0],
    ["Gujarat", "Cotton", 75, 38, 28, 7.8, 32, 48, 450, 14, 5.1],
    ["Haryana", "Wheat", 130, 48, 35, 7.9, 34, 42, 400, 18, 5.0],
    ["Himachal Pradesh", "Apple", 60, 20, 40, 6.0, 22, 80, 1300, 7, 5.0],
    ["Jharkhand", "Maize", 68, 22, 30, 6.1, 27, 72, 1000, 9, 5.4],
    ["Jammu and Kashmir", "Apple", 70, 25, 42, 6.7, 25, 76, 1500, 8, 5.6],
    ["Karnataka", "Maize", 72, 42, 25, 6.9, 29, 64, 850, 11, 6.0],
    ["Kerala", "Rice", 65, 28, 50, 5.7, 26, 85, 1700, 7, 6.1],
    ["Madhya Pradesh", "Soybean", 70, 40, 20, 7.4, 31, 55, 600, 13, 5.7],
    ["Maharashtra", "Cotton", 75, 43, 26, 7.1, 30, 58, 750, 12, 6.0],
    ["Manipur", "Rice", 58, 17, 37, 5.9, 25, 80, 1300, 8, 4.7],
    ["Meghalaya", "Rice", 52, 16, 33, 5.6, 23, 83, 1600, 7, 4.4],
    ["Mizoram", "Rice", 54, 15, 34, 5.7, 24, 82, 1500, 8, 4.5],
    ["Nagaland", "Maize", 56, 16, 36, 5.8, 25, 79, 1400, 9, 4.6],
    ["Odisha", "Rice", 67, 26, 32, 6.3, 28, 70, 1000, 10, 5.5],
    ["Puducherry", "Rice", 88, 55, 40, 7.0, 31, 60, 800, 14, 6.4],
    ["Punjab", "Wheat", 150, 50, 40, 8.0, 33, 50, 500, 16, 5.8],
    ["Sikkim", "Maize", 50, 20, 30, 5.5, 21, 85, 1500, 6, 4.2],
    ["Tamil Nadu", "Wheat", 80, 38, 30, 6.6, 32, 51, 0, 19, 6.0],
    ["Telangana", "Maize", 77, 48, 24, 7.0, 30, 55, 600, 15, 5.9],

    # Additional observations

    ["Andhra Pradesh", "Rice", 72, 35, 30, 6.7, 28, 62, 750, 10, 6.1],
    ["Tamil Nadu", "Maize", 76, 40, 32, 6.9, 29, 65, 850, 9, 6.4],
    ["Karnataka", "Cotton", 68, 30, 35, 6.4, 27, 70, 950, 8, 5.9],
    ["Maharashtra", "Soybean", 82, 42, 31, 6.8, 28, 63, 800, 10, 6.5],
    ["Gujarat", "Cotton", 74, 37, 29, 6.6, 30, 61, 700, 12, 6.0],
    ["Punjab", "Wheat", 79, 39, 33, 6.9, 27, 67, 900, 9, 6.3],
    ["Odisha", "Rice", 70, 34, 31, 6.5, 26, 72, 1000, 8, 5.8],
    ["Bihar", "Maize", 83, 44, 34, 7.0, 29, 60, 850, 11, 6.6],
]


# =========================================================
# DATAFRAME
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

df = pd.DataFrame(
    data,
    columns=FEATURES
)


# =========================================================
# FEATURES
# =========================================================

CATEGORICAL_FEATURES = [
    "state",
    "crop"
]

NUMERIC_FEATURES = [
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


X = df[
    CATEGORICAL_FEATURES +
    NUMERIC_FEATURES
]


# =========================================================
# PREPROCESSING
# =========================================================

preprocessor = ColumnTransformer(

    transformers=[

        (
            "categorical",

            OneHotEncoder(
                handle_unknown="ignore"
            ),

            CATEGORICAL_FEATURES
        ),

        (
            "numeric",

            StandardScaler(),

            NUMERIC_FEATURES
        )
    ]
)


# =========================================================
# ISOLATION FOREST
# =========================================================

isolation_forest = IsolationForest(

    n_estimators=500,

    contamination=0.15,

    random_state=42,

    max_samples="auto"
)


# =========================================================
# COMPLETE ML PIPELINE
# =========================================================

pipeline = Pipeline(

    steps=[

        (
            "preprocessor",
            preprocessor
        ),

        (
            "model",
            isolation_forest
        )
    ]
)


# =========================================================
# TRAIN
# =========================================================

pipeline.fit(X)


# =========================================================
# SAVE COMPLETE MODEL
# =========================================================

joblib.dump(
    pipeline,
    MODEL_PATH
)


# =========================================================
# OUTPUT
# =========================================================

print("=" * 70)
print("AI RISK MODEL TRAINING COMPLETE")
print("=" * 70)

print(
    f"Model saved to: {MODEL_PATH}"
)

print(
    f"Training records: {len(df)}"
)

print(
    f"Categorical features: {CATEGORICAL_FEATURES}"
)

print(
    f"Numeric features: {NUMERIC_FEATURES}"
)

print(
    "Algorithm: Isolation Forest"
)

print(
    "State and Crop are included as ML features."
)

print("=" * 70)