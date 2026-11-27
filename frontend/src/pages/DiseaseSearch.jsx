import React, { useState, useEffect } from 'react';
import { Search, Filter, Dna, Activity, GitFork, ArrowRight, X } from 'lucide-react';
import api from '../services/api';
import CategoryBadge from '../components/CategoryBadge';

const CATEGORIES = [
  'All Categories',
  'Metabolic & Endocrine',
  'Cardiovascular',
  'Oncology',
  'Respiratory',
  'Neurological',
  'Autoimmune',
  'Renal',
  'Musculoskeletal',
  'Psychiatric',
];

export default function DiseaseSearch({ onSelectDisease, initialQuery = '' }) {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    fetchDiseases();
  }, [query, selectedCategory]);

  const fetchDiseases = async () => {
    setLoading(true);
    setError(null);
    try {
      let data = [];
      if (query.trim()) {
        data = await api.searchDiseases(query.trim());
        if (selectedCategory !== 'All Categories') {
          data = data.filter(
            (d) => d.category.toLowerCase() === selectedCategory.toLowerCase()
          );
        }
      } else {
        const catParam = selectedCategory === 'All Categories' ? null : selectedCategory;
        data = await api.getDiseases(catParam);
      }
      setDiseases(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch diseases. Verify backend API connection.');
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSelectedCategory('All Categories');
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <Search size={26} color="#0284c7" /> Disease Knowledge Catalog & Search
        </h1>
        <p className="page-subtitle">
          Search over 20 documented medical conditions by phenotypic symptoms, genetic markers, or disease name.
        </p>
      </div>

      {/* Search and Category Filter Toolbar */}
      <div className="search-filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search disease name, symptom (e.g. Wheezing), or gene (e.g. BRCA1)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={18} color="#64748b" />
          <select
            className="category-filter-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {(query || selectedCategory !== 'All Categories') && (
          <button className="btn-secondary" onClick={handleClear} style={{ padding: '0.65rem 1rem' }}>
            Clear Filters
          </button>
        )}
      </div>

      {/* Disease Results Grid */}
      {loading ? (
        <div className="loading-box">
          <div className="spinner"></div>
          <p>Searching database records...</p>
        </div>
      ) : error ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#e11d48' }}>
          {error}
        </div>
      ) : diseases.length === 0 ? (
        <div className="empty-state card">
          <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
            No diseases found matching your search.
          </p>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>
            Try adjusting your search keywords, checking spelling, or resetting category filters.
          </p>
          <button className="btn-primary" onClick={handleClear}>Reset Search</button>
        </div>
      ) : (
        <div className="disease-grid">
          {diseases.map((d) => (
            <div
              key={d.id}
              className="card disease-card"
              onClick={() => onSelectDisease(d.id)}
            >
              <div>
                <div className="disease-card-header">
                  <CategoryBadge category={d.category} />
                  {d.code && (
                    <span className="tag-pill" style={{ fontSize: '0.7rem' }}>
                      {d.code}
                    </span>
                  )}
                </div>

                <h3 className="disease-title">{d.name}</h3>
                <p className="disease-desc">{d.description}</p>
              </div>

              <div>
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#0d9488' }}>
                    <Dna size={14} />
                    <span>{d.gene_count || 0} Genes</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#e11d48' }}>
                    <Activity size={14} />
                    <span>{d.symptom_count || 0} Symptoms</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#7c3aed' }}>
                    <GitFork size={14} />
                    <span>{d.relationships_count || 0} Links</span>
                  </div>
                </div>

                <div className="disease-meta-footer">
                  <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600 }}>
                    Click for Full Diagnostic Profile
                  </span>
                  <ArrowRight size={15} color="#0284c7" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
