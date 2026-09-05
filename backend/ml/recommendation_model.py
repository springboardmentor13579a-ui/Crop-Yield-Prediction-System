import pandas as pd
import joblib
import os

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report


# =========================================================
# PATHS
# =========================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

DATASET_PATH = os.path.join(
    BASE_DIR,
    "..",
    "datasets",
    "processed",
    "crop_recommendation_clean.csv"
)

DATASET_PATH = os.path.abspath(DATASET_PATH)

MODEL_DIR = os.path.join(
    BASE_DIR,
    "ml",
    "models"
)

MODEL_PATH = os.path.join(
    MODEL_DIR,
    "crop_recommendation_model.pkl"
)


# =========================================================
# LOAD DATASET
# =========================================================

print("=" * 60)
print("LOADING CROP RECOMMENDATION DATASET")
print("=" * 60)

df = pd.read_csv(DATASET_PATH)

print("Dataset shape:", df.shape)
print("Columns:", df.columns.tolist())


# =========================================================
# FEATURES AND TARGET
# =========================================================

features = [
    "N",
    "P",
    "K",
    "temperature",
    "humidity",
    "ph",
    "rainfall"
]

X = df[features]

y = df["label"]


# =========================================================
# TRAIN / TEST SPLIT
# =========================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)


print("Training samples:", len(X_train))
print("Testing samples:", len(X_test))


# =========================================================
# RANDOM FOREST CLASSIFIER
# =========================================================

model = RandomForestClassifier(
    n_estimators=300,
    random_state=42,
    n_jobs=-1,
    max_depth=None
)


print("=" * 60)
print("TRAINING MODEL")
print("=" * 60)

model.fit(
    X_train,
    y_train
)


# =========================================================
# EVALUATION
# =========================================================

y_pred = model.predict(X_test)

accuracy = accuracy_score(
    y_test,
    y_pred
)

print("=" * 60)
print("MODEL PERFORMANCE")
print("=" * 60)

print(
    f"Accuracy: {accuracy * 100:.2f}%"
)

print("\nClassification Report:\n")

print(
    classification_report(
        y_test,
        y_pred
    )
)


# =========================================================
# SAVE MODEL
# =========================================================

os.makedirs(
    MODEL_DIR,
    exist_ok=True
)

joblib.dump(
    model,
    MODEL_PATH
)


print("=" * 60)
print("MODEL SAVED")
print("=" * 60)

print(
    "Model path:",
    MODEL_PATH
)