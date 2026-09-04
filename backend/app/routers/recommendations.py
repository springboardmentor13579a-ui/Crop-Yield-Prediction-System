from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Forecast, SoilRecord, WeatherRecord, User
from ..security import get_current_user
from ..recommendation_service import build_recommendations

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])


@router.get("/me")
def my_recommendations(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    latest_forecast = db.query(Forecast).filter(Forecast.user_id == user.id).order_by(Forecast.created_at.desc()).first()
    latest_soil = db.query(SoilRecord).filter(SoilRecord.user_id == user.id).order_by(SoilRecord.created_at.desc()).first()
    latest_weather = db.query(WeatherRecord).filter(WeatherRecord.user_id == user.id).order_by(WeatherRecord.captured_at.desc()).first()
    return {
        "items": build_recommendations(latest_forecast, latest_soil, latest_weather),
        "has_forecast": latest_forecast is not None,
        "has_soil": latest_soil is not None,
        "has_weather": latest_weather is not None,
    }
