import React from 'react';
import { 
  LayoutDashboard, 
  Search, 
  Network, 
  GitCompare, 
  Dna, 
  BarChart3, 
  BookOpen, 
  Activity,
  AlertCircle
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'search', label: 'Disease Search', icon: Search },
  { id: 'network', label: 'Disease Network', icon: Network },
  { id: 'compare', label: 'Disease Comparison', icon: GitCompare },
  { id: 'genes', label: 'Gene Explorer', icon: Dna },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'research', label: 'Research Papers', icon: BookOpen },
];

export default function Sidebar({ currentTab, setCurrentTab }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-icon">
          <Activity size={24} />
        </div>
        <div>
          <div className="brand-title">MedNetwork</div>
          <div className="brand-subtitle">Knowledge Discovery</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="disclaimer-badge">
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, marginBottom: '2px' }}>
            <AlertCircle size={12} />
            Academic Platform
          </div>
          Educational biomedical analysis system. Not intended for clinical medical diagnostic decisions.
        </div>
        <div style={{ color: '#475569', fontSize: '0.7rem', textAlign: 'center' }}>
          v1.0.0 • SQLite & NetworkX Engine
        </div>
      </div>
    </aside>
  );
}
