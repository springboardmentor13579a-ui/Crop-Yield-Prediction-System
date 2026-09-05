from fastapi import APIRouter, HTTPException
from bson import ObjectId
from bson.errors import InvalidId

from app.schemas.user_schema import UserRegister, UserUpdate
from app.database.mongodb import users_collection


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


# =====================================================
# GET ALL USERS
# =====================================================

@router.get("")
async def get_users():

    users = []

    async for user in users_collection.find(
        {},
        {"password": 0}
    ):

        user["_id"] = str(user["_id"])

        users.append(user)

    return users


# =====================================================
# GET SINGLE USER
# =====================================================

@router.get("/{id}")
async def get_user(id: str):

    try:

        user = await users_collection.find_one(
            {
                "_id": ObjectId(id)
            },
            {
                "password": 0
            }
        )

    except InvalidId:

        raise HTTPException(
            status_code=400,
            detail="Invalid User ID"
        )

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    user["_id"] = str(user["_id"])

    return user


# =====================================================
# ADD USER
# =====================================================

@router.post("")
async def add_user(user: UserRegister):

    existing = await users_collection.find_one(
        {
            "email": user.email
        }
    )

    if existing:

        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    new_user = {

        "full_name": user.full_name,

        "email": user.email,

        "password": "",

        "provider": "admin",

        "role": user.role,

        # Farmer / profile information
        "phone": user.phone,

        "village": user.village,

        "mandal": user.mandal,

        "district": user.district,

        "state": user.state,

        "country": user.country,

        "land_area": user.land_area,

        "land_unit": user.land_unit,

        "crop": user.crop,

        "soil": user.soil,

        "irrigation": user.irrigation
    }

    print("Saving User:")
    print(new_user)

    result = await users_collection.insert_one(
        new_user
    )

    print(
        "Inserted Mongo ID:",
        result.inserted_id
    )

    return {

        "message":
            "User Added Successfully",

        "id":
            str(result.inserted_id)
    }


# =====================================================
# UPDATE USER
# =====================================================

@router.put("/{id}")
async def update_user(
    id: str,
    user: UserUpdate
):

    try:

        update_data = {

            "full_name":
                user.full_name,

            "email":
                user.email,

            "role":
                user.role
        }

        # Only update optional fields
        # when they were actually provided.

        optional_fields = [

            "phone",
            "village",
            "mandal",
            "district",
            "state",
            "country",
            "land_area",
            "land_unit",
            "crop",
            "soil",
            "irrigation"
        ]

        for field in optional_fields:

            value = getattr(
                user,
                field
            )

            if value is not None:

                update_data[field] = value


        result = await users_collection.update_one(

            {
                "_id": ObjectId(id)
            },

            {
                "$set": update_data
            }
        )

    except InvalidId:

        raise HTTPException(
            status_code=400,
            detail="Invalid User ID"
        )

    if result.matched_count == 0:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {

        "message":
            "User Updated Successfully"
    }


# =====================================================
# DELETE USER
# =====================================================

@router.delete("/{id}")
async def delete_user(id: str):

    try:

        result = await users_collection.delete_one(

            {
                "_id": ObjectId(id)
            }
        )

    except InvalidId:

        raise HTTPException(
            status_code=400,
            detail="Invalid User ID"
        )

    if result.deleted_count == 0:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {

        "message":
            "User Deleted Successfully"
    }