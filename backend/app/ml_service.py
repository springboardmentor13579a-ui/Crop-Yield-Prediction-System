"""YieldSense AI ML service.

Uses the supplied Random Forest pipeline:
backend/models/crop_yield_prediction_model.pkl

The pipeline was trained for Yield prediction using:
Year, State, Crop, Season, Area, Annual_Rainfall, Fertilizer, Pesticide
plus:
Rainfall_per_Area, Fertilizer_per_Area, Pesticide_per_Area, Year_Index

The metadata/options dataset is loaded online from Hugging Face.
"""
from functools import lru_cache
from pathlib import Path
import math
import joblib
import numpy as np
import pandas as pd
try:
    from datasets import load_dataset
except ImportError:
    load_dataset = None
from .config import settings

FEATURES = [
    "Year", "State", "Crop", "Season", "Area",
    "Annual_Rainfall", "Fertilizer", "Pesticide",
    "Rainfall_per_Area", "Fertilizer_per_Area",
    "Pesticide_per_Area", "Year_Index",
]
CATEGORICAL = ["State", "Crop", "Season"]


@lru_cache(maxsize=1)
def get_dataset() -> pd.DataFrame:
    """Load the full Hugging Face dataset (train + test) for options/context."""
    try:
        if load_dataset is None:
            raise ImportError("datasets package is not installed")
        ds = load_dataset(settings.hf_dataset_id)
        frames = [split.to_pandas() for split in ds.values()]
        df = pd.concat(frames, ignore_index=True)
    except Exception:
        # Keep the app usable offline. This local CSV has the same source-style
        # agricultural columns, but the production model is never loaded from it.
        df = pd.read_csv(settings.data_path)

    df = df.copy()
    df.columns = df.columns.str.strip()

    # Normalize the local/source naming difference.
    if "Crop_Year" in df.columns and "Year" not in df.columns:
        df = df.rename(columns={"Crop_Year": "Year"})

    for c in CATEGORICAL:
        df[c] = df[c].astype(str).str.strip()

    for c in ["Year", "Area", "Production", "Annual_Rainfall", "Fertilizer", "Pesticide", "Yield"]:
        if c in df.columns:
            df[c] = pd.to_numeric(df[c], errors="coerce")

    return df.dropna(subset=["Year", "Crop", "State", "Season"])


@lru_cache(maxsize=1)
def get_model():
    """Load the supplied Random Forest .pkl pipeline once."""
    path = Path(settings.yield_model_path)
    if not path.exists():
        raise FileNotFoundError(f"Yield model not found: {path}")
    try:
        return joblib.load(path)
    except Exception as exc:
        raise RuntimeError(
            f"Unable to load Random Forest model at {path}. "
            f"Make sure the backend uses the scikit-learn version pinned in requirements.txt. "
            f"Original error: {exc}"
        ) from exc


def options() -> dict:
    df = get_dataset()
    return {
        "crops": sorted(df["Crop"].dropna().unique().tolist()),
        "states": sorted(df["State"].dropna().unique().tolist()),
        "seasons": sorted(df["Season"].dropna().unique().tolist()),
        "year_min": int(df["Year"].min()),
        "year_max": int(df["Year"].max()),
        "model": "Random Forest",
        "target": "Yield",
        "model_features": FEATURES,
        "dataset": settings.hf_dataset_id,
        # Kept for the existing soil UI; soil values are NOT model inputs.
        "soil_types": ["Alluvial", "Black", "Red", "Laterite", "Sandy", "Loamy", "Clay", "Silty", "Other"],
        "irrigation_types": ["Rainfed", "Canal", "Tube well", "Drip", "Sprinkler", "Mixed", "Other"],
    }


def _frame(payload: dict) -> pd.DataFrame:
    df = get_dataset()
    min_year = int(df["Year"].min())
    area = float(payload["area"])
    rainfall = float(payload["annual_rainfall"])
    fertilizer = float(payload["fertilizer"])
    pesticide = float(payload["pesticide"])

    # Exact feature engineering used by the supplied .pkl model.
    row = {
        "Year": int(payload["crop_year"]),
        "State": str(payload["state"]).strip(),
        "Crop": str(payload["crop"]).strip(),
        "Season": str(payload["season"]).strip(),
        "Area": area,
        "Annual_Rainfall": rainfall,
        "Fertilizer": fertilizer,
        "Pesticide": pesticide,
        "Rainfall_per_Area": rainfall / (area + 1.0),
        "Fertilizer_per_Area": fertilizer / (area + 1.0),
        "Pesticide_per_Area": pesticide / (area + 1.0),
        "Year_Index": int(payload["crop_year"]) - min_year,
    }
    return pd.DataFrame([row], columns=FEATURES)


def forecast(payload: dict) -> tuple[float, float]:
    X = _frame(payload)
    yld = max(0.0, float(get_model().predict(X)[0]))
    production = max(0.0, yld * float(payload["area"]))
    if not math.isfinite(production):
        production = 0.0
    return yld, production


def historical_context(payload: dict) -> dict:
    df = get_dataset()
    subset = df[
        (df["Crop"] == payload["crop"])
        & (df["State"] == payload["state"])
        & (df["Season"] == payload["season"])
    ].copy()

    if subset.empty:
        subset = df[
            (df["Crop"] == payload["crop"])
            & (df["State"] == payload["state"])
        ].copy()
    if subset.empty:
        subset = df[df["Crop"] == payload["crop"]].copy()
    if subset.empty:
        return {
            "yield_median": None,
            "rainfall_median": None,
            "fertilizer_rate_median": None,
            "pesticide_rate_median": None,
            "records": 0,
        }

    safe_area = subset["Area"].replace(0, np.nan)
    fertilizer_rate = (subset["Fertilizer"] / safe_area).replace([np.inf, -np.inf], np.nan)
    pesticide_rate = (subset["Pesticide"] / safe_area).replace([np.inf, -np.inf], np.nan)

    return {
        "yield_median": float(subset["Yield"].median()),
        "rainfall_median": float(subset["Annual_Rainfall"].median()),
        "fertilizer_rate_median": float(fertilizer_rate.median()) if fertilizer_rate.notna().any() else None,
        "pesticide_rate_median": float(pesticide_rate.median()) if pesticide_rate.notna().any() else None,
        "records": int(len(subset)),
    }
