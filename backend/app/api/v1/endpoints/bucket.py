from typing import Any, List, Dict
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.api import deps
from app.db.mongodb import get_database
from app.models.user import User, UserRole, ROLE_WEIGHTS
from app.services.s3 import s3_service
import uuid
import os

router = APIRouter()

MAX_STORAGE_BYTES = 200 * 1024 * 1024  # 200 MB

@router.get("/", response_model=Dict[str, Any])
async def list_bucket_files(
    current_user: User = Depends(deps.get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    List files in the user's personal bucket.
    """
    if current_user.access_weight < ROLE_WEIGHTS[UserRole.RESEARCHER]:
        raise HTTPException(status_code=403, detail="Not authorized")

    prefix = f"bucket/{current_user.id}/"
    raw_files = s3_service.list_objects(prefix)
    
    files = []
    total_size = 0
    for f in raw_files:
        size = f.get("Size", 0)
        total_size += size
        files.append({
            "key": f.get("Key"),
            "filename": os.path.basename(f.get("Key")),
            "size": size,
            "last_modified": f.get("LastModified"),
            "url": s3_service.get_file_url(f.get('Key'))
        })
    
    # Sync storage usage if mismatch
    if total_size != (current_user.storage_used or 0):
        from bson import ObjectId
        await db["users"].update_one(
            {"_id": ObjectId(current_user.id)},
            {"$set": {"storage_used": total_size}}
        )
        
    return {
        "files": files,
        "storage_used": total_size,
        "storage_limit": MAX_STORAGE_BYTES
    }

@router.post("/upload", response_model=Dict[str, str])
async def upload_bucket_file(
    file: UploadFile = File(...),
    current_user: User = Depends(deps.get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Upload a file to the user's personal bucket.
    Enforces 200MB quota.
    """
    if current_user.access_weight < ROLE_WEIGHTS[UserRole.RESEARCHER]:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Check file size (approximate)
    file_size = 0
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    
    current_usage = current_user.storage_used or 0
    if current_usage + file_size > MAX_STORAGE_BYTES:
        raise HTTPException(status_code=400, detail="Storage quota exceeded (200MB limit)")

    # Upload
    filename = file.filename
    # Sanitize filename slightly to avoid path traversal? S3 handles most, but ensuring simple name is good.
    # We'll allow original filename but prepend UUID if needed to avoid overwrites? 
    # User requirement said "can upload any files", implying file management. 
    # Let's keep original filename but handle collisions? 
    # For now, simplistic: bucket/<user_id>/<filename>
    # If same name exists, it overwrites in S3.
    
    object_name = f"bucket/{current_user.id}/{filename}"
    
    try:
        url = s3_service.upload_file(file.file, object_name, content_type=file.content_type)
        
        # Update usage
        from bson import ObjectId
        new_usage = current_usage + file_size
        await db["users"].update_one(
            {"_id": ObjectId(current_user.id)},
            {"$set": {"storage_used": new_usage}}
        )
        
        return {"url": url, "filename": filename}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{filename}", response_model=Dict[str, str])
async def delete_bucket_file(
    filename: str,
    current_user: User = Depends(deps.get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Delete a file from the user's bucket and reclaim storage space.
    """
    if current_user.access_weight < ROLE_WEIGHTS[UserRole.RESEARCHER]:
        raise HTTPException(status_code=403, detail="Not authorized")

    object_name = f"bucket/{current_user.id}/{filename}"
    
    # Get size before deleting to update quota
    metadata = s3_service.get_object_metadata(object_name)
    size_to_free = metadata.get('ContentLength', 0) if metadata else 0

    success = s3_service.delete_object(object_name)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete file")
        
    # Update quota
    from bson import ObjectId
    current_usage = current_user.storage_used or 0
    new_usage = max(0, current_usage - size_to_free)
    
    await db["users"].update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": {"storage_used": new_usage}}
    )
    
    return {"status": "success", "freed_bytes": str(size_to_free)}
