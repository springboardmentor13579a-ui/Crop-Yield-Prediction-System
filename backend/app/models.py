from datetime import datetime, timezone
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base


def utcnow():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    state: Mapped[str | None] = mapped_column(String(120), nullable=True)
    district: Mapped[str | None] = mapped_column(String(120), nullable=True)
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="farmer")
    password_hash: Mapped[str] = mapped_column(String(512), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)

    farms: Mapped[list["Farm"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    forecasts: Mapped[list["Forecast"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    soil_records: Mapped[list["SoilRecord"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    weather_records: Mapped[list["WeatherRecord"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Farm(Base):
    __tablename__ = "farms"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    farm_name: Mapped[str] = mapped_column(String(120), nullable=False)
    state: Mapped[str] = mapped_column(String(120), nullable=False)
    district: Mapped[str | None] = mapped_column(String(120), nullable=True)
    village: Mapped[str | None] = mapped_column(String(120), nullable=True)
    area: Mapped[float | None] = mapped_column(Float, nullable=True)
    primary_crop: Mapped[str | None] = mapped_column(String(120), nullable=True)
    irrigation_type: Mapped[str | None] = mapped_column(String(80), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    user: Mapped[User] = relationship(back_populates="farms")


class Forecast(Base):
    __tablename__ = "forecasts"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    farm_id: Mapped[int | None] = mapped_column(ForeignKey("farms.id", ondelete="SET NULL"), nullable=True, index=True)
    crop: Mapped[str] = mapped_column(String(120), nullable=False)
    crop_year: Mapped[int] = mapped_column(Integer, nullable=False)
    season: Mapped[str] = mapped_column(String(80), nullable=False)
    state: Mapped[str] = mapped_column(String(120), nullable=False)
    area: Mapped[float] = mapped_column(Float, nullable=False)
    annual_rainfall: Mapped[float] = mapped_column(Float, nullable=False)
    fertilizer: Mapped[float] = mapped_column(Float, nullable=False)
    pesticide: Mapped[float] = mapped_column(Float, nullable=False)
    forecasted_yield: Mapped[float] = mapped_column(Float, nullable=False)
    forecasted_production: Mapped[float | None] = mapped_column(Float, nullable=True)
    historical_yield_median: Mapped[float | None] = mapped_column(Float, nullable=True)
    historical_rainfall_median: Mapped[float | None] = mapped_column(Float, nullable=True)
    historical_fertilizer_rate_median: Mapped[float | None] = mapped_column(Float, nullable=True)
    historical_pesticide_rate_median: Mapped[float | None] = mapped_column(Float, nullable=True)
    outside_historical_years: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)

    user: Mapped[User] = relationship(back_populates="forecasts")


class SoilRecord(Base):
    __tablename__ = "soil_records"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    farm_id: Mapped[int | None] = mapped_column(ForeignKey("farms.id", ondelete="SET NULL"), nullable=True, index=True)
    soil_type: Mapped[str] = mapped_column(String(80), nullable=False)
    ph: Mapped[float] = mapped_column(Float, nullable=False)
    nitrogen: Mapped[float | None] = mapped_column(Float, nullable=True)
    phosphorus: Mapped[float | None] = mapped_column(Float, nullable=True)
    potassium: Mapped[float | None] = mapped_column(Float, nullable=True)
    organic_carbon: Mapped[float | None] = mapped_column(Float, nullable=True)
    moisture: Mapped[float | None] = mapped_column(Float, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)

    user: Mapped[User] = relationship(back_populates="soil_records")


class WeatherRecord(Base):
    __tablename__ = "weather_records"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    farm_id: Mapped[int | None] = mapped_column(ForeignKey("farms.id", ondelete="SET NULL"), nullable=True, index=True)
    location_name: Mapped[str | None] = mapped_column(String(180), nullable=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    temperature: Mapped[float | None] = mapped_column(Float, nullable=True)
    apparent_temperature: Mapped[float | None] = mapped_column(Float, nullable=True)
    humidity: Mapped[float | None] = mapped_column(Float, nullable=True)
    precipitation: Mapped[float | None] = mapped_column(Float, nullable=True)
    wind_speed: Mapped[float | None] = mapped_column(Float, nullable=True)
    soil_temperature: Mapped[float | None] = mapped_column(Float, nullable=True)
    soil_moisture: Mapped[float | None] = mapped_column(Float, nullable=True)
    weather_code: Mapped[int | None] = mapped_column(Integer, nullable=True)
    captured_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)

    user: Mapped[User] = relationship(back_populates="weather_records")


class CropRecord(Base):
    __tablename__ = "crop_records"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    crop: Mapped[str] = mapped_column(String(120), index=True, nullable=False)
    crop_year: Mapped[int] = mapped_column(Integer, index=True, nullable=False)
    season: Mapped[str] = mapped_column(String(80), index=True, nullable=False)
    state: Mapped[str] = mapped_column(String(120), index=True, nullable=False)
    area: Mapped[float] = mapped_column(Float, nullable=False)
    production: Mapped[float] = mapped_column(Float, nullable=False)
    annual_rainfall: Mapped[float] = mapped_column(Float, nullable=False)
    fertilizer: Mapped[float] = mapped_column(Float, nullable=False)
    pesticide: Mapped[float] = mapped_column(Float, nullable=False)
    yield_value: Mapped[float] = mapped_column("yield", Float, nullable=False)
