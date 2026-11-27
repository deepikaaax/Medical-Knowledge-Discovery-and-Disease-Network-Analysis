import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import { 
  Network, 
  Sliders, 
  Filter, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Info, 
  Dna, 
  GitFork,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';
import CategoryBadge, { getCategoryColor } from '../components/CategoryBadge';

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

export default function DiseaseNetwork({ onSelectDisease, onSelectCompare }) {
  const cyRef = useRef(null);
  const containerRef = useRef(null);

  const [threshold, setThreshold] = useState(0.08);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [layoutName, setLayoutName] = useState('cose');
  const [networkData, setNetworkData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNetwork();
  }, [threshold, selectedCategory]);

  const fetchNetwork = async () => {
    setLoading(true);
    setError(null);
    try {
      const catParam = selectedCategory === 'All Categories' ? null : selectedCategory;
      const data = await api.getNetwork(threshold, catParam);
      setNetworkData(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch network graph from NetworkX backend.');
      setLoading(false);
    }
  };

  // Initialize and update Cytoscape instance
  useEffect(() => {
    if (!containerRef.current || !networkData) return;

    // Destroy existing cytoscape instance if any
    if (cyRef.current) {
      cyRef.current.destroy();
    }

    const elements = [
      ...networkData.elements.nodes,
      ...networkData.elements.edges
    ];

    const cy = cytoscape({
      container: containerRef.current,
      elements: elements,
      boxSelectionEnabled: false,
      autounselectify: false,
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(name)',
            'background-color': (ele) => getCategoryColor(ele.data('category')),
            'color': '#1e293b',
            'font-size': '11px',
            'font-family': 'Inter, sans-serif',
            'font-weight': 600,
            'text-valign': 'bottom',
            'text-margin-y': 6,
            'text-background-color': '#ffffff',
            'text-background-opacity': 0.85,
            'text-background-padding': '3px',
            'text-background-shape': 'roundrectangle',
            'width': (ele) => 34 + Math.min(ele.data('degree') * 3, 24),
            'height': (ele) => 34 + Math.min(ele.data('degree') * 3, 24),
            'border-width': 2,
            'border-color': '#ffffff',
            'transition-property': 'background-color, border-color, width, height',
            'transition-duration': '0.2s',
          },
        },
        {
          selector: 'node:selected',
          style: {
            'border-color': '#0284c7',
            'border-width': 4,
            'shadow-blur': 12,
            'shadow-color': 'rgba(2, 132, 199, 0.5)',
            'shadow-opacity': 0.8,
          },
        },
        {
          selector: 'edge',
          style: {
            'width': (ele) => Math.max(ele.data('weight') * 8, 1.5),
            'line-color': '#cbd5e1',
            'curve-style': 'bezier',
            'opacity': 0.75,
            'transition-property': 'line-color, opacity, width',
            'transition-duration': '0.2s',
          },
        },
        {
          selector: 'edge:selected',
          style: {
            'line-color': '#0284c7',
            'width': 4,
            'opacity': 1,
          },
        },
        {
          selector: '.highlighted',
          style: {
            'border-color': '#0284c7',
            'border-width': 4,
          },
        },
        {
          selector: '.edge-highlighted',
          style: {
            'line-color': '#0284c7',
            'opacity': 1,
            'width': 4,
          },
        },
      ],
      layout: {
        name: layoutName,
        animate: true,
        animationDuration: 500,
        padding: 50,
      },
    });

    // Node click handler
    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      setSelectedNode(node.data());
      setSelectedEdge(null);

      // Highlight connected edges & neighbors
      cy.elements().removeClass('highlighted edge-highlighted');
      node.addClass('highlighted');
      node.connectedEdges().addClass('edge-highlighted');
      node.neighborhood().nodes().addClass('highlighted');
    });

    // Edge click handler
    cy.on('tap', 'edge', (evt) => {
      const edge = evt.target;
      setSelectedEdge(edge.data());
      setSelectedNode(null);

      cy.elements().removeClass('highlighted edge-highlighted');
      edge.addClass('edge-highlighted');
    });

    // Background click handler to deselect
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        setSelectedNode(null);
        setSelectedEdge(null);
        cy.elements().removeClass('highlighted edge-highlighted');
      }
    });

    cyRef.current = cy;

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, [networkData, layoutName]);

  const handleZoomIn = () => cyRef.current && cyRef.current.zoom(cyRef.current.zoom() * 1.25);
  const handleZoomOut = () => cyRef.current && cyRef.current.zoom(cyRef.current.zoom() * 0.8);
  const handleFit = () => cyRef.current && cyRef.current.fit(50);
  const handleResetLayout = () => {
    if (cyRef.current) {
      cyRef.current.layout({ name: layoutName, animate: true }).run();
    }
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '1.25rem' }}>
        <h1 className="page-title">
          <Network size={26} color="#0284c7" /> Disease Relationship Network Graph
        </h1>
        <p className="page-subtitle">
          Interactive NetworkX topology visualizing shared gene associations and Jaccard similarity metrics.
        </p>
      </div>

      <div className="network-layout">
        {/* Main Network Canvas */}
        <div className="card network-main-card">
          {/* Controls Bar */}
          <div className="network-controls">
            {/* Threshold Slider */}
            <div className="control-group">
              <Sliders size={16} color="#64748b" />
              <div className="threshold-slider">
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                  Similarity Threshold:
                </span>
                <input
                  type="range"
                  min="0.0"
                  max="0.30"
                  step="0.02"
                  value={threshold}
                  onChange={(e) => setThreshold(parseFloat(e.target.value))}
                />
                <span style={{ 
                  fontFamily: 'var(--font-mono)', 
                  fontWeight: 700, 
                  fontSize: '0.8rem',
                  color: '#0284c7',
                  background: '#f0f9ff',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  border: '1px solid #bae6fd'
                }}>
                  {threshold.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Category Filter */}
            <div className="control-group">
              <Filter size={16} color="#64748b" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Layout selector */}
            <div className="control-group">
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Layout:</span>
              <select
                value={layoutName}
                onChange={(e) => setLayoutName(e.target.value)}
                style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              >
                <option value="cose">Force-Directed (Cose)</option>
                <option value="concentric">Concentric</option>
                <option value="circle">Circular</option>
                <option value="breadthfirst">Breadth-First</option>
              </select>
            </div>

            {/* Zoom / Reset Buttons */}
            <div className="control-group">
              <button className="btn-secondary" onClick={handleZoomIn} title="Zoom In" style={{ padding: '0.35rem 0.5rem' }}>
                <ZoomIn size={15} />
              </button>
              <button className="btn-secondary" onClick={handleZoomOut} title="Zoom Out" style={{ padding: '0.35rem 0.5rem' }}>
                <ZoomOut size={15} />
              </button>
              <button className="btn-secondary" onClick={handleFit} title="Fit to Canvas" style={{ padding: '0.35rem 0.5rem' }}>
                <Maximize2 size={15} />
              </button>
              <button className="btn-secondary" onClick={handleResetLayout} title="Re-run Layout" style={{ padding: '0.35rem 0.5rem' }}>
                <RotateCcw size={15} />
              </button>
            </div>
          </div>

          {/* Cytoscape Container */}
          <div ref={containerRef} className="cytoscape-container">
            {loading && (
              <div className="loading-box" style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', zIndex: 10 }}>
                <div className="spinner"></div>
                <p>Constructing graph network with NetworkX...</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info Card */}
        <div className="card network-sidebar-card">
          {/* Selected Node Details */}
          {selectedNode ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <CategoryBadge category={selectedNode.category} />
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Node Selected</span>
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                {selectedNode.name}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.5', marginBottom: '1rem' }}>
                {selectedNode.description}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.65rem', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Network Degree</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0284c7' }}>
                    {selectedNode.degree}
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.65rem', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Associated Genes</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0d9488' }}>
                    {selectedNode.gene_count}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.35rem' }}>
                  Associated Genes:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {selectedNode.genes && selectedNode.genes.map((g, i) => (
                    <span key={i} className="tag-pill" style={{ fontSize: '0.75rem' }}>
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              <button 
                className="btn-primary" 
                style={{ width: '100%', fontSize: '0.85rem', marginBottom: '0.5rem' }}
                onClick={() => onSelectDisease(selectedNode.id)}
              >
                View Full Disease Profile <ArrowRight size={14} />
              </button>

              {onSelectCompare && (
                <button 
                  className="btn-secondary" 
                  style={{ width: '100%', fontSize: '0.85rem' }}
                  onClick={() => onSelectCompare(selectedNode.id)}
                >
                  Compare with Another Disease
                </button>
              )}
            </div>
          ) : selectedEdge ? (
            /* Selected Edge Details */
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <GitFork size={16} color="#0284c7" />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0284c7' }}>
                  Relationship Edge Selected
                </span>
              </div>

              <div style={{ background: '#f0f9ff', padding: '1rem', borderRadius: '8px', border: '1px solid #bae6fd', textAlign: 'center', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: 600 }}>Jaccard Similarity</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0284c7', fontFamily: 'var(--font-mono)' }}>
                  {selectedEdge.weight.toFixed(4)}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                  Shared Genes: {selectedEdge.shared_genes_count}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>
                  Overlapping Genetic Etiology:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {selectedEdge.shared_genes && selectedEdge.shared_genes.map((g, i) => (
                    <span key={i} className="tag-pill" style={{ fontSize: '0.8rem', color: '#0369a1', background: '#e0f2fe' }}>
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Default: Network Overview & Metrics */
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Info size={16} color="#0284c7" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                  Network Topology Metrics
                </h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
                Computed dynamically using NetworkX based on Jaccard genetic overlap.
              </p>

              {networkData && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Active Nodes (Diseases)</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                      {networkData.metrics.total_nodes}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Active Edges (Connections)</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                      {networkData.metrics.total_edges}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Network Density</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0284c7', fontFamily: 'var(--font-mono)' }}>
                      {networkData.metrics.density}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Average Node Degree</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                      {networkData.metrics.average_degree}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Clustering Coefficient</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
                      {networkData.metrics.average_clustering}
                    </span>
                  </div>
                </div>
              )}

              <div style={{ marginTop: '1.5rem', padding: '0.85rem', background: '#f1f5f9', borderRadius: '8px', fontSize: '0.75rem', color: '#475569', lineHeight: '1.4' }}>
                <strong>Tip:</strong> Click any disease node to highlight adjacent neighbors and inspect genetic composition. Drag to adjust positions, and use the similarity threshold slider above to eliminate weak links.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
