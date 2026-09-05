from pydantic import BaseModel


class SoilRequest(BaseModel):

    state: str


class SoilResponse(BaseModel):

    state: str

    nitrogen: int
    phosphorus: int
    potassium: int
    ph: float

    soil_score: int

    nitrogen_status: str
    phosphorus_status: str
    potassium_status: str
    ph_status: str

    fertilizer: str

    recommendation: str

    crops: list[str]

    improvements: list[str]