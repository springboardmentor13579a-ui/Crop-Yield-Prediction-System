print("=" * 50)
print("SOIL ROUTER LOADED")
print("=" * 50)


from fastapi import APIRouter, HTTPException
from datetime import datetime

from app.schemas.soil_schema import (
    SoilRequest,
    SoilResponse,
)

from app.database.mongodb import soil_collection

from ml.soil_predictor import analyze_soil


router = APIRouter(
    prefix="/soil",
    tags=["Soil"],
)


# =========================================================
# SOIL ANALYSIS
# =========================================================

@router.post(
    "/analyze",
    response_model=SoilResponse
)
async def analyze(data: SoilRequest):

    try:

        if not data.state or not data.state.strip():

            raise HTTPException(
                status_code=400,
                detail="State is required"
            )

        result = analyze_soil(
            data.state
        )

        # =================================================
        # SAVE SOIL ANALYSIS
        # =================================================

        soil_document = {

            "state": result["state"],

            "nitrogen": result["nitrogen"],

            "phosphorus": result["phosphorus"],

            "potassium": result["potassium"],

            "ph": result["ph"],

            "soil_score": result["soil_score"],

            "nitrogen_status":
                result["nitrogen_status"],

            "phosphorus_status":
                result["phosphorus_status"],

            "potassium_status":
                result["potassium_status"],

            "ph_status":
                result["ph_status"],

            "fertilizer":
                result["fertilizer"],

            "crops":
                result["crops"],

            "recommendation":
                result["recommendation"],

            "improvements":
                result["improvements"],

            "created_at":
                datetime.utcnow()
        }

        await soil_collection.insert_one(
            soil_document
        )

        # =================================================
        # LOG
        # =================================================

        print("=" * 50)
        print("SOIL ANALYSIS SAVED")
        print("State:", data.state)
        print("Nitrogen:", result["nitrogen"])
        print("Phosphorus:", result["phosphorus"])
        print("Potassium:", result["potassium"])
        print("pH:", result["ph"])
        print("Soil Score:", result["soil_score"])
        print("Fertilizer:", result["fertilizer"])
        print("Crops:", result["crops"])
        print("=" * 50)

        return result

    except HTTPException:
        raise

    except ValueError as e:

        raise HTTPException(
            status_code=404,
            detail=str(e)
        )

    except Exception as e:

        print("=" * 50)
        print("SOIL ANALYSIS ERROR")
        print(str(e))
        print("=" * 50)

        raise HTTPException(
            status_code=500,
            detail="Soil analysis failed"
        )


# =========================================================
# GET LATEST SOIL ANALYSIS
# =========================================================

@router.get("/latest")
async def latest_soil(state: str):

    try:

        result = await soil_collection.find_one(
            {
                "state": {
                    "$regex": f"^{state.strip()}$",
                    "$options": "i"
                }
            },
            sort=[
                ("created_at", -1)
            ]
        )

        if not result:

            return {
                "soil": None
            }

        result["_id"] = str(
            result["_id"]
        )

        return {
            "soil": result
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# =========================================================
# GET ALL SOIL ANALYSES
# Used by Agricultural Officer
# =========================================================

@router.get("/all")
async def get_all_soil():

    try:

        analyses = []

        cursor = soil_collection.find(
            {}
        ).sort(
            "created_at",
            -1
        )

        async for item in cursor:

            item["_id"] = str(
                item["_id"]
            )

            analyses.append(item)

        return analyses

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )