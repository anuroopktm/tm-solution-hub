from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware

from app.endpoints import auth, users
from app.endpoints import solutions
from app.endpoints import categories

app = FastAPI(title="TM Solution Hub API")

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


api_router = APIRouter(prefix="/api")

api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"],
)

api_router.include_router(
    users.router,
    prefix="/users",
    tags=["Users"],
)

api_router.include_router(
    solutions.router,
    prefix="/solutions",
    tags=["Solutions"],
)

api_router.include_router(
    categories.router,
    prefix="/categories",
    tags=["Categories"],
)

app.include_router(api_router)
