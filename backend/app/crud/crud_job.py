from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from app.models.job import Job, JobCreate, JobUpdate

async def create_job(db: AsyncIOMotorDatabase, job: JobCreate) -> Job:
    job_data = job.model_dump()
    result = await db["jobs"].insert_one(job_data)
    created_job = await db["jobs"].find_one({"_id": result.inserted_id})
    return Job(**created_job)

async def get_job(db: AsyncIOMotorDatabase, job_id: str) -> Optional[Job]:
    try:
        oid = ObjectId(job_id)
    except:
        return None
    job = await db["jobs"].find_one({"_id": oid})
    if job:
        return Job(**job)
    return None

async def get_multi(
    db: AsyncIOMotorDatabase, 
    skip: int = 0, 
    limit: int = 100,
    search_query: str = "",
    active_only: bool = False
) -> tuple[List[Job], int]:
    query = {}
    
    if search_query:
        query["title"] = {"$regex": search_query, "$options": "i"}
    
    if active_only:
        query["is_active"] = True
        
    cursor = db["jobs"].find(query).sort("created_at", -1).skip(skip).limit(limit)
    total_count = await db["jobs"].count_documents(query)
    
    jobs_list = await cursor.to_list(length=limit)
    return [Job(**j) for j in jobs_list], total_count

async def update_job(db: AsyncIOMotorDatabase, job_id: str, job_in: JobUpdate) -> Optional[Job]:
    try:
        oid = ObjectId(job_id)
    except:
        return None
        
    update_data = job_in.model_dump(exclude_unset=True)
    
    result = await db["jobs"].update_one(
        {"_id": oid},
        {"$set": update_data}
    )
    
    if result.modified_count == 0 and result.matched_count == 0:
        return None
        
    updated_job = await db["jobs"].find_one({"_id": oid})
    return Job(**updated_job)

async def delete_job(db: AsyncIOMotorDatabase, job_id: str) -> bool:
    try:
        oid = ObjectId(job_id)
    except:
        return False
    result = await db["jobs"].delete_one({"_id": oid})
    return result.deleted_count > 0
