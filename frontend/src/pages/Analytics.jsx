import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  Network, 
  Share2, 
  Layers, 
  TrendingUp, 
  Activity, 
  Dna, 
  ArrowUpRight 
} from 'lucide-react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import api from '../services/api';
import CategoryBadge, { getCategoryColor } from '../components/CategoryBadge';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function Analytics({ onSelectDisease, onSelectCompare }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getAnalytics()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to compute analytics from backend.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="loading-box">
        <div className="spinner"></div>
        <p>Synthesizing topological and genetic comorbidity statistics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#e11d48' }}>
        {error}
      </div>
    );
  }

  // Degree Distribution Bar Chart Data
  const topDegreeDiseases = data.degree_distribution.slice(0, 10);
  const barData = {
    labels: topDegreeDiseases.map((d) => d.name.length > 18 ? d.name.substring(0, 18) + '...' : d.name),
    datasets: [
      {
        label: 'Number of Significant Disease Connections',
        data: topDegreeDiseases.map((d) => d.relationships),
        backgroundColor: '#0284c7',
        borderRadius: 6,
        hoverBackgroundColor: '#0369a1',
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items) => topDegreeDiseases[items[0].dataIndex].name,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: '#64748b' },
        grid: { color: '#f1f5f9' },
      },
      x: {
        ticks: { 
          color: '#64748b', 
          font: { size: 10 },
          maxRotation: 45,
          minRotation: 25,
        },
        grid: { display: false },
      },
    },
  };

  // Category Doughnut Data
  const catLabels = data.category_distribution.map((c) => c.category);
  const catCounts = data.category_distribution.map((c) => c.count);
  const catColors = catLabels.map((c) => getCategoryColor(c));

  const doughnutData = {
    labels: catLabels,
    datasets: [
      {
        data: catCounts,
        backgroundColor: catColors,
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <BarChart3 size={26} color="#0284c7" /> Biomedical Analytics & Network Topology
        </h1>
        <p className="page-subtitle">
          Comprehensive quantitative assessment of graph density, connectivity hubs, and comorbid genetic overlap.
        </p>
      </div>

      {/* Network Metrics Top Cards */}
      <div className="stat-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Graph Nodes</div>
            <div className="stat-value">{data.network_metrics.total_nodes}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <Activity size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Graph Edges</div>
            <div className="stat-value">{data.network_metrics.total_edges}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#f3e8ff', color: '#7c3aed' }}>
            <Share2 size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Network Density</div>
            <div className="stat-value" style={{ fontFamily: 'var(--font-mono)' }}>
              {data.network_metrics.density}
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#ecfdf5', color: '#059669' }}>
            <Network size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Avg Clustering Coeff.</div>
            <div className="stat-value" style={{ fontFamily: 'var(--font-mono)' }}>
              {data.network_metrics.average_clustering}
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}>
            <TrendingUp size={24} />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.2fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Relationships Distribution Chart */}
        <div className="card">
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
              Degree Distribution: Most Connected Phenotypes
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Top 10 diseases ranked by number of comorbid genetic connections
            </p>
          </div>
          <div style={{ height: '300px' }}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="card">
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
              Disease Category Proportions
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Taxonomic classification of cataloged pathologies
            </p>
          </div>
          <div style={{ height: '240px', position: 'relative' }}>
            <Doughnut 
              data={doughnutData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom', labels: { boxWidth: 10, padding: 8, font: { size: 10 } } }
                },
                cutout: '60%'
              }} 
            />
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Highest Shared Genes Pairs */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                Highest Shared Genetic Overlaps
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Pairs exhibiting maximum Jaccard similarity index
              </p>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Disease Pair</th>
                  <th>Shared Genes</th>
                  <th>Jaccard Index</th>
                </tr>
              </thead>
              <tbody>
                {data.highest_shared_genes.map((p, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>
                        {p.disease_1}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        ↔ {p.disease_2}
                      </div>
                    </td>
                    <td>
                      <span className="tag-pill" style={{ background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0', fontWeight: 700 }}>
                        {p.shared_genes_count} Genes
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0284c7' }}>
                        J={p.jaccard_score.toFixed(4)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Complete Node Ranking */}
        <div className="card">
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
              Full Degree Connectivity Ranking
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Network centrality and connected edges count per entity
            </p>
          </div>

          <div className="table-container" style={{ maxHeight: '350px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Disease Name</th>
                  <th>Category</th>
                  <th>Connections</th>
                </tr>
              </thead>
              <tbody>
                {data.degree_distribution.map((d, idx) => (
                  <tr 
                    key={idx}
                    onClick={() => onSelectDisease && onSelectDisease(idx + 1)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ fontWeight: 700, color: '#94a3b8' }}>#{idx + 1}</td>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{d.name}</td>
                    <td><CategoryBadge category={d.category} /></td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#0284c7' }}>
                        {d.relationships} links
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
