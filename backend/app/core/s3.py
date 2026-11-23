# pyright: reportMissingTypeStubs=false, reportUnknownMemberType=false, reportUnknownVariableType=false
import json
import logging
from typing import Any
import boto3
from botocore.client import Config
from botocore.exceptions import ClientError, EndpointConnectionError

from app.core.config import settings

logger = logging.getLogger(__name__)


def get_s3_client() -> Any:
    """Create and return a configured boto3 S3 client for MinIO/S3."""
    return boto3.client(
        "s3",
        endpoint_url=settings.S3_ENDPOINT_URL,
        aws_access_key_id=settings.S3_ACCESS_KEY,
        aws_secret_access_key=settings.S3_SECRET_KEY,
        region_name=settings.S3_REGION_NAME,
        config=Config(signature_version="s3v4"),
    )


def ensure_bucket_exists() -> bool:
    """
    Ensure the target S3 bucket exists in MinIO.
    If it doesn't exist, create it and set a public read policy
    so uploaded media/assets can be fetched by web clients.
    """
    s3 = get_s3_client()
    bucket_name = settings.S3_BUCKET_NAME

    try:
        try:
            s3.head_bucket(Bucket=bucket_name)
            logger.info("S3 bucket '%s' already exists and is accessible.", bucket_name)
        except ClientError as err:
            error_response: dict[str, Any] = getattr(err, "response", {})
            error_code = error_response.get("Error", {}).get("Code")
            if error_code in ("404", "NoSuchBucket"):
                logger.info(
                    "S3 bucket '%s' does not exist. Creating it...", bucket_name
                )
                # In us-east-1, CreateBucketConfiguration should not be supplied
                if settings.S3_REGION_NAME == "us-east-1":
                    s3.create_bucket(Bucket=bucket_name)
                else:
                    s3.create_bucket(
                        Bucket=bucket_name,
                        CreateBucketConfiguration={
                            "LocationConstraint": settings.S3_REGION_NAME
                        },
                    )
                logger.info("S3 bucket '%s' created successfully.", bucket_name)
            else:
                logger.warning("Could not verify bucket '%s': %s", bucket_name, err)
                return False

        # Apply a public read policy for anonymous GET access
        public_read_policy: dict[str, Any] = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Sid": "PublicReadGetObject",
                    "Effect": "Allow",
                    "Principal": "*",
                    "Action": ["s3:GetObject"],
                    "Resource": [f"arn:aws:s3:::{bucket_name}/*"],
                }
            ],
        }
        try:
            s3.put_bucket_policy(
                Bucket=bucket_name,
                Policy=json.dumps(public_read_policy),
            )
            logger.info("Public read policy applied to bucket '%s'.", bucket_name)
        except Exception as policy_err:
            logger.warning("Could not set bucket policy: %s", policy_err)

        return True

    except EndpointConnectionError:
        logger.warning(
            "Could not connect to S3/MinIO endpoint at %s. Bucket verification skipped.",
            settings.S3_ENDPOINT_URL,
        )
        return False
    except Exception as exc:
        logger.warning("Unexpected error checking S3 bucket '%s': %s", bucket_name, exc)
        return False
