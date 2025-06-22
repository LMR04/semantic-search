from fastapi import FastAPI
from app.controllers import search_controller

app = FastAPI(title="Semanti Search API")

app.include_router(search_controller.router)