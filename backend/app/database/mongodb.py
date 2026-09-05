from motor.motor_asyncio import AsyncIOMotorClient
from app.config.settings import settings
client = AsyncIOMotorClient(
    settings.MONGODB_URL
)
db = client[
    settings.DATABASE_NAME
]
users_collection = db["users"]
predictions_collection = db["predictions"]
soil_collection = db["soil_analyses"]
advice_requests_collection = db["advice_requests"]
print("=" * 60)
print("MongoDB Connected")
print("Database :", settings.DATABASE_NAME)
print("Users Collection :", users_collection.name)
print("Predictions Collection :", predictions_collection.name)
print("Soil Collection :", soil_collection.name)
print("Advice Collection :", advice_requests_collection.name)
print("=" * 60)