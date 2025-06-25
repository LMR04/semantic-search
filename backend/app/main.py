from fastapi import FastAPI
from app.controllers import search_controller
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="Semanti Search API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # Permitir el frontend en desarrollo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/documents", StaticFiles(directory="data/books"), name="documents")

app.include_router(search_controller.router)