from pydantic import BaseModel


class PredictionRequest(BaseModel):

    user_email: str

    country: str
    state: str
    area: str
    item: str
    year: int
    season: str

    rainfall: float
    pesticides: float
    temperature: float


class PredictionResponse(BaseModel):

    predicted_yield: float
    predicted_yield_tonnes_ha: float

    country: str
    state: str
    area: str
    crop: str
    year: int
    season: str

    rainfall: float
    temperature: float
    pesticides: float

    model: str
    prediction_id: str