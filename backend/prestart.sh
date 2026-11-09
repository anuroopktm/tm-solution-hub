#!/bin/sh

set -e

echo "Running database migrations..."

uv run alembic upgrade head

echo "Migrations completed successfully."

echo "Starting FastAPI application..."
exec uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
