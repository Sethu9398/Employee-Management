
import os
import logging
from sqlite3 import IntegrityError

from fastapi.security import HTTPAuthorizationCredentials

from App.schemas.userSchema import TokenResponse, UserLogin, UserRegister, UserResponse
from App.utils.security import create_access_token, hash_password, verify_password
import bcrypt
from pathlib import Path
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException,status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from App.database import SessionLocal, get_db
from App.models.userModel import User, UserRole

logger = logging.getLogger(__name__)

# Adjust this path according to your project structure
BASE_DIR = Path(__file__).resolve().parents[2]

ENV_PATH = BASE_DIR / ".env"


load_dotenv(dotenv_path=ENV_PATH)

router = APIRouter(
    prefix="/user",
    tags=["Users"]
)


@router.post("/create-default-admin")
def create_default_admin():

    db: Session = SessionLocal()

    try:
        admin_email = os.getenv("ADMIN_EMAIL","admin@company.com")
        admin_password = os.getenv("ADMIN_PASSWORD","Admin@12345")


        print("ENV FILE EXISTS:", ENV_PATH.exists())
        print("ADMIN_EMAIL LOADED:", bool(os.getenv("ADMIN_EMAIL")))
        print("ADMIN_PASSWORD LOADED:", bool(os.getenv("ADMIN_PASSWORD")))

        if not admin_email or not admin_password:
            raise HTTPException(
                status_code=500,
                detail="Admin credentials not configured"
            )

        if len(admin_password.encode("utf-8")) > 72:
            raise HTTPException(
                status_code=400,
                detail="Password must not exceed 72 bytes"
            )

        # Check existing Admin
        admin_exists = db.query(User).filter(
            User.role == UserRole.ADMIN
        ).first()

        if admin_exists:
            raise HTTPException(
                status_code=400,
                detail="Admin user already exists"
            )

        # Check duplicate email
        user_exists = db.query(User).filter(
            User.email == admin_email
        ).first()

        if user_exists:
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )

        # Hash password
        hashed_password = bcrypt.hashpw(
            admin_password.encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

        # Create Admin
        admin = User(
            email=admin_email,
            password=hashed_password,
            role=UserRole.ADMIN,
            department_id=None,
            is_active=True,
            is_delete=False
        )

        db.add(admin)
        db.commit()
        db.refresh(admin)

        return {
            "status": "success",
            "message": "Admin created successfully",
            "user_id": admin.user_id,
            "email": admin.email,
            "role": admin.role.value
        }

    except HTTPException:
        db.rollback()
        raise

    except SQLAlchemyError as e:
      db.rollback()

      logger.exception("SQLAlchemy error occurred")

      print("ERROR TYPE:", type(e).__name__)
      print("DATABASE ERROR:", str(e))

      original_error = getattr(e, "orig", None)

      if original_error:
         print("ORIGINAL DATABASE ERROR:", repr(original_error))

      raise HTTPException(
        status_code=500,
        detail=str(e)
       )

    except Exception:
        db.rollback()
        logger.exception("Unexpected error")

        raise HTTPException(
            status_code=500,
            detail="Something went wrong"
        )

    finally:
        db.close()


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
def register_user(
    user_data: UserRegister,
    db: Session = Depends(get_db)
):

    email = user_data.email.strip().lower()

    # Check duplicate email
    existing_user = db.query(User).filter(
        User.email == email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Hash password
    hashed_password = hash_password(user_data.password)

    # Create employee account
    new_user = User(
        email=email,
        password=hashed_password,
        role=UserRole.EMPLOYEE,
        department_id=None,
        is_active=True,
        is_delete=False
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return new_user

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=409,
            detail="Email already registered"
        )

    except Exception:
        db.rollback()
        logger.exception("User registration failed")

        raise HTTPException(
            status_code=500,
            detail="Unable to register user"
        )


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK
)
def login_user(
    login_data: UserLogin,
    db: Session = Depends(get_db)
):

    email = login_data.email.strip().lower()

    # Find user by email
    user = db.query(User).filter(
        User.email == email,
        User.is_delete == False
    ).first()

    # Check user exists
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # Verify password
    if not verify_password(
        login_data.password,
        user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # Check account status
    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Your account is inactive"
        )

    # Generate JWT token
    access_token = create_access_token(
        user_id=user.user_id,
        role=user.role.value
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.user_id,
        "role": user.role.value
    }

