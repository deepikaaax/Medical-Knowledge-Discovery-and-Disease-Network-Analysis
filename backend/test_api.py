import sys, os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_endpoints():
    print("Testing /api/health...")
    r = client.get("/api/health")
    assert r.status_code == 200, f"Health check failed: {r.text}"
    print("✓ Health check passed")

    print("Testing Root SPA / ...")
    r = client.get("/")
    assert r.status_code == 200
    assert "MedNetwork" in r.text
    print("✓ Root SPA index.html served correctly")

    print("Testing /api/stats...")
    r = client.get("/api/stats")
    assert r.status_code == 200, f"Stats failed: {r.text}"
    data = r.json()
    assert data["total_diseases"] == 20
    assert data["total_genes"] >= 30
    assert data["total_relationships"] > 0
    print(f"✓ Stats: {data['total_diseases']} diseases, {data['total_genes']} genes, {data['total_relationships']} relationships")

    print("Testing /api/diseases...")
    r = client.get("/api/diseases")
    assert r.status_code == 200
    diseases = r.json()
    assert len(diseases) == 20
    print(f"✓ Diseases count: {len(diseases)}")

    print("Testing /api/diseases/search?q=Diabetes...")
    r = client.get("/api/diseases/search?q=Diabetes")
    assert r.status_code == 200
    search_results = r.json()
    assert len(search_results) > 0
    print(f"✓ Search results for 'Diabetes': {len(search_results)}")

    print("Testing /api/diseases/1...")
    r = client.get("/api/diseases/1")
    assert r.status_code == 200
    d1 = r.json()
    assert len(d1["genes"]) > 0
    assert len(d1["symptoms"]) > 0
    assert len(d1["related_diseases"]) > 0
    print(f"✓ Disease 1: {d1['name']} with {len(d1['genes'])} genes, {len(d1['symptoms'])} symptoms, {len(d1['related_diseases'])} related diseases")

    print("Testing /api/network?threshold=0.05...")
    r = client.get("/api/network?threshold=0.05")
    assert r.status_code == 200
    net = r.json()
    nodes = net["elements"]["nodes"]
    edges = net["elements"]["edges"]
    assert len(nodes) == 20
    assert len(edges) > 0
    print(f"✓ Network: {len(nodes)} nodes, {len(edges)} edges, density: {net['metrics']['density']}")

    print("Testing /api/compare...")
    # Compare Diabetes (1) and Obesity (3)
    r = client.post("/api/compare", json={"disease_id_1": 1, "disease_id_2": 3})
    assert r.status_code == 200
    comp = r.json()
    assert comp["jaccard_score"] > 0
    print(f"✓ Comparison (Diabetes vs Obesity): Jaccard={comp['jaccard_score']}, Shared genes={comp['shared_genes']}")

    print("Testing /api/genes...")
    r = client.get("/api/genes?q=PPARG")
    assert r.status_code == 200
    genes = r.json()
    assert len(genes) > 0
    print(f"✓ Gene search for PPARG: {genes[0]['symbol']} associated with {genes[0]['disease_count']} diseases")

    print("Testing /api/analytics...")
    r = client.get("/api/analytics")
    assert r.status_code == 200
    analytics = r.json()
    assert "network_metrics" in analytics
    print(f"✓ Analytics retrieved successfully")

    print("\nALL BACKEND API TESTS PASSED!")

if __name__ == "__main__":
    test_endpoints()
