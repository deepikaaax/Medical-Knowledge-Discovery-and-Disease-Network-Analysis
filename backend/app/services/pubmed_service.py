import httpx
from typing import List, Dict, Any, Optional

PUBMED_SEARCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
PUBMED_SUMMARY_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi"

async def fetch_pubmed_articles(query: str, max_results: int = 6) -> List[Dict[str, Any]]:
    """
    Queries the official NCBI PubMed E-utilities API for peer-reviewed papers.
    Falls back gracefully if the external service is unavailable or offline.
    """
    if not query.strip():
        return []

    articles: List[Dict[str, Any]] = []

    try:
        async with httpx.AsyncClient(timeout=3.5) as client:
            search_params = {
                "db": "pubmed",
                "term": f"{query} [Title/Abstract] AND (genetics OR gene OR etiology)",
                "retmode": "json",
                "retmax": max_results,
                "sort": "pub_date"
            }
            search_resp = await client.get(PUBMED_SEARCH_URL, params=search_params)
            if search_resp.status_code != 200:
                return []

            search_data = search_resp.json()
            id_list = search_data.get("esearchresult", {}).get("idlist", [])

            if not id_list:
                return []

            # Retrieve article summaries
            summary_params = {
                "db": "pubmed",
                "id": ",".join(id_list),
                "retmode": "json"
            }
            summary_resp = await client.get(PUBMED_SUMMARY_URL, params=summary_params)
            if summary_resp.status_code != 200:
                return []

            summary_data = summary_resp.json().get("result", {})

            for pmid in id_list:
                item = summary_data.get(pmid)
                if not item:
                    continue

                # Authors list formatting
                authors = [a.get("name", "") for a in item.get("authors", [])]
                author_str = ", ".join(authors[:3]) + (" et al." if len(authors) > 3 else "")

                pub_date = item.get("pubdate", "")
                year = None
                if pub_date:
                    parts = pub_date.split()
                    for p in parts:
                        if p.isdigit() and len(p) == 4:
                            year = int(p)
                            break

                articles.append({
                    "pmid": pmid,
                    "title": item.get("title", "Untitled Article"),
                    "authors": author_str or "Authors not listed",
                    "journal": item.get("source", "PubMed Journal"),
                    "year": year or 2023,
                    "url": f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
                    "source_type": "NCBI PubMed Live API"
                })

    except Exception:
        # Graceful fallback: return empty list on timeout or offline
        return []

    return articles
