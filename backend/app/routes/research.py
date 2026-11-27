from fastapi import APIRouter, Query
from typing import List, Dict, Any
from ..services import db_service
from ..services.pubmed_service import fetch_pubmed_articles

router = APIRouter(prefix="/api/research", tags=["Research Literature"])

@router.get("/search", response_model=List[Dict[str, Any]])
async def search_research(
    q: str = Query(..., min_length=1, description="Search term for medical research articles")
):
    """
    Searches local peer-reviewed reference database and integrates with
    the official NCBI PubMed E-utilities API.
    """
    # 1. Search local curated SQLite database
    local_papers = db_service.search_local_research_papers(q)

    # 2. Query NCBI PubMed Live API
    pubmed_papers = await fetch_pubmed_articles(q, max_results=6)

    # Combine results, avoiding duplicate PMIDs
    seen_pmids = set()
    combined_results = []

    for p in local_papers:
        pmid = p.get("pmid")
        if pmid:
            seen_pmids.add(str(pmid))
        combined_results.append(p)

    for p in pubmed_papers:
        pmid = str(p.get("pmid"))
        if pmid not in seen_pmids:
            seen_pmids.add(pmid)
            combined_results.append(p)

    return combined_results
