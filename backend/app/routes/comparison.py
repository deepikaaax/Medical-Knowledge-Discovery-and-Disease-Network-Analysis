from fastapi import APIRouter, HTTPException
from ..services import db_service
from ..algorithms.similarity import calculate_jaccard_similarity
from ..models.schemas import CompareRequest, CompareResponse

router = APIRouter(prefix="/api/compare", tags=["Disease Comparison"])

@router.post("", response_model=CompareResponse)
def compare_diseases(payload: CompareRequest):
    """
    Compares two selected diseases based on their associated genes.
    Calculates dynamic Jaccard similarity: J(A, B) = |A ∩ B| / |A ∪ B|.
    """
    d1 = db_service.get_disease_by_id(payload.disease_id_1)
    d2 = db_service.get_disease_by_id(payload.disease_id_2)

    if not d1:
        raise HTTPException(status_code=404, detail=f"Disease with ID {payload.disease_id_1} not found")
    if not d2:
        raise HTTPException(status_code=404, detail=f"Disease with ID {payload.disease_id_2} not found")

    genes_1_items = db_service.get_disease_genes(payload.disease_id_1)
    genes_2_items = db_service.get_disease_genes(payload.disease_id_2)

    genes_set_1 = {g["symbol"] for g in genes_1_items}
    genes_set_2 = {g["symbol"] for g in genes_2_items}

    sim = calculate_jaccard_similarity(genes_set_1, genes_set_2)

    return {
        "disease_1": d1,
        "disease_2": d2,
        **sim
    }
