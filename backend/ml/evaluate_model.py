import joblib
import pandas as pd
import numpy as np

from pathlib import Path

from sklearn.model_selection import train_test_split, cross_val_score, KFold
from sklearn.metrics import (
    r2_score,
    mean_absolute_error,
    mean_squared_error
)
from sklearn.dummy import DummyRegressor


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_PATH = (
    BASE_DIR.parent
    / "datasets"
    / "processed"
    / "yield_df_clean.csv"
)

MODEL_DIR = BASE_DIR / "models"

MODEL_PATH = MODEL_DIR / "model.pkl"
AREA_ENCODER_PATH = MODEL_DIR / "area_encoder.pkl"
ITEM_ENCODER_PATH = MODEL_DIR / "item_encoder.pkl"


# ============================================================
# HEADER
# ============================================================

print("=" * 70)
print("YIELDSENSE AI - MODEL EVALUATION")
print("=" * 70)


# ============================================================
# LOAD DATA
# ============================================================

print("\nLoading dataset...")

df = pd.read_csv(DATA_PATH)

print("Dataset:", DATA_PATH)
print("Total samples:", len(df))

df = df.dropna()

print("Samples after cleaning:", len(df))


# ============================================================
# LOAD TRAINED MODEL
# ============================================================

print("\nLoading trained model...")

model = joblib.load(MODEL_PATH)

area_encoder = joblib.load(
    AREA_ENCODER_PATH
)

item_encoder = joblib.load(
    ITEM_ENCODER_PATH
)

print("Model:", type(model).__name__)
print("Number of areas:", len(area_encoder.classes_))
print("Number of crops:", len(item_encoder.classes_))


# ============================================================
# ENCODE CATEGORICAL FEATURES
# ============================================================

df["Area"] = area_encoder.transform(
    df["Area"]
)

df["Item"] = item_encoder.transform(
    df["Item"]
)


# ============================================================
# FEATURES
# ============================================================

FEATURES = [
    "Area",
    "Item",
    "Year",
    "average_rain_fall_mm_per_year",
    "pesticides_tonnes",
    "avg_temp"
]

TARGET = "hg/ha_yield"


X = df[FEATURES]

y = df[TARGET]


# ============================================================
# TRAIN / TEST SPLIT
# IMPORTANT:
# Must use the SAME random_state as training
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42
)


print("\n" + "=" * 70)
print("DATA SPLIT")
print("=" * 70)

print("Training samples:", len(X_train))
print("Testing samples :", len(X_test))


# ============================================================
# MODEL PREDICTION
# ============================================================

print("\nGenerating predictions...")

y_pred = model.predict(X_test)


# ============================================================
# EVALUATION METRICS
# ============================================================

r2 = r2_score(
    y_test,
    y_pred
)

mae = mean_absolute_error(
    y_test,
    y_pred
)

rmse = np.sqrt(
    mean_squared_error(
        y_test,
        y_pred
    )
)


# ============================================================
# ACTUAL VS PREDICTED
# ============================================================

comparison = pd.DataFrame({

    "Actual Yield (hg/ha)": y_test.to_numpy(),

    "Predicted Yield (hg/ha)": y_pred,

})

comparison["Absolute Error (hg/ha)"] = (
    abs(
        comparison["Actual Yield (hg/ha)"]
        -
        comparison["Predicted Yield (hg/ha)"]
    )
)


# ============================================================
# CROSS VALIDATION
# ============================================================

print("\nRunning 5-Fold Cross Validation...")

kf = KFold(
    n_splits=5,
    shuffle=True,
    random_state=42
)

cv_scores = cross_val_score(
    model,
    X,
    y,
    cv=kf,
    scoring="r2",
    n_jobs=-1
)


cv_mean = cv_scores.mean()
cv_std = cv_scores.std()


# ============================================================
# BASELINE MODEL
# ============================================================

print("\nEvaluating baseline model...")

baseline = DummyRegressor(
    strategy="mean"
)

baseline.fit(
    X_train,
    y_train
)

baseline_pred = baseline.predict(
    X_test
)

baseline_r2 = r2_score(
    y_test,
    baseline_pred
)


# ============================================================
# DISPLAY RESULTS
# ============================================================

print("\n" + "=" * 70)
print("RANDOM FOREST MODEL PERFORMANCE")
print("=" * 70)

print(
    f"R² Score              : {r2:.4f}"
)

print(
    f"R² Accuracy           : {r2 * 100:.2f}%"
)

print(
    f"MAE                   : {mae:.2f} hg/ha"
)

print(
    f"RMSE                  : {rmse:.2f} hg/ha"
)


print("\n" + "=" * 70)
print("5-FOLD CROSS VALIDATION")
print("=" * 70)

print(
    "Fold R² Scores:"
)

for i, score in enumerate(
    cv_scores,
    start=1
):

    print(
        f"Fold {i}: {score:.4f}"
    )

print(
    f"\nMean CV R² : {cv_mean:.4f}"
)

print(
    f"Std CV R²  : {cv_std:.4f}"
)


print("\n" + "=" * 70)
print("BASELINE COMPARISON")
print("=" * 70)

print(
    f"Baseline R² : {baseline_r2:.4f}"
)

print(
    f"Random Forest R² : {r2:.4f}"
)

print(
    f"Improvement : {(r2 - baseline_r2):.4f}"
)


# ============================================================
# ACTUAL VS PREDICTED
# ============================================================

print("\n" + "=" * 70)
print("ACTUAL VS PREDICTED - FIRST 10 TEST SAMPLES")
print("=" * 70)

print(
    comparison.head(10).to_string(
        index=False
    )
)


# ============================================================
# ERROR SUMMARY
# ============================================================

print("\n" + "=" * 70)
print("ERROR ANALYSIS")
print("=" * 70)

print(
    f"Average Absolute Error : {mae:.2f} hg/ha"
)

print(
    f"Root Mean Squared Error: {rmse:.2f} hg/ha"
)

print(
    f"Maximum Absolute Error : "
    f"{comparison['Absolute Error (hg/ha)'].max():.2f} hg/ha"
)


# ============================================================
# MODEL INTERPRETATION
# ============================================================

print("\n" + "=" * 70)
print("MODEL INTERPRETATION")
print("=" * 70)

if r2 >= 0.90:

    print(
        "Excellent predictive performance based on R²."
    )

elif r2 >= 0.75:

    print(
        "Good predictive performance based on R²."
    )

elif r2 >= 0.50:

    print(
        "Moderate predictive performance based on R²."
    )

else:

    print(
        "Low predictive performance based on R²."
    )


# ============================================================
# SAVE EVALUATION RESULTS
# ============================================================

evaluation_info = {

    "model":
        "Random Forest Regressor",

    "dataset_samples":
        int(len(df)),

    "training_samples":
        int(len(X_train)),

    "testing_samples":
        int(len(X_test)),

    "r2_score":
        float(r2),

    "r2_percentage":
        float(r2 * 100),

    "mae":
        float(mae),

    "rmse":
        float(rmse),

    "cross_validation_mean_r2":
        float(cv_mean),

    "cross_validation_std":
        float(cv_std),

    "baseline_r2":
        float(baseline_r2),

    "features":
        FEATURES,

    "target":
        TARGET
}


joblib.dump(
    evaluation_info,
    MODEL_DIR / "evaluation_info.pkl"
)


# ============================================================
# SAVE ACTUAL VS PREDICTED
# ============================================================

comparison.to_csv(
    MODEL_DIR / "actual_vs_predicted.csv",
    index=False
)


# ============================================================
# FINAL
# ============================================================

print("\n" + "=" * 70)
print("EVALUATION COMPLETED SUCCESSFULLY")
print("=" * 70)

print("\nGenerated files:")

print(
    "evaluation_info.pkl"
)

print(
    "actual_vs_predicted.csv"
)

print("\nYieldSense AI model evaluation completed.")