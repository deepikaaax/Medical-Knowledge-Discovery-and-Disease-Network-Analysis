import sqlite3
from typing import List, Dict, Any, Optional
from ..database import get_db_connection
from ..algorithms.similarity import calculate_jaccard_similarity

def get_all_diseases(category: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
    SELECT d.id, d.name, d.code, d.category, d.description,
           COUNT(DISTINCT dg.gene_id) AS gene_count,
           COUNT(DISTINCT ds.symptom_id) AS symptom_count
    FROM diseases d
    LEFT JOIN disease_genes dg ON d.id = dg.disease_id
    LEFT JOIN disease_symptoms ds ON d.id = ds.disease_id
    """
    params = []
    if category:
        query += " WHERE LOWER(d.category) = LOWER(?)"
        params.append(category)

    query += " GROUP BY d.id ORDER BY d.name ASC"

    cursor.execute(query, params)
    rows = cursor.fetchall()

    # Also count relationships for each disease
    results = []
    for r in rows:
        d_id = r["id"]
        cursor.execute(
            """
            SELECT COUNT(*) AS rel_count
            FROM disease_relationships
            WHERE disease_id_1 = ? OR disease_id_2 = ?
            """,
            (d_id, d_id)
        )
        rel_count = cursor.fetchone()["rel_count"]

        results.append({
            "id": r["id"],
            "name": r["name"],
            "code": r["code"],
            "category": r["category"],
            "description": r["description"],
            "gene_count": r["gene_count"],
            "symptom_count": r["symptom_count"],
            "relationships_count": rel_count
        })

    conn.close()
    return results

def search_diseases(q: str) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    search_term = f"%{q.strip()}%"

    cursor.execute(
        """
        SELECT DISTINCT d.id, d.name, d.code, d.category, d.description,
               COUNT(DISTINCT dg.gene_id) AS gene_count,
               COUNT(DISTINCT ds.symptom_id) AS symptom_count
        FROM diseases d
        LEFT JOIN disease_genes dg ON d.id = dg.disease_id
        LEFT JOIN disease_symptoms ds ON d.id = ds.disease_id
        LEFT JOIN symptoms s ON ds.symptom_id = s.id
        LEFT JOIN genes g ON dg.gene_id = g.id
        WHERE d.name LIKE ? OR d.category LIKE ? OR d.description LIKE ?
           OR s.name LIKE ? OR g.symbol LIKE ?
        GROUP BY d.id
        ORDER BY
            CASE
                WHEN LOWER(d.name) = LOWER(?) THEN 1
                WHEN LOWER(d.name) LIKE LOWER(? || '%') THEN 2
                ELSE 3
            END,
            d.name ASC
        """,
        (search_term, search_term, search_term, search_term, search_term, q.strip(), q.strip())
    )
    rows = cursor.fetchall()
    conn.close()

    return [dict(r) for r in rows]

def get_disease_by_id(disease_id: int) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id, name, code, category, description FROM diseases WHERE id = ?",
        (disease_id,)
    )
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None

    disease = dict(row)
    conn.close()
    return disease

def get_disease_genes(disease_id: int) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT g.id, g.symbol, g.name, g.chromosome, g.description,
               dg.evidence_type, dg.source
        FROM genes g
        JOIN disease_genes dg ON g.id = dg.gene_id
        WHERE dg.disease_id = ?
        ORDER BY g.symbol ASC
        """,
        (disease_id,)
    )
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_disease_symptoms(disease_id: int) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT s.id, s.name, s.category, s.description, ds.frequency
        FROM symptoms s
        JOIN disease_symptoms ds ON s.id = ds.symptom_id
        WHERE ds.disease_id = ?
        ORDER BY s.name ASC
        """,
        (disease_id,)
    )
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_related_diseases(disease_id: int) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()

    # Query relationships where this disease is either disease_id_1 or disease_id_2
    cursor.execute(
        """
        SELECT
            CASE WHEN dr.disease_id_1 = ? THEN d2.id ELSE d1.id END AS id,
            CASE WHEN dr.disease_id_1 = ? THEN d2.name ELSE d1.name END AS name,
            CASE WHEN dr.disease_id_1 = ? THEN d2.category ELSE d1.category END AS category,
            dr.shared_genes_count,
            dr.jaccard_score
        FROM disease_relationships dr
        JOIN diseases d1 ON dr.disease_id_1 = d1.id
        JOIN diseases d2 ON dr.disease_id_2 = d2.id
        WHERE dr.disease_id_1 = ? OR dr.disease_id_2 = ?
        ORDER BY dr.jaccard_score DESC, dr.shared_genes_count DESC
        """,
        (disease_id, disease_id, disease_id, disease_id, disease_id)
    )
    rows = cursor.fetchall()

    results = []
    # For each related disease, find exact shared genes
    cursor.execute(
        """
        SELECT g.symbol
        FROM genes g
        JOIN disease_genes dg ON g.id = dg.gene_id
        WHERE dg.disease_id = ?
        """,
        (disease_id,)
    )
    current_genes = {r["symbol"] for r in cursor.fetchall()}

    for r in rows:
        target_id = r["id"]
        cursor.execute(
            """
            SELECT g.symbol
            FROM genes g
            JOIN disease_genes dg ON g.id = dg.gene_id
            WHERE dg.disease_id = ?
            """,
            (target_id,)
        )
        target_genes = {g["symbol"] for g in cursor.fetchall()}
        shared = sorted(list(current_genes.intersection(target_genes)))

        results.append({
            "id": r["id"],
            "name": r["name"],
            "category": r["category"],
            "shared_genes_count": r["shared_genes_count"],
            "jaccard_score": round(r["jaccard_score"], 4),
            "shared_genes": shared
        })

    conn.close()
    return results

def get_research_papers_for_disease(disease_id: int) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id, pmid, title, authors, journal, year, url, 'Curated Reference' AS source_type
        FROM research_papers
        WHERE disease_id = ?
        ORDER BY year DESC
        """,
        (disease_id,)
    )
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_all_disease_genes_map() -> Dict[int, List[str]]:
    """Returns a mapping of disease_id -> list of gene symbols."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT dg.disease_id, g.symbol
        FROM disease_genes dg
        JOIN genes g ON dg.gene_id = g.id
        ORDER BY g.symbol ASC
        """
    )
    rows = cursor.fetchall()
    conn.close()

    result: Dict[int, List[str]] = {}
    for r in rows:
        d_id = r["disease_id"]
        sym = r["symbol"]
        if d_id not in result:
            result[d_id] = []
        result[d_id].append(sym)
    return result

def get_all_genes(query: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()

    sql = """
    SELECT g.id, g.symbol, g.name, g.chromosome, g.description,
           COUNT(DISTINCT dg.disease_id) AS disease_count
    FROM genes g
    LEFT JOIN disease_genes dg ON g.id = dg.gene_id
    """
    params = []
    if query:
        sql += " WHERE g.symbol LIKE ? OR g.name LIKE ? OR g.chromosome LIKE ?"
        term = f"%{query.strip()}%"
        params.extend([term, term, term])

    sql += " GROUP BY g.id ORDER BY disease_count DESC, g.symbol ASC"

    cursor.execute(sql, params)
    rows = cursor.fetchall()

    genes = []
    for r in rows:
        g_id = r["id"]
        # Fetch associated disease names
        cursor.execute(
            """
            SELECT d.id, d.name, d.category
            FROM diseases d
            JOIN disease_genes dg ON d.id = dg.disease_id
            WHERE dg.gene_id = ?
            ORDER BY d.name ASC
            """,
            (g_id,)
        )
        associated_diseases = [dict(d) for d in cursor.fetchall()]

        genes.append({
            "id": r["id"],
            "symbol": r["symbol"],
            "name": r["name"],
            "chromosome": r["chromosome"],
            "description": r["description"],
            "disease_count": r["disease_count"],
            "associated_diseases": associated_diseases
        })

    conn.close()
    return genes

def get_gene_by_id(gene_id: int) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id, symbol, name, chromosome, description FROM genes WHERE id = ?",
        (gene_id,)
    )
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None

    gene = dict(row)
    cursor.execute(
        """
        SELECT d.id, d.name, d.code, d.category, d.description
        FROM diseases d
        JOIN disease_genes dg ON d.id = dg.disease_id
        WHERE dg.gene_id = ?
        ORDER BY d.name ASC
        """,
        (gene_id,)
    )
    gene["associated_diseases"] = [dict(d) for d in cursor.fetchall()]
    gene["disease_count"] = len(gene["associated_diseases"])

    conn.close()
    return gene

def record_search_query(query: str, disease_id: Optional[int] = None):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO search_history (query, disease_id) VALUES (?, ?)",
            (query.strip(), disease_id)
        )
        conn.commit()
        conn.close()
    except Exception:
        pass

def get_recent_searches(limit: int = 5) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT sh.id, sh.query, sh.searched_at, d.id AS disease_id, d.name AS disease_name, d.category
        FROM search_history sh
        LEFT JOIN diseases d ON sh.disease_id = d.id
        ORDER BY sh.searched_at DESC
        LIMIT ?
        """,
        (limit,)
    )
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_dashboard_stats() -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) AS count FROM diseases")
    total_diseases = cursor.fetchone()["count"]

    cursor.execute("SELECT COUNT(*) AS count FROM genes")
    total_genes = cursor.fetchone()["count"]

    cursor.execute("SELECT COUNT(*) AS count FROM symptoms")
    total_symptoms = cursor.fetchone()["count"]

    cursor.execute("SELECT COUNT(*) AS count FROM disease_relationships")
    total_relationships = cursor.fetchone()["count"]

    # Category breakdown
    cursor.execute(
        """
        SELECT category, COUNT(*) AS count
        FROM diseases
        GROUP BY category
        ORDER BY count DESC
        """
    )
    category_distribution = [dict(r) for r in cursor.fetchall()]

    # Most connected diseases (degree count in disease_relationships)
    cursor.execute(
        """
        SELECT d.id, d.name, d.category, COUNT(dr.id) AS connections
        FROM diseases d
        JOIN disease_relationships dr ON (d.id = dr.disease_id_1 OR d.id = dr.disease_id_2)
        GROUP BY d.id
        ORDER BY connections DESC, d.name ASC
        LIMIT 6
        """
    )
    most_connected = [dict(r) for r in cursor.fetchall()]

    # High similarity disease pairs
    cursor.execute(
        """
        SELECT d1.name AS disease_1, d2.name AS disease_2, dr.jaccard_score, dr.shared_genes_count
        FROM disease_relationships dr
        JOIN diseases d1 ON dr.disease_id_1 = d1.id
        JOIN diseases d2 ON dr.disease_id_2 = d2.id
        ORDER BY dr.jaccard_score DESC, dr.shared_genes_count DESC
        LIMIT 6
        """
    )
    top_pairs = [dict(r) for r in cursor.fetchall()]

    conn.close()

    recent_searches = get_recent_searches(limit=5)

    return {
        "total_diseases": total_diseases,
        "total_genes": total_genes,
        "total_symptoms": total_symptoms,
        "total_relationships": total_relationships,
        "category_distribution": category_distribution,
        "most_connected_diseases": most_connected,
        "top_pairs": top_pairs,
        "recent_searches": recent_searches
    }

def search_local_research_papers(query: str) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    term = f"%{query.strip()}%"

    cursor.execute(
        """
        SELECT rp.id, rp.pmid, rp.title, rp.authors, rp.journal, rp.year, rp.url,
               d.name AS disease_name, d.category AS disease_category,
               'Curated Local Repository' AS source_type
        FROM research_papers rp
        LEFT JOIN diseases d ON rp.disease_id = d.id
        WHERE rp.title LIKE ? OR rp.authors LIKE ? OR rp.journal LIKE ? OR d.name LIKE ?
        ORDER BY rp.year DESC
        """,
        (term, term, term, term)
    )
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]
