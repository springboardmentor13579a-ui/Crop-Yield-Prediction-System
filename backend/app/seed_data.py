import pandas as pd
from sqlalchemy import func
from .database import SessionLocal
from .models import CropRecord
from .config import settings


def ensure_crop_records():
    db = SessionLocal()
    try:
        count = db.query(func.count(CropRecord.id)).scalar() or 0
        if count:
            return int(count)
        df = pd.read_csv(settings.data_path)
        records = [
            {
                "crop": str(r.Crop), "crop_year": int(r.Crop_Year), "season": str(r.Season),
                "state": str(r.State), "area": float(r.Area), "production": float(r.Production),
                "annual_rainfall": float(r.Annual_Rainfall), "fertilizer": float(r.Fertilizer),
                "pesticide": float(r.Pesticide), "yield_value": float(r.Yield),
            }
            for r in df.itertuples(index=False)
        ]
        db.bulk_insert_mappings(CropRecord, records)
        db.commit()
        return len(records)
    finally:
        db.close()
