from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Farm, User
from ..schemas import FarmCreate, FarmOut
from ..security import get_current_user
from ..ml_service import options

router = APIRouter(prefix="/api/farms", tags=["Farm management"])


def _owned_farm(db: Session, user: User, farm_id: int) -> Farm:
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    return farm


def _validate(payload: FarmCreate):
    opts = options()
    if payload.state not in opts["states"]:
        raise HTTPException(status_code=422, detail="State is not present in the agricultural dataset")
    if payload.primary_crop and payload.primary_crop not in opts["crops"]:
        raise HTTPException(status_code=422, detail="Primary crop is not present in the agricultural dataset")
    if (payload.latitude is None) != (payload.longitude is None):
        raise HTTPException(status_code=422, detail="Latitude and longitude must be provided together")


@router.get("", response_model=list[FarmOut])
def my_farms(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.role != "farmer":
        raise HTTPException(status_code=403, detail="Farmer account required")
    return db.query(Farm).filter(Farm.user_id == user.id).order_by(Farm.created_at.desc()).all()


@router.post("", response_model=FarmOut, status_code=status.HTTP_201_CREATED)
def create_farm(payload: FarmCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.role != "farmer":
        raise HTTPException(status_code=403, detail="Farmer account required")
    _validate(payload)
    farm = Farm(user_id=user.id, **payload.model_dump())
    db.add(farm)
    db.commit()
    db.refresh(farm)
    return farm


@router.put("/{farm_id}", response_model=FarmOut)
def update_farm(farm_id: int, payload: FarmCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _validate(payload)
    farm = _owned_farm(db, user, farm_id)
    for key, value in payload.model_dump().items():
        setattr(farm, key, value)
    db.commit()
    db.refresh(farm)
    return farm


@router.delete("/{farm_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_farm(farm_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    farm = _owned_farm(db, user, farm_id)
    db.delete(farm)
    db.commit()
