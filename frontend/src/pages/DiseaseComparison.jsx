import React, { useState, useEffect } from 'react';
import { GitCompare, Dna, ArrowRight, Zap, RefreshCw, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import CategoryBadge from '../components/CategoryBadge';

export default function DiseaseComparison({ initialDisease1 = null, initialDisease2 = null, onSelectDisease }) {
  const [diseases, setDiseases] = useState([]);
  const [selectedDisease1, setSelectedDisease1] = useState(initialDisease1 || '');
  const [selectedDisease2, setSelectedDisease2] = useState(initialDisease2 || '');
  const [comparisonResult, setComparisonResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load disease list for dropdowns
    api.getDiseases()
      .then((data) => {
        setDiseases(data);
        // Default selection if not provided
        if (!selectedDisease1 && data.length > 0) {
          const d1 = initialDisease1 || data[0].id;
          const d2 = initialDisease2 || (data.length > 2 ? data[2].id : data[1].id);
          setSelectedDisease1(d1);
          setSelectedDisease2(d2);
          performComparison(d1, d2);
        } else if (selectedDisease1 && selectedDisease2) {
          performComparison(selectedDisease1, selectedDisease2);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (initialDisease1) setSelectedDisease1(initialDisease1);
    if (initialDisease2) setSelectedDisease2(initialDisease2);
    if (initialDisease1 && initialDisease2) {
      performComparison(initialDisease1, initialDisease2);
    }
  }, [initialDisease1, initialDisease2]);

  const performComparison = async (id1, id2) => {
    if (!id1 || !id2) return;
    if (id1 === id2) {
      setError('Please select two distinct diseases to calculate comparative similarity.');
      setComparisonResult(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await api.compareDiseases(id1, id2);
      setComparisonResult(result);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to compute disease comparison.');
      setLoading(false);
    }
  };

  const handleCompareClick = () => {
    performComparison(selectedDisease1, selectedDisease2);
  };

  const setPresetPair = (id1, id2) => {
    setSelectedDisease1(id1);
    setSelectedDisease2(id2);
    performComparison(id1, id2);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <GitCompare size={26} color="#0284c7" /> Disease Comparison & Shared Genetic Etiology
        </h1>
        <p className="page-subtitle">
          Dynamically evaluate shared genetic markers and calculate Jaccard similarity coefficients between clinical entities.
        </p>
      </div>

      {/* Preset Fast Selection Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>
          Suggested Comparisons:
        </span>
        <button 
          className="btn-secondary" 
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
          onClick={() => {
            const d1 = diseases.find(d => d.name.includes('Diabetes'));
            const d2 = diseases.find(d => d.name.includes('Obesity'));
            if (d1 && d2) setPresetPair(d1.id, d2.id);
          }}
        >
          Diabetes vs. Obesity
        </button>
        <button 
          className="btn-secondary" 
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
          onClick={() => {
            const d1 = diseases.find(d => d.name.includes('Hypertension'));
            const d2 = diseases.find(d => d.name.includes('Chronic Kidney'));
            if (d1 && d2) setPresetPair(d1.id, d2.id);
          }}
        >
          Hypertension vs. Chronic Kidney Disease
        </button>
        <button 
          className="btn-secondary" 
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
          onClick={() => {
            const d1 = diseases.find(d => d.name.includes('Breast Cancer'));
            const d2 = diseases.find(d => d.name.includes('Lung Cancer'));
            if (d1 && d2) setPresetPair(d1.id, d2.id);
          }}
        >
          Breast Cancer vs. Lung Cancer
        </button>
        <button 
          className="btn-secondary" 
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
          onClick={() => {
            const d1 = diseases.find(d => d.name.includes('Asthma'));
            const d2 = diseases.find(d => d.name.includes('Obstructive'));
            if (d1 && d2) setPresetPair(d1.id, d2.id);
          }}
        >
          Asthma vs. COPD
        </button>
      </div>

      {/* Selection Row */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="comparison-selectors">
          <div className="select-box">
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>
              Select First Disease
            </label>
            <select
              value={selectedDisease1}
              onChange={(e) => setSelectedDisease1(e.target.value)}
            >
              <option value="">Select a disease...</option>
              {diseases.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.category})
                </option>
              ))}
            </select>
          </div>

          <div className="vs-circle">VS</div>

          <div className="select-box">
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>
              Select Second Disease
            </label>
            <select
              value={selectedDisease2}
              onChange={(e) => setSelectedDisease2(e.target.value)}
            >
              <option value="">Select a disease...</option>
              {diseases.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button
            className="btn-primary"
            onClick={handleCompareClick}
            disabled={!selectedDisease1 || !selectedDisease2 || loading}
            style={{ minWidth: '220px' }}
          >
            {loading ? <RefreshCw className="spinner" size={16} /> : <Zap size={16} />}
            Compute Dynamic Jaccard Similarity
          </button>
        </div>

        {error && (
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#ffe4e6', color: '#e11d48', borderRadius: '8px', textAlign: 'center', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}
      </div>

      {/* Results View */}
      {comparisonResult && (
        <div>
          {/* Main Score Banner */}
          <div className="comparison-score-card">
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                {comparisonResult.disease_1.name}
              </span>
              <span style={{ color: '#0284c7', fontWeight: 800 }}>&</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                {comparisonResult.disease_2.name}
              </span>
            </div>

            <div className="score-display">
              {comparisonResult.percentage}%
            </div>

            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#0369a1', marginTop: '-0.25rem', marginBottom: '0.5rem' }}>
              Jaccard Similarity Index: {comparisonResult.jaccard_score}
            </div>

            <div className="score-formula">
              J(A, B) = |A ∩ B| / |A ∪ B| = {comparisonResult.shared_count} / {comparisonResult.union_count}
            </div>
          </div>

          {/* 3-Column Venn-style Representation */}
          <div className="venn-container">
            {/* Left: Disease 1 Unique Genes */}
            <div className="venn-box left">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <CategoryBadge category={comparisonResult.disease_1.category} />
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Total: {comparisonResult.total_genes_1} genes</span>
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                {comparisonResult.disease_1.name}
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Unique to {comparisonResult.disease_1.name} ({comparisonResult.unique_disease_1_count})
              </p>

              <div className="genes-tag-cloud">
                {comparisonResult.unique_disease_1.length === 0 ? (
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>None</span>
                ) : (
                  comparisonResult.unique_disease_1.map((g, i) => (
                    <span key={i} className="tag-pill" style={{ background: '#ffffff' }}>
                      {g}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Middle: Shared Genes Intersection */}
            <div className="venn-box shared">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
                <CheckCircle2 size={16} color="#059669" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
                  Shared Genetic Overlap ({comparisonResult.shared_count})
                </span>
              </div>

              <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#475569' }}>
                  Biomarkers simultaneously linked to both pathological profiles
                </span>
              </div>

              <div className="genes-tag-cloud" style={{ justifyContent: 'center' }}>
                {comparisonResult.shared_genes.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b', fontSize: '0.9rem' }}>
                    No shared genes identified between these two phenotypes.
                  </div>
                ) : (
                  comparisonResult.shared_genes.map((g, i) => (
                    <span 
                      key={i} 
                      className="tag-pill" 
                      style={{ 
                        background: '#dcfce7', 
                        color: '#15803d', 
                        borderColor: '#86efac',
                        fontWeight: 700,
                        padding: '0.3rem 0.75rem',
                        fontSize: '0.9rem'
                      }}
                    >
                      {g}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Right: Disease 2 Unique Genes */}
            <div className="venn-box right">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <CategoryBadge category={comparisonResult.disease_2.category} />
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Total: {comparisonResult.total_genes_2} genes</span>
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                {comparisonResult.disease_2.name}
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Unique to {comparisonResult.disease_2.name} ({comparisonResult.unique_disease_2_count})
              </p>

              <div className="genes-tag-cloud">
                {comparisonResult.unique_disease_2.length === 0 ? (
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>None</span>
                ) : (
                  comparisonResult.unique_disease_2.map((g, i) => (
                    <span key={i} className="tag-pill" style={{ background: '#ffffff' }}>
                      {g}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
