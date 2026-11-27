import React from 'react';
import { Search, Database, ShieldCheck } from 'lucide-react';

export default function Header({ currentTab, onQuickSearch }) {
  const [query, setQuery] = React.useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      onQuickSearch(query.trim());
      setQuery('');
    }
  };

  const getPageTitle = () => {
    switch (currentTab) {
      case 'dashboard': return 'Medical Knowledge Dashboard';
      case 'search': return 'Disease Search & Phenotypic Profiler';
      case 'network': return 'Disease Relationship Network Visualizer';
      case 'compare': return 'Bigenic & Polygenic Disease Comparison';
      case 'genes': return 'Gene Explorer & Biomarker Atlas';
      case 'analytics': return 'Network Topology & Statistical Analytics';
      case 'research': return 'Scientific Literature & PubMed Discovery';
      default: return 'Medical Knowledge Discovery';
    }
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
            {getPageTitle()}
          </h2>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Biomedical Knowledge Graph & Genetic Association Exploration
          </div>
        </div>
      </div>

      <div className="header-right">
        <div className="header-search">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Quick search disease or gene (Press Enter)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="system-status">
          <span className="status-dot"></span>
          <span>Knowledge Engine Active</span>
        </div>
      </div>
    </header>
  );
}
