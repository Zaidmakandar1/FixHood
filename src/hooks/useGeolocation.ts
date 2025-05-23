import { useState, useEffect } from 'react';

type Coordinates = {
  lat: number;
  lng: number;
};

type GeolocationState = {
  coordinates: Coordinates | null;
  error: string | null;
  isLoading: boolean;
};

const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    error: null,
    isLoading: true
  });

  useEffect(() => {
    // Check if the browser supports geolocation
    if (!navigator.geolocation) {
      setState({
        coordinates: null,
        error: 'Geolocation is not supported by your browser',
        isLoading: false
      });
      return;
    }

    // Try to get the current position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coordinates: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          },
          error: null,
          isLoading: false
        });
      },
      (error) => {
        setState({
          coordinates: null,
          error: getGeolocationErrorMessage(error),
          isLoading: false
        });
      }
    );
  }, []);

  // Helper function to get user-friendly error messages
  const getGeolocationErrorMessage = (error: GeolocationPositionError): string => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'User denied the request for Geolocation.';
      case error.POSITION_UNAVAILABLE:
        return 'Location information is unavailable.';
      case error.TIMEOUT:
        return 'The request to get user location timed out.';
      default:
        return 'An unknown error occurred.';
    }
  };

  return state;
};

export default useGeolocation;