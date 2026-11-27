import React from 'react';

export const getCategoryClass = (category) => {
  if (!category) return 'badge-gray';
  const cat = category.toLowerCase();
  if (cat.includes('metabolic') || cat.includes('endocrine')) return 'badge-blue';
  if (cat.includes('cardio')) return 'badge-red';
  if (cat.includes('oncology') || cat.includes('cancer')) return 'badge-purple';
  if (cat.includes('respiratory')) return 'badge-cyan';
  if (cat.includes('neuro')) return 'badge-amber';
  if (cat.includes('autoimmune')) return 'badge-green';
  if (cat.includes('renal') || cat.includes('kidney')) return 'badge-indigo';
  if (cat.includes('musculo') || cat.includes('skeletal')) return 'badge-pink';
  if (cat.includes('psychiatric')) return 'badge-amber';
  return 'badge-gray';
};

export const getCategoryColor = (category) => {
  if (!category) return '#64748b';
  const cat = category.toLowerCase();
  if (cat.includes('metabolic') || cat.includes('endocrine')) return '#0284c7';
  if (cat.includes('cardio')) return '#e11d48';
  if (cat.includes('oncology') || cat.includes('cancer')) return '#7c3aed';
  if (cat.includes('respiratory')) return '#0891b2';
  if (cat.includes('neuro')) return '#d97706';
  if (cat.includes('autoimmune')) return '#059669';
  if (cat.includes('renal') || cat.includes('kidney')) return '#4f46e5';
  if (cat.includes('musculo') || cat.includes('skeletal')) return '#db2777';
  if (cat.includes('psychiatric')) return '#ca8a04';
  return '#64748b';
};

export default function CategoryBadge({ category }) {
  return (
    <span className={`badge ${getCategoryClass(category)}`}>
      {category}
    </span>
  );
}
