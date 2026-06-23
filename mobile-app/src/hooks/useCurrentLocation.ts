import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

export function useCurrentLocation() {
  const [currentLocation, setCurrentLocation] = useState('Locating...');

  useEffect(() => {
    const getLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setCurrentLocation('Location unavailable');
        return;
      }

      const position = await Location.getCurrentPositionAsync({});

      const places = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      const place = places[0];

      console.log("from location hook", place)
      
      if (!place) {
        setCurrentLocation('Location unavailable');
        return;
      }

      const district = place.district || place.subregion || 'Unknown city';
      const state = place.region || '';
    

      setCurrentLocation(state ? `${district}, ${state}.` : district);
    };

    getLocation();
  }, []);

  return currentLocation;
}