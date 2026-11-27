import React, { useState, useEffect } from 'react';
import { Dna, Search, X, Activity, ArrowRight, Layers } from 'lucide-react';
import api from '../services/api';
import CategoryBadge from '../components/CategoryBadge';

export default function GeneExplorer({ onSelectDisease, initialQuery = '' }) {
  const [genes, setGenes] = useState([]);
  const [query, setQuery] = useState(initialQuery);
  const [selectedGene, setSelectedGene] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGenes();
  }, [query]);

  const fetchGenes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getGenes(query.trim() || null);
      setGenes(data);
      if (data.length > 0 && !selectedGene) {
        setSelectedGene(data[0]);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch genes.');
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <Dna size={26} color="#0d9488" /> Gene Explorer & Pleiotropy Atlas
        </h1>
        <p className="page-subtitle">
          Discover candidate genes, genomic loci, and their pleiotropic multi-disease associations.
        </p>
      </div>

      {/* Search Bar */}
      <div className="search-filter-bar">
        <div className="search-input-wrapper" style={{ maxWidth: '480px' }}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search gene symbol (e.g. PPARG, ACE, TNF) or full name..."
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
      </div>

      {loading ? (
        <div className="loading-box">
          <div className="spinner"></div>
          <p>Querying genomic database...</p>
        </div>
      ) : error ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#e11d48' }}>
          {error}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Genes List Table */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                Cataloged Genes ({genes.length})
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Sorted by Disease Associations
              </span>
            </div>

            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Chromosome</th>
                    <th>Diseases</th>
                  </tr>
                </thead>
                <tbody>
                  {genes.map((g) => {
                    const isSelected = selectedGene && selectedGene.id === g.id;
                    return (
                      <tr
                        key={g.id}
                        onClick={() => setSelectedGene(g)}
                        style={{
                          cursor: 'pointer',
                          backgroundColor: isSelected ? '#f0f9ff' : 'transparent',
                          fontWeight: isSelected ? 600 : 400,
                        }}
                      >
                        <td>
                          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0284c7' }}>
                            {g.symbol}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {g.name}
                          </div>
                        </td>
                        <td>
                          <span className="tag-pill" style={{ fontSize: '0.7rem' }}>
                            {g.chromosome || '—'}
                          </span>
                        </td>
                        <td>
                          <span style={{ 
                            background: g.disease_count > 2 ? '#fef3c7' : '#f1f5f9',
                            color: g.disease_count > 2 ? '#b45309' : '#334155',
                            fontWeight: 700,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem'
                          }}>
                            {g.disease_count} {g.disease_count === 1 ? 'Disease' : 'Diseases'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Gene Detail Profile */}
          <div className="card" style={{ position: 'sticky', top: '80px' }}>
            {selectedGene ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ 
                    fontFamily: 'var(--font-mono)', 
                    fontSize: '1.5rem', 
                    fontWeight: 800, 
                    color: '#0f172a' 
                  }}>
                    {selectedGene.symbol}
                  </span>
                  <span className="tag-pill" style={{ fontSize: '0.8rem', background: '#e0f2fe', color: '#0369a1', borderColor: '#bae6fd' }}>
                    Chromosome {selectedGene.chromosome}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#334155', marginBottom: '1rem' }}>
                  {selectedGene.name}
                </h3>

                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '0.4rem', letterSpacing: '0.04em' }}>
                    Biological Function & Molecular Role
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.6', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    {selectedGene.description || 'No detailed biological annotation recorded.'}
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '0.75rem', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Activity size={15} color="#0284c7" /> Linked Clinical Conditions ({selectedGene.associated_diseases ? selectedGene.associated_diseases.length : selectedGene.disease_count})
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedGene.associated_diseases && selectedGene.associated_diseases.map((d) => (
                      <div
                        key={d.id}
                        onClick={() => onSelectDisease && onSelectDisease(d.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem 1rem',
                          background: '#ffffff',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#38bdf8'; e.currentTarget.style.backgroundColor = '#f0f9ff'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.backgroundColor = '#ffffff'; }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>
                            {d.name}
                          </span>
                          <CategoryBadge category={d.category} />
                        </div>
                        <ArrowRight size={15} color="#0284c7" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                Select a gene from the list to view detailed profile and multi-disease linkages.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
