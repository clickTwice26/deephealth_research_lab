from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from app.models.publication import Publication, PublicationCreate, PublicationUpdate

async def create_publication(db: AsyncIOMotorDatabase, publication: PublicationCreate) -> Publication:
    pub_data = publication.model_dump()
    result = await db["publications"].insert_one(pub_data)
    created_pub = await db["publications"].find_one({"_id": result.inserted_id})
    return Publication(**created_pub)

async def get_publication(db: AsyncIOMotorDatabase, pub_id: str) -> Optional[Publication]:
    try:
        oid = ObjectId(pub_id)
    except:
        return None
    pub = await db["publications"].find_one({"_id": oid})
    if pub:
        return Publication(**pub)
    return None

async def get_multi(
    db: AsyncIOMotorDatabase, 
    skip: int = 0, 
    limit: int = 100,
    search_query: str = ""
) -> tuple[List[Publication], int]:
    query = {}
    
    if search_query:
        query["title"] = {"$regex": search_query, "$options": "i"}
        
    cursor = db["publications"].find(query).sort("date", -1).skip(skip).limit(limit)
    total_count = await db["publications"].count_documents(query)
    
    pubs_list = await cursor.to_list(length=limit)
    return [Publication(**p) for p in pubs_list], total_count

async def update_publication(db: AsyncIOMotorDatabase, pub_id: str, pub_in: PublicationUpdate) -> Optional[Publication]:
    try:
        oid = ObjectId(pub_id)
    except:
        return None
        
    update_data = pub_in.model_dump(exclude_unset=True)
    
    result = await db["publications"].update_one(
        {"_id": oid},
        {"$set": update_data}
    )
    
    if result.modified_count == 0 and result.matched_count == 0:
        return None
        
    updated_pub = await db["publications"].find_one({"_id": oid})
    return Publication(**updated_pub)

async def delete_publication(db: AsyncIOMotorDatabase, pub_id: str) -> bool:
    try:
        oid = ObjectId(pub_id)
    except:
        return False
    result = await db["publications"].delete_one({"_id": oid})
    return result.deleted_count > 0
