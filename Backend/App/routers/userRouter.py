import os
import logging

from sqlalchemy import or_
from App.utils.auth import get_current_admin, get_current_user
from App.models.departmentModel import Department
import jwt
from fastapi.security import HTTPAuthorizationCredentials

from App.schemas.userSchema import TokenResponse, UserListResponse, UserLogin, UserRegister, UserResponse
from App.utils.security import (
    ALGORITHM,
    REFRESH_TOKEN_EXPIRE_DAYS,
    SECRET_KEY,
    create_access_token,
    create_refresh_token,
    hash_password,
    is_access_token_active,
    verify_password,
    verify_refresh_token,
)
import bcrypt
from pathlib import Path
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from App.database import SessionLocal, get_db
from App.models.userModel import User, UserRole

logger = logging.getLogger(__name__)

# Adjust this path according to your project structure
BASE_DIR = Path(__file__).resolve().parents[2]

ENV_PATH = BASE_DIR / ".env"


load_dotenv(dotenv_path=ENV_PATH)

router = APIRouter(prefix="/user", tags=["Users"])



ACCESS_COOKIE_MAX_AGE = 60 * 60
REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * REFRESH_TOKEN_EXPIRE_DAYS


def set_access_cookie(response: Response, access_token: str):

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,  # True in production with HTTPS
        samesite="lax",
        max_age=ACCESS_COOKIE_MAX_AGE
    )


def set_auth_cookies(response: Response, access_token: str, refresh_token: str):

    set_access_cookie(response, access_token)

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,  # True in production with HTTPS
        samesite="lax",
        max_age=REFRESH_COOKIE_MAX_AGE
    )


@router.post("/create-default-admin")
def create_default_admin():

    db: Session = SessionLocal()

    try:
        admin_email = os.getenv("ADMIN_EMAIL", "admin@company.com")
        admin_password = os.getenv("ADMIN_PASSWORD", "Admin@12345")

        print("ENV FILE EXISTS:", ENV_PATH.exists())
        print("ADMIN_EMAIL LOADED:", bool(os.getenv("ADMIN_EMAIL")))
        print("ADMIN_PASSWORD LOADED:", bool(os.getenv("ADMIN_PASSWORD")))

        if not admin_email or not admin_password:
            raise HTTPException(
                status_code=500, detail="Admin credentials not configured"
            )

        if len(admin_password.encode("utf-8")) > 72:
            raise HTTPException(
                status_code=400, detail="Password must not exceed 72 bytes"
            )

        # Check existing Admin
        admin_exists = db.query(User).filter(User.role == UserRole.ADMIN).first()

        if admin_exists:
            raise HTTPException(status_code=400, detail="Admin user already exists")

        # Check duplicate email
        user_exists = db.query(User).filter(User.email == admin_email).first()

        if user_exists:
            raise HTTPException(status_code=400, detail="Email already registered")

        # Hash password
        hashed_password = bcrypt.hashpw(
            admin_password.encode("utf-8"), bcrypt.gensalt()
        ).decode("utf-8")

        # Create Admin
        admin = User(
            email=admin_email,
            password=hashed_password,
            role=UserRole.ADMIN,
            department_id=None,
            is_active=True,
            is_delete=False,
        )

        db.add(admin)
        db.commit()
        db.refresh(admin)

        return {
            "status": "success",
            "message": "Admin created successfully",
            "user_id": admin.user_id,
            "email": admin.email,
            "role": admin.role.value,
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

        raise HTTPException(status_code=500, detail=str(e))

    except Exception:
        db.rollback()
        logger.exception("Unexpected error")

        raise HTTPException(status_code=500, detail="Something went wrong")

    finally:
        db.close()


@router.post(
    "/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED
)
def register_user(user_data: UserRegister, response: Response,db: Session = Depends(get_db)):

    email = user_data.email.strip().lower()

    # Check duplicate email
    existing_user = db.query(User).filter(User.email == email).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    department = db.query(Department).filter(
        Department.department_id == user_data.department_id,
        Department.is_active == True,
        Department.is_delete == False
    ).first()


    if not department:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid department ID or department is inactive"
        )

    # Hash password
    hashed_password = hash_password(user_data.password)

    # Create employee account
    new_user = User(
        fullname=user_data.fullname.strip(),
        email=email,
        phonenumber=user_data.phonenumber,
        password=hashed_password,
        role=UserRole.EMPLOYEE,
        department_id=department.department_id,
        is_active=True,
        is_delete=False,
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

          # Generate tokens
        access_token = create_access_token(
            user_id=new_user.user_id,
            role=new_user.role.value
        )

        refresh_token = create_refresh_token(
            user_id=new_user.user_id,
            role=new_user.role.value
        )

        # Store tokens in cookies
        set_auth_cookies(
            response,
            access_token,
            refresh_token
        )

        return new_user

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Email already registered"
        )

    except Exception:
        db.rollback()
        logger.exception("User registration failed")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to register user",
        )


@router.post("/login", response_model=UserResponse, status_code=status.HTTP_200_OK)
def login_user(
    login_data: UserLogin,
    response: Response,
    db: Session = Depends(get_db)
):

    email = login_data.email.strip().lower()

    # Find user by email
    user = db.query(User).filter(User.email == email, User.is_delete == False).first()

    # Check user exists
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Verify password
    if not verify_password(login_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Check account status
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Your account is inactive")

     # Generate Access Token
    access_token = create_access_token(
        user_id=user.user_id,
        role=user.role.value
    )

    # Generate Refresh Token
    refresh_token = create_refresh_token(
        user_id=user.user_id,
        role=user.role.value
    )

    # Store both tokens in cookies
    set_auth_cookies(
        response,
        access_token,
        refresh_token
    )

    return user


@router.post("/logout", status_code=status.HTTP_200_OK)
def logout_user(response: Response):

    # Delete Access Token Cookie
    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=False,
        samesite="lax",
        path="/"
    )

    # Delete Refresh Token Cookie
    response.delete_cookie(
        key="refresh_token",
        httponly=True,
        secure=False,
        samesite="lax",
        path="/"
    )

    return {
        "status": "success",
        "message": "Logout successful"
    }



@router.get("/me", response_model=UserResponse)
def get_logged_in_user(
    current_user: User = Depends(get_current_user)
):
    return current_user

@router.post("/refresh")
def refresh_access_token(
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):

    refresh_token = request.cookies.get("refresh_token")

    if not refresh_token:
        raise HTTPException(
            status_code=401,
            detail="Refresh token missing"
        )

    # 1. Refresh token must be valid and NOT expired
    user_id = verify_refresh_token(refresh_token)

    user = db.query(User).filter(
        User.user_id == user_id,
        User.is_delete == False
    ).first()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=401,
            detail="User not found or inactive"
        )

    # 2. Only issue a new access token once the current one has expired
    if is_access_token_active(request.cookies.get("access_token"), user.user_id):
        return {
            "refreshed": False,
            "message": "Access token is still valid"
        }

    # 3. Issue a new access token only — the refresh token is never reset here,
    #    so the user must log in again when it expires.
    new_access_token = create_access_token(
        user_id=user.user_id,
        role=user.role.value
    )

    set_access_cookie(response, new_access_token)

    return {
        "refreshed": True,
        "message": "Access token refreshed successfully"
    }


@router.get('/list',response_model=UserListResponse,status_code=status.HTTP_200_OK)
def get_all_user_list(db:Session=Depends(get_db),current_user:User=Depends(get_current_user)):

    users = db.query(User).order_by(
        User.user_id.desc()
    ).all()

    
    return {
        "total_user": len(users),
        "user": users
    }

@router.get('/singleuser/{user_id}',response_model=UserResponse,status_code=status.HTTP_200_OK)
def get_single_user(user_id: int,db:Session=Depends(get_db),current_user:User=Depends(get_current_user)):

    user = db.query(User).filter(
        User.user_id == user_id,
        User.is_delete == False
    ).first()

    # Check user exists
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user



    
@router.get(
    "/search/{search}",
    response_model=UserListResponse,
    status_code=status.HTTP_200_OK
)
def search_users(
    search: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    search = search.strip()

    if not search:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please enter user ID or name"
        )

    query = db.query(User).filter(
        User.is_delete == False
    )

    if current_user.role == UserRole.EMPLOYEE:
        query = query.filter(
            User.role == UserRole.EMPLOYEE
        )

    search_filters = [
        User.fullname.ilike(f"%{search}%")
    ]

    # Search by user ID
    if search.isdigit():
        search_filters.append(
            User.user_id == int(search)
        )

    users = query.filter(
        or_(*search_filters)
    ).order_by(
        User.user_id.desc()
    ).all()

    return {
        "total_user": len(users),
        "user": users
    }


@router.patch(
    "/delete/{id}/{is_delete}",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK
)
def change_user_delete_status(
    id: int,
    is_delete: bool,
    db: Session = Depends(get_db),
    current_user_admin: User = Depends(get_current_admin)
):
    user = db.query(User).filter(
        User.user_id == id
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if user.is_delete == is_delete:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User is already {'deleted' if is_delete else 'active'}"
        )

    try:
        user.is_delete = is_delete

        db.commit()
        db.refresh(user)

        return user

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user delete status"
        )

@router.patch(
    "/active/{id}/{is_active}",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK
)
def change_user_active_status(
    id: int,
    is_active: bool,
    db: Session = Depends(get_db),
    current_user_admin: User = Depends(get_current_admin)
):
    user = db.query(User).filter(
        User.user_id == id
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if user.is_active == is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User is already {'active' if is_active else 'inactive'}"
        )

    try:
        user.is_active = is_active

        db.commit()
        db.refresh(user)

        return user

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user active status"
        )