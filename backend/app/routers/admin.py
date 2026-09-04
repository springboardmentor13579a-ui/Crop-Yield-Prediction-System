from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import User, Forecast, CropRecord, Farm, SoilRecord, WeatherRecord
from ..schemas import UserOut, ForecastOut, UserStatusUpdate
from ..security import require_admin
from ..ml_service import get_dataset

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/summary")
def summary(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    df = get_dataset()
    return {
        "users": int(db.query(func.count(User.id)).scalar() or 0),
        "farmers": int(db.query(func.count(User.id)).filter(User.role == "farmer").scalar() or 0),
        "active_users": int(db.query(func.count(User.id)).filter(User.is_active.is_(True)).scalar() or 0),
        "farms": int(db.query(func.count(Farm.id)).scalar() or 0),
        "forecasts": int(db.query(func.count(Forecast.id)).scalar() or 0),
        "soil_records": int(db.query(func.count(SoilRecord.id)).scalar() or 0),
        "weather_checks": int(db.query(func.count(WeatherRecord.id)).scalar() or 0),
        "dataset_rows": int(db.query(func.count(CropRecord.id)).scalar() or 0),
        "crops": int(df["Crop"].nunique()),
        "states": int(df["State"].nunique()),
        "seasons": int(df["Season"].nunique()),
        "year_range": [int(df["Crop_Year"].min()), int(df["Crop_Year"].max())],
    }


@router.get("/users", response_model=list[UserOut])
def users(limit: int = 200, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return db.query(User).order_by(User.created_at.desc()).limit(min(max(limit, 1), 500)).all()


@router.patch("/users/{user_id}/status", response_model=UserOut)
def set_user_status(user_id: int, payload: UserStatusUpdate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id and not payload.is_active:
        raise HTTPException(status_code=400, detail="You cannot deactivate your own admin account")
    user.is_active = payload.is_active
    db.commit()
    db.refresh(user)
    return user


@router.get("/farms")
def farms(limit: int = 300, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    rows = db.query(Farm, User).join(User, Farm.user_id == User.id).order_by(Farm.created_at.desc()).limit(min(max(limit, 1), 500)).all()
    return [{
        "id": f.id, "farm_name": f.farm_name, "owner": u.full_name, "owner_email": u.email,
        "state": f.state, "district": f.district, "village": f.village, "area": f.area,
        "primary_crop": f.primary_crop, "irrigation_type": f.irrigation_type,
        "latitude": f.latitude, "longitude": f.longitude, "created_at": f.created_at,
    } for f, u in rows]


@router.get("/forecasts", response_model=list[ForecastOut])
def forecasts(limit: int = 200, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return db.query(Forecast).order_by(Forecast.created_at.desc()).limit(min(max(limit, 1), 500)).all()


@router.get("/activity")
def activity(limit: int = 100, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    soils = db.query(SoilRecord).order_by(SoilRecord.created_at.desc()).limit(min(max(limit, 1), 200)).all()
    weather = db.query(WeatherRecord).order_by(WeatherRecord.captured_at.desc()).limit(min(max(limit, 1), 200)).all()
    return {
        "soil": [{"id": r.id, "user_id": r.user_id, "soil_type": r.soil_type, "ph": r.ph, "created_at": r.created_at} for r in soils],
        "weather": [{"id": r.id, "user_id": r.user_id, "location_name": r.location_name, "temperature": r.temperature, "precipitation": r.precipitation, "captured_at": r.captured_at} for r in weather],
    }


@router.get("/dataset")
def dataset_rows(
    page: int = Query(1, ge=1), page_size: int = Query(40, ge=1, le=100),
    crop: str | None = None, state: str | None = None,
    db: Session = Depends(get_db), _: User = Depends(require_admin),
):
    q = db.query(CropRecord)
    if crop:
        q = q.filter(CropRecord.crop == crop)
    if state:
        q = q.filter(CropRecord.state == state)
    total = q.count()
    rows = q.order_by(CropRecord.id).offset((page - 1) * page_size).limit(page_size).all()
    return {
        "page": page, "page_size": page_size, "total": int(total),
        "rows": [{
            "Crop": r.crop, "Crop_Year": r.crop_year, "Season": r.season, "State": r.state,
            "Area": r.area, "Production": r.production, "Annual_Rainfall": r.annual_rainfall,
            "Fertilizer": r.fertilizer, "Pesticide": r.pesticide, "Yield": r.yield_value,
        } for r in rows],
    }
