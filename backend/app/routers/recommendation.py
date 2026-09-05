from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ml.recommendation_predictor import recommend_crops


router = APIRouter(
    prefix="/recommendation",
    tags=["Recommendations"]
)


# =========================================================
# REQUEST MODEL
# =========================================================

class RecommendationRequest(BaseModel):

    # Soil nutrients
    nitrogen: float
    phosphorus: float
    potassium: float

    # Soil pH
    ph: float

    # Weather conditions
    temperature: float
    humidity: float
    rainfall: float

    # Existing prediction / soil information
    # These are kept so the existing frontend/backend
    # request structure is not unnecessarily disturbed.
    predicted_yield_tonnes_ha: float = 0
    soil_score: float = 0

    nitrogen_status: str = ""
    phosphorus_status: str = ""
    potassium_status: str = ""
    ph_status: str = ""


# =========================================================
# AI CROP RECOMMENDATION
# =========================================================

@router.post("/generate")
async def generate_recommendation(
    data: RecommendationRequest
):

    try:

        # =================================================
        # CALL TRAINED ML MODEL
        # =================================================

        result = recommend_crops(

            nitrogen=data.nitrogen,

            phosphorus=data.phosphorus,

            potassium=data.potassium,

            temperature=data.temperature,

            humidity=data.humidity,

            ph=data.ph,

            rainfall=data.rainfall
        )


        # =================================================
        # RESPONSE
        # =================================================

        return {

            "recommended_crop":
                result["recommended_crop"],

            "recommendations":
                result["recommendations"],

            "input": {

                "nitrogen":
                    data.nitrogen,

                "phosphorus":
                    data.phosphorus,

                "potassium":
                    data.potassium,

                "temperature":
                    data.temperature,

                "humidity":
                    data.humidity,

                "ph":
                    data.ph,

                "rainfall":
                    data.rainfall
            },

            "message":
                "AI-based crop recommendation generated successfully."
        }


    except Exception as e:

        print("=" * 60)
        print("RECOMMENDATION ERROR")
        print("=" * 60)
        print(str(e))
        print("=" * 60)

        raise HTTPException(

            status_code=500,

            detail="AI crop recommendation failed"
        )