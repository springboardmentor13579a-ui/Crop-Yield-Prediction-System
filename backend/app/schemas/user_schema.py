from pydantic import BaseModel, EmailStr
from typing import Literal


# =========================================================
# COMMON USER ROLE
# =========================================================

UserRole = Literal[
    "farmer",
    "admin",
    "agricultural_officer"
]


# =========================================================
# REGISTER
# =========================================================

class UserRegister(BaseModel):

    full_name: str

    email: EmailStr

    password: str

    role: UserRole = "farmer"

    # -----------------------------------------------------
    # PROFILE INFORMATION
    # -----------------------------------------------------

    phone: str | None = None

    country: str | None = None

    state: str | None = None

    district: str | None = None

    mandal: str | None = None

    village: str | None = None

    land_area: float | None = None

    land_unit: str | None = "acres"

    crop: str | None = None

    soil: str | None = None

    irrigation: str | None = None


# =========================================================
# LOGIN
# =========================================================

class UserLogin(BaseModel):

    email: EmailStr

    password: str

    role: UserRole


# =========================================================
# USER RESPONSE
# =========================================================

class UserResponse(BaseModel):

    full_name: str

    email: EmailStr

    role: str


# =========================================================
# USER UPDATE
# =========================================================

class UserUpdate(BaseModel):

    full_name: str

    email: EmailStr

    role: UserRole

    phone: str | None = None

    country: str | None = None

    state: str | None = None

    district: str | None = None

    mandal: str | None = None

    village: str | None = None

    land_area: float | None = None

    land_unit: str | None = "acres"

    crop: str | None = None

    soil: str | None = None

    irrigation: str | None = None