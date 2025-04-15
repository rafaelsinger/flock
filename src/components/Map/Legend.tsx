import React from 'react';

interface LegendProps {
  thresholds: number[];
  colorScale: (value: number) => string;
  max: number;
}

export const Legend: React.FC<LegendProps> = ({ thresholds, colorScale, max }) => {
  const bins = [0, ...thresholds, max];

  return (
    <div className="legend-section">
      <div className="flex flex-col gap-1">
        {bins.slice(0, -1).map((start, i) => {
          const end = bins[i + 1];
          const label = start === end ? `${start}` : `${start + 1}–${end}`;
          const color = colorScale(start + 1);
          return (
            <div key={i} className="flex items-center gap-2 text-[#333]">
              <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: color }} />
              <span>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
