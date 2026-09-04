from collections import Counter, defaultdict
from io import BytesIO
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Forecast, Farm, User
from ..schemas import ForecastRequest, ForecastOut
from ..security import get_current_user
from ..ml_service import forecast, options, historical_context
from ..risk_service import forecast_dict, report_payload, report_html

router = APIRouter(prefix="/api", tags=["Yield forecasting"])


@router.get("/meta/options")
def get_options():
    return options()


def _owned_forecast(forecast_id: int, db: Session, user: User) -> Forecast:
    row = db.query(Forecast).filter(Forecast.id == forecast_id, Forecast.user_id == user.id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Forecast was not found")
    return row


@router.post("/forecasts", response_model=ForecastOut)
def create_forecast(payload: ForecastRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.role != "farmer":
        raise HTTPException(status_code=403, detail="Farmer account required for forecasting")

    opts = options()
    if payload.crop not in opts["crops"]:
        raise HTTPException(status_code=422, detail="Crop is not present in the agricultural dataset")
    if payload.state not in opts["states"]:
        raise HTTPException(status_code=422, detail="State is not present in the agricultural dataset")
    if payload.season not in opts["seasons"]:
        raise HTTPException(status_code=422, detail="Season is not present in the agricultural dataset")

    if payload.farm_id is not None:
        farm = db.query(Farm).filter(Farm.id == payload.farm_id, Farm.user_id == user.id).first()
        if not farm:
            raise HTTPException(status_code=404, detail="Selected farm was not found")

    data = payload.model_dump()
    yield_value, production_value = forecast(data)
    ctx = historical_context(data)
    row = Forecast(
        user_id=user.id,
        **data,
        forecasted_yield=yield_value,
        forecasted_production=production_value,
        historical_yield_median=ctx["yield_median"],
        historical_rainfall_median=ctx["rainfall_median"],
        historical_fertilizer_rate_median=ctx["fertilizer_rate_median"],
        historical_pesticide_rate_median=ctx["pesticide_rate_median"],
        outside_historical_years=(payload.crop_year < opts["year_min"] or payload.crop_year > opts["year_max"]),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return forecast_dict(row)


@router.get("/forecasts/me", response_model=list[ForecastOut])
def my_forecasts(limit: int = 100, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = (db.query(Forecast).filter(Forecast.user_id == user.id).order_by(Forecast.created_at.desc()).limit(min(max(limit, 1), 500)).all())
    return [forecast_dict(row) for row in rows]


@router.get("/forecasts/{forecast_id}/report")
def forecast_report(forecast_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    row = _owned_forecast(forecast_id, db, user)
    farm = db.query(Farm).filter(Farm.id == row.farm_id, Farm.user_id == user.id).first() if row.farm_id else None
    return report_payload(row, farm.farm_name if farm else None)


@router.get("/forecasts/{forecast_id}/report/download")
def download_forecast_report(forecast_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    row = _owned_forecast(forecast_id, db, user)
    farm = db.query(Farm).filter(Farm.id == row.farm_id, Farm.user_id == user.id).first() if row.farm_id else None
    html = report_html(report_payload(row, farm.farm_name if farm else None)).encode("utf-8")
    headers = {"Content-Disposition": f'attachment; filename="yieldsense-risk-report-{forecast_id}.html"'}
    return StreamingResponse(BytesIO(html), media_type="text/html; charset=utf-8", headers=headers)


@router.get("/analytics/me")
def my_analytics(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = db.query(Forecast).filter(Forecast.user_id == user.id).order_by(Forecast.created_at.asc()).all()
    if not rows:
        return {"count": 0, "average_yield": None, "top_crop": None, "average_risk": None, "high_risk_count": 0, "recent": [], "by_crop": [], "by_season": []}
    enriched = [forecast_dict(r) for r in rows]
    crop_counts = Counter(r.crop for r in rows)
    by_crop = defaultdict(list)
    by_season = defaultdict(list)
    for r in rows:
        by_crop[r.crop].append(r.forecasted_yield)
        by_season[r.season].append(r.forecasted_yield)
    return {
        "count": len(rows),
        "average_yield": sum(r.forecasted_yield for r in rows) / len(rows),
        "top_crop": crop_counts.most_common(1)[0][0],
        "average_risk": round(sum(x["risk_score"] for x in enriched) / len(enriched), 1),
        "high_risk_count": sum(1 for x in enriched if x["risk_level"] in {"high", "critical"}),
        "recent": [{"date": r.created_at.isoformat(), "crop": r.crop, "yield": r.forecasted_yield} for r in rows[-12:]],
        "by_crop": sorted([{"name": k, "count": len(v), "average_yield": sum(v) / len(v)} for k, v in by_crop.items()], key=lambda x: x["count"], reverse=True)[:8],
        "by_season": sorted([{"name": k, "count": len(v), "average_yield": sum(v) / len(v)} for k, v in by_season.items()], key=lambda x: x["count"], reverse=True),
    }
