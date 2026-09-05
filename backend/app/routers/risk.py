from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ml.risk_predictor import predict_risk


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(

    prefix="/risk",

    tags=[
        "Risk Assessment"
    ]
)


# =========================================================
# REQUEST MODEL
# =========================================================

class RiskRequest(BaseModel):

    # -----------------------------------------------------
    # LOCATION / CROP
    # -----------------------------------------------------

    state: str

    city: str

    crop: str


    # -----------------------------------------------------
    # SOIL
    # -----------------------------------------------------

    nitrogen: float

    phosphorus: float

    potassium: float

    ph: float


    # -----------------------------------------------------
    # WEATHER
    # -----------------------------------------------------

    temperature: float

    humidity: float

    rainfall: float

    wind: float


    # -----------------------------------------------------
    # PREDICTED YIELD
    # -----------------------------------------------------

    predicted_yield_tonnes_ha: float = 0


# =========================================================
# AI RISK ASSESSMENT
# =========================================================

@router.post("/assess")
async def assess_risk(
    data: RiskRequest
):

    try:

        # =================================================
        # AI MODEL
        # =================================================

        result = predict_risk(

            state=data.state,

            crop=data.crop,

            nitrogen=data.nitrogen,

            phosphorus=data.phosphorus,

            potassium=data.potassium,

            ph=data.ph,

            temperature=data.temperature,

            humidity=data.humidity,

            rainfall=data.rainfall,

            wind=data.wind,

            predicted_yield_tonnes_ha=
                data.predicted_yield_tonnes_ha
        )


        # =================================================
        # RESPONSE
        # =================================================

        return {

            "success": True,


            # ---------------------------------------------
            # PROFILE
            # ---------------------------------------------

            "state":
                data.state,

            "city":
                data.city,

            "crop":
                data.crop,


            # ---------------------------------------------
            # AI RESULT
            # ---------------------------------------------

            "overall_risk":
                result["overall_risk"],

            "risk_score":
                result["risk_score"],

            "model_prediction":
                result["model_prediction"],

            "model":
                result["model"],

            "decision_score":
                result["decision_score"],


            # ---------------------------------------------
            # INPUT
            # ---------------------------------------------

            "input": {

                "state":
                    data.state,

                "city":
                    data.city,

                "crop":
                    data.crop,

                "nitrogen":
                    data.nitrogen,

                "phosphorus":
                    data.phosphorus,

                "potassium":
                    data.potassium,

                "ph":
                    data.ph,

                "temperature":
                    data.temperature,

                "humidity":
                    data.humidity,

                "rainfall":
                    data.rainfall,

                "wind":
                    data.wind,

                "predicted_yield_tonnes_ha":
                    data.predicted_yield_tonnes_ha
            },


            # ---------------------------------------------
            # MESSAGE
            # ---------------------------------------------

            "message":
                "AI-based agricultural risk assessment generated successfully."
        }


    except Exception as e:

        print("=" * 70)

        print(
            "RISK ASSESSMENT ERROR"
        )

        print("=" * 70)

        print(
            str(e)
        )

        print("=" * 70)


        raise HTTPException(

            status_code=500,

            detail=
                f"AI risk assessment failed: {str(e)}"
        )