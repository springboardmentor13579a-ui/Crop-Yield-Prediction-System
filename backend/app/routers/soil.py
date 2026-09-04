from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Farm, SoilRecord, User
from ..schemas import SoilCreate, SoilOut
from ..security import get_current_user
from ..soil_service import analyze_soil

router = APIRouter(prefix="/api/soil", tags=["Soil analysis"])


@router.post("/records", response_model=SoilOut, status_code=status.HTTP_201_CREATED)
def create_soil_record(payload: SoilCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.role != "farmer":
        raise HTTPException(status_code=403, detail="Farmer account required")
    if payload.farm_id is not None:
        farm = db.query(Farm).filter(Farm.id == payload.farm_id, Farm.user_id == user.id).first()
        if not farm:
            raise HTTPException(status_code=404, detail="Selected farm was not found")
    row = SoilRecord(user_id=user.id, **payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("/records/me", response_model=list[SoilOut])
def my_soil_records(limit: int = 50, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(SoilRecord).filter(SoilRecord.user_id == user.id).order_by(SoilRecord.created_at.desc()).limit(min(max(limit, 1), 200)).all()


@router.get("/records/{record_id}/analysis")
def soil_analysis(record_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    row = db.query(SoilRecord).filter(SoilRecord.id == record_id, SoilRecord.user_id == user.id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Soil record not found")
    return analyze_soil(row)
