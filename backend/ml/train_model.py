import joblib
import pandas as pd

from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error


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

MODEL_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# LOAD DATASET
# ============================================================

print("=" * 60)
print("LOADING CROP YIELD DATASET")
print("=" * 60)

print("Dataset path:", DATA_PATH)

df = pd.read_csv(DATA_PATH)

print("\nFirst 5 rows:")
print(df.head())

print("\nDataset shape:", df.shape)


# ============================================================
# CLEAN DATA
# ============================================================

df = df.dropna()

print("\nAfter removing missing values:", df.shape)


# ============================================================
# DISPLAY INFORMATION
# ============================================================

print("\nAreas:")
print(df["Area"].unique())

print("\nCrops:")
print(df["Item"].unique())


# ============================================================
# ENCODE AREA AND CROP
# ============================================================

area_encoder = LabelEncoder()
item_encoder = LabelEncoder()

df["Area"] = area_encoder.fit_transform(df["Area"])

df["Item"] = item_encoder.fit_transform(df["Item"])


# ============================================================
# FEATURES AND TARGET
# ============================================================

X = df[
    [
        "Area",
        "Item",
        "Year",
        "average_rain_fall_mm_per_year",
        "pesticides_tonnes",
        "avg_temp",
    ]
]

y = df["hg/ha_yield"]


# ============================================================
# TRAIN / TEST SPLIT
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42
)

print("\nTraining samples:", len(X_train))
print("Testing samples:", len(X_test))


# ============================================================
# RANDOM FOREST REGRESSION
# ============================================================

print("\n" + "=" * 60)
print("TRAINING RANDOM FOREST")
print("=" * 60)

model = RandomForestRegressor(
    n_estimators=300,
    max_depth=None,
    min_samples_split=2,
    min_samples_leaf=1,
    max_features="sqrt",
    random_state=42,
    n_jobs=-1
)

model.fit(X_train, y_train)


# ============================================================
# PREDICTION
# ============================================================

y_pred = model.predict(X_test)


# ============================================================
# EVALUATION
# ============================================================

r2 = r2_score(y_test, y_pred)

mae = mean_absolute_error(y_test, y_pred)

rmse = mean_squared_error(
    y_test,
    y_pred
) ** 0.5


print("\n" + "=" * 60)
print("RANDOM FOREST RESULTS")
print("=" * 60)

print(f"R²   : {r2:.4f}")
print(f"R² % : {r2 * 100:.2f}%")
print(f"MAE  : {mae:.2f}")
print(f"RMSE : {rmse:.2f}")


# ============================================================
# SAVE MODEL
# ============================================================

joblib.dump(
    model,
    MODEL_DIR / "model.pkl"
)

joblib.dump(
    area_encoder,
    MODEL_DIR / "area_encoder.pkl"
)

joblib.dump(
    item_encoder,
    MODEL_DIR / "item_encoder.pkl"
)


# ============================================================
# SAVE MODEL INFORMATION
# ============================================================

model_info = {
    "model": "Random Forest Regressor",
    "r2_score": float(r2),
    "r2_percentage": float(r2 * 100),
    "mae": float(mae),
    "rmse": float(rmse),
    "training_samples": int(len(X_train)),
    "testing_samples": int(len(X_test)),
    "features": [
        "Area",
        "Item",
        "Year",
        "average_rain_fall_mm_per_year",
        "pesticides_tonnes",
        "avg_temp"
    ],
    "target": "hg/ha_yield"
}

joblib.dump(
    model_info,
    MODEL_DIR / "model_info.pkl"
)


# ============================================================
# COMPLETED
# ============================================================

print("\n" + "=" * 60)
print("MODEL SAVED SUCCESSFULLY")
print("=" * 60)

print("model.pkl")
print("area_encoder.pkl")
print("item_encoder.pkl")
print("model_info.pkl")

print("\nTraining completed!")