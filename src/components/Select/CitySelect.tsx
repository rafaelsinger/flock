import React from 'react';
import { useLoadScript, Autocomplete } from '@react-google-maps/api';

interface Location {
  city: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
}

interface CitySelectProps {
  value: string;
  onChange: (location: Location) => void;
}

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

export const CitySelect: React.FC<CitySelectProps> = ({ value, onChange }) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places'],
  });

  const autocompleteRef = React.useRef<google.maps.places.Autocomplete | null>(null);

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    const location = place?.geometry?.location;

    if (place && location) {
      onChange({
        city: place.address_components?.[0]?.long_name || '',
        state:
          place.address_components?.find((c: AddressComponent) =>
            c.types.includes('administrative_area_level_1')
          )?.short_name || '',
        country:
          place.address_components?.find((c: AddressComponent) => c.types.includes('country'))
            ?.short_name || '',
        lat: location.lat(),
        lng: location.lng(),
      });
    }
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <Autocomplete
      onLoad={(autocomplete: google.maps.places.Autocomplete) => {
        autocompleteRef.current = autocomplete;
      }}
      onPlaceChanged={handlePlaceChanged}
    >
      <input type="text" placeholder="Enter your city" className="input" defaultValue={value} />
    </Autocomplete>
  );
};
