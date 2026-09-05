from fastapi import APIRouter, HTTPException
from google.oauth2 import id_token
from google.auth.transport import requests
from app.config.settings import settings
from app.schemas.user_schema import UserRegister, UserLogin
from app.schemas.google_schema import GoogleToken
from app.database.mongodb import users_collection
from app.utils.password import (
    hash_password,
    verify_password
)

from app.utils.jwt_handler import create_access_token


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# =========================================================
# VALID ROLES
# =========================================================

VALID_ROLES = {
    "farmer",
    "admin",
    "agricultural_officer"
}


# =========================================================
# REGISTER
# =========================================================

@router.post("/register")
async def register(user: UserRegister):

    try:

        # -------------------------------------------------
        # CHECK ROLE
        # -------------------------------------------------

        if user.role not in VALID_ROLES:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid role. Allowed roles are: "
                    "farmer, admin, agricultural_officer"
                )
            )

        # -------------------------------------------------
        # NORMALIZE EMAIL
        # -------------------------------------------------

        email = user.email.strip().lower()

        # -------------------------------------------------
        # CHECK EXISTING EMAIL
        # -------------------------------------------------

        existing = await users_collection.find_one(
            {
                "email": email
            }
        )

        if existing:

            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )

        # -------------------------------------------------
        # CREATE USER
        # -------------------------------------------------

        new_user = {

            "full_name":
                user.full_name.strip(),

            "email":
                email,

            "password":
                hash_password(
                    user.password
                ),

            "provider":
                "local",

            "role":
                user.role,

            "phone":
                user.phone,

            "country":
                user.country,

            "state":
                user.state,

            "district":
                user.district,

            "mandal":
                user.mandal,

            "village":
                user.village,

            "land_area":
                user.land_area,

            "land_unit":
                user.land_unit or "acres",

            "crop":
                user.crop,

            "soil":
                user.soil,

            "irrigation":
                user.irrigation
        }

        # -------------------------------------------------
        # SAVE
        # -------------------------------------------------

        result = await users_collection.insert_one(
            new_user
        )

        print("=" * 60)
        print("USER REGISTERED")
        print("Name :", user.full_name)
        print("Email:", email)
        print("Role :", user.role)
        print("Mongo ID:", result.inserted_id)
        print("=" * 60)

        return {

            "message":
                "Registration Successful",

            "id":
                str(result.inserted_id),

            "role":
                user.role

        }

    except HTTPException:

        raise

    except Exception as e:

        print("=" * 60)
        print("REGISTRATION ERROR")
        print(str(e))
        print("=" * 60)

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# =========================================================
# LOGIN
# =========================================================

@router.post("/login")
async def login(user: UserLogin):

    # -----------------------------------------------------
    # NORMALIZE EMAIL
    # -----------------------------------------------------

    email = user.email.strip().lower()

    # -----------------------------------------------------
    # CHECK ROLE
    # -----------------------------------------------------

    if user.role not in VALID_ROLES:

        raise HTTPException(
            status_code=400,
            detail="Invalid login role"
        )

    # -----------------------------------------------------
    # FIND USER
    # -----------------------------------------------------

    db_user = await users_collection.find_one(
        {
            "email": email
        }
    )

    if db_user is None:

        raise HTTPException(
            status_code=401,
            detail="Invalid Credentials"
        )

    # -----------------------------------------------------
    # DATABASE ROLE
    # -----------------------------------------------------

    database_role = db_user.get(
        "role",
        "farmer"
    )

    # -----------------------------------------------------
    # ROLE CHECK
    # -----------------------------------------------------

    if database_role != user.role:

        role_names = {

            "farmer":
                "Farmer",

            "admin":
                "Admin",

            "officer":
                "Agricultural Officer"

        }

        actual_role = role_names.get(
            database_role,
            database_role
        )

        raise HTTPException(

            status_code=403,

            detail=(
                f"This account is registered as "
                f"{actual_role}. "
                f"Please select the correct login."
            )

        )

    # -----------------------------------------------------
    # GOOGLE ACCOUNT
    # -----------------------------------------------------

    if db_user.get("provider") == "google":

        raise HTTPException(

            status_code=401,

            detail="Please login using Google"

        )

    # -----------------------------------------------------
    # PASSWORD
    # -----------------------------------------------------

    if not db_user.get("password"):

        raise HTTPException(

            status_code=401,

            detail=(
                "Please use the login method "
                "used during registration"
            )

        )

    # -----------------------------------------------------
    # VERIFY PASSWORD
    # -----------------------------------------------------

    if not verify_password(
        user.password,
        db_user["password"]
    ):

        raise HTTPException(

            status_code=401,

            detail="Invalid Credentials"

        )

    # -----------------------------------------------------
    # CREATE JWT
    # -----------------------------------------------------

    token = create_access_token(

        {
            "sub":
                db_user["email"],

            "role":
                database_role
        }

    )

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {

        "access_token":
            token,

        "token_type":
            "bearer",

        "user": {

            "full_name":
                db_user.get(
                    "full_name",
                    ""
                ),

            "email":
                db_user.get(
                    "email",
                    ""
                ),

            "role":
                database_role

        }

    }


# =========================================================
# GOOGLE LOGIN
# =========================================================

@router.post("/google")
async def google_login(data: GoogleToken):

    try:

        # -------------------------------------------------
        # VERIFY GOOGLE TOKEN
        # -------------------------------------------------

        idinfo = id_token.verify_oauth2_token(

            data.token,

            requests.Request(),

            settings.GOOGLE_CLIENT_ID

        )

        email = idinfo["email"]

        name = idinfo.get(
            "name",
            ""
        )

        # -------------------------------------------------
        # FIND USER
        # -------------------------------------------------

        user = await users_collection.find_one(
            {
                "email": email
            }
        )

        # -------------------------------------------------
        # CREATE GOOGLE FARMER
        # -------------------------------------------------

        if user is None:

            new_google_user = {

                "full_name":
                    name,

                "email":
                    email,

                "password":
                    "",

                "provider":
                    "google",

                "role":
                    "farmer",

                "phone":
                    "",

                "village":
                    "",

                "mandal":
                    "",

                "district":
                    "",

                "state":
                    "",

                "country":
                    "",

                "land_area":
                    0,

                "land_unit":
                    "acres",

                "crop":
                    "",

                "soil":
                    "",

                "irrigation":
                    ""

            }

            await users_collection.insert_one(
                new_google_user
            )

            user = await users_collection.find_one(
                {
                    "email": email
                }
            )

        # -------------------------------------------------
        # GOOGLE ONLY FARMER
        # -------------------------------------------------

        if user.get("role") != "farmer":

            raise HTTPException(

                status_code=403,

                detail=(
                    "Google login is available "
                    "only for Farmer accounts."
                )

            )

        # -------------------------------------------------
        # JWT
        # -------------------------------------------------

        token = create_access_token(

            {
                "sub":
                    email,

                "role":
                    "farmer"
            }

        )

        # -------------------------------------------------
        # RESPONSE
        # -------------------------------------------------

        return {

            "access_token":
                token,

            "token_type":
                "bearer",

            "user": {

                "full_name":
                    user.get(
                        "full_name",
                        name
                    ),

                "email":
                    user.get(
                        "email",
                        email
                    ),

                "role":
                    "farmer",

                "phone":
                    user.get(
                        "phone",
                        ""
                    ),

                "village":
                    user.get(
                        "village",
                        ""
                    ),

                "mandal":
                    user.get(
                        "mandal",
                        ""
                    ),

                "district":
                    user.get(
                        "district",
                        ""
                    ),

                "state":
                    user.get(
                        "state",
                        ""
                    ),

                "country":
                    user.get(
                        "country",
                        ""
                    ),

                "land_area":
                    user.get(
                        "land_area",
                        0
                    ),

                "land_unit":
                    user.get(
                        "land_unit",
                        "acres"
                    ),

                "crop":
                    user.get(
                        "crop",
                        ""
                    ),

                "soil":
                    user.get(
                        "soil",
                        ""
                    ),

                "irrigation":
                    user.get(
                        "irrigation",
                        ""
                    )

            }

        }

    except HTTPException:

        raise

    except Exception as e:

        print("=" * 60)
        print("GOOGLE LOGIN ERROR")
        print(str(e))
        print("=" * 60)

        raise HTTPException(

            status_code=401,

            detail="Google Authentication Failed"

        )