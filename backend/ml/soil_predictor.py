import pandas as pd
from pathlib import Path


# =========================================================
# LOAD SOIL DATASET
# =========================================================

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_PATH = (
    BASE_DIR.parent
    / "datasets"
    / "processed"
    / "soil_clean.csv"
)

soil_df = pd.read_csv(DATA_PATH)

print("=" * 50)
print("Loading soil predictor...")
print("Soil dataset:", DATA_PATH)
print("Rows:", len(soil_df))
print("Columns:", list(soil_df.columns))
print("=" * 50)


# =========================================================
# SOIL ANALYSIS
# =========================================================

def analyze_soil(state: str):

    if not state or not state.strip():
        raise ValueError("State is required")

    state = state.strip()

    # -----------------------------------------------------
    # FIND STATE
    # -----------------------------------------------------

    row = soil_df[
        soil_df["state"]
        .astype(str)
        .str.strip()
        .str.lower()
        == state.lower()
    ]

    if row.empty:
        raise ValueError(
            f"State '{state}' not found in soil dataset"
        )

    row = row.iloc[0]

    # -----------------------------------------------------
    # GET SOIL VALUES
    # -----------------------------------------------------

    N = int(row["N"])
    P = int(row["P"])
    K = int(row["K"])
    pH = float(row["pH"])

    # -----------------------------------------------------
    # NUTRIENT STATUS
    # -----------------------------------------------------

    def get_status(value):

        if value >= 70:
            return "High"

        elif value >= 40:
            return "Medium"

        return "Low"

    n_status = get_status(N)
    p_status = get_status(P)
    k_status = get_status(K)

    # -----------------------------------------------------
    # PH STATUS
    # -----------------------------------------------------

    if pH < 6.5:

        ph_status = "Acidic"

    elif pH <= 7.5:

        ph_status = "Neutral"

    else:

        ph_status = "Alkaline"

    # -----------------------------------------------------
    # SOIL HEALTH SCORE
    # -----------------------------------------------------

    nitrogen_score = min(N, 100)

    phosphorus_score = min(P * 2, 100)

    potassium_score = min(K * 3, 100)

    ph_score = max(
        0,
        100 - abs(7 - pH) * 12
    )

    score = round(
        (
            nitrogen_score
            + phosphorus_score
            + potassium_score
            + ph_score
        ) / 4
    )

    score = max(0, min(score, 100))

    # -----------------------------------------------------
    # FERTILIZER RECOMMENDATION
    # -----------------------------------------------------

    fertilizer = []

    if n_status == "Low":
        fertilizer.append("Urea")

    if p_status == "Low":
        fertilizer.append("DAP")

    if k_status == "Low":
        fertilizer.append("MOP")

    if not fertilizer:
        fertilizer.append("Organic Compost")

    fertilizer_text = ", ".join(fertilizer)

    # -----------------------------------------------------
    # CROP RECOMMENDATION
    # -----------------------------------------------------

    if 6.5 <= pH <= 7.5:

        crops = [
            "Rice",
            "Maize",
            "Groundnut",
            "Sugarcane"
        ]

    elif pH < 6.5:

        crops = [
            "Tea",
            "Coffee",
            "Potato"
        ]

    else:

        crops = [
            "Cotton",
            "Millets",
            "Wheat"
        ]

    # -----------------------------------------------------
    # IMPROVEMENT ADVICE
    # -----------------------------------------------------

    improvements = []

    if n_status == "Low":

        improvements.append(
            "Nitrogen is low. Consider nitrogen-rich "
            "fertilizer such as Urea or organic manure."
        )

    elif n_status == "High":

        improvements.append(
            "Nitrogen is high. Avoid excessive nitrogen "
            "fertilizer application."
        )

    else:

        improvements.append(
            "Nitrogen level is in a moderate range."
        )

    if p_status == "Low":

        improvements.append(
            "Phosphorus is low. DAP or phosphorus-rich "
            "fertilizer may be beneficial."
        )

    elif p_status == "High":

        improvements.append(
            "Phosphorus level is high. Avoid unnecessary "
            "phosphorus application."
        )

    else:

        improvements.append(
            "Phosphorus level is in a moderate range."
        )

    if k_status == "Low":

        improvements.append(
            "Potassium is low. MOP or potassium-rich "
            "fertilizer may be beneficial."
        )

    elif k_status == "High":

        improvements.append(
            "Potassium level is high. Avoid excessive "
            "potassium fertilizer."
        )

    else:

        improvements.append(
            "Potassium level is in a moderate range."
        )

    if pH < 6.5:

        improvements.append(
            "Soil is acidic. Suitable agricultural lime "
            "or other soil amendments may help."
        )

    elif pH > 7.5:

        improvements.append(
            "Soil is alkaline. Organic matter and suitable "
            "soil amendments may help."
        )

    else:

        improvements.append(
            "Soil pH is within a generally suitable range."
        )

    # -----------------------------------------------------
    # OVERALL RECOMMENDATION
    # -----------------------------------------------------

    recommendation = (
        f"Soil health score is {score}/100. "
        f"The soil is {ph_status.lower()} with "
        f"nitrogen ({n_status.lower()}), "
        f"phosphorus ({p_status.lower()}) and "
        f"potassium ({k_status.lower()}) levels. "
        f"Suitable crops include {', '.join(crops[:2])}. "
        f"Recommended fertilizer: {fertilizer_text}."
    )

    # -----------------------------------------------------
    # RETURN
    # -----------------------------------------------------

    return {

        "state": state,

        "nitrogen": N,

        "phosphorus": P,

        "potassium": K,

        "ph": pH,

        "soil_score": score,

        "nitrogen_status": n_status,

        "phosphorus_status": p_status,

        "potassium_status": k_status,

        "ph_status": ph_status,

        "fertilizer": fertilizer_text,

        "recommendation": recommendation,

        "crops": crops,

        "improvements": improvements
    }