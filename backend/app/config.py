from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[1]


class Settings(BaseSettings):
    app_name: str = "YieldSense AI API"
    secret_key: str = "CHANGE-ME-BEFORE-PRODUCTION-USE-AT-LEAST-32-BYTES"
    access_token_expire_minutes: int = 1440
    database_url: str = f"sqlite:///{(BASE_DIR / 'yieldsense.db').as_posix()}"
    frontend_url: str = "http://localhost:5173"

    # Supplied Random Forest pipeline.
    yield_model_path: str = str(BASE_DIR / "models" / "crop_yield_prediction_model.pkl")

    # Online agricultural dataset used for options and historical context.
    hf_dataset_id: str = "dhyann2815/india-crop-yield-prediction"

    # Offline fallback only if Hugging Face cannot be reached.
    data_path: str = str(BASE_DIR / "data" / "crop_yield.csv")

    weather_base_url: str = "https://api.open-meteo.com/v1/forecast"
    geocoding_base_url: str = "https://geocoding-api.open-meteo.com/v1/search"

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
