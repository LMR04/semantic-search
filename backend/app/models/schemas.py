from pydantic import BaseModel

class SearchResponse(BaseModel):
    title: str
    text_result: str
    doc_type: str
    date: str
    weight: float
    score: float
    url: str
