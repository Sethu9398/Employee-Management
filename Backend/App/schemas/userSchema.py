
from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional
from App.models.userModel import UserRole



# User registration
class UserRegister(BaseModel):
    fullname: str = Field(min_length=2, max_length=150)
    email: str = Field(min_length=5, max_length=150)
    phonenumber: Optional[str] = Field(default=None, max_length=15)
    password: str = Field(min_length=8, max_length=72)



# User login
class UserLogin(BaseModel):
    email: str = Field(min_length=5, max_length=150)
    password: str = Field(min_length=1, max_length=72)

# User response (never return password)
class UserResponse(BaseModel):
    user_id: int
    fullname: Optional[str] = None
    email: str
    phonenumber: Optional[str] = None
    role: UserRole
    department_id: Optional[int] = None
    is_active: bool
    is_delete: bool

    model_config = ConfigDict(from_attributes=True)

class UserListResponse(BaseModel):
    total_user:int
    user:List[UserResponse]

# JWT token response
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
