import React, { useState, useCallback } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

interface Location {
  city: string;
  state: string;
  country: string;
  lat: number;
  lon: number;
}

interface CitySelectProps {
  value: string;
  onChange: (location: Location) => void;
}

interface Datasource {
  sourcename: string;
  attribution: string;
  license: string;
  url: string;
}

interface Timezone {
  name: string;
  offset_STD: string;
  offset_STD_seconds: number;
  offset_DST: string;
  offset_DST_seconds: number;
  abbreviation_STD: string;
  abbreviation_DST: string;
}

interface Rank {
  importance: number;
  confidence: number;
  confidence_city_level: number;
  match_type: string;
}

interface BoundingBox {
  lon1: number;
  lat1: number;
  lon2: number;
  lat2: number;
}

interface GeoapifyResult {
  datasource: Datasource;
  old_name?: string;
  country: string;
  country_code: string;
  state: string;
  county: string;
  city: string;
  iso3166_2: string;
  lon: number;
  lat: number;
  state_code: string;
  result_type: string;
  formatted: string;
  address_line1: string;
  address_line2: string;
  category: string;
  timezone: Timezone;
  plus_code: string;
  plus_code_short: string;
  rank: Rank;
  place_id: string;
  bbox: BoundingBox;
}

interface GeoapifyResponse {
  results: GeoapifyResult[];
}

export const CitySelect: React.FC<CitySelectProps> = ({ value, onChange }) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<GeoapifyResult[]>([]);
  const debouncedValue = useDebounce(inputValue, 250);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocationSelected, setIsLocationSelected] = useState(Boolean(value));

  const fetchSuggestions = useCallback(
    async (text: string) => {
      if (!text || isLocationSelected) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(text)}&type=city&format=json&apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_KEY}`
        );
        const data = (await response.json()) as GeoapifyResponse;
        setSuggestions(data.results || []);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
      setIsLoading(false);
    },
    [isLocationSelected]
  );

  React.useEffect(() => {
    fetchSuggestions(debouncedValue);
  }, [debouncedValue, fetchSuggestions]);

  const handleSelect = (feature: GeoapifyResult) => {
    const location: Location = {
      city: feature.city || '',
      state: feature.state_code || '',
      country: feature.country || '',
      lat: feature.lat,
      lon: feature.lon,
    };

    setInputValue(feature.formatted);
    setSuggestions([]);
    setIsLocationSelected(true);
    onChange(location);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // If the user changes the input after selecting a location,
    // we need to reset the selected state to allow new searches
    if (isLocationSelected && newValue !== inputValue) {
      setIsLocationSelected(false);
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Enter your city"
        className="w-full text-[#333] border border-gray-200 px-4 py-3 rounded-lg focus:border-[#F9C5D1] focus:ring-2 focus:ring-[#F9C5D1]/20 outline-none transition-all cursor-text"
      />

      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666]">Loading...</div>
      )}

      {suggestions.length > 0 && !isLocationSelected && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {suggestions.map((feature, index) => (
            <li
              key={index}
              className="px-4 py-2 hover:bg-[#F9C5D1]/10 cursor-pointer text-[#333]"
              onClick={() => handleSelect(feature)}
            >
              {feature.formatted}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
