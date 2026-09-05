print("MAIN IMPORTED USERS ROUTER")
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.users import router as users_router
from app.routers.prediction import router as prediction_router
from app.database.mongodb import client
from app.routers.auth import router as auth_router
from app.routers.analytics import router as analytics_router
#from app.routers.farmers import router as farmers_router
from app.routers.risk import router as risk_router
from app.routers.soil import router as soil_router
from app.routers.recommendation import router as recommendation_router
from app.routers.report import router as report_router
from app.routers import admin
from app.routers.advice import router as advice_router
app = FastAPI(
    title="YieldSense AI",
    description="AI Crop Yield Prediction System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "🌾 Welcome to YieldSense AI"
    }

@app.get("/health")
async def health():
    try:
        await client.admin.command("ping")
        return {
            "status": "Connected",
            "database": "MongoDB Atlas"
        }
    except Exception as e:
        return {
            "status": "Failed",
            "error": str(e)
        }

app.include_router(auth_router)
#app.include_router(farmers_router)
app.include_router(users_router)
app.include_router(prediction_router)
app.include_router(soil_router)
app.include_router(report_router)
app.include_router(admin.router)
app.include_router(analytics_router)
app.include_router(recommendation_router)
app.include_router(advice_router)
app.include_router(risk_router)
print("=" * 60)
print("🔥 ADVICE ROUTER REGISTERED")
print("=" * 60)
