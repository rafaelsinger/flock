'use client';
import * as React from 'react';
import Map, { Source, Layer, Marker, LayerProps, ViewState } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useQuery } from '@tanstack/react-query';
import { scaleQuantize } from 'd3-scale';
import { Plus, Minus } from 'lucide-react';
import center from '@turf/center';

// Types
interface LocationData {
  [location: string]: number; // states or cities
}

const stateGeoUrl =
  'https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json';

// Mock city coordinates for demo
const CITY_COORDINATES: { [city: string]: [number, number] } = {
  'Los Angeles': [-118.2437, 34.0522],
  'San Francisco': [-122.4194, 37.7749],
  'San Diego': [-117.1611, 32.7157],
  Sacramento: [-121.4944, 38.5816],
  Fresno: [-119.7871, 36.7378],
  Oakland: [-122.2712, 37.8044],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const layerStyle = (colorExpression: any): LayerProps => ({
  id: 'states-fill',
  type: 'fill',
  paint: {
    'fill-color': colorExpression,
    'fill-opacity': 0.8,
    'fill-outline-color': '#E5E5E5',
  },
});

const hoverLayerStyle: LayerProps = {
  id: 'states-hover',
  type: 'line' as const,
  paint: {
    'line-color': '#333333',
    'line-width': 2,
  },
};

export const FlockMap: React.FC = () => {
  const [viewState, setViewState] = React.useState({
    longitude: -97,
    latitude: 38,
    zoom: 3,
    transitionDuration: 500,
  });

  const [selectedState, setSelectedState] = React.useState<string | null>(null);
  const [hoveredStateId, setHoveredStateId] = React.useState<number | null>(null);
  const [hoverInfo, setHoverInfo] = React.useState<{
    name: string;
    value: number;
    x: number;
    y: number;
  } | null>(null);

  const { data: locationData, isLoading } = useQuery<LocationData>({
    queryKey: ['locationData', selectedState],
    queryFn: async () => {
      if (!selectedState) {
        const response = await fetch('/api/users/locations');
        if (!response.ok) throw new Error('Failed to fetch location data');
        return response.json();
      } else {
        // TODO: replace with actual API call
        // Fetch city-level data (mocked here)
        // const response = await fetch(`/api/users/locations?state=${selectedState}`);
        // if (!response.ok) throw new Error('Failed to fetch city data');
        // return response.json();
        return {
          'Los Angeles': 400,
          'San Francisco': 320,
          'San Diego': 250,
          Sacramento: 150,
          Fresno: 100,
          Oakland: 90,
        };
      }
    },
    enabled: true,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [geoJson, setGeoJson] = React.useState<any>(null);

  React.useEffect(() => {
    fetch(stateGeoUrl)
      .then((res) => res.json())
      .then((data) => setGeoJson(data));
  }, []);

  const maxValue =
    Object.values(locationData || {}).reduce((max, value) => Math.max(max, value), 0) || 45;

  const colorScale = scaleQuantize<string>()
    .domain([0, maxValue])
    .range(['#FFEAE8', '#FFD1CC', '#FFA69E', '#FF7B6F', '#FF4D3D', '#F28B82']);

  const fillColorExpression = [
    'match',
    ['get', 'name'],
    ...(locationData && !selectedState
      ? Object.entries(locationData).flatMap(([state, value]) => [state, colorScale(value)])
      : []),
    '#EEE',
  ];

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

  const renderLegendSkeleton = () =>
    Array(6)
      .fill(0)
      .map((_, index) => (
        <div key={index} className="flex items-center gap-2.5">
          <div className="w-4 h-4 rounded border border-gray-100 bg-gray-200 animate-pulse" />
          <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
        </div>
      ));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleStateClick = (feature: any) => {
    const clickedState = feature.properties?.name;
    if (!clickedState) return;

    const centroid = center(feature);
    const [lon, lat] = centroid.geometry.coordinates;

    setSelectedState(clickedState);
    setViewState({
      longitude: lon,
      latitude: lat,
      zoom: 6,
      transitionDuration: 500,
    });
  };

  const handleViewStateChange = (evt: { viewState: ViewState }) => {
    setViewState((prev) => ({
      ...evt.viewState,
      transitionDuration: prev.transitionDuration,
    }));
  };

  return (
    <div className="w-full h-full relative">
      <Map
        {...viewState}
        style={{ width: '100%', height: '100%' }}
        mapStyle={`https://api.maptiler.com/maps/streets/style.json?key=OSNs9Q0u9qOO5KUhz2WB`}
        onMove={handleViewStateChange}
        interactiveLayerIds={['states-fill']}
        onClick={(event) => {
          const feature = event.features?.[0];
          if (feature && !selectedState) {
            handleStateClick(feature);
          }
        }}
        onMouseMove={(event) => {
          const feature = event.features?.[0];
          if (feature) {
            setHoveredStateId(feature.id as number);
            const name = feature.properties?.name || 'Unknown';
            const value = locationData?.[name] || 0;
            setHoverInfo({
              name,
              value,
              x: event.point.x,
              y: event.point.y,
            });
          } else {
            setHoveredStateId(null);
            setHoverInfo(null);
          }
        }}
        onMouseLeave={() => {
          setHoveredStateId(null);
          setHoverInfo(null);
        }}
      >
        {geoJson && !selectedState && (
          <Source id="states" type="geojson" data={geoJson}>
            <Layer {...layerStyle(fillColorExpression)} />
            {hoveredStateId !== null && (
              <Layer {...hoverLayerStyle} filter={['==', '$id', hoveredStateId]} />
            )}
          </Source>
        )}

        {selectedState &&
          locationData &&
          Object.entries(locationData).map(([city, value]) => {
            const coords = CITY_COORDINATES[city];
            if (!coords) return null; // Don't crash if missing coords

            return (
              <Marker key={city} longitude={coords[0]} latitude={coords[1]}>
                <div
                  style={{
                    width: Math.min(40, 10 + (value / maxValue) * 30),
                    height: Math.min(40, 10 + (value / maxValue) * 30),
                    backgroundColor: colorScale(value),
                    borderRadius: '50%',
                    opacity: 0.7,
                    border: '1px solid #333',
                    transform: 'translate(-50%, -50%)',
                  }}
                  title={`${city}: ${value} grads`}
                />
              </Marker>
            );
          })}
      </Map>

      {/* Zoom Controls */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
        <button
          onClick={() => setViewState((s) => ({ ...s, zoom: Math.min(8, s.zoom * 1.2) }))}
          className="p-2 bg-white rounded-lg shadow-md border hover:bg-gray-50 transition"
        >
          <Plus className="w-4 h-4 text-[#333]" />
        </button>
        <button
          onClick={() => setViewState((s) => ({ ...s, zoom: Math.max(1, s.zoom / 1.2) }))}
          className="p-2 bg-white rounded-lg shadow-md border hover:bg-gray-50 transition"
        >
          <Minus className="w-4 h-4 text-[#333]" />
        </button>
      </div>

      {/* Tooltip */}
      {hoverInfo && !selectedState && (
        <div
          className="fixed bg-white px-3 py-2 rounded-lg shadow-md border border-gray-100 pointer-events-none z-50 text-xs"
          style={{
            left: hoverInfo.x,
            top: hoverInfo.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="font-medium">{hoverInfo.name}</div>
          <div className="text-gray-500">{hoverInfo.value} grads</div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md border border-gray-100 p-3 z-10">
        <div className="text-sm font-semibold text-[#111111] mb-3">
          {selectedState ? 'City Graduates' : 'State Graduates'}
        </div>
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

      {/* Back Button */}
      {selectedState && (
        <button
          onClick={() => {
            setSelectedState(null);
            setViewState({
              longitude: -97,
              latitude: 38,
              zoom: 3,
              transitionDuration: 500,
            });
          }}
          className="absolute top-4 right-4 bg-white px-4 py-2 rounded-lg shadow-md border border-gray-100 hover:bg-gray-50 transition z-10"
        >
          Back to USA
        </button>
      )}
    </div>
  );
};
