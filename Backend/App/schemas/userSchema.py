
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from App.models.userModel import UserRole


# User registration
class UserRegister(BaseModel):
    email: str = Field(min_length=5, max_length=150)
    password: str = Field(min_length=8, max_length=72)


# User login
class UserLogin(BaseModel):
    email: str = Field(min_length=5, max_length=150)
    password: str = Field(min_length=1, max_length=72)

# User response (never return password)
class UserResponse(BaseModel):
    user_id: int
    email: str
    role: UserRole
    department_id: Optional[int] = None
    is_active: bool
    is_delete: bool

    model_config = ConfigDict(from_attributes=True)


# JWT token response
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
