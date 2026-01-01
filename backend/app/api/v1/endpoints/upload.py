from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
import os
import uuid
from typing import Dict, Any

from app.models.user import User
from app.api import deps
from app.services.s3 import s3_service
from app.db.mongodb import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

router = APIRouter()

@router.post("/", response_model=Dict[str, str])
async def upload_file_root(
    file: UploadFile = File(...),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Upload a generic file to S3 (Root Endpoint).
    """
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    file_extension = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{file_extension}"
    object_name = f"uploads/{current_user.id}/{filename}"
    
    try:
        await file.seek(0)
        url = s3_service.upload_file(
            file.file, 
            object_name, 
            content_type=file.content_type
        )
        return {"url": url}

    except Exception as e:
        print(f"S3 Upload error: {e}")
        raise HTTPException(status_code=500, detail=f"Could not upload file: {str(e)}")


@router.post("/profile-picture", response_model=Dict[str, str])
async def upload_profile_picture(
    file: UploadFile = File(...),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Upload a profile picture for the current user to S3.
    """
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Generate organized object name: profile_pictures/<user_id>/<uuid>.<ext>
    file_extension = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{file_extension}"
    object_name = f"profile_pictures/{current_user.id}/{filename}"
    
    try:
        # Read file content safely
        # Ensure we are at the beginning of the file (though for a fresh upload it should be)
        await file.seek(0)
        
        # Upload to S3
        url = s3_service.upload_file(
            file.file, 
            object_name, 
            content_type=file.content_type
        )
        
        # Update User Profile in DB
        result = await db["users"].update_one(
            {"_id": ObjectId(current_user.id)},
            {"$set": {"profile_image": url}}
        )
        
        if result.modified_count == 0 and result.matched_count == 0:
             # This should ideally not happen if current_user exists
             pass

        return {"url": url}

    except Exception as e:
        print(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=f"Could not upload file: {str(e)}")


@router.post("/s3", response_model=Dict[str, str])
async def upload_file_s3(
    file: UploadFile = File(...),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Upload a generic file to S3.
    """
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Generate organized object name: uploads/<user_id>/<uuid>.<ext>
    file_extension = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{file_extension}"
    object_name = f"uploads/{current_user.id}/{filename}"
    
    try:
        await file.seek(0)
        url = s3_service.upload_file(
            file.file, 
            object_name, 
            content_type=file.content_type
        )
        return {"url": url}

    except Exception as e:
        print(f"S3 Upload error: {e}")
        raise HTTPException(status_code=500, detail=f"Could not upload file: {str(e)}")
