from pydantic import BaseModel

class Farmer(BaseModel):
    name: str
    age: int
    district: str
    state: str
    soil_type: str
    farm_size: float