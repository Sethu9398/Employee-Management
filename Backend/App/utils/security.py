
import os
import bcrypt

import jwt
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY","assalt_sethu")

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY is missing from .env")

ALGORITHM = os.getenv("ALGORITHM", "HS256")

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
)


# Hash password
def hash_password(password: str) -> str:

    if len(password.encode("utf-8")) > 72:
        raise ValueError("Password must not exceed 72 bytes")

    hashed = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    )

    return hashed.decode("utf-8")


# Verify password
def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:

    if len(plain_password.encode("utf-8")) > 72:
        return False

    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8")
    )


# Generate JWT token
def create_access_token(user_id: int, role: str):

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user_id),
        "role": role,
        "exp": expire
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )
