from fastapi import APIRouter, HTTPException

from datetime import datetime, timezone

from bson import ObjectId

from bson.errors import InvalidId


from app.database.mongodb import (
    users_collection,
    advice_requests_collection
)


from app.schemas.advice_schema import (
    AdviceRequestCreate,
    AdviceReply
)


print("=" * 60)
print("🔥 ADVICE ROUTER IMPORTED")
print("=" * 60)


router = APIRouter(
    prefix="/advice",
    tags=["Advice"]
)


# =========================================================
# GET AGRICULTURAL OFFICERS
# =========================================================

@router.get("/officers")
async def get_agricultural_officers():

    officers = []


    async for officer in users_collection.find(
        {
            "role": "agricultural_officer"
        },
        {
            "password": 0
        }
    ):

        officers.append({

            "id":
                str(
                    officer["_id"]
                ),

            "full_name":
                officer.get(
                    "full_name",
                    "Agricultural Officer"
                ),

            "email":
                officer.get(
                    "email"
                ),

            "district":
                officer.get(
                    "district"
                ),

            "state":
                officer.get(
                    "state"
                )

        })


    return officers


# =========================================================
# CREATE ADVICE REQUEST
# =========================================================

@router.post("/request")
async def create_advice_request(
    request: AdviceRequestCreate
):

    # -----------------------------------------------------
    # VALIDATE QUERY
    # -----------------------------------------------------

    if not request.query.strip():

        raise HTTPException(
            status_code=400,
            detail="Please enter your query"
        )


    # -----------------------------------------------------
    # CHECK FARMER
    # -----------------------------------------------------

    farmer = await users_collection.find_one(
        {
            "email": request.farmer_email,
            "role": "farmer"
        },
        {
            "password": 0
        }
    )


    if not farmer:

        raise HTTPException(
            status_code=404,
            detail="Farmer not found"
        )


    # -----------------------------------------------------
    # CHECK AGRICULTURAL OFFICER
    # -----------------------------------------------------

    officer = await users_collection.find_one(
        {
            "email": request.officer_email,
            "role": "agricultural_officer"
        },
        {
            "password": 0
        }
    )


    if not officer:

        raise HTTPException(
            status_code=404,
            detail="Agricultural officer not found"
        )


    # -----------------------------------------------------
    # CREATE ADVICE REQUEST
    # -----------------------------------------------------

    advice_request = {

        "farmer_email":
            farmer.get("email"),

        "farmer_name":
            farmer.get(
                "full_name",
                "Farmer"
            ),

        "officer_email":
            officer.get("email"),

        "officer_name":
            officer.get(
                "full_name",
                "Agricultural Officer"
            ),

        "crop":
            request.crop
            or farmer.get("crop"),

        "query":
            request.query.strip(),

        "response":
            None,

        "status":
            "pending",

        "created_at":
            datetime.now(timezone.utc),

        "replied_at":
            None

    }


    result = await advice_requests_collection.insert_one(
        advice_request
    )


    return {

        "message":
            "Advice request sent successfully",

        "request_id":
            str(
                result.inserted_id
            ),

        "status":
            "pending"

    }


# =========================================================
# GET REQUESTS FOR OFFICER
# =========================================================

@router.get("/officer/{email}")
async def get_officer_requests(
    email: str
):

    requests = []


    cursor = advice_requests_collection.find(
        {
            "officer_email": email
        }
    ).sort(
        "created_at",
        -1
    )


    async for item in cursor:

        item["_id"] = str(
            item["_id"]
        )

        requests.append(item)


    return requests


# =========================================================
# GET REQUESTS FOR FARMER
# =========================================================

@router.get("/farmer/{email}")
async def get_farmer_requests(
    email: str
):

    requests = []


    cursor = advice_requests_collection.find(
        {
            "farmer_email": email
        }
    ).sort(
        "created_at",
        -1
    )


    async for item in cursor:

        item["_id"] = str(
            item["_id"]
        )

        requests.append(item)


    return requests


# =========================================================
# OFFICER REPLIES TO ADVICE
# =========================================================

@router.put("/reply/{request_id}")
async def reply_to_advice(
    request_id: str,
    reply: AdviceReply
):

    # -----------------------------------------------------
    # VALIDATE RESPONSE
    # -----------------------------------------------------

    if not reply.response.strip():

        raise HTTPException(
            status_code=400,
            detail="Advice response cannot be empty"
        )


    # -----------------------------------------------------
    # VALIDATE OBJECT ID
    # -----------------------------------------------------

    try:

        object_id = ObjectId(
            request_id
        )

    except InvalidId:

        raise HTTPException(
            status_code=400,
            detail="Invalid advice request ID"
        )


    # -----------------------------------------------------
    # UPDATE REQUEST
    # -----------------------------------------------------

    result = await advice_requests_collection.update_one(

        {
            "_id": object_id
        },

        {
            "$set": {

                "response":
                    reply.response.strip(),

                "status":
                    "replied",

                "replied_at":
                    datetime.now(
                        timezone.utc
                    )

            }
        }

    )


    if result.matched_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Advice request not found"
        )


    return {

        "message":
            "Advice sent successfully",

        "status":
            "replied"

    }