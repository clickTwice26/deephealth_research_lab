from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, Body
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.api.deps import get_database, get_current_user
from app.models.research_area import ResearchArea, ResearchAreaCreate, ResearchAreaUpdate
from app.models.user import User, UserRole, ROLE_WEIGHTS
from app.api import deps
from bson import ObjectId

router = APIRouter()

@router.get("/", response_model=dict)
async def read_research_areas(
    page: int = 1,
    size: int = 20,
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> Any:
    """
    Retrieve research areas with pagination.
    """
    skip = (page - 1) * size
    cursor = db["research_areas"].find().sort("number", 1).skip(skip).limit(size)
    items = await cursor.to_list(length=size)
    total_count = await db["research_areas"].count_documents({})
    
    return {
        "items": [ResearchArea(**item) for item in items],
        "total": total_count,
        "page": page,
        "size": size,
        "pages": (total_count + size - 1) // size
    }

@router.post("/", response_model=ResearchArea)
async def create_research_area(
    area: ResearchAreaCreate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(deps.RoleChecker(required_weight=ROLE_WEIGHTS[UserRole.ADMIN])),
) -> Any:
    """
    Create new research area. Admin only.
    """
    item_dict = area.model_dump()
    result = await db["research_areas"].insert_one(item_dict)
    created_item = await db["research_areas"].find_one({"_id": result.inserted_id})
    return ResearchArea(**created_item)

@router.put("/{area_id}", response_model=ResearchArea)
async def update_research_area(
    area_id: str,
    area: ResearchAreaUpdate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(deps.RoleChecker(required_weight=ROLE_WEIGHTS[UserRole.ADMIN])),
) -> Any:
    """
    Update research area. Admin only.
    """
    try:
        oid = ObjectId(area_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid ID")
        
    update_data = area.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")

    result = await db["research_areas"].update_one(
        {"_id": oid},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Research area not found")
        
    updated_item = await db["research_areas"].find_one({"_id": oid})
    return ResearchArea(**updated_item)

@router.delete("/{area_id}", response_model=bool)
async def delete_research_area(
    area_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(deps.RoleChecker(required_weight=ROLE_WEIGHTS[UserRole.ADMIN])),
) -> Any:
    """
    Delete research area. Admin only.
    """
    try:
        oid = ObjectId(area_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid ID")
        
    result = await db["research_areas"].delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Research area not found")
    return True
