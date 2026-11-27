from fastapi import APIRouter
from ..services import db_service
from ..algorithms.network_analysis import build_disease_network
from ..models.schemas import AnalyticsResponse

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("", response_model=AnalyticsResponse)
def get_analytics():
    """
    Computes system-wide network statistics, category distributions,
    and connectivity rankings.
    """
    stats = db_service.get_dashboard_stats()
    diseases = db_service.get_all_diseases()
    gene_map = db_service.get_all_disease_genes_map()

    # Network analysis at baseline threshold 0.05
    network = build_disease_network(diseases, gene_map, similarity_threshold=0.05)

    # Degree distribution (number of relationships per disease)
    degree_dist = [
        {"name": d["name"], "category": d["category"], "relationships": d["relationships_count"]}
        for d in diseases
    ]
    degree_dist.sort(key=lambda x: x["relationships"], reverse=True)

    return {
        "total_diseases": stats["total_diseases"],
        "total_genes": stats["total_genes"],
        "total_symptoms": stats["total_symptoms"],
        "total_relationships": stats["total_relationships"],
        "category_distribution": stats["category_distribution"],
        "most_connected_diseases": stats["most_connected_diseases"],
        "highest_shared_genes": stats["top_pairs"],
        "degree_distribution": degree_dist,
        "network_metrics": network["metrics"]
    }
