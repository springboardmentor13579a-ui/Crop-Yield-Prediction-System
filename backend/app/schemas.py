from datetime import datetime
from typing import Literal
from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    phone: str | None = Field(default=None, max_length=30)
    state: str | None = Field(default=None, max_length=120)
    district: str | None = Field(default=None, max_length=120)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    role: Literal["farmer", "admin"]


class ProfileUpdate(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    phone: str | None = Field(default=None, max_length=30)
    state: str | None = Field(default=None, max_length=120)
    district: str | None = Field(default=None, max_length=120)


class UserOut(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    phone: str | None
    state: str | None
    district: str | None
    role: str
    is_active: bool
    created_at: datetime
    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class FarmCreate(BaseModel):
    farm_name: str = Field(min_length=2, max_length=120)
    state: str = Field(min_length=1, max_length=120)
    district: str | None = Field(default=None, max_length=120)
    village: str | None = Field(default=None, max_length=120)
    area: float | None = Field(default=None, gt=0)
    primary_crop: str | None = Field(default=None, max_length=120)
    irrigation_type: str | None = Field(default=None, max_length=80)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)


class FarmOut(FarmCreate):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


class ForecastRequest(BaseModel):
    farm_id: int | None = None
    crop: str = Field(min_length=1, max_length=120)
    crop_year: int = Field(ge=1990, le=2100)
    season: str = Field(min_length=1, max_length=80)
    state: str = Field(min_length=1, max_length=120)
    area: float = Field(gt=0)
    annual_rainfall: float = Field(ge=0)
    fertilizer: float = Field(ge=0)
    pesticide: float = Field(ge=0)


class ForecastOut(BaseModel):
    id: int
    farm_id: int | None
    crop: str
    crop_year: int
    season: str
    state: str
    area: float
    annual_rainfall: float
    fertilizer: float
    pesticide: float
    forecasted_yield: float
    forecasted_production: float | None
    historical_yield_median: float | None
    historical_rainfall_median: float | None
    historical_fertilizer_rate_median: float | None
    historical_pesticide_rate_median: float | None
    outside_historical_years: bool
    decision: str | None = None
    recommendation: str | None = None
    risk_score: int | None = None
    risk_level: str | None = None
    risk_label: str | None = None
    confidence_note: str | None = None
    risk_factors: list[dict] = Field(default_factory=list)
    immediate_next_step: str | None = None
    next_actions: list[str] = Field(default_factory=list)
    summary: str | None = None
    created_at: datetime
    model_config = {"from_attributes": True}


class SoilCreate(BaseModel):
    farm_id: int | None = None
    soil_type: str = Field(min_length=1, max_length=80)
    ph: float = Field(ge=0, le=14)
    nitrogen: float | None = Field(default=None, ge=0)
    phosphorus: float | None = Field(default=None, ge=0)
    potassium: float | None = Field(default=None, ge=0)
    organic_carbon: float | None = Field(default=None, ge=0)
    moisture: float | None = Field(default=None, ge=0, le=100)
    notes: str | None = Field(default=None, max_length=2000)


class SoilOut(SoilCreate):
    id: int
    user_id: int
    created_at: datetime
    model_config = {"from_attributes": True}


class UserStatusUpdate(BaseModel):
    is_active: bool
