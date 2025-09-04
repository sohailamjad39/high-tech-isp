// components/ui/FeatureGrid.jsx
import React from 'react';

export default function FeatureGrid({ children, columns = 3 }) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-8 mt-12`}>
      {children}
    </div>
  );
}