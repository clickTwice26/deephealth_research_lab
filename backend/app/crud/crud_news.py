from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from app.models.news import News, NewsCreate

async def create_news(db: AsyncIOMotorDatabase, news: NewsCreate) -> News:
    news_dict = news.model_dump()
    result = await db["news"].insert_one(news_dict)
    created_news = await db["news"].find_one({"_id": result.inserted_id})
    return News(**created_news)

async def get_multi(
    db: AsyncIOMotorDatabase, 
    skip: int = 0, 
    limit: int = 100,
    search_query: str = ""
) -> tuple[List[News], int]:
    query = {"is_published": True}
    
    if search_query:
        query["title"] = {"$regex": search_query, "$options": "i"}
        
    cursor = db["news"].find(query).sort("date", -1).skip(skip).limit(limit)
    total_count = await db["news"].count_documents(query)
    
    news_list = await cursor.to_list(length=limit)
    return [News(**n) for n in news_list], total_count

async def update_news(db: AsyncIOMotorDatabase, news_id: str, news_in: NewsCreate) -> Optional[News]:
    try:
        oid = ObjectId(news_id)
    except:
        return None
        
    update_data = news_in.model_dump(exclude_unset=True)
    
    result = await db["news"].update_one(
        {"_id": oid},
        {"$set": update_data}
    )
    
    if result.modified_count == 0 and result.matched_count == 0:
        return None
        
    updated_news = await db["news"].find_one({"_id": oid})
    return News(**updated_news)

async def delete_news(db: AsyncIOMotorDatabase, news_id: str) -> bool:
    try:
        oid = ObjectId(news_id)
    except:
        return False
    result = await db["news"].delete_one({"_id": oid})
    return result.deleted_count > 0
