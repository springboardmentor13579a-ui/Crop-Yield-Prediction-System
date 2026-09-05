from fastapi import APIRouter, HTTPException
from datetime import datetime

from app.schemas.prediction_schema import (
    PredictionRequest,
    PredictionResponse,
)

from ml.predictor import predict_yield
from app.database.mongodb import predictions_collection


print("=" * 60)
print("PREDICTION ROUTER LOADED")
print("=" * 60)


router = APIRouter(
    prefix="/prediction",
    tags=["Prediction"],
)


# =========================================================
# POST PREDICTION
# =========================================================

@router.post(
    "/predict",
    response_model=PredictionResponse,
)
async def predict(data: PredictionRequest):

    try:

        # =====================================================
        # 1. RANDOM FOREST PREDICTION
        # =====================================================

        value = predict_yield(
            data.area,
            data.item,
            data.year,
            data.rainfall,
            data.pesticides,
            data.temperature,
        )

        value = round(float(value), 2)


        # =====================================================
        # 2. CONVERT hg/ha -> tonnes/ha
        # =====================================================

        predicted_tonnes = round(
            value / 10000,
            6
        )


        # =====================================================
        # 3. CREATE MONGODB DOCUMENT
        # =====================================================

        prediction_document = {

            "user_email":
                data.user_email.strip().lower(),

            "country":
                data.country,

            "state":
                data.state,

            "area":
                data.area,

            "crop":
                data.item,

            "year":
                data.year,

            "season":
                data.season,

            "rainfall":
                data.rainfall,

            "temperature":
                data.temperature,

            "pesticides":
                data.pesticides,

            "predicted_yield_hg_ha":
                value,

            "predicted_yield_tonnes_ha":
                predicted_tonnes,

            "model":
                "Random Forest Regressor",

            "created_at":
                datetime.utcnow(),
        }


        # =====================================================
        # 4. SAVE TO MONGODB
        # =====================================================

        result = await predictions_collection.insert_one(
            prediction_document
        )


        # =====================================================
        # 5. TERMINAL LOG
        # =====================================================

        print("=" * 60)
        print("PREDICTION SAVED TO MONGODB")
        print("MongoDB ID:", result.inserted_id)
        print("User:", data.user_email)
        print("Country:", data.country)
        print("State:", data.state)
        print("Area:", data.area)
        print("Crop:", data.item)
        print("Year:", data.year)
        print("Season:", data.season)
        print("Rainfall:", data.rainfall)
        print("Temperature:", data.temperature)
        print("Pesticides:", data.pesticides)
        print("Yield:", value, "hg/ha")
        print(
            "Yield:",
            predicted_tonnes,
            "tonnes/ha"
        )
        print("=" * 60)


        # =====================================================
        # 6. RETURN COMPLETE PREDICTION
        # =====================================================

        return {

            "predicted_yield":
                value,

            "predicted_yield_tonnes_ha":
                predicted_tonnes,

            "country":
                data.country,

            "state":
                data.state,

            "area":
                data.area,

            "crop":
                data.item,

            "year":
                data.year,

            "season":
                data.season,

            "rainfall":
                data.rainfall,

            "temperature":
                data.temperature,

            "pesticides":
                data.pesticides,

            "model":
                "Random Forest Regressor",

            "prediction_id":
                str(result.inserted_id),
        }


    except Exception as e:

        print(
            "Prediction Error:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# =========================================================
# GET LATEST PREDICTION FOR FARMER
# =========================================================

@router.get("/latest")
async def get_latest_prediction(
    user_email: str
):

    try:

        # =====================================================
        # NORMALIZE EMAIL
        # =====================================================

        clean_email = (
            user_email
            .strip()
            .lower()
        )


        print("=" * 60)
        print("GET LATEST PREDICTION")
        print(
            "Searching email:",
            clean_email
        )
        print("=" * 60)


        # =====================================================
        # FIND LATEST PREDICTION
        # =====================================================

        prediction = await predictions_collection.find_one(
            {
                "user_email": clean_email
            },
            sort=[
                (
                    "created_at",
                    -1
                )
            ]
        )


        # =====================================================
        # NO PREDICTION
        # =====================================================

        if not prediction:

            print(
                "NO PREDICTION FOUND FOR:",
                clean_email
            )

            return {
                "prediction": None
            }


        # =====================================================
        # CONVERT OBJECT ID
        # =====================================================

        prediction_id = str(
            prediction["_id"]
        )


        print(
            "PREDICTION FOUND:",
            prediction_id
        )


        # =====================================================
        # RETURN LATEST PREDICTION
        # =====================================================

        return {

            "prediction": {

                "prediction_id":
                    prediction_id,

                "user_email":
                    prediction.get(
                        "user_email"
                    ),

                "country":
                    prediction.get(
                        "country"
                    ),

                "state":
                    prediction.get(
                        "state"
                    ),

                "area":
                    prediction.get(
                        "area"
                    ),

                "item":
                    prediction.get(
                        "crop"
                    ),

                "crop":
                    prediction.get(
                        "crop"
                    ),

                "year":
                    prediction.get(
                        "year"
                    ),

                "season":
                    prediction.get(
                        "season"
                    ),

                "rainfall":
                    prediction.get(
                        "rainfall"
                    ),

                "temperature":
                    prediction.get(
                        "temperature"
                    ),

                "pesticides":
                    prediction.get(
                        "pesticides"
                    ),

                "predicted_yield":
                    prediction.get(
                        "predicted_yield_hg_ha"
                    ),

                "predicted_yield_tonnes_ha":
                    prediction.get(
                        "predicted_yield_tonnes_ha"
                    ),

                "model":
                    prediction.get(
                        "model"
                    ),

                "created_at":
                    prediction.get(
                        "created_at"
                    )
            }
        }


    except Exception as e:

        print("=" * 60)
        print("LATEST PREDICTION ERROR")
        print(str(e))
        print("=" * 60)

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )