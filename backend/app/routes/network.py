from fastapi import APIRouter, Query
from typing import Optional
from ..services import db_service
from ..algorithms.network_analysis import build_disease_network
from ..models.schemas import NetworkResponse

router = APIRouter(prefix="/api/network", tags=["Network Analysis"])

@router.get("", response_model=NetworkResponse)
def get_disease_network(
    threshold: float = Query(0.05, ge=0.0, le=1.0, description="Minimum Jaccard similarity score to establish edge"),
    category: Optional[str] = Query(None, description="Filter network nodes by disease category")
):
    """
    Constructs disease network using NetworkX graph algorithms and formats for Cytoscape.js.
    Calculates betweenness, degrees, clustering coefficients, and network density.
    """
    diseases = db_service.get_all_diseases()
    gene_map = db_service.get_all_disease_genes_map()

    network_data = build_disease_network(
        diseases=diseases,
        disease_genes_map=gene_map,
        similarity_threshold=threshold,
        category_filter=category
    )

    return network_data
