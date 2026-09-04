from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Farm, User, WeatherRecord
from ..security import get_current_user
from ..weather_service import search_location, current_weather

router = APIRouter(prefix="/api/weather", tags=["Weather analysis"])


@router.get("/locations")
def locations(q: str = Query(min_length=2, max_length=120), user: User = Depends(get_current_user)):
    if user.role != "farmer":
        raise HTTPException(status_code=403, detail="Farmer account required")
    return search_location(q)


@router.get("/current")
def weather_current(
    latitude: float | None = Query(default=None, ge=-90, le=90),
    longitude: float | None = Query(default=None, ge=-180, le=180),
    farm_id: int | None = None,
    location_name: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if user.role != "farmer":
        raise HTTPException(status_code=403, detail="Farmer account required")
    farm = None
    if farm_id is not None:
        farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == user.id).first()
        if not farm:
            raise HTTPException(status_code=404, detail="Selected farm was not found")
        if farm.latitude is None or farm.longitude is None:
            raise HTTPException(status_code=422, detail="This farm does not have saved coordinates")
        latitude, longitude = farm.latitude, farm.longitude
        location_name = location_name or farm.farm_name
    if latitude is None or longitude is None:
        raise HTTPException(status_code=422, detail="Provide farm coordinates or latitude and longitude")

    data = current_weather(latitude, longitude)
    c = data.get("current", {})
    row = WeatherRecord(
        user_id=user.id,
        farm_id=farm.id if farm else None,
        location_name=location_name,
        latitude=latitude,
        longitude=longitude,
        temperature=c.get("temperature_2m"),
        apparent_temperature=c.get("apparent_temperature"),
        humidity=c.get("relative_humidity_2m"),
        precipitation=c.get("precipitation"),
        wind_speed=c.get("wind_speed_10m"),
        soil_temperature=c.get("soil_temperature_0cm"),
        soil_moisture=c.get("soil_moisture_0_to_1cm"),
        weather_code=c.get("weather_code"),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return {"record_id": row.id, **data, "location_name": location_name, "latitude": latitude, "longitude": longitude}


@router.get("/history/me")
def weather_history(limit: int = 20, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = db.query(WeatherRecord).filter(WeatherRecord.user_id == user.id).order_by(WeatherRecord.captured_at.desc()).limit(min(max(limit, 1), 100)).all()
    return [{
        "id": r.id, "location_name": r.location_name, "latitude": r.latitude, "longitude": r.longitude,
        "temperature": r.temperature, "humidity": r.humidity, "precipitation": r.precipitation,
        "wind_speed": r.wind_speed, "soil_temperature": r.soil_temperature, "soil_moisture": r.soil_moisture,
        "captured_at": r.captured_at,
    } for r in rows]
