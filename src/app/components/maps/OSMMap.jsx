// components/maps/OSMMap.jsx
'use client';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function OSMMap({ 
  coverageAreas = [], 
  offices = [], 
  userLocation = null, 
  center = { lat: 40.7128, lng: -74.0060 }, 
  zoom = 12 
}) {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    leafletMap.current = L.map(mapRef.current).setView([center.lat, center.lng], zoom);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(leafletMap.current);

    // Add coverage areas
    coverageAreas.forEach(area => {
      if (area.geometry?.coordinates?.length) {
        const polygon = L.polygon(area.geometry.coordinates[0].map(coord => [coord[1], coord[0]]), {
          color: area.color || '#4285F4',
          weight: 3,
          opacity: 0.8,
          fillColor: area.color || '#4285F4',
          fillOpacity: 0.35,
        }).addTo(leafletMap.current);

        // Add tooltip
        polygon.bindTooltip(area.name, {
          permanent: false,
          direction: 'center'
        });
      }
    });

    // Add offices
    offices.forEach(office => {
      if (office.location?.coordinates?.length === 2) {
        const marker = L.marker([office.location.coordinates[1], office.location.coordinates[0]]).addTo(leafletMap.current);
        marker.bindPopup(`
          <div>
            <strong>${office.name}</strong><br/>
            ${office.phone}<br/>
            ${office.email}
          </div>
        `);
      }
    });

    // Add user location marker
    if (userLocation) {
      L.marker([userLocation.lat, userLocation.lng], {
        icon: L.divIcon({
          className: 'user-location-marker',
          html: '<div style="background-color: #EA4335; width: 12px; height: 12px; border-radius: 50%; border: 3px solid #B31412; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>',
          iconSize: [18, 18],
          iconAnchor: [9, 9]
        })
      }).addTo(leafletMap.current).bindTooltip('Your Location', {
        permanent: false,
        direction: 'top'
      });
    }

    // Cleanup on unmount
    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [coverageAreas, offices, userLocation, center, zoom]);

  // Update map when center or zoom changes
  useEffect(() => {
    if (leafletMap.current) {
      leafletMap.current.setView([center.lat, center.lng], zoom);
    }
  }, [center, zoom]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full"
      style={{ minHeight: '400px' }}
    />
  );
}