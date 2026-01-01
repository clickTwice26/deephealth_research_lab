from typing import Any, List
from fastapi import APIRouter, Body, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from app.api import deps
from app.api.deps import get_database
from app.models.user import User, UserRole, ROLE_WEIGHTS
from app.models.team import TeamMember, TeamMemberCreate, TeamMemberUpdate

router = APIRouter()

@router.get("/", response_model=List[TeamMember])
async def read_team_members(
    db: AsyncIOMotorDatabase = Depends(get_database),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve team members. Public access.
    Sorted by designation_weight (descending).
    """
    cursor = db["team_members"].find().sort("designation_weight", -1).skip(skip).limit(limit)
    members = await cursor.to_list(length=limit)
    
    # Map _id to id
    return [{**m, "_id": str(m["_id"])} for m in members]

@router.post("/", response_model=TeamMember)
async def create_team_member(
    *,
    db: AsyncIOMotorDatabase = Depends(get_database),
    member_in: TeamMemberCreate,
    current_user: User = Depends(deps.RoleChecker(required_weight=ROLE_WEIGHTS[UserRole.ADMIN])),
) -> Any:
    """
    Create new team member. Admin only.
    """
    member_dict = member_in.model_dump()
    result = await db["team_members"].insert_one(member_dict)
    
    created_member = await db["team_members"].find_one({"_id": result.inserted_id})
    return {**created_member, "_id": str(created_member["_id"])}

@router.put("/{member_id}", response_model=TeamMember)
async def update_team_member(
    *,
    db: AsyncIOMotorDatabase = Depends(get_database),
    member_id: str,
    member_in: TeamMemberUpdate,
    current_user: User = Depends(deps.RoleChecker(required_weight=ROLE_WEIGHTS[UserRole.ADMIN])),
) -> Any:
    """
    Update team member. Admin only.
    """
    try:
        oid = ObjectId(member_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid ID")

    # Filter out None values to avoid overwriting with null
    update_data = {k: v for k, v in member_in.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")

    result = await db["team_members"].update_one(
        {"_id": oid},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Team member not found")
        
    updated_member = await db["team_members"].find_one({"_id": oid})
    return {**updated_member, "_id": str(updated_member["_id"])}

@router.delete("/{member_id}", response_model=bool)
async def delete_team_member(
    *,
    db: AsyncIOMotorDatabase = Depends(get_database),
    member_id: str,
    current_user: User = Depends(deps.RoleChecker(required_weight=ROLE_WEIGHTS[UserRole.ADMIN])),
) -> Any:
    """
    Delete team member. Admin only.
    """
    try:
        oid = ObjectId(member_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid ID")

    result = await db["team_members"].delete_one({"_id": oid})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Team member not found")
        
    return True
