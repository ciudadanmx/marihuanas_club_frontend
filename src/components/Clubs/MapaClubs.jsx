import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLoadScript, GoogleMap, Marker } from '@react-google-maps/api';
import { Box, CircularProgress, Typography, Button } from '@mui/material';

import cultivoIcon from '../../assets/marcador_club_cultivo.png';
import consumoIcon from '../../assets/marcador_club_consumo.png';
import ambosIcon from '../../assets/marcador_club_ambos.png';

const STRAPI_URL = process.env.REACT_APP_STRAPI_URL;
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const libraries = ['places'];

// Contenedor del mapa con borde neón
const mapContainerStyle = {
  width: '80%',
  height: '400px',
  margin: '0 auto',
  position: 'relative',
  border: '4px solid #39FF14',
  borderRadius: '8px',
  boxShadow: '0 0 15px #39FF14'
};
const defaultCenter = { lat: 19.4326, lng: -99.1332 };
const defaultZoom = 12;
const RADIUS_KM = 100;

function haversineDistance(lat1, lng1, lat2, lng2) {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function MapaClubs({ membresia = false }) {
  const { isLoaded, loadError } = useLoadScript({ googleMapsApiKey: GOOGLE_MAPS_API_KEY, libraries });

  const [hasAccess, setHasAccess] = useState(membresia);
  const [center, setCenter] = useState(defaultCenter);
  const [zoom, setZoom] = useState(defaultZoom);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const mapRef = useRef();
  const onMapLoad = map => { mapRef.current = map; };
  const onZoomChanged = () => { if (mapRef.current) setZoom(mapRef.current.getZoom()); };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => setCenter({ lat: coords.latitude, lng: coords.longitude }),
        () => console.warn('⚠️ No se pudo obtener ubicación, usando default')
      );
    }
  }, []);

  const fetchClubs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${STRAPI_URL}/api/clubs?populate=*&pagination[pageSize]=1000`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const items = (await res.json()).data.map(i => i.attributes);
      setClubs(items.filter(club => club.lat && club.lng && haversineDistance(center.lat, center.lng, club.lat, club.lng) <= RADIUS_KM));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [center]);

  useEffect(() => { fetchClubs(); }, [fetchClubs]);

  if (loadError) return <Typography color="error">Error loading maps</Typography>;
  if (!isLoaded) return <Box sx={{ textAlign: 'center', my: 4 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
      <Box sx={mapContainerStyle}>
        {/* Banner centrado verticalmente */}
        {!hasAccess && (
          <Box sx={{
            position: 'absolute',
            top: '50%', left: 0, transform: 'translateY(-50%)',
            width: '100%',
            backgroundColor: 'rgba(0,128,0,0.3)',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 10,
          }}>
            <Typography color="white" variant="h6">Tienes que tener membresía para ver los clubs</Typography>
            <Button
              variant="contained"
              onClick={() => setHasAccess(true)}
              sx={{ mt: 1 }}
            >
              Activar membresía
            </Button>
          </Box>
        )}

        {loading && (
          <Box sx={{ textAlign: 'center', my: 2 }}>
            <CircularProgress />
            <Typography>Cargando clubes...</Typography>
          </Box>
        )}
        {error && (<Typography color="error">Error: {error}</Typography>)}

        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={center}
          zoom={zoom}
          onLoad={onMapLoad}
          onZoomChanged={onZoomChanged}
          options={{ zoomControl: true, mapTypeControl: false, streetViewControl: false, fullscreenControl: false }}
        >
          {hasAccess && clubs.map((club, idx) => {
            let iconUrl = ambosIcon;
            if (club.tipo === 'cultivo') iconUrl = cultivoIcon;
            else if (club.tipo === 'consumo') iconUrl = consumoIcon;
            const size = 24 + zoom; // adaptativo al zoom
            return (
              <Marker
                key={idx}
                position={{ lat: club.lat, lng: club.lng }}
                title={club.nombre_club}
                icon={{ url: iconUrl, scaledSize: new window.google.maps.Size(size, size) }}
              />
            );
          })}
        </GoogleMap>
      </Box>
    </Box>
  );
}
