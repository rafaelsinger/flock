'use client';
import * as React from 'react';
import { Map as MapGL, Source, Layer, Marker, LayerProps, MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useQuery } from '@tanstack/react-query';
import { Plus, Minus, Maximize2, Minimize2 } from 'lucide-react';
import center from '@turf/center';
import { STATE_NAME_TO_ABBREV } from '@/constants/location';
import type { PropertyValueSpecification } from 'maplibre-gl';
import { Legend } from './Legend';
import * as d3 from 'd3';
import { getCustomBuckets } from '@/lib/utils';

// Types
interface LocationData {
  [location: string]: number; // states or cities
}

interface CityCoordinates {
  [city: string]: [number, number];
}

interface LocationResponse {
  locations: LocationData;
  coordinates: CityCoordinates;
}

// Type guard
function isLocationResponse(data: unknown): data is LocationResponse {
  return (
    data !== null &&
    typeof data === 'object' &&
    data !== null &&
    'locations' in data &&
    'coordinates' in data
  );
}

const stateGeoUrl =
  'https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json';

const layerStyle = (colorExpression: PropertyValueSpecification<string>): LayerProps => ({
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

  const [selectedState, setSelectedState] = React.useState<string | null>(null);
  const [hoveredStateId, setHoveredStateId] = React.useState<number | null>(null);
  const [hoveredCity, setHoveredCity] = React.useState<{
    city: string;
    value: number;
    x: number;
    y: number;
  } | null>(null);
  const [hoverInfo, setHoverInfo] = React.useState<{
    name: string;
    value: number;
    x: number;
    y: number;
  } | null>(null);

  const [zoomedIn, setZoomedIn] = React.useState(false);
  const [mapLoaded, setMapLoaded] = React.useState(false);

  const [cityCoordinates, setCityCoordinates] = React.useState<CityCoordinates>({});

  const { data: apiResponse, isLoading } = useQuery({
    queryKey: ['locationData', selectedState],
    queryFn: async () => {
      if (!selectedState) {
        const response = await fetch('/api/locations');
        if (!response.ok) throw new Error('Failed to fetch location data');
        return response.json();
      } else {
        const response = await fetch(`/api/locations?state=${STATE_NAME_TO_ABBREV[selectedState]}`);
        if (!response.ok) throw new Error('Failed to fetch city data');
        return response.json();
      }
    },
    enabled: true,
  });

  // Process the API response data
  React.useEffect(() => {
    if (apiResponse) {
      if (isLocationResponse(apiResponse)) {
        setCityCoordinates(apiResponse.coordinates);
      }
    }
  }, [apiResponse]);

  // Extract the location data from the response
  const locationData: LocationData = React.useMemo(() => {
    if (!apiResponse) return {};
    if (isLocationResponse(apiResponse)) {
      return apiResponse.locations;
    }
    return apiResponse as LocationData;
  }, [apiResponse]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [geoJson, setGeoJson] = React.useState<any>(null);

  React.useEffect(() => {
    fetch(stateGeoUrl)
      .then((res) => res.json())
      .then((data) => setGeoJson(data));
  }, []);

  const maxValue =
    Object.values(locationData || {}).reduce((max, value) => Math.max(max, value), 0) || 1;

  const thresholds = getCustomBuckets(maxValue);

  // Match colors to number of bins
  const colorSchemes: { [key: number]: string[] } = {
    2: ['#fb6a4a', '#de2d26'],
    3: ['#fc9272', '#fb6a4a', '#de2d26'],
    4: ['#fc9272', '#fb6a4a', '#de2d26', '#a50f15'],
    5: ['#fee0d2', '#fc9272', '#fb6a4a', '#de2d26', '#a50f15'],
  };

  const colorRange = colorSchemes[thresholds.length] || colorSchemes[5];

  const colorScale = d3
    .scaleThreshold<number, string>()
    .domain(thresholds.slice(0, -1))
    .range(colorRange);

  const fillColorExpression = React.useMemo(() => {
    if (!locationData || selectedState) {
      return ['match', ['get', 'name'], '#cccccc'] as unknown as PropertyValueSpecification<string>;
    }

    const pairs = Object.entries(locationData)
      .map(([state, value]) => [state, colorScale(value)])
      .flat();

    return [
      'match',
      ['get', 'name'],
      ...pairs,
      '#cccccc', // fallback for "no data"
    ] as unknown as PropertyValueSpecification<string>;
  }, [locationData, selectedState, colorScale]);

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

    const stateAbbrev = STATE_NAME_TO_ABBREV[clickedState];
    if (!stateAbbrev) return;

    const centroid = center(feature);
    const [lon, lat] = centroid.geometry.coordinates;

    setSelectedState(clickedState);
    setZoomedIn(true);

    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [lon, lat],
        zoom: 6,
        pitch: 30,
        speed: 1.2,
        curve: 1.5,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        easing: (t: any) => t,
        essential: true,
      });
    }

    onCitySelect('', stateAbbrev);
  };

  const showSkeleton = !mapLoaded || isLoading;

  const handleMouseMove = React.useCallback(
    (event: maplibregl.MapLayerMouseEvent) => {
      const feature = event.features?.[0];
      if (feature && mapRef.current) {
        const name = feature.properties?.name || 'Unknown';
        const value = locationData?.[name] || 0;

        const rect = mapRef.current.getMap().getCanvas().getBoundingClientRect();
        const correctedX = rect.left + event.point.x;
        const correctedY = rect.top + event.point.y;

        setHoveredStateId(feature.id as number);
        setHoverInfo({
          name,
          value,
          x: correctedX,
          y: correctedY,
        });
      } else {
        setHoveredStateId(null);
        setHoverInfo(null);
      }
    },
    [locationData]
  );

  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative ${zoomedIn ? 'bg-gray-50' : 'bg-[#F9F9F9]'}`}
    >
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
        onLoad={() => setMapLoaded(true)}
        onClick={(event) => {
          const feature = event.features?.[0];
          if (feature && !selectedState) {
            handleStateClick(feature);
          }
        }}
        onMouseMove={handleMouseMove}
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
            const coords = cityCoordinates[city];
            if (!coords) return null;

            const normalizedValue = Math.sqrt(value) / Math.sqrt(maxValue);
            const bubbleSize = Math.min(50, 20 + normalizedValue * 40); // Increased minimum size

            return (
              <Marker key={city} longitude={coords[0]} latitude={coords[1]}>
                <div
                  className="bubble"
                  onClick={() => onCitySelect(city, STATE_NAME_TO_ABBREV[selectedState])}
                  onMouseEnter={(e) => {
                    setHoveredCity({
                      city,
                      value,
                      x: e.clientX,
                      y: e.clientY,
                    });
                  }}
                  onMouseMove={(e) => {
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
                    opacity: hoveredCity?.city === city ? 0.9 : 0.7, // Highlight when hovered
                    border: hoveredCity?.city === city ? '2px solid #111' : '1px solid #333',
                    transform:
                      hoveredCity?.city === city
                        ? 'translate(-50%, -50%) scale(1.1)'
                        : 'translate(-50%, -50%) scale(1)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    zIndex: hoveredCity?.city === city ? 200 : 100,
                    boxShadow: hoveredCity?.city === city ? '0 0 8px rgba(0,0,0,0.3)' : 'none',
                  }}
                />
              </Marker>
            );
          })}

        {/* Tooltips */}
        {hoverInfo && !selectedState && (
          <div
            className="fixed bg-white px-3 py-2 rounded-lg shadow-md border border-gray-100 pointer-events-none z-50 text-xs"
            style={{
              left: hoverInfo.x,
              top: hoverInfo.y,
              transform: 'translate(0px, -100%)',
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

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md border border-gray-100 p-3 z-10">
        <div className="text-sm font-semibold text-[#111111] mb-3">
          {selectedState ? `${selectedState} City Graduates` : 'State Graduates'}
        </div>
        {showSkeleton ? renderLegendSkeleton() : <Legend colorScale={colorScale} />}
      </div>

      {/* Back Button */}
      {selectedState && (
        <button
          onClick={() => {
            setSelectedState(null);
            onCitySelect('', '');
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

      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-16 p-2 bg-white rounded-lg shadow-md border hover:bg-gray-50 transition z-10 text-[#333]"
      >
        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
      </button>
    </div>
  );
};
