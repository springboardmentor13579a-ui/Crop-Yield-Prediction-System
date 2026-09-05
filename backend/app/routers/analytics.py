from fastapi import APIRouter, HTTPException
from app.database.mongodb import predictions_collection, soil_collection

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


# =========================================================
# DASHBOARD ANALYTICS
# =========================================================

@router.get("/dashboard")
async def dashboard_analytics():

    try:

        # -------------------------------------------------
        # TOTAL PREDICTIONS
        # -------------------------------------------------

        total_predictions = await predictions_collection.count_documents({})

        # -------------------------------------------------
        # TOTAL SOIL ANALYSES
        # -------------------------------------------------

        total_soil = await soil_collection.count_documents({})

        # -------------------------------------------------
        # PREDICTION DATA
        # -------------------------------------------------

        predictions = []

        cursor = predictions_collection.find({})

        async for item in cursor:

            predictions.append(item)

        # -------------------------------------------------
        # CALCULATE YIELD STATISTICS
        # -------------------------------------------------

        yields = [
            float(p.get("predicted_yield_hg_ha", 0))
            for p in predictions
            if p.get("predicted_yield_hg_ha") is not None
        ]

        if yields:

            average_yield = sum(yields) / len(yields)

            maximum_yield = max(yields)

            minimum_yield = min(yields)

        else:

            average_yield = 0

            maximum_yield = 0

            minimum_yield = 0

        # -------------------------------------------------
        # CROP DISTRIBUTION
        # -------------------------------------------------

        crop_counts = {}

        for prediction in predictions:

            crop = prediction.get(
                "crop",
                "Unknown"
            )

            crop_counts[crop] = (
                crop_counts.get(crop, 0) + 1
            )

        # -------------------------------------------------
        # STATE DISTRIBUTION
        # -------------------------------------------------

        state_counts = {}

        for prediction in predictions:

            state = prediction.get(
                "state",
                "Unknown"
            )

            state_counts[state] = (
                state_counts.get(state, 0) + 1
            )

        # -------------------------------------------------
        # RECENT PREDICTIONS
        # -------------------------------------------------

        recent = []

        cursor = predictions_collection.find(
            {}
        ).sort(
            "created_at",
            -1
        ).limit(10)

        async for item in cursor:

            recent.append({

                "crop":
                    item.get("crop"),

                "area":
                    item.get("area"),

                "state":
                    item.get("state"),

                "predicted_yield":
                    item.get(
                        "predicted_yield_tonnes_ha"
                    ),

                "created_at":
                    item.get("created_at")

            })

        # -------------------------------------------------
        # RESPONSE
        # -------------------------------------------------

        return {

            "total_predictions":
                total_predictions,

            "total_soil_analyses":
                total_soil,

            "average_yield_hg_ha":
                round(
                    average_yield,
                    2
                ),

            "average_yield_tonnes_ha":
                round(
                    average_yield / 10000,
                    4
                ),

            "maximum_yield_hg_ha":
                round(
                    maximum_yield,
                    2
                ),

            "minimum_yield_hg_ha":
                round(
                    minimum_yield,
                    2
                ),

            "crop_distribution":
                crop_counts,

            "state_distribution":
                state_counts,

            "recent_predictions":
                recent

        }

    except Exception as e:

        print(
            "ANALYTICS ERROR:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to generate analytics"
        )