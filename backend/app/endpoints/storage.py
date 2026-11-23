import logging
import os
from typing import Any
from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.schemas.base import BaseResponse
from app.schemas.storage import (
    FileUploadResponse,
    PresignedUploadRequest,
    PresignedUploadResponse,
)
from app.services import storage as storage_service

logger = logging.getLogger(__name__)

router = APIRouter()

# Max file size: 100 MB
MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024

# Disallowed extensions for security
BLOCKED_EXTENSIONS = {
    ".exe",
    ".bat",
    ".cmd",
    ".sh",
    ".bash",
    ".bin",
    ".msi",
    ".scr",
    ".com",
    ".pif",
    ".application",
}


@router.post(
    "/upload",
    response_model=BaseResponse[FileUploadResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Upload a file to MinIO/S3",
)
async def upload_file(
    file: UploadFile = File(...),
    folder: str = Form("general"),
) -> BaseResponse[FileUploadResponse]:
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided in upload payload.",
        )

    ext = os.path.splitext(file.filename)[1].lower()
    if ext in BLOCKED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File extension '{ext}' is not permitted.",
        )

    # Check file size (spooled file position)
    file.file.seek(0, os.SEEK_END)
    size = file.file.tell()
    file.file.seek(0)

    if size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot upload an empty file.",
        )

    if size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds maximum limit of {MAX_FILE_SIZE_BYTES // (1024 * 1024)}MB.",
        )

    content_type = file.content_type or "application/octet-stream"

    try:
        result: dict[str, Any] = storage_service.upload_file(
            file_obj=file.file,
            filename=file.filename,
            content_type=content_type,
            folder=folder,
        )
    except Exception as exc:
        logger.exception("Failed to upload file to storage: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file to storage: {str(exc)}",
        )

    return BaseResponse(
        detail="File uploaded successfully",
        data=FileUploadResponse(**result),
    )


@router.post(
    "/presigned-url",
    response_model=BaseResponse[PresignedUploadResponse],
    status_code=status.HTTP_200_OK,
    summary="Generate a presigned upload URL for direct S3 upload",
)
def get_presigned_upload_url(
    payload: PresignedUploadRequest,
) -> BaseResponse[PresignedUploadResponse]:
    ext = os.path.splitext(payload.filename)[1].lower()
    if ext in BLOCKED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File extension '{ext}' is not permitted.",
        )

    try:
        result: dict[str, Any] = storage_service.generate_presigned_upload_url(
            filename=payload.filename,
            content_type=payload.content_type,
            folder=payload.folder,
            expires_in=payload.expires_in,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate presigned upload URL: {str(exc)}",
        )

    return BaseResponse(
        detail="Presigned upload URL generated successfully",
        data=PresignedUploadResponse(**result),
    )


@router.delete(
    "/{file_key:path}",
    response_model=BaseResponse[None],
    status_code=status.HTTP_200_OK,
    summary="Delete a file from MinIO/S3 by key",
)
def delete_file(file_key: str) -> BaseResponse[None]:
    success = storage_service.delete_file(file_key)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete file from storage.",
        )

    return BaseResponse(detail="File deleted successfully")
