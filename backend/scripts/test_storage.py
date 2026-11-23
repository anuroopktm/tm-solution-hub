from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def run_tests():
    print("Testing /api/storage endpoints...")

    # 1. Test empty file validation
    res = client.post(
        "/api/storage/upload",
        files={"file": ("empty.txt", b"", "text/plain")},
        data={"folder": "test"},
    )
    assert res.status_code == 400, f"Expected 400, got {res.status_code}: {res.text}"
    print("✓ Empty file check passed (400 Bad Request)")

    # 2. Test blocked extension
    res = client.post(
        "/api/storage/upload",
        files={
            "file": ("bad_script.exe", b"binarycontent", "application/octet-stream")
        },
    )
    assert res.status_code == 400, f"Expected 400, got {res.status_code}: {res.text}"
    print("✓ Blocked extension check passed (400 Bad Request)")

    # 3. Test successful upload with mocked S3 client
    with patch("app.services.storage.get_s3_client") as mock_get_s3:
        mock_s3 = MagicMock()
        mock_get_s3.return_value = mock_s3

        res = client.post(
            "/api/storage/upload",
            files={"file": ("sample.png", b"\x89PNG\r\n\x1a\nfakeimage", "image/png")},
            data={"folder": "thumbnails"},
        )
        assert (
            res.status_code == 201
        ), f"Expected 201, got {res.status_code}: {res.text}"
        data = res.json()["data"]
        assert "thumbnails/" in data["file_key"]
        assert "sample.png" in data["file_key"]
        assert data["url"].startswith(
            "http://localhost:9000/tm-solution-hub/thumbnails/"
        )
        assert data["content_type"] == "image/png"
        assert data["file_size_bytes"] > 0
        mock_s3.put_object.assert_called_once()
        print("✓ File upload endpoint passed (201 Created):", data["url"])

    # 4. Test presigned upload URL endpoint
    with patch("app.services.storage.get_s3_client") as mock_get_s3:
        mock_s3 = MagicMock()
        mock_s3.generate_presigned_url.return_value = (
            "http://localhost:9000/tm-solution-hub/videos/123_demo.mp4?sig=xyz"
        )
        mock_get_s3.return_value = mock_s3

        res = client.post(
            "/api/storage/presigned-url",
            json={
                "filename": "demo.mp4",
                "content_type": "video/mp4",
                "folder": "videos",
                "expires_in": 1800,
            },
        )
        assert (
            res.status_code == 200
        ), f"Expected 200, got {res.status_code}: {res.text}"
        presigned_data = res.json()["data"]
        assert "upload_url" in presigned_data
        assert "public_url" in presigned_data
        print(
            "✓ Presigned URL endpoint passed (200 OK):",
            presigned_data["upload_url"],
        )

    print("\nAll storage endpoint tests passed successfully!")


if __name__ == "__main__":
    run_tests()
