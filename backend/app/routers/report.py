from fastapi import APIRouter, HTTPException

from app.database.mongodb import predictions_collection
from ml.soil_predictor import analyze_soil

router = APIRouter(
    prefix="/report",
    tags=["Reports"]
)


@router.get("/latest")
async def get_latest_report():

    try:

        # Get latest prediction
        report = await predictions_collection.find_one(
            {},
            sort=[("created_at", -1)]
        )

        if not report:
            raise HTTPException(
                status_code=404,
                detail="No prediction report found"
            )

        # Convert MongoDB ObjectId
        report["_id"] = str(report["_id"])

        # -----------------------------------------
        # GET STATE
        # -----------------------------------------

        state = report.get("state")

        if not state:
            state = "N/A"

        # -----------------------------------------
        # SOIL ANALYSIS
        # -----------------------------------------

        soil_data = None

        if state != "N/A":

            try:

                soil_data = analyze_soil(state)

            except Exception as soil_error:

                print("Soil analysis error:", soil_error)

                soil_data = None

        # -----------------------------------------
        # ADD SOIL DATA TO REPORT
        # -----------------------------------------

        if soil_data:

            report["soil"] = {
                "nitrogen": soil_data["nitrogen"],
                "phosphorus": soil_data["phosphorus"],
                "potassium": soil_data["potassium"],
                "ph": soil_data["ph"],
                "soil_score": soil_data["soil_score"],
                "nitrogen_status": soil_data["nitrogen_status"],
                "phosphorus_status": soil_data["phosphorus_status"],
                "potassium_status": soil_data["potassium_status"],
                "ph_status": soil_data["ph_status"],
                "fertilizer": soil_data["fertilizer"],
                "recommended_crops": soil_data["crops"],
                "recommendation": soil_data["recommendation"]
            }

        else:

            report["soil"] = None

        # -----------------------------------------
        # RETURN REPORT
        # -----------------------------------------

        return report

    except HTTPException:

        raise

    except Exception as e:

        print("Report Error:", str(e))

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )