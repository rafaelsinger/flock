"use client"
import React, { useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { scaleQuantize } from "d3-scale";

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

  // Using quantize scale for better color distribution
  const colorScale = scaleQuantize<string>()
    .domain([0, 45])
    .range([
      "#FFF9F8",
      "#FDE2E0",
      "#FACAC7",
      "#F7B3AE",
      "#F49B95",
      "#F28B82"
    ]);

  const handleMouseMove = (event: React.MouseEvent) => {
    setTooltipPosition({
      x: event.clientX + 16, // offset from cursor
      y: event.clientY - 40
    });
  };

  return (
    <div className="w-full h-full bg-[#F9F9F9] relative" onMouseMove={handleMouseMove}>
      <ComposableMap
        projection="geoAlbersUsa"
        projectionConfig={{
          scale: 500,
          center: [0,0]
        //   center: [-96.9, 37] // Adjusted center point
        }}
      >
        <ZoomableGroup>
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
          className="fixed bg-white px-3 py-2 rounded-lg shadow-md border border-gray-100 text-sm pointer-events-none z-50"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translate(-50%, -100%)'
          }}
        >
          {tooltipContent}
        </div>
      )}
    </div>
  );
}; 