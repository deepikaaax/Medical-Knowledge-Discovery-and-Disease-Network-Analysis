from typing import Set, Dict, Any, List

def calculate_jaccard_similarity(genes_a: Set[str], genes_b: Set[str]) -> Dict[str, Any]:
    """
    Computes Jaccard Similarity between two sets of genes:
    J(A, B) = |A ∩ B| / |A ∪ B|

    If both sets are empty, similarity is 0.0.
    """
    intersection = genes_a.intersection(genes_b)
    union = genes_a.union(genes_b)

    score = len(intersection) / len(union) if len(union) > 0 else 0.0
    rounded_score = round(score, 4)

    return {
        "jaccard_score": rounded_score,
        "percentage": round(score * 100, 2),
        "shared_genes": sorted(list(intersection)),
        "shared_count": len(intersection),
        "unique_disease_1": sorted(list(genes_a - genes_b)),
        "unique_disease_1_count": len(genes_a - genes_b),
        "unique_disease_2": sorted(list(genes_b - genes_a)),
        "unique_disease_2_count": len(genes_b - genes_a),
        "total_genes_1": len(genes_a),
        "total_genes_2": len(genes_b),
        "union_count": len(union)
    }
