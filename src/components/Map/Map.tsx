'use client';
import * as React from 'react';
import { Map as MapGL, Source, Layer, Marker, LayerProps, MapRef } from 'react-map-gl/maplibre';
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

interface FlockMapProps {
  onCitySelect: (city: string, state: string) => void;
}

export const FlockMap: React.FC<FlockMapProps> = ({ onCitySelect }) => {
  const mapRef = React.useRef<MapRef>(null);

  const [viewState, setViewState] = React.useState({
    longitude: -97,
    latitude: 38,
    zoom: 3,
    transitionDuration: 500,
  });

  const [hoveredCity, setHoveredCity] = React.useState<{
    city: string;
    value: number;
    x: number;
    y: number;
  } | null>(null);

  const [selectedState, setSelectedState] = React.useState<string | null>(null);
  const [hoveredStateId, setHoveredStateId] = React.useState<number | null>(null);
  const [hoverInfo, setHoverInfo] = React.useState<{
    name: string;
    value: number;
    x: number;
    y: number;
  } | null>(null);

  const [zoomedIn, setZoomedIn] = React.useState(false);

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
    .range(['#fef0d9', '#fdcc8a', '#fc8d59', '#e34a33', '#b30000']);

  const fillColorExpression = [
    'match',
    ['get', 'name'],
    ...(locationData && !selectedState
      ? Object.entries(locationData).flatMap(([state, value]) => [state, colorScale(value)])
      : []),
    '#EEE',
  ];

  const getLegendData = () => {
    const step = Math.ceil(maxValue / 5);
    const buildRange = (start: number, end: number) => {
      return start === end ? `${start}` : `${start}-${end}`;
    };

    return [
      { range: buildRange(0, step), color: '#fef0d9' },
      { range: buildRange(step + 1, 2 * step), color: '#fdcc8a' },
      { range: buildRange(2 * step + 1, 3 * step), color: '#fc8d59' },
      { range: buildRange(3 * step + 1, 4 * step), color: '#e34a33' },
      { range: `${4 * step + 1}+`, color: '#b30000' }, // 5th bucket is always open-ended
    ];
  };

  const legendData = getLegendData();

  const renderLegendSkeleton = () => (
    <div className="space-y-2.5">
      {Array(5)
        .fill(0)
        .map((_, index) => (
          <div key={index} className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded border border-gray-100 bg-gray-200 animate-pulse" />
            <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
    </div>
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleStateClick = (feature: any) => {
    const clickedState = feature.properties?.name;
    if (!clickedState) return;

    const centroid = center(feature);
    const [lon, lat] = centroid.geometry.coordinates;

    setSelectedState(clickedState);
    setZoomedIn(true);

    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [lon, lat],
        zoom: 6,
        pitch: 30,
        speed: 1.2, // slower is smoother
        curve: 1.5, // curvature of flight path
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        easing: (t: any) => t, // linear easing
        essential: true,
      });
    }
  };

  return (
    <div className={`w-full h-full relative ${zoomedIn ? 'bg-gray-50' : 'bg-[#F9F9F9]'}`}>
      <MapGL
        {...viewState}
        ref={mapRef}
        style={{ width: '100%', height: '100%' }}
        mapStyle={`https://api.maptiler.com/maps/streets/style.json?key=OSNs9Q0u9qOO5KUhz2WB`}
        cursor={hoveredStateId !== null ? 'pointer' : 'grab'}
        onMove={(evt) => {
          setViewState((prev) => ({
            ...evt.viewState,
            transitionDuration: prev.transitionDuration,
          }));
        }}
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
            if (!coords) return null;

            // Smarter, nonlinear size scaling
            const normalizedValue = Math.sqrt(value) / Math.sqrt(maxValue); // 0 to 1
            const bubbleSize = Math.min(40, 10 + normalizedValue * 30); // control min/max

            return (
              <Marker key={city} longitude={coords[0]} latitude={coords[1]}>
                <div
                  className="bubble"
                  onClick={() => onCitySelect(city, selectedState)}
                  onMouseEnter={(e) => {
                    setHoveredCity({
                      city,
                      value,
                      x: e.clientX,
                      y: e.clientY,
                    });
                  }}
                  onMouseLeave={() => setHoveredCity(null)}
                  style={{
                    width: `${bubbleSize}px`,
                    height: `${bubbleSize}px`,
                    backgroundColor: colorScale(value),
                    borderRadius: '50%',
                    opacity: 0.8,
                    border: '1px solid #333',
                    transform: 'translate(-50%, -50%) scale(1)',
                    transition: 'transform 0.2s ease',
                    cursor: 'pointer',
                  }}
                />
              </Marker>
            );
          })}
      </MapGL>

      {/* Zoom Controls */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
        <button
          onClick={() => setViewState((s) => ({ ...s, zoom: Math.min(8, s.zoom * 1.2) }))}
          className="p-2 cursor-pointer bg-white rounded-lg shadow-md border transition transform hover:scale-110 hover:bg-gray-100 hover:shadow-lg"
        >
          <Plus className="w-4 h-4 text-[#333]" />
        </button>
        <button
          onClick={() => setViewState((s) => ({ ...s, zoom: Math.max(1, s.zoom / 1.2) }))}
          className="p-2 cursor-pointer bg-white rounded-lg shadow-md border transition transform hover:scale-110 hover:bg-gray-100 hover:shadow-lg"
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
            transform: 'translate(-20%, 300%)',
          }}
        >
          <div className="font-medium text-[#333]">{hoverInfo.name}</div>
          <div className="text-gray-500">{hoverInfo.value} grads</div>
        </div>
      )}
      {hoveredCity && (
        <div
          className="fixed bg-white px-3 py-2 rounded-lg shadow-md border border-gray-100 text-xs z-50 pointer-events-none"
          style={{
            left: hoveredCity.x,
            top: hoveredCity.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="font-medium text-[#333]">{hoveredCity.city}</div>
          <div className="text-gray-500">{hoveredCity.value} grads</div>
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
            setZoomedIn(false);
            if (mapRef.current) {
              mapRef.current.flyTo({
                center: [-97, 38],
                zoom: 3,
                speed: 1.2,
                pitch: 0,
                curve: 1.5,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                easing: (t: any) => t,
                essential: true,
              });
            }
          }}
          className="absolute top-4 right-4 p-2 bg-white rounded-lg shadow-md border hover:bg-gray-50 transition z-10 text-[#333]"
        >
          Back to USA
        </button>
      )}
    </div>
  );
};
