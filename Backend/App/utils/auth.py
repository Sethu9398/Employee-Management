
from fastapi import Request, Depends, HTTPException, status
from sqlalchemy.orm import Session

from App.database import get_db
from App.models.userModel import User, UserRole
from App.utils.security import verify_access_token


# Get current authenticated user
def get_current_user(
    request: Request,
    db: Session = Depends(get_db)
):

    # Read access token from cookie
    access_token = request.cookies.get("access_token")

    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token missing. Please login."
        )

    # Verify access token
    payload = verify_access_token(access_token)

    user_id = int(payload["sub"])

    # Find user in database
    user = db.query(User).filter(
        User.user_id == user_id,
        User.is_delete == False
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is inactive"
        )

    return user


# Admin authorization
def get_current_admin(
    current_user: User = Depends(get_current_user)
):

    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )

    return current_user
