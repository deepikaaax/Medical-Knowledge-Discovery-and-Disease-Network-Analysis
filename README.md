# Web-Based Medical Knowledge Discovery and Disease Network Analysis

An educational biomedical research and network analysis platform designed to explore disease relationships, comorbidity patterns, and shared genetic etiologies using **FastAPI**, **NetworkX**, **Cytoscape.js**, and **React**.

> **Disclaimer:** This web application is an educational and academic knowledge discovery platform. It is **not** a clinical diagnostic tool and should not be used for medical decisions.

---

## 1. Features & Core Modules

1. **Dashboard:**
   - Real-time statistics dynamically calculated from the SQLite database: total diseases, genes, clinical symptoms, and relationships.
   - Interactive disease category distribution chart.
   - Most connected disease hubs and top shared genetic overlap pairs.
   - Live query tracking from `search_history`.

2. **Disease Search & Phenotypic Profiler:**
   - Real-time search by disease name, description, symptoms, or gene symbol.
   - Category filtering (Cardiovascular, Oncology, Metabolic, Autoimmune, Respiratory, Neurological, Renal, etc.).
   - Comprehensive modal detailing ICD codes, clinical symptoms with frequencies, associated genes with chromosome loci, related diseases, and PubMed references.

3. **Disease Network Visualization (Cytoscape.js & NetworkX):**
   - High-performance graph canvas powered by Cytoscape.js.
   - Nodes represent diseases colored according to clinical taxonomy.
   - Edges represent shared genetic etiology, with width reflecting similarity strength.
   - Dynamic **Jaccard Similarity Threshold Filter** (adjust slider to filter weak links).
   - Layout options: Force-Directed (`cose`), `concentric`, `circle`, `breadthfirst`.
   - Node and edge selection with deep diagnostic inspection.

4. **Disease Comparison Tool:**
   - Compare any two diseases side-by-side.
   - Real-time backend calculation of Jaccard Similarity: $J(A, B) = \frac{|A \cap B|}{|A \cup B|}$.
   - 3-column Venn-style breakdown showing unique genes in Disease A, shared intersection genes, and unique genes in Disease B.
   - One-click presets (e.g., *Diabetes vs. Obesity*, *Breast Cancer vs. Lung Cancer*).

5. **Gene Explorer & Pleiotropy Atlas:**
   - Search cataloged genes (e.g. `PPARG`, `ACE`, `BRCA1`, `TNF`, `APOE`).
   - Detailed biological function, chromosomal location, and pleiotropic multi-disease connections.
   - Click any linked disease to view its complete clinical profile.

6. **Network Analytics:**
   - Degree distribution bar charts showing most connected disease hubs.
   - Network density, average degree, and clustering coefficients computed by NetworkX.
   - Comprehensive ranking tables of comorbid disease pairs.

7. **Scientific Literature & PubMed Discovery:**
   - Seamless literature search query engine.
   - Hybrid system combining local peer-reviewed citations with the live free **NCBI PubMed E-utilities API** (`esearch` and `esummary`).
   - Graceful offline fallback to local SQLite database when external internet is unavailable.

---

## 2. Technology Stack

- **Frontend:** React 19, Vite, Axios, Cytoscape.js, Chart.js, react-chartjs-2, Lucide React
- **Styling:** Modern CSS3 (Healthcare white and light-blue palette, responsive layout, accessible typography)
- **Backend:** Python 3.10+, FastAPI, Uvicorn, NetworkX, HTTPX, Pydantic v2
- **Database:** SQLite with foreign keys and cascade constraints

---

## 3. Architecture & Mathematical Formula

### Jaccard Similarity Algorithm

Disease connections and comorbidity scores are calculated based on shared associated genetic markers:

$$J(A, B) = \frac{|A \cap B|}{|A \cup B|}$$

- $|A \cap B|$ = Number of genes associated with **both** Disease A and Disease B.
- $|A \cup B|$ = Total number of unique genes associated with **either** Disease A or Disease B.

If $J(A, B) \ge \text{threshold}$, an edge is drawn in the NetworkX graph with weight equal to the similarity coefficient.

---

## 4. Database Schema

The SQLite database (`medical_discovery.db`) includes 8 structured tables:

1. `diseases` — id, name, code (ICD-10), category, description, created_at
2. `genes` — id, symbol, name, chromosome, description
3. `symptoms` — id, name, category, description
4. `disease_genes` — disease_id, gene_id, evidence_type, source
5. `disease_symptoms` — disease_id, symptom_id, frequency
6. `disease_relationships` — disease_id_1, disease_id_2, shared_genes_count, jaccard_score, relationship_type
7. `research_papers` — id, pmid, title, authors, journal, year, url, disease_id
8. `search_history` — id, query, disease_id, searched_at

---

## 5. Directory Structure

```
medical-knowledge-discovery/
├── backend/
│   ├── app/
│   │   ├── algorithms/
│   │   │   ├── similarity.py          # Jaccard calculation
│   │   │   └── network_analysis.py    # NetworkX graph analysis
│   │   ├── data/
│   │   │   ├── seed_data.py           # Database initial population
│   │   │   └── medical_discovery.db   # SQLite database
│   │   ├── models/
│   │   │   └── schemas.py             # Pydantic request/response models
│   │   ├── routes/
│   │   │   ├── analytics.py           # Graph analytics & degree stats
│   │   │   ├── comparison.py          # Dynamic disease pair comparison
│   │   │   ├── diseases.py            # Disease retrieval and search
│   │   │   ├── genes.py               # Gene explorer endpoints
│   │   │   ├── network.py             # NetworkX to Cytoscape endpoint
│   │   │   ├── research.py            # PubMed & literature search
│   │   │   └── stats.py               # Dashboard summary metrics
│   │   ├── services/
│   │   │   ├── db_service.py          # Central database access service
│   │   │   └── pubmed_service.py      # Resilient NCBI PubMed API client
│   │   ├── database.py                # SQLite connection & schema init
│   │   └── main.py                    # FastAPI entrypoint & static mount
│   ├── requirements.txt
│   └── test_api.py                    # Automated test suite
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CategoryBadge.jsx
│   │   │   ├── DiseaseDetailModal.jsx
│   │   │   ├── Header.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── pages/
│   │   │   ├── Analytics.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DiseaseComparison.jsx
│   │   │   ├── DiseaseNetwork.jsx
│   │   │   ├── DiseaseSearch.jsx
│   │   │   ├── GeneExplorer.jsx
│   │   │   └── ResearchPapers.jsx
│   │   ├── services/
│   │   │   └── api.js                 # Axios API service
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── run_backend.py                     # Python runner for backend
├── start_backend.bat                  # One-click Windows starter for backend
├── start_frontend.bat                 # One-click Windows starter for frontend
└── README.md
```

---

## 6. Installation & Execution

### Prerequisites
- Python 3.10 or higher
- Node.js 18 or higher (with `npm`)

### 1. Backend Setup
```bash
# Navigate to workspace root
cd medical-knowledge-discovery

# Install Python packages
python -m pip install -r backend/requirements.txt

# (Optional) Re-seed or inspect database
python -c "import sys; sys.path.insert(0, 'backend'); from app.data.seed_data import seed_database; seed_database()"

# Run automated tests
python backend/test_api.py

# Start FastAPI backend
python run_backend.py
```
Backend API will be running at `http://127.0.0.1:8000`.
Interactive Swagger UI is available at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup
```bash
# In a new terminal window
cd frontend

# Install Node dependencies (if not already installed)
npm install

# Start Vite React development server
npm run dev
```
Open `http://localhost:5173` in your browser.

> **Note on Standalone Production Mode:**
> The frontend has already been built into `frontend/dist`. You can access the complete full-stack web application directly from `http://127.0.0.1:8000/` without running the Vite dev server!

---

## 7. REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Healthcheck endpoint |
| `GET` | `/api/stats` | Dashboard statistics (counts, categories, top hubs) |
| `GET` | `/api/diseases` | List all diseases (with optional `?category=`) |
| `GET` | `/api/diseases/search?q=` | Search diseases by keyword, symptom, or gene |
| `GET` | `/api/diseases/{id}` | Detailed profile with genes, symptoms, and links |
| `GET` | `/api/diseases/{id}/genes` | Associated genes for a disease |
| `GET` | `/api/diseases/{id}/symptoms` | Documented symptoms for a disease |
| `GET` | `/api/diseases/{id}/related` | Related diseases ranked by Jaccard score |
| `GET` | `/api/network?threshold=0.05` | NetworkX graph formatted for Cytoscape.js |
| `POST` | `/api/compare` | Dynamic Jaccard comparison of two disease IDs |
| `GET` | `/api/genes?q=` | Cataloged genes with disease associations |
| `GET` | `/api/genes/{id}` | Single gene details and associated conditions |
| `GET` | `/api/analytics` | Network topology, centrality, and degree distributions |
| `GET` | `/api/research/search?q=` | NCBI PubMed API + local research literature search |

---

## 8. Academic Project Presentation Tips

1. **Demonstrate Comorbidity Discovery:** In the **Disease Network**, point out how conditions across different organ systems connect through shared inflammatory and vascular genes (e.g. *Rheumatoid Arthritis* and *Asthma* linking via `TNF`, or *Cardiovascular Disease* and *Alzheimer's* linking via `APOE`).
2. **Demonstrate Dynamic Threshold Filtering:** Move the slider from `0.05` to `0.20` in the network view to show how noise is eliminated, isolating high-confidence clusters.
3. **Demonstrate the Jaccard Formula in Action:** Go to **Disease Comparison**, choose *Type 2 Diabetes* and *Obesity*, and explain the calculation: $|A \cap B| = 2$ (`FTO`, `PPARG`) divided by $|A \cup B| = 14 \implies 14.29\%$.
4. **Demonstrate Live NCBI PubMed Integration:** In **Research Papers**, enter a query like `APOE Alzheimer` to demonstrate asynchronous querying of the National Center for Biotechnology Information (NCBI).
