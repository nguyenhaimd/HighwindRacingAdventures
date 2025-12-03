
import React, { useEffect, useRef } from 'react';
import { ProcessedRaceData } from '../types';
import { getCoordinates } from '../utils';
import { MapPin } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface RaceMapProps {
  data: ProcessedRaceData[];
}

const RaceMap: React.FC<RaceMapProps> = ({ data }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Group races by location
  const locationGroups = React.useMemo(() => {
    const groups: Record<string, { count: number; coords: [number, number]; races: ProcessedRaceData[] }> = {};

    data.forEach(race => {
      const coords = getCoordinates(race.location);
      if (coords) {
        // Create a key based on normalized location string or coordinates to group exact spots
        const key = race.location.toLowerCase();
        
        if (!groups[key]) {
          groups[key] = { count: 0, coords, races: [] };
        }
        groups[key].count += 1;
        groups[key].races.push(race);
      }
    });
    return Object.values(groups);
  }, [data]);

  // Effect 1: Initialize Map (Runs once)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Safety check: Clean up any existing map instance on this node
    const container = mapContainerRef.current as any;
    if (container._leaflet_id) {
       container._leaflet_id = null;
       container.innerHTML = '';
    }

    // Initialize map
    const map = L.map(mapContainerRef.current).setView([38.9072, -77.0369], 7);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    mapInstanceRef.current = map;

    // Cleanup on unmount
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Effect 2: Update Markers (Runs when data changes)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing marker layers
    map.eachLayer((layer: any) => {
        if (layer instanceof L.CircleMarker || layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    // Add new markers
    locationGroups.forEach(loc => {
        const size = Math.min(30, 8 + (loc.count * 1.5)); // Dynamic size based on race count
        
        const circle = L.circleMarker(loc.coords, {
            color: '#3b82f6', // Blue border
            fillColor: '#60a5fa', // Light blue fill
            fillOpacity: 0.6,
            radius: size,
            weight: 2
        }).addTo(map);

        // Create popup content
        const raceList = loc.races.slice(0, 5).map(r => `<li>${r.year}: ${r.event}</li>`).join('');
        const remaining = loc.races.length > 5 ? `<li>...and ${loc.races.length - 5} more</li>` : '';
        
        const popupContent = `
            <div style="font-family: 'Inter', sans-serif;">
                <strong style="font-size: 14px; color: #1e293b;">${loc.races[0].location}</strong>
                <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">${loc.count} Race${loc.count > 1 ? 's' : ''}</div>
                <ul style="font-size: 11px; padding-left: 14px; color: #475569; max-height: 100px; overflow-y: auto;">
                    ${raceList}
                    ${remaining}
                </ul>
            </div>
        `;

        circle.bindPopup(popupContent);
    });

  }, [locationGroups]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-96">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-blue-500" />
                Race Locations
            </h3>
            <span className="text-xs text-slate-400">Mid-Atlantic Focus</span>
        </div>
        <div ref={mapContainerRef} className="flex-grow w-full h-full z-0" />
    </div>
  );
};

export default RaceMap;
