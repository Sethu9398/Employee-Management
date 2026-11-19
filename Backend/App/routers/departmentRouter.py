
import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from App.database import get_db
from App.models.departmentModel import Department
from App.models.userModel import User
from App.schemas.departmentSchema import (
    DepartmentCreate,
    DepartmentResponse
)
from App.utils.auth import get_current_admin


logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/department",
    tags=["Department"]
)


@router.post(
    "/create",
    response_model=DepartmentResponse,
    status_code=status.HTTP_201_CREATED
)
def create_department(
    department_data: DepartmentCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):

    # Validate department name
    department_name = department_data.department_name.strip()

    if not department_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Department name cannot be empty"
        )

    # Check duplicate department
    existing_department = db.query(Department).filter(
        Department.department_name == department_name
    ).first()

    if existing_department:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Department already exists"
        )

    # Create department
    new_department = Department(
        department_name=department_name,
        is_active=True,
        is_delete=False
    )

    try:
        db.add(new_department)
        db.commit()
        db.refresh(new_department)

        return new_department

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Department already exists"
        )

    except Exception:
        db.rollback()
        logger.exception("Department creation failed")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create department"
        )
