from fastapi import APIRouter, UploadFile, File, HTTPException
import uuid
import shutil
from pathlib import Path
from app.core.config import settings
from pydantic import BaseModel

router = APIRouter()

class UploadOut(BaseModel):
    url: str

@router.post("", response_model=UploadOut)
async def upload_file(file: UploadFile = File(...)):
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed.")

    # Generate a unique filename
    ext = file.filename.split(".")[-1] if file.filename else "jpg"
    unique_filename = f"{uuid.uuid4().hex}.{ext}"

    # Ensure uploads directory exists
    upload_dir = Path(settings.LOCAL_STORAGE_PATH)
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    file_path = upload_dir / unique_filename

    try:
        # Save the file using shutil.copyfileobj which is efficient for streaming
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {e}")
    finally:
        file.file.close()

    # Construct the public URL
    # Assuming the app is served on localhost:8000 for this prototype
    public_url = f"http://localhost:8000/uploads/{unique_filename}"
    
    return UploadOut(url=public_url)
