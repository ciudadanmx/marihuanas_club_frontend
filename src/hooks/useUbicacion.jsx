// src/hooks/useUbicacion.js
import { useEffect, useState } from "react";

export function useUbicacion() {
  const [ubicacion, setUbicacion] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("La geolocalización no es compatible con este navegador.");
      setCargando(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const data = await reverseGeocode(latitude, longitude);
          setUbicacion({
            lat: latitude,
            lng: longitude,
            ciudad: data.city || data.town || data.village,
            codigoPostal: data.postcode,
            direccion: data.display_name,
          });
        } catch (err) {
          setError("Error obteniendo dirección.");
        } finally {
          setCargando(false);
        }
      },
      (err) => {
        setError("No se pudo obtener la ubicación.");
        setCargando(false);
      }
    );
  }, []);

  return { ubicacion, error, cargando };
}

// 🔧 Helper para reverse geocoding usando Nominatim (OpenStreetMap)
async function reverseGeocode(lat, lng) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
  );
  if (!response.ok) throw new Error("Falló el reverse geocoding");
  const data = await response.json();
  return data.address;
}
