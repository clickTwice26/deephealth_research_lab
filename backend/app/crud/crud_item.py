from app.models.item import ItemCreate, Item
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

async def get_items(db: AsyncIOMotorDatabase, skip: int = 0, limit: int = 100):
    items_cursor = db["items"].find().skip(skip).limit(limit)
    items = await items_cursor.to_list(length=limit)
    return items

async def create_item(db: AsyncIOMotorDatabase, item: ItemCreate):
    item_dict = item.model_dump()
    result = await db["items"].insert_one(item_dict)
    created_item = await db["items"].find_one({"_id": result.inserted_id})
    return created_item

async def get_item(db: AsyncIOMotorDatabase, item_id: str):
    if not ObjectId.is_valid(item_id):
        return None
    item = await db["items"].find_one({"_id": ObjectId(item_id)})
    return item
