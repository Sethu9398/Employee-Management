import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from App.database import get_db
from App.models.departmentModel import Department
from App.models.userModel import User
from App.schemas.departmentSchema import (
    DepartmentCreate,
    DepartmentListResponse,
    DepartmentResponse,
    DepartmentStatusResponse,
)
from App.utils.auth import get_current_admin, get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/department", tags=["Department"])


@router.post(
    "/create", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED
)
def create_department(
    department_data: DepartmentCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):

    # Validate department name
    department_name = department_data.department_name.strip()

    if not department_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Department name cannot be empty",
        )

    # Check duplicate department
    existing_department = (
        db.query(Department)
        .filter(Department.department_name == department_name)
        .first()
    )

    if existing_department:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Department already exists"
        )

    # Create department
    new_department = Department(
        department_name=department_name, is_active=True, is_delete=False
    )

    try:
        db.add(new_department)
        db.commit()
        db.refresh(new_department)

        return new_department

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Department already exists"
        )

    except Exception:
        db.rollback()
        logger.exception("Department creation failed")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create department",
        )


@router.get("/list", response_model=DepartmentListResponse)
def get_department_List(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    departments = db.query(Department).filter(Department.is_delete == False).all()

    return {
        "status": "success",
        "total_departments": len(departments),
        "departments": departments,
    }


@router.patch("/{department_id}/status", response_model=DepartmentStatusResponse)
def change_dept_active_status(
    department_id: int,
    is_active: bool,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    department = (
        db.query(Department)
        .filter(
            Department.department_id == department_id, Department.is_delete == False
        )
        .first()
    )

    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Department not found"
        )

    if department.is_active == is_active:
        return {
            "status": "success",
            "message": (
                "Department is already active"
                if is_active
                else "Department is already inactive"
            ),
            "department_id": department.department_id,
            "department_name": department.department_name,
            "is_active": department.is_active,
            "is_delete": department.is_delete,
        }

    try:
        department.is_active = is_active
        db.commit()
        db.refresh(department)
        return {
            "status": "success",
            "message": (
                "Department activated successfully"
                if is_active
                else "Department deactivated successfully"
            ),
            "department_id": department.department_id,
            "department_name": department.department_name,
            "is_active": department.is_active,
        }
    except:
        db.rollback()
        logger.exception("Department status update failed")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to update department status",
        )

@router.get(
    "/search/{search}",
    response_model=DepartmentListResponse,
    status_code=status.HTTP_200_OK
)
def search_department(
    search: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    search = search.strip()

    if not search:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please enter department ID or department name"
        )

    query = db.query(Department).filter(
        Department.is_delete == False
    )

    search_filters = [
        Department.department_name.ilike(f"%{search}%")
    ]

    if search.isdigit():
        search_filters.append(
            Department.department_id == int(search)
        )

    departments = query.filter(
        or_(*search_filters)
    ).order_by(
        Department.department_id.desc()
    ).all()

    return {
        "status": "success",
        "total_departments": len(departments),
        "departments": departments
    }

@router.get(
    "/single/{department_id}",
    response_model=DepartmentResponse,
    status_code=status.HTTP_200_OK
)
def get_single_dept(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    department = db.query(Department).filter(
        Department.department_id == department_id,
        Department.is_delete == False
    ).first()

    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found"
        )

    return department



@router.patch(
    "/delete/{department_id}/{is_delete}",
    response_model=DepartmentResponse,
    status_code=status.HTTP_200_OK
)
def change_department_delete_status(
    department_id: int,
    is_delete: bool,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    department = db.query(Department).filter(
        Department.department_id == department_id
    ).first()

    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found"
        )

    if department.is_delete == is_delete:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Department is already {'deleted' if is_delete else 'active'}"
        )

    try:
        department.is_delete = is_delete

        db.commit()
        db.refresh(department)

        return department

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update department delete status"
        ) 