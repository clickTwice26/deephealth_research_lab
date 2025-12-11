from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, Body, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.api import deps
from app.api.deps import get_database, get_current_user
from app.models.job import Job, JobCreate, JobUpdate, JobPagination
from app.models.user import User, UserRole, ROLE_WEIGHTS
from app.crud import crud_job
import math

router = APIRouter()

@router.get("/", response_model=JobPagination)
async def read_jobs(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    search: str = "",
    active_only: bool = False,
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> Any:
    """
    Retrieve jobs with pagination and search.
    """
    skip = (page - 1) * size
    items, total = await crud_job.get_multi(db, skip=skip, limit=size, search_query=search, active_only=active_only)
    
    pages = math.ceil(total / size) if total > 0 else 0
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "size": size,
        "pages": pages
    }

@router.post("/", response_model=Job)
async def create_job(
    job: JobCreate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(deps.RoleChecker(required_weight=ROLE_WEIGHTS[UserRole.ADMIN])),
) -> Any:
    """
    Create a new job. Admin only.
    """
    return await crud_job.create_job(db, job)

@router.put("/{job_id}", response_model=Job)
async def update_job(
    job_id: str,
    job: JobUpdate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(deps.RoleChecker(required_weight=ROLE_WEIGHTS[UserRole.ADMIN])),
) -> Any:
    """
    Update job. Admin only.
    """
    updated_job = await crud_job.update_job(db, job_id, job)
    if not updated_job:
        raise HTTPException(status_code=404, detail="Job not found")
    return updated_job

@router.delete("/{job_id}", response_model=bool)
async def delete_job(
    job_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(deps.RoleChecker(required_weight=ROLE_WEIGHTS[UserRole.ADMIN])),
) -> Any:
    """
    Delete job. Admin only.
    """
    success = await crud_job.delete_job(db, job_id)
    if not success:
        raise HTTPException(status_code=404, detail="Job not found")
    return success
