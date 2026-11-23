from pydantic import BaseModel, Field


class FileUploadResponse(BaseModel):
    file_key: str = Field(..., description="Unique S3 object key")
    url: str = Field(..., description="Publicly accessible URL")
    filename: str = Field(..., description="Sanitized original filename")
    content_type: str = Field(..., description="MIME content type")
    file_size_bytes: int = Field(..., description="File size in bytes")


class PresignedUploadRequest(BaseModel):
    filename: str = Field(..., min_length=1, max_length=255)
    content_type: str = Field(..., min_length=1, max_length=100)
    folder: str = Field(default="general", max_length=50)
    expires_in: int = Field(default=3600, ge=60, le=86400)


class PresignedUploadResponse(BaseModel):
    upload_url: str = Field(
        ..., description="Pre-signed PUT URL for uploading directly to S3"
    )
    file_key: str = Field(..., description="S3 object key that will be created")
    public_url: str = Field(..., description="Publicly accessible URL once uploaded")
    expires_in: int = Field(..., description="URL expiration time in seconds")
