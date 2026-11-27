from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class DiseaseBase(BaseModel):
    id: int
    name: str
    code: Optional[str] = None
    category: str
    description: str

class GeneItem(BaseModel):
    id: int
    symbol: str
    name: str
    chromosome: Optional[str] = None
    description: Optional[str] = None
    evidence_type: Optional[str] = None
    source: Optional[str] = None

class SymptomItem(BaseModel):
    id: int
    name: str
    category: Optional[str] = None
    description: Optional[str] = None
    frequency: Optional[str] = None

class RelatedDiseaseItem(BaseModel):
    id: int
    name: str
    category: str
    shared_genes_count: int
    jaccard_score: float
    shared_genes: List[str]

class ResearchPaperItem(BaseModel):
    id: Optional[int] = None
    pmid: Optional[str] = None
    title: str
    authors: Optional[str] = None
    journal: Optional[str] = None
    year: Optional[int] = None
    url: Optional[str] = None
    source_type: Optional[str] = "Curated Reference"

class DiseaseDetail(DiseaseBase):
    genes: List[GeneItem] = []
    symptoms: List[SymptomItem] = []
    related_diseases: List[RelatedDiseaseItem] = []
    research_papers: List[ResearchPaperItem] = []

class CompareRequest(BaseModel):
    disease_id_1: int = Field(..., description="ID of the first disease")
    disease_id_2: int = Field(..., description="ID of the second disease")

class CompareResponse(BaseModel):
    disease_1: DiseaseBase
    disease_2: DiseaseBase
    jaccard_score: float
    percentage: float
    shared_genes: List[str]
    shared_count: int
    unique_disease_1: List[str]
    unique_disease_1_count: int
    unique_disease_2: List[str]
    unique_disease_2_count: int
    total_genes_1: int
    total_genes_2: int
    union_count: int

class NetworkMetrics(BaseModel):
    total_nodes: int
    total_edges: int
    density: float
    average_degree: float
    average_clustering: float
    connected_components: int
    threshold_applied: float

class NetworkResponse(BaseModel):
    elements: Dict[str, Any]
    metrics: NetworkMetrics

class AnalyticsResponse(BaseModel):
    total_diseases: int
    total_genes: int
    total_symptoms: int
    total_relationships: int
    category_distribution: List[Dict[str, Any]]
    most_connected_diseases: List[Dict[str, Any]]
    highest_shared_genes: List[Dict[str, Any]]
    degree_distribution: List[Dict[str, Any]]
    network_metrics: NetworkMetrics
