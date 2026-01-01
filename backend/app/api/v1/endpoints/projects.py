from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.api.deps import get_database
from app.models.project import Project, ProjectCreate, ProjectUpdate
from app.models.user import User, UserRole, ROLE_WEIGHTS
from app.api import deps
from bson import ObjectId

router = APIRouter()

@router.get("/", response_model=List[Project])
async def read_projects(
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> Any:
    """
    Retrieve all active projects.
    """
    cursor = db["projects"].find({"is_active": True}).sort("created_at", -1)
    items = await cursor.to_list(length=100)
    return [Project(**item) for item in items]

@router.post("/", response_model=Project)
async def create_project(
    project: ProjectCreate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(deps.RoleChecker(required_weight=ROLE_WEIGHTS[UserRole.ADMIN])),
) -> Any:
    """
    Create new project. Admin only.
    """
    item_dict = project.model_dump()
    result = await db["projects"].insert_one(item_dict)
    created_item = await db["projects"].find_one({"_id": result.inserted_id})
    return Project(**created_item)

@router.put("/{project_id}", response_model=Project)
async def update_project(
    project_id: str,
    project: ProjectUpdate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(deps.RoleChecker(required_weight=ROLE_WEIGHTS[UserRole.ADMIN])),
) -> Any:
    """
    Update project. Admin only.
    """
    try:
        oid = ObjectId(project_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid ID")
        
    update_data = project.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")

    result = await db["projects"].update_one(
        {"_id": oid},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
        
    updated_item = await db["projects"].find_one({"_id": oid})
    return Project(**updated_item)

@router.delete("/{project_id}", response_model=bool)
async def delete_project(
    project_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(deps.RoleChecker(required_weight=ROLE_WEIGHTS[UserRole.ADMIN])),
) -> Any:
    """
    Delete project. Admin only.
    """
    try:
        oid = ObjectId(project_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid ID")
        
    result = await db["projects"].delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return True
