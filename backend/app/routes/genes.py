from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from ..services import db_service

router = APIRouter(prefix="/api/genes", tags=["Genes"])

@router.get("", response_model=List[dict])
def list_genes(q: Optional[str] = Query(None, description="Search query for gene symbol or name")):
    """Retrieves all genes or filters by symbol/name, including associated disease counts."""
    return db_service.get_all_genes(query=q)

@router.get("/{gene_id}", response_model=dict)
def get_gene(gene_id: int):
    """Retrieves single gene profile and all associated diseases."""
    gene = db_service.get_gene_by_id(gene_id)
    if not gene:
        raise HTTPException(status_code=404, detail="Gene not found")
    return gene
