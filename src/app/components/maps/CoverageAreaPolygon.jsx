// components/maps/CoverageAreaPolygon.jsx
"use client"
import { useMemo } from 'react';

export default function CoverageAreaPolygon({ area }) {
  const coordinates = useMemo(() => {
    if (!area.geometry?.coordinates?.length) return [];
    return area.geometry.coordinates[0];
  }, [area.geometry?.coordinates]);

  if (!coordinates.length) return null;

  return (
    <polygon
      points={coordinates.map(coord => `${coord[0]},${coord[1]}`).join(' ')}
      fill={area.color || '#4285F4'}
      fillOpacity="0.35"
      stroke={area.color || '#4285F4'}
      strokeWidth="3"
      strokeOpacity="0.8"
      style={{ transition: 'all 0.3s ease' }}
    />
  );
}