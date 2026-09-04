from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import Base, engine
from .routers import auth, farms, forecasts, soil, weather, recommendations, admin
from .seed_data import ensure_crop_records

Base.metadata.create_all(bind=engine)
ensure_crop_records()

app = FastAPI(title=settings.app_name, version="2.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth.router)
app.include_router(farms.router)
app.include_router(forecasts.router)
app.include_router(soil.router)
app.include_router(weather.router)
app.include_router(recommendations.router)
app.include_router(admin.router)


@app.get("/")
def root():
    return {"name": "YieldSense AI API", "status": "running", "docs": "/docs"}


@app.get("/api/health")
def health():
    # Keep health checks useful without forcing a model load on every request.
    try:
        from .ml_service import get_model
        get_model()
        model_status = "loaded"
    except Exception as exc:
        model_status = f"error: {exc}"
    return {
        "status": "ok" if model_status == "loaded" else "degraded",
        "model": "Random Forest",
        "model_status": model_status,
    }
