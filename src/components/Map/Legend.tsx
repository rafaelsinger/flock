import * as d3 from 'd3';

interface LegendProps {
  colorScale: d3.ScaleThreshold<number, string>;
}

export const Legend: React.FC<LegendProps> = ({ colorScale }) => {
  const thresholds = colorScale.domain();
  const range = colorScale.range();

  const bins = range.map((color, i) => {
    const from = i === 0 ? 0 : thresholds[i - 1];
    const to = thresholds[i];
    let label;
    if (i === range.length - 1) {
      label = `${from}+`;
    } else if (from === to - 1) {
      label = `${from}`;
    } else {
      label = `${from}–${to - 1}`;
    }
    return { color, label };
  });

  return (
    <div className="legend-section bg-gray-50 p-2 rounded border text-xs shadow-sm">
      <div className="flex flex-col gap-1">
        {bins.map(({ color, label }, i) => (
          <div key={i} className="flex items-center gap-2 text-[#333]">
            <div
              className="w-4 h-4 rounded-sm border border-gray-300"
              style={{ backgroundColor: color }}
            />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
