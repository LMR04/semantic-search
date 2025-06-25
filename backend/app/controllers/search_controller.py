from fastapi import APIRouter, Query
from app.services import search_service
from app.models.schemas import SearchResponse

router = APIRouter()

@router.get("/search", response_model=list[SearchResponse])
def search_books(q: str = Query(..., description="Natural language query to search for books")):
    results = search_service.search(q)
    return results