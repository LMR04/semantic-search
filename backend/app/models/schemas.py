from pydantic import BaseModel

class SearchResponse(BaseModel):
    book_id: str
    page: int
    paragraph_id: int 
    original_text: str
    similarity_score: float