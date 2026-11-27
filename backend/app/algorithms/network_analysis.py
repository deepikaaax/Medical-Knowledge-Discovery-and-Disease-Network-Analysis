import networkx as nx
from typing import List, Dict, Any, Tuple
from .similarity import calculate_jaccard_similarity

def build_disease_network(
    diseases: List[Dict[str, Any]],
    disease_genes_map: Dict[int, List[str]],
    similarity_threshold: float = 0.05,
    category_filter: str = None
) -> Dict[str, Any]:
    """
    Constructs a NetworkX graph of diseases based on shared gene associations.
    Computes graph metrics and formats data for Cytoscape.js visualization.
    """
    G = nx.Graph()

    # Filter diseases if category specified
    filtered_diseases = [
        d for d in diseases
        if not category_filter or d["category"].lower() == category_filter.lower()
    ]
    disease_ids = {d["id"] for d in filtered_diseases}

    # Add nodes
    for d in filtered_diseases:
        d_id = d["id"]
        genes = set(disease_genes_map.get(d_id, []))
        G.add_node(
            d_id,
            id=str(d_id),
            name=d["name"],
            category=d["category"],
            code=d.get("code", ""),
            description=d.get("description", ""),
            gene_count=len(genes),
            genes=sorted(list(genes))
        )

    # Calculate pairwise Jaccard similarities and add edges
    disease_list = list(filtered_diseases)
    edges_info = []

    for i in range(len(disease_list)):
        id_1 = disease_list[i]["id"]
        genes_1 = set(disease_genes_map.get(id_1, []))

        for j in range(i + 1, len(disease_list)):
            id_2 = disease_list[j]["id"]
            genes_2 = set(disease_genes_map.get(id_2, []))

            sim_result = calculate_jaccard_similarity(genes_1, genes_2)
            score = sim_result["jaccard_score"]
            shared_count = sim_result["shared_count"]

            # Edge creation condition
            if score >= similarity_threshold and shared_count > 0:
                G.add_edge(
                    id_1,
                    id_2,
                    weight=score,
                    shared_genes_count=shared_count,
                    shared_genes=sim_result["shared_genes"]
                )
                edges_info.append({
                    "source": str(id_1),
                    "target": str(id_2),
                    "weight": score,
                    "shared_genes_count": shared_count,
                    "shared_genes": sim_result["shared_genes"]
                })

    # Compute network metrics using NetworkX
    num_nodes = G.number_of_nodes()
    num_edges = G.number_of_edges()

    if num_nodes > 0:
        density = round(nx.density(G), 4)
        degrees = dict(G.degree())
        avg_degree = round(sum(degrees.values()) / num_nodes, 2)
        try:
            avg_clustering = round(nx.average_clustering(G), 4)
        except Exception:
            avg_clustering = 0.0
        try:
            betweenness = nx.betweenness_centrality(G)
        except Exception:
            betweenness = {n: 0.0 for n in G.nodes()}
        connected_components = nx.number_connected_components(G)
    else:
        density = 0.0
        avg_degree = 0.0
        avg_clustering = 0.0
        betweenness = {}
        connected_components = 0

    # Build Cytoscape JSON payload
    cytoscape_nodes = []
    for node_id, data in G.nodes(data=True):
        deg = G.degree(node_id)
        btn = round(betweenness.get(node_id, 0.0), 4)
        cytoscape_nodes.append({
            "data": {
                "id": str(node_id),
                "label": data["name"],
                "name": data["name"],
                "category": data["category"],
                "code": data["code"],
                "gene_count": data["gene_count"],
                "degree": deg,
                "betweenness": btn,
                "genes": data["genes"],
                "description": data["description"]
            }
        })

    cytoscape_edges = []
    for edge in edges_info:
        edge_id = f"e_{edge['source']}_{edge['target']}"
        cytoscape_edges.append({
            "data": {
                "id": edge_id,
                "source": edge["source"],
                "target": edge["target"],
                "weight": edge["weight"],
                "shared_genes_count": edge["shared_genes_count"],
                "shared_genes": edge["shared_genes"],
                "label": f"J={edge['weight']:.2f} ({edge['shared_genes_count']} genes)"
            }
        })

    return {
        "elements": {
            "nodes": cytoscape_nodes,
            "edges": cytoscape_edges
        },
        "metrics": {
            "total_nodes": num_nodes,
            "total_edges": num_edges,
            "density": density,
            "average_degree": avg_degree,
            "average_clustering": avg_clustering,
            "connected_components": connected_components,
            "threshold_applied": similarity_threshold
        }
    }
