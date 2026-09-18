from fastapi import APIRouter, UploadFile, File, HTTPException
import uuid
import shutil
from pathlib import Path
from app.core.config import settings
from app.storage.base import get_storage
from pydantic import BaseModel

router = APIRouter()

class UploadOut(BaseModel):
    url: str

class MultiUploadOut(BaseModel):
    urls: list[str]

@router.post("", response_model=UploadOut)
async def upload_file(file: UploadFile = File(...)):
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed.")

    try:
        data = await file.read()
        storage = get_storage()
        uploaded = await storage.save(
            file_data=data,
            original_filename=file.filename or "photo.jpg",
            content_type=file.content_type,
            folder="products"
        )
        return UploadOut(url=uploaded.url)
    except Exception as e:
        # Fallback to local storage if remote fails
        try:
            ext = file.filename.split(".")[-1] if file.filename else "jpg"
            unique_filename = f"{uuid.uuid4().hex}.{ext}"
            upload_dir = Path(settings.LOCAL_STORAGE_PATH)
            upload_dir.mkdir(parents=True, exist_ok=True)
            file_path = upload_dir / unique_filename
            with open(file_path, "wb") as buffer:
                buffer.write(data)
            return UploadOut(url=f"{settings.LOCAL_STORAGE_URL}/{unique_filename}")
        except Exception as local_err:
            raise HTTPException(status_code=500, detail=f"Could not save file: {e} / {local_err}")
    finally:
        await file.close()

@router.post("/multiple", response_model=MultiUploadOut)
async def upload_multiple_files(files: list[UploadFile] = File(...)):
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    storage = get_storage()
    saved_urls = []

    for f in files:
        if f.content_type not in allowed_types:
            continue
        try:
            data = await f.read()
            uploaded = await storage.save(
                file_data=data,
                original_filename=f.filename or "photo.jpg",
                content_type=f.content_type,
                folder="products"
            )
            saved_urls.append(uploaded.url)
        except Exception as e:
            try:
                ext = f.filename.split(".")[-1] if f.filename else "jpg"
                unique_filename = f"{uuid.uuid4().hex}.{ext}"
                upload_dir = Path(settings.LOCAL_STORAGE_PATH)
                upload_dir.mkdir(parents=True, exist_ok=True)
                file_path = upload_dir / unique_filename
                with open(file_path, "wb") as buffer:
                    buffer.write(data)
                saved_urls.append(f"{settings.LOCAL_STORAGE_URL}/{unique_filename}")
            except Exception as local_err:
                print(f"Failed to save file: {e} / {local_err}")
        finally:
            await f.close()

    return MultiUploadOut(urls=saved_urls)
