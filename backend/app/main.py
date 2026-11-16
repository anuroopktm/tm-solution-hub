from fastapi import FastAPI

from app.api.router import api_router
from app.core.cors import register_cors

# Initialize standalone FastAPI Application
app = FastAPI(
    title="TM Solution Hub API",
)

# Register CORS middleware
register_cors(app)

# Register FastAPI REST API routes (/api/...)
app.include_router(api_router)
