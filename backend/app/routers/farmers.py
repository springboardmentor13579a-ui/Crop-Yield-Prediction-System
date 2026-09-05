from fastapi import APIRouter
from app.database.mongodb import users_collection

router = APIRouter(
    prefix="/farmers",
    tags=["Farmers"]
)


@router.get("/")
async def get_all_farmers():

    farmers = []

    async for farmer in users_collection.find(
        {"role": "farmer"},
        {"password": 0}
    ):
        farmer["_id"] = str(farmer["_id"])
        farmers.append(farmer)

    return farmers