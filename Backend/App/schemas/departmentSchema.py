from typing import List

from pydantic import BaseModel, ConfigDict


class DepartmentCreate(BaseModel):
    department_name: str


class DepartmentResponse(BaseModel):
    department_id: int
    department_name: str
    is_active: bool
    is_delete: bool

    model_config = ConfigDict(from_attributes=True)


class DepartmentListResponse(BaseModel):
    status: str
    total_departments: int
    departments: List[DepartmentResponse]


class DepartmentStatusResponse(BaseModel):
    status: str
    message: str
    department_id: int
    department_name: str
    is_active: bool