import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  Dna, 
  GitFork, 
  Stethoscope, 
  TrendingUp, 
  Clock, 
  ArrowRight,
  Sparkles,
  PieChart as PieIcon,
  Layers
} from 'lucide-react';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement 
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import api from '../services/api';
import CategoryBadge, { getCategoryColor } from '../components/CategoryBadge';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function Dashboard({ setCurrentTab, onSelectDisease, onQuickCompare }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await api.getStats();
      setStats(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Unable to load database metrics. Ensure backend server is running.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-box">
        <div className="spinner"></div>
        <p>Calculating database metrics and graph topology...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: '#e11d48', marginBottom: '1rem', fontWeight: 600 }}>{error}</p>
        <button className="btn-primary" onClick={fetchStats}>Retry Connection</button>
      </div>
    );
  }

  // Chart data for Disease Categories
  const categoryLabels = stats.category_distribution.map((c) => c.category);
  const categoryCounts = stats.category_distribution.map((c) => c.count);
  const categoryColors = categoryLabels.map((c) => getCategoryColor(c));

  const doughnutData = {
    labels: categoryLabels,
    datasets: [
      {
        data: categoryCounts,
        backgroundColor: categoryColors,
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 12,
          font: { size: 11, family: "'Inter', sans-serif" },
        },
      },
    },
    cutout: '68%',
  };

  return (
    <div>
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
        color: '#ffffff',
        padding: '1.75rem 2rem',
        borderRadius: '16px',
        marginBottom: '2rem',
        boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.35)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ maxWidth: '650px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', background: 'rgba(255,255,255,0.15)', display: 'inline-flex', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
            <Sparkles size={14} /> Medical Knowledge Discovery Engine
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Biomedical Disease Network & Genetic Discovery
          </h1>
          <p style={{ fontSize: '0.95rem', opacity: 0.9, lineHeight: 1.5 }}>
            Explore phenotypic profiles, quantify disease comorbidities using Jaccard genetic similarity, and analyze disease cluster topologies.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            className="btn-secondary" 
            style={{ border: 'none', color: '#0369a1' }}
            onClick={() => setCurrentTab('network')}
          >
            <GitFork size={16} /> Explore Network
          </button>
          <button 
            className="btn-secondary"
            style={{ background: 'rgba(255,255,255,0.2)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.4)' }}
            onClick={() => setCurrentTab('compare')}
          >
            Disease Comparison
          </button>
        </div>
      </div>

      {/* Dynamic Database Statistics Grid */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Total Diseases</div>
            <div className="stat-value">{stats.total_diseases}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <Activity size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Genetic Biomarkers</div>
            <div className="stat-value">{stats.total_genes}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#ccfbf1', color: '#0d9488' }}>
            <Dna size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Calculated Relationships</div>
            <div className="stat-value">{stats.total_relationships}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#f3e8ff', color: '#7c3aed' }}>
            <GitFork size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Clinical Symptoms</div>
            <div className="stat-value">{stats.total_symptoms}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#ffe4e6', color: '#e11d48' }}>
            <Stethoscope size={24} />
          </div>
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div className="dashboard-grid">
        {/* Most Connected Diseases */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                Most Connected Disease Hubs
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Diseases exhibiting the highest degree of shared genetic etiology
              </p>
            </div>
            <button 
              className="btn-secondary" 
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
              onClick={() => setCurrentTab('analytics')}
            >
              Full Analytics <ArrowRight size={14} />
            </button>
          </div>

          <div className="connected-list">
            {stats.most_connected_diseases.map((d, index) => (
              <div 
                key={d.id} 
                className="connected-item"
                onClick={() => onSelectDisease && onSelectDisease(d.id)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: index === 0 ? '#fef3c7' : '#f1f5f9',
                    color: index === 0 ? '#d97706' : '#64748b',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem'
                  }}>
                    #{index + 1}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>
                      {d.name}
                    </div>
                    <CategoryBadge category={d.category} />
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ 
                    background: '#e0f2fe', 
                    color: '#0369a1', 
                    fontWeight: 700, 
                    padding: '0.25rem 0.65rem', 
                    borderRadius: '9999px',
                    fontSize: '0.8rem'
                  }}>
                    {d.connections} Connections
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown Chart */}
        <div className="card">
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
              Disease Categories
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Taxonomy distribution across {stats.total_diseases} cataloged conditions
            </p>
          </div>

          <div style={{ height: '240px', position: 'relative' }}>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>

          <div style={{ textAlign: 'center', marginTop: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Dynamic breakdown generated from SQLite <code>diseases</code> table
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Searches & Top Similarity Pairs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Top Similarity Pairs */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <TrendingUp size={18} color="#0284c7" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
              Strongest Genetic Overlaps
            </h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
            Highest Jaccard similarity scores between disease pairs
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {stats.top_pairs.map((pair, idx) => (
              <div 
                key={idx} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem', 
                  background: '#f8fafc', 
                  borderRadius: '8px',
                  border: '1px solid #f1f5f9'
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>
                    {pair.disease_1}
                  </span>
                  <span style={{ color: '#94a3b8', margin: '0 0.35rem' }}>↔</span>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>
                    {pair.disease_2}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: '#0284c7', fontWeight: 700, fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
                    J={pair.jaccard_score.toFixed(3)}
                  </span>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    {pair.shared_genes_count} shared genes
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Searched Diseases */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Clock size={18} color="#d97706" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
              Recent Searches & Inquiries
            </h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
            Live tracking from <code>search_history</code> database table
          </p>

          {stats.recent_searches.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
              No search history recorded yet. Use the search bar to query diseases!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {stats.recent_searches.map((s, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem', 
                    background: '#f8fafc', 
                    borderRadius: '8px',
                    border: '1px solid #f1f5f9',
                    cursor: s.disease_id ? 'pointer' : 'default'
                  }}
                  onClick={() => s.disease_id && onSelectDisease && onSelectDisease(s.disease_id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>
                      "{s.query}"
                    </div>
                    {s.category && <CategoryBadge category={s.category} />}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {new Date(s.searched_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
