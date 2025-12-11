from typing import List, Any, Union
from fastapi import APIRouter, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.api.deps import get_database, get_current_user
from app.models.user import User
from app.crud import crud_user, crud_experiment
from pydantic import BaseModel

router = APIRouter()

class SearchResultItem(BaseModel):
    id: str
    label: str
    type: str  # 'user', 'experiment', 'navigation'
    category: str # 'Navigation', 'Analysis', 'Users'
    href: str

@router.get("/", response_model=List[SearchResultItem])
async def search(
    q: str = Query(..., min_length=1),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Search across Users and Experiments.
    """
    results = []

    # 1. Search Experiments
    experiments = await crud_experiment.get_multi_by_search(db, query=q, limit=5)
    for exp in experiments:
        results.append(SearchResultItem(
            id=str(exp.id),
            label=exp.title,
            type='experiment',
            category='Analysis',
            href=f'/dashboard/experiments/{exp.id}'
        ))

    # 2. Search Users
    users = await crud_user.get_multi_by_search(db, query=q, limit=5)
    for user in users:
        results.append(SearchResultItem(
            id=str(user.id),
            label=user.full_name or user.email,
            type='user',
            category='Users',
            href=f'/dashboard/profile/{user.id}' # Assuming an admin/view profile route exists or just linking to profile
        ))
        
    # 3. Add Custom Navigation Matches (Client side does this well, but server can augment)
    # For now, let's stick to DB content. Client side already has hardcoded nav.
    
    return results
