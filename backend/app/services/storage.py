# pyright: reportMissingTypeStubs=false, reportUnknownMemberType=false, reportUnknownVariableType=false
import re
import uuid
from typing import Any, BinaryIO
from botocore.exceptions import ClientError

from app.core.config import settings
from app.core.s3 import ensure_bucket_exists, get_s3_client


def sanitize_filename(filename: str) -> str:
    """Sanitize filename to keep it safe for S3 keys and URLs."""
    # Remove any directory path components
    name = filename.split("/")[-1].split("\\")[-1]
    # Replace non-alphanumeric chars (excluding dot, hyphen, underscore) with underscore
    name = re.sub(r"[^a-zA-Z0-9.\-_]", "_", name)
    return name or "unnamed_file"


def get_public_url(file_key: str) -> str:
    """Construct public URL using the configured public S3 endpoint."""
    base_url = settings.S3_PUBLIC_ENDPOINT_URL.rstrip("/")
    bucket = settings.S3_BUCKET_NAME
    key = file_key.lstrip("/")
    return f"{base_url}/{bucket}/{key}"


def upload_file(
    file_obj: BinaryIO,
    filename: str,
    content_type: str,
    folder: str = "general",
) -> dict[str, Any]:
    """
    Upload a file stream to MinIO/S3 under a folder prefix.
    Returns metadata dict containing file_key, url, filename, content_type, and file_size_bytes.
    """
    s3 = get_s3_client()
    safe_name = sanitize_filename(filename)
    unique_prefix = uuid.uuid4().hex[:12]
    file_key = f"{folder.strip('/')}/{unique_prefix}_{safe_name}"

    # Read bytes to compute size and upload
    body = file_obj.read()
    file_size_bytes = len(body)

    try:
        s3.put_object(
            Bucket=settings.S3_BUCKET_NAME,
            Key=file_key,
            Body=body,
            ContentType=content_type,
        )
    except ClientError as err:
        error_response: dict[str, Any] = getattr(err, "response", {})
        error_code = error_response.get("Error", {}).get("Code")
        if error_code in ("404", "NoSuchBucket"):
            ensure_bucket_exists()
            s3.put_object(
                Bucket=settings.S3_BUCKET_NAME,
                Key=file_key,
                Body=body,
                ContentType=content_type,
            )
        else:
            raise

    url = get_public_url(file_key)

    return {
        "file_key": file_key,
        "url": url,
        "filename": safe_name,
        "content_type": content_type,
        "file_size_bytes": file_size_bytes,
    }


def delete_file(file_key: str) -> bool:
    """Delete an object from MinIO/S3 by its key."""
    s3 = get_s3_client()
    try:
        s3.delete_object(Bucket=settings.S3_BUCKET_NAME, Key=file_key)
        return True
    except ClientError:
        return False


def generate_presigned_upload_url(
    filename: str,
    content_type: str,
    folder: str = "general",
    expires_in: int = 3600,
) -> dict[str, Any]:
    """
    Generate a presigned PUT URL for direct client-to-S3 uploads.
    """
    s3 = get_s3_client()
    safe_name = sanitize_filename(filename)
    unique_prefix = uuid.uuid4().hex[:12]
    file_key = f"{folder.strip('/')}/{unique_prefix}_{safe_name}"

    params = {
        "Bucket": settings.S3_BUCKET_NAME,
        "Key": file_key,
        "ContentType": content_type,
    }

    upload_url: str = str(
        s3.generate_presigned_url(
            "put_object",
            Params=params,
            ExpiresIn=expires_in,
        )
    )

    # In case internal endpoint differs from public endpoint, align the URL
    if settings.S3_ENDPOINT_URL != settings.S3_PUBLIC_ENDPOINT_URL:
        upload_url = upload_url.replace(
            settings.S3_ENDPOINT_URL, settings.S3_PUBLIC_ENDPOINT_URL
        )

    public_url = get_public_url(file_key)

    return {
        "upload_url": upload_url,
        "file_key": file_key,
        "public_url": public_url,
        "expires_in": expires_in,
    }


def generate_presigned_download_url(
    file_key: str,
    expires_in: int = 3600,
) -> str:
    """Generate a presigned GET URL for temporary access to a private object."""
    s3 = get_s3_client()
    url: str = str(
        s3.generate_presigned_url(
            "get_object",
            Params={"Bucket": settings.S3_BUCKET_NAME, "Key": file_key},
            ExpiresIn=expires_in,
        )
    )
    if settings.S3_ENDPOINT_URL != settings.S3_PUBLIC_ENDPOINT_URL:
        url = url.replace(settings.S3_ENDPOINT_URL, settings.S3_PUBLIC_ENDPOINT_URL)
    return url
