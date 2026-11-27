from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from ..services import db_service
from ..models.schemas import DiseaseBase, DiseaseDetail, GeneItem, SymptomItem, RelatedDiseaseItem

router = APIRouter(prefix="/api/diseases", tags=["Diseases"])

@router.get("", response_model=List[dict])
def list_diseases(category: Optional[str] = Query(None, description="Filter by category")):
    """Retrieves all diseases, optionally filtered by category."""
    return db_service.get_all_diseases(category=category)

@router.get("/search", response_model=List[dict])
def search_diseases(q: str = Query(..., min_length=1, description="Search keyword")):
    """Searches diseases by name, category, symptoms, or associated gene symbol."""
    results = db_service.search_diseases(q)
    # Record first match or generic search in history
    if results:
        db_service.record_search_query(q, disease_id=results[0]["id"])
    else:
        db_service.record_search_query(q, disease_id=None)
    return results

@router.get("/{disease_id}", response_model=DiseaseDetail)
def get_disease_detail(disease_id: int):
    """Retrieves comprehensive information for a single disease."""
    disease = db_service.get_disease_by_id(disease_id)
    if not disease:
        raise HTTPException(status_code=404, detail="Disease not found")

    genes = db_service.get_disease_genes(disease_id)
    symptoms = db_service.get_disease_symptoms(disease_id)
    related = db_service.get_related_diseases(disease_id)
    papers = db_service.get_research_papers_for_disease(disease_id)

    # Record search view
    db_service.record_search_query(disease["name"], disease_id=disease_id)

    return {
        **disease,
        "genes": genes,
        "symptoms": symptoms,
        "related_diseases": related,
        "research_papers": papers
    }

@router.get("/{disease_id}/genes", response_model=List[GeneItem])
def get_disease_genes(disease_id: int):
    """Retrieves all genes associated with a specific disease."""
    disease = db_service.get_disease_by_id(disease_id)
    if not disease:
        raise HTTPException(status_code=404, detail="Disease not found")
    return db_service.get_disease_genes(disease_id)

@router.get("/{disease_id}/symptoms", response_model=List[SymptomItem])
def get_disease_symptoms(disease_id: int):
    """Retrieves all symptoms documented for a specific disease."""
    disease = db_service.get_disease_by_id(disease_id)
    if not disease:
        raise HTTPException(status_code=404, detail="Disease not found")
    return db_service.get_disease_symptoms(disease_id)

@router.get("/{disease_id}/related", response_model=List[RelatedDiseaseItem])
def get_related_diseases(disease_id: int):
    """Retrieves diseases sharing genetic etiology, ranked by Jaccard similarity."""
    disease = db_service.get_disease_by_id(disease_id)
    if not disease:
        raise HTTPException(status_code=404, detail="Disease not found")
    return db_service.get_related_diseases(disease_id)
