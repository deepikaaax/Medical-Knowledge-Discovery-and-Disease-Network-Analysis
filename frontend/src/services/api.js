import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Stats & Dashboard
  getStats: async () => {
    const res = await apiClient.get('/stats');
    return res.data;
  },

  // Diseases
  getDiseases: async (category = null) => {
    const params = category ? { category } : {};
    const res = await apiClient.get('/diseases', { params });
    return res.data;
  },

  searchDiseases: async (query) => {
    const res = await apiClient.get('/diseases/search', { params: { q: query } });
    return res.data;
  },

  getDiseaseById: async (id) => {
    const res = await apiClient.get(`/diseases/${id}`);
    return res.data;
  },

  getDiseaseGenes: async (id) => {
    const res = await apiClient.get(`/diseases/${id}/genes`);
    return res.data;
  },

  getDiseaseSymptoms: async (id) => {
    const res = await apiClient.get(`/diseases/${id}/symptoms`);
    return res.data;
  },

  getRelatedDiseases: async (id) => {
    const res = await apiClient.get(`/diseases/${id}/related`);
    return res.data;
  },

  // Network Visualization
  getNetwork: async (threshold = 0.05, category = null) => {
    const params = { threshold };
    if (category) params.category = category;
    const res = await apiClient.get('/network', { params });
    return res.data;
  },

  // Disease Comparison
  compareDiseases: async (diseaseId1, diseaseId2) => {
    const res = await apiClient.post('/compare', {
      disease_id_1: parseInt(diseaseId1),
      disease_id_2: parseInt(diseaseId2),
    });
    return res.data;
  },

  // Genes
  getGenes: async (query = null) => {
    const params = query ? { q: query } : {};
    const res = await apiClient.get('/genes', { params });
    return res.data;
  },

  getGeneById: async (id) => {
    const res = await apiClient.get(`/genes/${id}`);
    return res.data;
  },

  // Analytics
  getAnalytics: async () => {
    const res = await apiClient.get('/analytics');
    return res.data;
  },

  // Research Papers
  searchResearch: async (query) => {
    const res = await apiClient.get('/research/search', { params: { q: query } });
    return res.data;
  },

  // Health
  checkHealth: async () => {
    const res = await apiClient.get('/health');
    return res.data;
  },
};

export default api;
