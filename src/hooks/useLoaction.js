import { useState } from "react";

export default function useLocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const requestLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        setError("Geolocation not supported");
        reject();
        return;
      }

      setLoading(true);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setLocation(coords);
          setLoading(false);
          resolve(coords);
        },
        (err) => {
          setLoading(false);
          setError(err.message);
          reject(err);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
        }
      );
    });
  };

  return { location, error, loading, requestLocation };
}
