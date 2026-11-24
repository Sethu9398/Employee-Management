
from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    Enum,
    ForeignKey
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from App.database import Base
import enum


# User roles
class UserRole(enum.Enum):
    ADMIN = "ADMIN"
    HR = "HR"
    EMPLOYEE = "EMPLOYEE"


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)

     # New columns
    fullname = Column(String(150), nullable=True)

    email = Column(String(150), unique=True, nullable=False, index=True)

    phonenumber = Column(String(15), nullable=True)

    password = Column(String(255), nullable=False)

    role = Column(
        Enum(UserRole),
        nullable=False,
        default=UserRole.EMPLOYEE
    )

    department_id = Column(
        Integer,
        ForeignKey("departments.department_id"),
        nullable=True
    )

     # Department relationship
    department = relationship(
        "Department",
        back_populates="users"
    )


    is_active = Column(Boolean, default=True, nullable=False)

    is_delete = Column(Boolean, default=False, nullable=False)

    created_at = Column(
        DateTime,
        server_default=func.now()
    )

    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now()
    )
