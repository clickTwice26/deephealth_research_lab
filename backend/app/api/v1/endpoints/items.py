from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List

from app.crud import crud_item
from app.models.item import ItemCreate, Item
from app.db.mongodb import get_database

router = APIRouter()

@router.post("/", response_model=Item)
async def create_item(item: ItemCreate, db: AsyncIOMotorDatabase = Depends(get_database)):
    return await crud_item.create_item(db=db, item=item)

@router.get("/", response_model=List[Item])
async def read_items(skip: int = 0, limit: int = 100, db: AsyncIOMotorDatabase = Depends(get_database)):
    items = await crud_item.get_items(db, skip=skip, limit=limit)
    return items

@router.get("/{item_id}", response_model=Item)
async def read_item(item_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    item = await crud_item.get_item(db, item_id=item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return item
