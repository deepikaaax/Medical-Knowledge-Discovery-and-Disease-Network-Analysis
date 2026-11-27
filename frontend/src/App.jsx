import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DiseaseDetailModal from './components/DiseaseDetailModal';
import Dashboard from './pages/Dashboard';
import DiseaseSearch from './pages/DiseaseSearch';
import DiseaseNetwork from './pages/DiseaseNetwork';
import DiseaseComparison from './pages/DiseaseComparison';
import GeneExplorer from './pages/GeneExplorer';
import Analytics from './pages/Analytics';
import ResearchPapers from './pages/ResearchPapers';
import './App.css';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [activeModalDiseaseId, setActiveModalDiseaseId] = useState(null);
  const [compareDisease1, setCompareDisease1] = useState(null);
  const [compareDisease2, setCompareDisease2] = useState(null);
  const [searchInitialQuery, setSearchInitialQuery] = useState('');

  const handleSelectDisease = (id) => {
    setActiveModalDiseaseId(id);
  };

  const handleCloseModal = () => {
    setActiveModalDiseaseId(null);
  };

  const handleSelectCompare = (diseaseId) => {
    setCompareDisease1(diseaseId);
    setCurrentTab('compare');
  };

  const handleQuickSearch = (query) => {
    setSearchInitialQuery(query);
    setCurrentTab('search');
  };

  const renderActivePage = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <Dashboard
            setCurrentTab={setCurrentTab}
            onSelectDisease={handleSelectDisease}
            onQuickCompare={handleSelectCompare}
          />
        );
      case 'search':
        return (
          <DiseaseSearch
            onSelectDisease={handleSelectDisease}
            initialQuery={searchInitialQuery}
          />
        );
      case 'network':
        return (
          <DiseaseNetwork
            onSelectDisease={handleSelectDisease}
            onSelectCompare={handleSelectCompare}
          />
        );
      case 'compare':
        return (
          <DiseaseComparison
            initialDisease1={compareDisease1}
            initialDisease2={compareDisease2}
            onSelectDisease={handleSelectDisease}
          />
        );
      case 'genes':
        return (
          <GeneExplorer
            onSelectDisease={handleSelectDisease}
          />
        );
      case 'analytics':
        return (
          <Analytics
            onSelectDisease={handleSelectDisease}
            onSelectCompare={handleSelectCompare}
          />
        );
      case 'research':
        return (
          <ResearchPapers />
        );
      default:
        return (
          <Dashboard
            setCurrentTab={setCurrentTab}
            onSelectDisease={handleSelectDisease}
            onQuickCompare={handleSelectCompare}
          />
        );
    }
  };

  return (
    <div className="app-container">
      {/* Collapsible/Fixed Modern Healthcare Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          if (tab !== 'search') setSearchInitialQuery('');
          setCurrentTab(tab);
        }}
      />

      <div className="main-wrapper">
        {/* Modern App Header */}
        <Header
          currentTab={currentTab}
          onQuickSearch={handleQuickSearch}
        />

        {/* Main Content Area */}
        <main className="content-area">
          {renderActivePage()}
        </main>
      </div>

      {/* Disease Detail Modal */}
      {activeModalDiseaseId && (
        <DiseaseDetailModal
          diseaseId={activeModalDiseaseId}
          onClose={handleCloseModal}
          onSelectCompare={handleSelectCompare}
          onSelectDisease={handleSelectDisease}
        />
      )}
    </div>
  );
}
