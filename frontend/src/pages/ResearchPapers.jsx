import React, { useState, useEffect } from 'react';
import { BookOpen, Search, ExternalLink, Globe, Database, Sparkles, X } from 'lucide-react';
import api from '../services/api';

const POPULAR_SEARCHES = [
  'TCF7L2 type 2 diabetes',
  'BRCA1 breast cancer genetics',
  'APOE late onset alzheimer',
  'Hypertension renin angiotensin',
  'EGFR lung cancer tyrosine kinase',
  'FTO obesity gwas',
  'TNF rheumatoid arthritis'
];

export default function ResearchPapers() {
  const [query, setQuery] = useState('Diabetes');
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    executeSearch('Diabetes');
  }, []);

  const executeSearch = async (searchTerm) => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const results = await api.searchResearch(searchTerm.trim());
      setPapers(results);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Unable to fetch research articles.');
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    executeSearch(query);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <BookOpen size={26} color="#0284c7" /> Scientific Literature & NCBI PubMed Discovery
        </h1>
        <p className="page-subtitle">
          Query peer-reviewed biomedical literature from both local curated references and live NCBI Entrez E-utilities.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div className="search-input-wrapper" style={{ flex: 1, minWidth: '300px' }}>
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by disease, gene (e.g., APOE), mechanism, or PMID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button 
                type="button"
                onClick={() => setQuery('')}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ minWidth: '130px' }}>
            {loading ? 'Searching...' : 'Search Papers'}
          </button>
        </form>

        {/* Quick Suggestion Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
            Quick Topics:
          </span>
          {POPULAR_SEARCHES.map((topic, i) => (
            <button
              key={i}
              className="tag-pill"
              style={{ fontSize: '0.75rem', cursor: 'pointer' }}
              onClick={() => {
                setQuery(topic);
                executeSearch(topic);
              }}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Integration Notice */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '0.75rem 1.25rem', 
        background: '#f8fafc', 
        borderRadius: '10px', 
        border: '1px solid #e2e8f0', 
        marginBottom: '1.5rem',
        fontSize: '0.8rem',
        color: '#475569'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Globe size={16} color="#0284c7" />
          <span>
            Hybrid Multi-Source Discovery: Curated Local SQLite Database + NCBI PubMed Live E-utilities API
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Database size={14} color="#059669" />
          <span style={{ color: '#059669', fontWeight: 600 }}>Zero-Dependency Fallback Active</span>
        </div>
      </div>

      {/* Results List */}
      {loading ? (
        <div className="loading-box">
          <div className="spinner"></div>
          <p>Querying NCBI PubMed and local medical reference repository...</p>
        </div>
      ) : error ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#e11d48' }}>
          {error}
        </div>
      ) : papers.length === 0 ? (
        <div className="empty-state card">
          <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
            No research papers found for "{query}".
          </p>
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
            Try searching for broader medical entities like "Cardiovascular", "Asthma", or specific gene symbols like "TP53".
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {papers.map((p, idx) => {
            const isLive = p.source_type && p.source_type.includes('Live');
            return (
              <div 
                key={idx} 
                className="card"
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.5rem',
                  borderLeft: isLive ? '4px solid #0284c7' : '4px solid #0d9488'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span style={{ 
                        fontSize: '0.7rem', 
                        fontWeight: 700, 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '4px',
                        background: isLive ? '#e0f2fe' : '#ccfbf1',
                        color: isLive ? '#0369a1' : '#0f766e',
                        border: isLive ? '1px solid #bae6fd' : '1px solid #99f6e4'
                      }}>
                        {p.source_type || 'Curated Reference'}
                      </span>

                      {p.pmid && (
                        <span className="tag-pill" style={{ fontSize: '0.7rem' }}>
                          PMID: {p.pmid}
                        </span>
                      )}

                      {p.disease_name && (
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Related: <strong>{p.disease_name}</strong>
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', lineHeight: '1.4' }}>
                      {p.title}
                    </h3>
                  </div>

                  {p.url && (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-secondary"
                      style={{ 
                        padding: '0.4rem 0.75rem', 
                        fontSize: '0.8rem', 
                        color: '#0284c7', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        flexShrink: 0
                      }}
                    >
                      <span>Read Paper</span>
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>

                <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                  <span><strong>Authors:</strong> {p.authors || 'Not listed'}</span>
                  <span><strong>Journal:</strong> <em>{p.journal || 'PubMed Journal'}</em></span>
                  {p.year && <span><strong>Year:</strong> {p.year}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
