'use client';
import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { scaleQuantize } from 'd3-scale';
import { Plus, Minus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

// Define the type for location data
interface LocationData {
  [state: string]: number;
}

interface Position {
  coordinates: [number, number]; // Explicitly typed as tuple with two numbers
  zoom: number;
}

interface GeographyProps {
  properties: {
    name: string;
    // other properties if needed
  };
  rsmKey: string;
}

const geoUrl = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

export const Map: React.FC<{ display?: boolean }> = ({ display = false }) => {
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState<Position>({
    coordinates: [-97, 38],
    zoom: 1,
  });

  // Fetch location data from API
  const { data: locationData, isLoading } = useQuery<LocationData>({
    queryKey: ['locationData'],
    queryFn: async () => {
      const response = await fetch('/api/users/locations');
      if (!response.ok) {
        throw new Error('Failed to fetch location data');
      }
      return response.json();
    },
    enabled: !display,
  });

  // Find the maximum value for the color scale
  const maxValue =
    Object.values(locationData || {}).reduce((max, value) => Math.max(max, value), 0) || 45; // Default to 45 if no data

  // Update the color scale to have more contrast
  const colorScale = scaleQuantize<string>().domain([0, maxValue]).range([
    '#FFEAE8', // Much lighter start
    '#FFD1CC',
    '#FFA69E',
    '#FF7B6F',
    '#FF4D3D',
    '#F28B82', // Keep brand color as max
  ]);

  // Calculate legend ranges based on the max value
  const getLegendData = () => {
    const step = Math.ceil(maxValue / 6);
    return [
      { range: `0-${step - 1}`, color: '#FFEAE8' },
      { range: `${step}-${2 * step - 1}`, color: '#FFD1CC' },
      { range: `${2 * step}-${3 * step - 1}`, color: '#FFA69E' },
      { range: `${3 * step}-${4 * step - 1}`, color: '#FF7B6F' },
      { range: `${4 * step}-${5 * step - 1}`, color: '#FF4D3D' },
      { range: `${5 * step}+`, color: '#F28B82' },
    ];
  };

  const legendData = getLegendData();

  const handleMouseMove = (event: React.MouseEvent) => {
    setTooltipPosition({
      x: event.clientX + 16, // offset from cursor
      y: event.clientY - 40,
    });
  };

  const handleZoomIn = () => {
    if (position.zoom >= 4) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.2 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 1) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.2 }));
  };

  const handleMoveEnd = (newPosition: Position) => {
    setPosition(newPosition);
  };

  // Render skeleton for legend items
  const renderLegendSkeleton = () => {
    return Array(6)
      .fill(0)
      .map((_, index) => (
        <div key={index} className="flex items-center gap-2.5">
          <div className="w-4 h-4 rounded border border-gray-100 bg-gray-200 animate-pulse" />
          <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
        </div>
      ));
  };

  return (
    <div className="w-full h-full bg-[#F9F9F9] relative" onMouseMove={handleMouseMove}>
      {/* Legend */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md border border-gray-100 z-10">
        <div className="p-3">
          <div className="text-sm font-semibold text-[#111111] mb-3">Graduates</div>
          <div className="space-y-2.5">
            {isLoading
              ? renderLegendSkeleton()
              : legendData.map(({ range, color }) => (
                  <div key={range} className="flex items-center gap-2.5">
                    <div
                      className="w-4 h-4 rounded border border-gray-100"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm text-[#333333]">{range}</span>
                  </div>
                ))}
          </div>
        </div>
      </div>

      {/* Update Zoom Controls */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-white rounded-lg shadow-md border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
          disabled={position.zoom >= 4}
        >
          <Plus className="w-4 h-4 text-[#333333]" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-white rounded-lg shadow-md border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
          disabled={position.zoom <= 1}
        >
          <Minus className="w-4 h-4 text-[#333333]" />
        </button>
      </div>

      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F28B82]"></div>
        </div>
      ) : (
        <ComposableMap
          projection="geoAlbersUsa"
          projectionConfig={{
            scale: 800,
          }}
          style={{
            width: '100%',
            height: 'auto',
          }}
        >
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates}
            onMoveEnd={handleMoveEnd}
            maxZoom={4}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo: GeographyProps) => {
                  const stateValue = locationData?.[geo.properties.name] || 0;
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={colorScale(stateValue)}
                      stroke="#E5E5E5"
                      strokeWidth={0.75}
                      onMouseEnter={() => {
                        setTooltipContent(`${geo.properties.name}: ${stateValue} grads`);
                      }}
                      onMouseLeave={() => {
                        setTooltipContent('');
                      }}
                      style={{
                        default: {
                          outline: 'none',
                          opacity: 0.95,
                        },
                        hover: {
                          fill: '#F9C5D1',
                          outline: 'none',
                          cursor: 'pointer',
                          opacity: 1,
                        },
                        pressed: {
                          outline: 'none',
                        },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      )}
      {tooltipContent && (
        <div
          className="fixed bg-white px-4 py-2.5 rounded-lg shadow-md border border-gray-100 pointer-events-none z-50"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="font-medium text-[#111111]">{tooltipContent}</div>
        </div>
      )}
    </div>
  );
};
