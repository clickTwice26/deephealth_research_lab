from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
import os
import uuid
from typing import Dict

router = APIRouter()

# Get absolute path to backend/uploads
# .../backend/app/api/v1/endpoints/upload.py -> .../backend
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")

# Ensure upload directory exists
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@router.post("/", response_model=Dict[str, str])
async def upload_file(file: UploadFile = File(...)):
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    try:
        contents = await file.read()
        with open(file_path, "wb") as buffer:
            buffer.write(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {str(e)}")
        
    # Return URL (assuming backend runs on localhost:9191)
    # In production, this should use a proper base URL from settings
    return {"url": f"http://localhost:9191/uploads/{filename}"}
