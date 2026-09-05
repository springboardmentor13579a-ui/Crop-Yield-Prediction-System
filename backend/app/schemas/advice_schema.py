from pydantic import BaseModel


# =========================================================
# CREATE ADVICE REQUEST
# =========================================================

class AdviceRequestCreate(BaseModel):

    farmer_email: str

    officer_email: str

    query: str

    crop: str | None = None


# =========================================================
# OFFICER REPLY
# =========================================================

class AdviceReply(BaseModel):

    response: str