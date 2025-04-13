"use client"
import React, { useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { scaleQuantize } from "d3-scale";
import { Plus, Minus } from 'lucide-react';

// Mock data - replace with API data later
const mockLocationData = {
  "California": 45,
  "New York": 30,
  "Massachusetts": 25,
  "Washington": 20,
  "Texas": 15,
  "Illinois": 10,
};

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

interface GeographyProps {
  properties: {
    name: keyof typeof mockLocationData;
    // other properties if needed
  };
  rsmKey: string;
}

export const Map: React.FC = () => {
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ coordinates: [-97, 38], zoom: 1 });

  // Update the color scale to have more contrast
  const colorScale = scaleQuantize<string>()
    .domain([0, 45])
    .range([
      "#FFEAE8", // Much lighter start
      "#FFD1CC",
      "#FFA69E",
      "#FF7B6F",
      "#FF4D3D",
      "#F28B82"  // Keep brand color as max
    ]);

  const legendData = [
    { range: "0-7", color: "#FFEAE8" },
    { range: "8-15", color: "#FFD1CC" },
    { range: "16-23", color: "#FFA69E" },
    { range: "24-31", color: "#FF7B6F" },
    { range: "32-39", color: "#FF4D3D" },
    { range: "40+", color: "#F28B82" },
  ];

  const handleMouseMove = (event: React.MouseEvent) => {
    setTooltipPosition({
      x: event.clientX + 16, // offset from cursor
      y: event.clientY - 40
    });
  };

  const handleZoomIn = () => {
    if (position.zoom >= 4) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom * 1.2 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 1) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom / 1.2 }));
  };

  const handleMoveEnd = (position: any) => {
    setPosition(position);
  };

  return (
    <div className="w-full h-full bg-[#F9F9F9] relative" onMouseMove={handleMouseMove}>
      {/* Legend */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md border border-gray-100 z-10">
        <div className="p-3">
          <div className="text-sm font-semibold text-[#111111] mb-3">Graduates</div>
          <div className="space-y-2.5">
            {legendData.map(({ range, color }) => (
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

      <ComposableMap
        projection="geoAlbersUsa"
        projectionConfig={{
          scale: 800
        }}
        style={{
          width: "100%",
          height: "auto"
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
                const stateValue = mockLocationData[geo.properties.name] || 0;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={colorScale(stateValue)}
                    stroke="#E5E5E5"
                    strokeWidth={0.75}
                    onMouseEnter={() => {
                      setTooltipContent(
                        `${geo.properties.name}: ${stateValue} grads`
                      );
                    }}
                    onMouseLeave={() => {
                      setTooltipContent("");
                    }}
                    style={{
                      default: {
                        outline: "none",
                        opacity: 0.95,
                      },
                      hover: {
                        fill: "#F9C5D1",
                        outline: "none",
                        cursor: "pointer",
                        opacity: 1,
                      },
                      pressed: {
                        outline: "none",
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      {tooltipContent && (
        <div 
          className="fixed bg-white px-4 py-2.5 rounded-lg shadow-md border border-gray-100 pointer-events-none z-50"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="font-medium text-[#111111]">{tooltipContent}</div>
        </div>
      )}
    </div>
  );
}; 