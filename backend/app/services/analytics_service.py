# ============================================================
# ANALYTICS SERVICE
# backend/app/services/analytics_service.py
# ============================================================

from collections import defaultdict
from datetime import datetime
from statistics import mean

from bson import ObjectId

from backend.app.database.mongodb import get_database


# ============================================================
# HELPERS
# ============================================================

def safe_float(value, default=0.0):
    try:
        if value is None:
            return default
        return float(value)
    except (TypeError, ValueError):
        return default


# ============================================================
# GET CURRENT MODEL PREDICTION VALUE
# ============================================================

def get_prediction_value(prediction):
    """
    CURRENT MODEL

    predicted_yield is already stored as tonnes / hectare.
    No unit conversion is performed here.
    """

    value = prediction.get("predicted_yield")

    if value is None:
        value = prediction.get("yield")

    if value is None:
        value = prediction.get("Yield")

    return safe_float(value)


# ============================================================
# CROP NAME
# ============================================================

def get_crop_name(prediction):
    return (
        prediction.get("crop")
        or prediction.get("crop_name")
        or prediction.get("Crop")
        or prediction.get("Item")
        or prediction.get("item")
        or "Unknown Crop"
    )


# ============================================================
# AREA NAME
# ============================================================

def get_area_name(prediction):
    return (
        prediction.get("area")
        or prediction.get("Area")
        or prediction.get("location")
        or prediction.get("Location")
        or prediction.get("region")
        or prediction.get("Region")
        or "Unknown Area"
    )


# ============================================================
# YEAR
# ============================================================

def get_prediction_year(prediction):
    value = (
        prediction.get("year")
        if prediction.get("year") is not None
        else prediction.get("Year")
    )

    try:
        if value is None:
            return None
        return int(value)
    except (TypeError, ValueError):
        return None


# ============================================================
# DATE
# ============================================================

def get_prediction_date(prediction):
    for field in [
        "created_at",
        "createdAt",
        "prediction_date",
        "date",
    ]:
        value = prediction.get(field)

        if value:
            if isinstance(value, datetime):
                return value

            if isinstance(value, str):
                try:
                    return datetime.fromisoformat(
                        value.replace("Z", "+00:00")
                    )
                except ValueError:
                    pass

    object_id = prediction.get("_id")

    if object_id is not None:
        try:
            return object_id.generation_time
        except Exception:
            pass

    return None


# ============================================================
# SEASON
# ============================================================

def get_prediction_season(prediction, prediction_date=None):
    """
    Return the season attached to a prediction.

    Priority:
        1. Explicit season field, if the prediction document has one.
        2. Prediction date month.

    Indian agricultural season approximation used when no explicit
    season is stored:

        Kharif -> June to September
        Rabi   -> October to March
        Zaid   -> April to May

    This keeps the seasonal report honest: it is based on the
    prediction date unless a real season field is already present.
    """

    explicit = (
        prediction.get("season")
        or prediction.get("Season")
        or prediction.get("crop_season")
        or prediction.get("cropSeason")
    )

    if explicit:
        normalized = str(explicit).strip().lower()

        mapping = {
            "kharif": "Kharif",
            "kharif season": "Kharif",
            "monsoon": "Kharif",
            "rabi": "Rabi",
            "rabi season": "Rabi",
            "winter": "Rabi",
            "zaid": "Zaid",
            "zaid season": "Zaid",
            "summer": "Zaid",
        }

        return mapping.get(
            normalized,
            str(explicit).strip().title(),
        )

    if prediction_date is None:
        return None

    month = prediction_date.month

    if month in (6, 7, 8, 9):
        return "Kharif"

    if month in (4, 5):
        return "Zaid"

    return "Rabi"


# ============================================================
# GET USER FARMS
# ============================================================

def get_user_farms(farms_collection, user_id):
    """
    Farm documents may contain user_id as either a string or ObjectId.
    """

    user_id_string = str(user_id)

    queries = [
        {"user_id": user_id_string}
    ]

    try:
        object_id = ObjectId(user_id_string)
        queries.append({"user_id": object_id})
    except Exception:
        pass

    return list(
        farms_collection.find({"$or": queries})
    )


# ============================================================
# EMPTY SEASONAL REPORT
# ============================================================

def empty_seasonal_report():
    return {
        "performance": [],
        "crop_performance": [],
        "best_season": None,
        "best_average_yield": 0,
        "basis": (
            "Season is determined from an explicit season field when "
            "available; otherwise the prediction date is used."
        ),
    }


# ============================================================
# BUILD SEASONAL REPORT
# ============================================================

def build_seasonal_report(valid_records):
    """
    Build seasonal productivity statistics from valid current-model
    prediction records.
    """

    season_order = {
        "Kharif": 0,
        "Rabi": 1,
        "Zaid": 2,
    }

    season_groups = defaultdict(list)
    season_crop_groups = defaultdict(list)

    for record in valid_records:
        season = record.get("season")

        if not season:
            continue

        season_groups[season].append(record["yield"])
        season_crop_groups[
            (season, record["crop"])
        ].append(record["yield"])

    total_season_predictions = sum(
        len(values)
        for values in season_groups.values()
    )

    performance = []

    for season, values in season_groups.items():
        performance.append(
            {
                "season": season,
                "predictions": len(values),
                "average_yield": round(mean(values), 2),
                "best_yield": round(max(values), 2),
                "lowest_yield": round(min(values), 2),
                "prediction_share": round(
                    (len(values) / total_season_predictions) * 100,
                    1,
                ) if total_season_predictions else 0,
            }
        )

    performance.sort(
        key=lambda item: (
            season_order.get(item["season"], 99),
            -item["average_yield"],
        )
    )

    crop_performance = []

    for (season, crop), values in season_crop_groups.items():
        crop_performance.append(
            {
                "season": season,
                "crop": crop,
                "predictions": len(values),
                "average_yield": round(mean(values), 2),
            }
        )

    crop_performance.sort(
        key=lambda item: (
            season_order.get(item["season"], 99),
            -item["average_yield"],
        )
    )

    best = None

    if performance:
        best = max(
            performance,
            key=lambda item: item["average_yield"],
        )

    return {
        "performance": performance,
        "crop_performance": crop_performance,
        "best_season": best["season"] if best else None,
        "best_average_yield": (
            best["average_yield"] if best else 0
        ),
        "basis": (
            "Season is determined from an explicit season field when "
            "available; otherwise the prediction date is used."
        ),
    }


# ============================================================
# MAIN ANALYTICS FUNCTION
# ============================================================

def get_user_analytics(user_id):
    db = get_database()

    predictions_collection = db["predictions"]
    farms_collection = db["farms"]

    # ========================================================
    # FETCH ONLY CURRENT MODEL PREDICTIONS
    # ========================================================

    predictions = list(
        predictions_collection.find(
            {
                "user_id": str(user_id),
                "yield_unit": "tonnes_per_hectare",
            }
        ).sort("_id", 1)
    )

    # ========================================================
    # FETCH USER FARMS
    # ========================================================

    user_farms = get_user_farms(
        farms_collection,
        user_id,
    )

    total_farms = len(user_farms)

    # ========================================================
    # EMPTY STATE
    # ========================================================

    if not predictions:
        return {
            "success": True,
            "has_data": False,
            "summary": {
                "total_predictions": 0,
                "total_farms": total_farms,
                "total_crops": 0,
                "average_yield": 0,
                "best_yield": 0,
                "lowest_yield": 0,
                "performance_score": 0,
            },
            "crop_performance": [],
            "area_performance": [],
            "year_performance": [],
            "prediction_trend": [],
            "recent_predictions": [],
            "seasonal_report": empty_seasonal_report(),
            "insights": [],
            "generated_at": datetime.utcnow().isoformat(),
        }

    # ========================================================
    # PREPARE RECORDS
    # ========================================================

    records = []

    for prediction in predictions:
        predicted_yield = get_prediction_value(prediction)
        crop = get_crop_name(prediction)
        area = get_area_name(prediction)
        year = get_prediction_year(prediction)
        prediction_date = get_prediction_date(prediction)
        season = get_prediction_season(
            prediction,
            prediction_date,
        )

        records.append(
            {
                "id": str(prediction.get("_id", "")),
                "crop": crop,
                "area": area,
                "year": year,
                "yield": round(predicted_yield, 3),
                "season": season,
                "created_at": (
                    prediction_date.isoformat()
                    if prediction_date
                    else None
                ),
            }
        )

    # ========================================================
    # VALID YIELDS
    # ========================================================

    valid_records = [
        record
        for record in records
        if record["yield"] > 0
    ]

    yields = [
        record["yield"]
        for record in valid_records
    ]

    # ========================================================
    # SUMMARY
    # ========================================================

    average_yield = mean(yields) if yields else 0
    best_yield = max(yields) if yields else 0
    lowest_yield = min(yields) if yields else 0

    # ========================================================
    # CROP PERFORMANCE
    # ========================================================

    crop_groups = defaultdict(list)

    for record in valid_records:
        crop_groups[record["crop"]].append(record["yield"])

    crop_performance = []

    for crop, values in crop_groups.items():
        crop_performance.append(
            {
                "crop": crop,
                "predictions": len(values),
                "average_yield": round(mean(values), 2),
                "best_yield": round(max(values), 2),
                "lowest_yield": round(min(values), 2),
            }
        )

    crop_performance.sort(
        key=lambda item: item["average_yield"],
        reverse=True,
    )

    # ========================================================
    # AREA PERFORMANCE
    # ========================================================

    area_groups = defaultdict(list)

    for record in valid_records:
        area_groups[record["area"]].append(record["yield"])

    area_performance = []

    for area, values in area_groups.items():
        area_performance.append(
            {
                "area": area,
                "predictions": len(values),
                "average_yield": round(mean(values), 2),
                "best_yield": round(max(values), 2),
                "lowest_yield": round(min(values), 2),
            }
        )

    area_performance.sort(
        key=lambda item: item["average_yield"],
        reverse=True,
    )

    # ========================================================
    # YEAR PERFORMANCE
    # ========================================================

    year_groups = defaultdict(list)

    for record in valid_records:
        if record["year"] is not None:
            year_groups[record["year"]].append(record["yield"])

    year_performance = []

    for year, values in year_groups.items():
        year_performance.append(
            {
                "year": year,
                "predictions": len(values),
                "average_yield": round(mean(values), 2),
                "best_yield": round(max(values), 2),
                "lowest_yield": round(min(values), 2),
            }
        )

    year_performance.sort(
        key=lambda item: item["year"]
    )

    # ========================================================
    # SEASONAL PERFORMANCE
    # ========================================================

    seasonal_report = build_seasonal_report(
        valid_records
    )

    # ========================================================
    # INDIVIDUAL PREDICTION COMPARISON
    # ========================================================

    prediction_trend = []

    crop_prediction_counters = defaultdict(int)

    for index, record in enumerate(valid_records):
        crop_prediction_counters[record["crop"]] += 1

        prediction_trend.append(
            {
                "prediction_number": index + 1,
                "crop_prediction_number": crop_prediction_counters[
                    record["crop"]
                ],
                "label": (
                    f"{record['crop']} "
                    f"#{crop_prediction_counters[record['crop']]}"
                ),
                "yield": record["yield"],
                "crop": record["crop"],
                "year": record["year"],
                "area": record["area"],
            }
        )

    # ========================================================
    # INSIGHTS
    # ========================================================

    insights = []

    if crop_performance:
        best_crop = crop_performance[0]

        insights.append(
            {
                "type": "success",
                "title": "Top performing crop",
                "description": (
                    f"{best_crop['crop']} has the highest average "
                    f"predicted yield at "
                    f"{best_crop['average_yield']:.2f} tonnes/ha."
                ),
            }
        )

    if average_yield > 0:
        insights.append(
            {
                "type": "info",
                "title": "Average productivity",
                "description": (
                    f"Your average predicted productivity is "
                    f"{average_yield:.2f} tonnes/ha."
                ),
            }
        )

    if best_yield > lowest_yield:
        yield_range = best_yield - lowest_yield

        insights.append(
            {
                "type": "warning",
                "title": "Yield variation",
                "description": (
                    f"The difference between your highest and lowest "
                    f"prediction is {yield_range:.2f} tonnes/ha."
                ),
            }
        )

    if best_yield > 0:
        insights.append(
            {
                "type": "success",
                "title": "Best prediction",
                "description": (
                    f"Your highest predicted yield is "
                    f"{best_yield:.2f} tonnes/ha."
                ),
            }
        )

    unique_crops = {
        record["crop"]
        for record in valid_records
        if record["crop"]
    }

    if len(unique_crops) > 1:
        insights.append(
            {
                "type": "info",
                "title": "Crop diversity",
                "description": (
                    f"You have analysed {len(unique_crops)} "
                    f"different crops across your prediction history."
                ),
            }
        )

    # Seasonal insight
    if seasonal_report["best_season"]:
        insights.append(
            {
                "type": "success",
                "title": "Best performing season",
                "description": (
                    f"{seasonal_report['best_season']} has the highest "
                    f"average predicted yield at "
                    f"{seasonal_report['best_average_yield']:.2f} tonnes/ha."
                ),
            }
        )

    # ========================================================
    # PERFORMANCE SCORE
    # ========================================================

    prediction_count = len(valid_records)

    performance_score = min(
        100,
        prediction_count * 10,
    )

    # ========================================================
    # RETURN
    # ========================================================

    return {
        "success": True,
        "has_data": True,
        "summary": {
            "total_predictions": prediction_count,
            "total_farms": total_farms,
            "total_crops": len(unique_crops),
            "average_yield": round(average_yield, 2),
            "best_yield": round(best_yield, 2),
            "lowest_yield": round(lowest_yield, 2),
            "performance_score": performance_score,
        },
        "crop_performance": crop_performance,
        "area_performance": area_performance,
        "year_performance": year_performance,
        "prediction_trend": prediction_trend,
        "recent_predictions": list(
            reversed(valid_records[-10:])
        ),
        "seasonal_report": seasonal_report,
        "insights": insights,
        "generated_at": datetime.utcnow().isoformat(),
    }