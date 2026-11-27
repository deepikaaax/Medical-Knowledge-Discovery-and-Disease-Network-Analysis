import React, { useEffect, useState } from 'react';
import { X, Dna, Activity, GitFork, BookOpen, ExternalLink, ArrowRight } from 'lucide-react';
import api from '../services/api';
import CategoryBadge from './CategoryBadge';

export default function DiseaseDetailModal({ diseaseId, onClose, onSelectCompare, onSelectDisease }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!diseaseId) return;
    setLoading(true);
    setError(null);
    api.getDiseaseById(diseaseId)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load disease details.');
        setLoading(false);
      });
  }, [diseaseId]);

  if (!diseaseId) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {loading ? (
          <div className="loading-box">
            <div className="spinner"></div>
            <p>Loading disease knowledge profile...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#e11d48', marginBottom: '1rem' }}>{error}</p>
            <button className="btn-secondary" onClick={onClose}>Close</button>
          </div>
        ) : data ? (
          <>
            <div className="modal-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                  <CategoryBadge category={data.category} />
                  {data.code && (
                    <span className="tag-pill" style={{ fontSize: '0.75rem' }}>
                      ICD-10: {data.code}
                    </span>
                  )}
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
                  {data.name}
                </h2>
              </div>
              <button className="modal-close-btn" onClick={onClose} title="Close">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Description */}
              <div>
                <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600, marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
                  Pathophysiology & Overview
                </h4>
                <p style={{ color: '#334155', lineHeight: '1.6', fontSize: '0.95rem' }}>
                  {data.description}
                </p>
              </div>

              {/* Action Bar */}
              {onSelectCompare && (
                <div style={{ background: '#f0f9ff', padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #bae6fd' }}>
                  <span style={{ fontSize: '0.85rem', color: '#0369a1', fontWeight: 500 }}>
                    Discover genetic similarity with other clinical phenotypes
                  </span>
                  <button 
                    className="btn-primary" 
                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                    onClick={() => {
                      onSelectCompare(data.id);
                      onClose();
                    }}
                  >
                    Compare in Comparison Tool <ArrowRight size={14} />
                  </button>
                </div>
              )}

              {/* Symptoms */}
              <div>
                <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', letterSpacing: '0.04em' }}>
                  <Activity size={16} color="#0284c7" /> Documented Phenotypic Symptoms ({data.symptoms.length})
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {data.symptoms.map((s) => (
                    <span 
                      key={s.id} 
                      style={{ 
                        background: '#f8fafc', 
                        border: '1px solid #e2e8f0', 
                        padding: '0.35rem 0.75rem', 
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        color: '#1e293b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                      title={s.description || s.name}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0284c7' }}></span>
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Associated Genes */}
              <div>
                <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', letterSpacing: '0.04em' }}>
                  <Dna size={16} color="#0d9488" /> Associated Genetic Markers ({data.genes.length})
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
                  {data.genes.map((g) => (
                    <div 
                      key={g.id} 
                      style={{ 
                        background: '#ffffff', 
                        border: '1px solid #e2e8f0', 
                        padding: '0.75rem', 
                        borderRadius: '8px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
                          {g.symbol}
                        </span>
                        {g.chromosome && (
                          <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                            Chr {g.chromosome}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '0.35rem' }}>
                        {g.name}
                      </div>
                      {g.description && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: '1.4' }}>
                          {g.description.length > 90 ? g.description.substring(0, 90) + '...' : g.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Diseases */}
              <div>
                <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', letterSpacing: '0.04em' }}>
                  <GitFork size={16} color="#7c3aed" /> Related Diseases via Shared Etiology ({data.related_diseases.length})
                </h4>
                {data.related_diseases.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: '#64748b' }}>No direct gene overlaps found above threshold.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {data.related_diseases.map((rel) => (
                      <div 
                        key={rel.id} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          padding: '0.65rem 0.85rem', 
                          background: '#f8fafc', 
                          borderRadius: '8px',
                          border: '1px solid #f1f5f9',
                          cursor: 'pointer'
                        }}
                        onClick={() => onSelectDisease && onSelectDisease(rel.id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>
                            {rel.name}
                          </span>
                          <CategoryBadge category={rel.category} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0284c7' }}>
                              J = {rel.jaccard_score.toFixed(3)}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                              {rel.shared_genes_count} shared ({rel.shared_genes.join(', ')})
                            </div>
                          </div>
                          <ArrowRight size={14} color="#94a3b8" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Research References */}
              {data.research_papers && data.research_papers.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', letterSpacing: '0.04em' }}>
                    <BookOpen size={16} color="#d97706" /> Peer-Reviewed Research References ({data.research_papers.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {data.research_papers.map((p, idx) => (
                      <div key={idx} style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a', marginBottom: '0.2rem' }}>
                          {p.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{p.authors} — <em>{p.journal}</em> ({p.year})</span>
                          {p.url && (
                            <a 
                              href={p.url} 
                              target="_blank" 
                              rel="noreferrer" 
                              style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}
                            >
                              PubMed <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
