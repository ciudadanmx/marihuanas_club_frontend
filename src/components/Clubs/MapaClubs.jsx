// src/components/MapaClubs.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLoadScript, GoogleMap, Marker, InfoWindow, StandaloneSearchBox } from '@react-google-maps/api';
import { Box, CircularProgress, Typography, Button, Avatar, Chip, TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { useNavigate } from 'react-router-dom';

import cultivoIcon from '../../assets/marcador_club_cultivo.png';
import consumoIcon from '../../assets/marcador_club_consumo.png';
import ambosIcon from '../../assets/marcador_club_ambos.png';

const STRAPI_URL = process.env.REACT_APP_STRAPI_URL || '';
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const libraries = ['places'];

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

  // para mostrar InfoWindow al pasar hover
  const [hoveredClub, setHoveredClub] = useState(null);

  // buscador
  const [cityOnly, setCityOnly] = useState(true); // toggle para buscar solo ciudades o cualquier lugar
  const searchBoxRef = useRef(null);

  const mapRef = useRef();
  const onMapLoad = map => { mapRef.current = map; };
  const onZoomChanged = () => { if (mapRef.current) setZoom(mapRef.current.getZoom()); };

  const navigate = useNavigate();

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
      const json = await res.json();
      const itemsRaw = json.data || [];

      // normalizamos los atributos y extraemos URL de la foto (si existe)
      const items = itemsRaw.map(item => {
        const a = item.attributes || {};
        const fotoData = a.foto_de_perfil?.data?.attributes || null;
        let fotoUrl = null;
        if (fotoData && fotoData.url) {
          fotoUrl = fotoData.url.startsWith('http') ? fotoData.url : `${STRAPI_URL}${fotoData.url}`;
        }
        return {
          ...a,
          fotoUrl,
        };
      });

      // filtramos por lat/lng y por radio
      const filtered = items.filter(club => {
        if (!club.lat || !club.lng) return false;
        try {
          return haversineDistance(center.lat, center.lng, club.lat, club.lng) <= RADIUS_KM;
        } catch { return false; }
      });

      setClubs(filtered);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }, [center]);

  useEffect(() => { fetchClubs(); }, [fetchClubs]);

  if (loadError) return <Typography color="error">Error loading maps</Typography>;
  if (!isLoaded) return <Box sx={{ textAlign: 'center', my: 4 }}><CircularProgress /></Box>;

  // opciones para el autocomplete/searchbox
  const searchOptions = cityOnly ? { types: ['(cities)'] } : {};

  const handlePlacesChanged = () => {
    const sb = searchBoxRef.current;
    if (!sb) return;
    const places = sb.getPlaces ? sb.getPlaces() : [];
    if (!places || places.length === 0) return;
    const place = places[0];
    if (place.geometry) {
      // si el place tiene viewport preferimos hacer fitBounds
      if (place.geometry.viewport && mapRef.current) {
        mapRef.current.fitBounds(place.geometry.viewport);
      } else if (place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setCenter({ lat, lng });
        setZoom(13);
        if (mapRef.current && mapRef.current.panTo) mapRef.current.panTo({ lat, lng });
      }
    }
  };

  const handleSearchLoad = (ref) => { searchBoxRef.current = ref; };

  const goToMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        const pos = { lat: coords.latitude, lng: coords.longitude };
        setCenter(pos);
        setZoom(13);
        if (mapRef.current && mapRef.current.panTo) mapRef.current.panTo(pos);
      }, () => console.warn('No fue posible obtener geolocalización'));
    }
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
      <Box sx={mapContainerStyle}>

        {/* BUSCADOR: StandaloneSearchBox posicionado encima del mapa */}
        <Box sx={{ position: 'absolute', top: 10, left: 10, zIndex: 30, display: 'flex', gap: 1, alignItems: 'center' }}>
          <StandaloneSearchBox
            onLoad={handleSearchLoad}
            onPlacesChanged={handlePlacesChanged}
            options={searchOptions}
          >
            <TextField
              size="small"
              placeholder={cityOnly ? 'Buscar ciudad...' : 'Buscar lugar o dirección...'}
              variant="outlined"
              sx={{ width: 320, bgcolor: 'background.paper' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={goToMyLocation} aria-label="Mi ubicación">
                      <MyLocationIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </StandaloneSearchBox>

          <Button size="small" variant="outlined" onClick={() => setCityOnly(v => !v)} sx={{ whiteSpace: 'nowrap' }}>
            {cityOnly ? 'Ciudades' : 'Todos'}
          </Button>
        </Box>

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
            const size = Math.max(28, 18 + zoom); // adaptativo al zoom, mínimo 28

            const onMarkerClick = () => {
              const safeName = encodeURIComponent(club.nombre_club || club.id || `club-${idx}`);
              navigate(`/clubs/${safeName}`);
            };

            const onMarkerHover = () => {
              setHoveredClub(club);
            };

            const onMarkerOut = () => {
              setHoveredClub(prev => (prev && prev.nombre_club === club.nombre_club ? null : prev));
            };

            return (
              <Marker
                key={idx}
                position={{ lat: club.lat, lng: club.lng }}
                title={club.nombre_club}
                icon={{ url: iconUrl, scaledSize: new window.google.maps.Size(size, size) }}
                clickable={true}
                onClick={onMarkerClick}
                onMouseOver={onMarkerHover}
                onMouseOut={onMarkerOut}
                onTouchStart={onMarkerHover}
              />
            );
          })}

          {/* InfoWindow que aparece al hacer hover (o touch) */}
          {hoveredClub && hoveredClub.lat && hoveredClub.lng && (
            <InfoWindow
              position={{ lat: hoveredClub.lat, lng: hoveredClub.lng }}
              onCloseClick={() => setHoveredClub(null)}
              options={{ pixelOffset: new window.google.maps.Size(0, -30) }}
            >
              {/* ...el contenido del InfoWindow se mantiene igual que en tu versión original... */}
              <Box sx={{ maxWidth: 340, display: 'flex', gap: 1, alignItems: 'flex-start', fontFamily: "'Roboto', sans-serif", position: 'relative' }}>
                <Avatar
                  src={hoveredClub.foto_de_perfil?.url || hoveredClub.fotoUrl || undefined}
                  alt={hoveredClub.nombre_club || 'Club'}
                  variant="rounded"
                  sx={{ width: 56, height: 56, flexShrink: 0, boxShadow: 1 }}
                >
                  {(!hoveredClub.foto_de_perfil?.url && !hoveredClub.fotoUrl && (hoveredClub.nombre_club || '').charAt(0)) || ''}
                </Avatar>

                <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.4, flexWrap: 'wrap' }}>
                    {(() => {
                      const tipo = (hoveredClub.tipo || '').toString().toLowerCase();
                      const isCultivo = tipo === 'cultivo' || tipo === 'ambas' || tipo === 'ambos' || tipo.includes('cultivo');
                      if (!isCultivo) return null;

                      const lugares = typeof hoveredClub.lugares === 'number' ? hoveredClub.lugares : null;
                      const numIntegrantes = typeof hoveredClub.num_integrantes === 'number' ? hoveredClub.num_integrantes : 0;

                      if (lugares === null) return null;

                      const libres = Math.max(0, lugares - numIntegrantes);

                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mr: 0.6 }}>
                          <Chip
                            size="small"
                            label={`${libres} de ${lugares} lugares libres`}
                            sx={{
                              bgcolor: '#000',
                              color: '#fff',
                              fontWeight: 700,
                              fontSize: 12,
                            }}
                          />
                        </Box>
                      );
                    })()}

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, flexWrap: 'wrap', minWidth: 0 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 700,
                          fontSize: 15,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: 180
                        }}
                      >
                        {hoveredClub.nombre_club || 'Club sin nombre'}
                      </Typography>

                      {(() => {
                        const tipo = (hoveredClub.tipo || '').toString().toLowerCase();
                        if (tipo === 'consumo') {
                          return (
                            <Chip
                              label="Club de Consumo"
                              size="small"
                              sx={{ bgcolor: '#ffb74d', color: '#3e2723', fontWeight: 700 }}
                            />
                          );
                        }
                        if (tipo === 'cultivo') {
                          return (
                            <Chip
                              label="Club de Cultivo"
                              size="small"
                              sx={{ bgcolor: '#a5d6a7', color: '#1b5e20', fontWeight: 700 }}
                            />
                          );
                        }
                        if (tipo === 'ambas' || tipo === 'ambos' || tipo === 'consumo_y_cultivo') {
                          return (
                            <Chip
                              label="Club de Cultivo y Consumo"
                              size="small"
                              sx={{ bgcolor: '#ce93d8', color: '#4a148c', fontWeight: 700 }}
                            />
                          );
                        }
                        return null;
                      })()}
                    </Box>
                  </Box>

                  <Typography variant="body2" sx={{ maxHeight: 40, overflow: 'hidden', textOverflow: 'ellipsis', color: 'text.secondary', fontSize: 13 }}>
                    {hoveredClub.descripcion || 'Sin descripción.'}
                  </Typography>

                  <Box sx={{ mt: 0.6, display: 'flex', gap: 1, flexDirection: 'column' }}>
                    {Array.isArray(hoveredClub.productos) && hoveredClub.productos.length > 0 && (
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.3 }}>Productos</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {hoveredClub.productos.slice(0, 6).map((p, i) => (
                            <Chip
                              key={i}
                              label={(typeof p === 'string' ? p : (p.nombre || p.titulo || JSON.stringify(p))).slice(0, 30)}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                          {hoveredClub.productos.length > 6 && <Typography variant="caption" sx={{ alignSelf: 'center' }}>+{hoveredClub.productos.length - 6}</Typography>}
                        </Box>
                      </Box>
                    )}

                    {Array.isArray(hoveredClub.servicios) && hoveredClub.servicios.length > 0 && (
                      <Box sx={{ mt: 0.4 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.3 }}>Servicios</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                          {hoveredClub.servicios.slice(0, 4).map((s, i) => (
                            <Typography key={i} variant="body2" sx={{ fontSize: 12, color: 'text.secondary' }}>
                              • {typeof s === 'string' ? s : (s.nombre || s.descripcion || JSON.stringify(s))}
                            </Typography>
                          ))}
                          {hoveredClub.servicios.length > 4 && <Typography variant="caption">+{hoveredClub.servicios.length - 4} más</Typography>}
                        </Box>
                      </Box>
                    )}
                  </Box>

                  {hoveredClub.horarios && typeof hoveredClub.horarios === 'object' && (
                    <Box sx={{ mt: 0.7 }}>
                      {['consumo', 'cultivo'].map((tipoKey) => {
                        const bloque = hoveredClub.horarios[tipoKey];
                        if (!bloque) return null;
                        const titulo = tipoKey === 'consumo' ? 'Horario de Consumo' : 'Horario de Cultivo';
                        return (
                          <Box key={tipoKey} sx={{ mb: 0.6 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.3 }}>
                              {titulo}
                            </Typography>

                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0.3 }}>
                              {['lunes','martes','miércoles','jueves','viernes','sábado','domingo'].map((dia) => {
                                const d = bloque[dia] || bloque[dia.toLowerCase()] || { abre: 'cerrado', cierra: '' };
                                const abierto = d.abre && d.abre.toString().toLowerCase() !== 'cerrado' && d.abre !== '';
                                return (
                                  <Box key={dia} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{dia.charAt(0).toUpperCase() + dia.slice(1)}</Typography>
                                    <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
                                      {abierto ? `${d.abre} — ${d.cierra}` : 'Cerrado'}
                                    </Typography>
                                  </Box>
                                );
                              })}
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  )}

                  <Box sx={{ mt: 0.6 }}>
                    <Button
                      size="small"
                      variant="contained"
                      sx={{ mt: 0.3, alignSelf: 'flex-start' }}
                      onClick={() => {
                        const safeName = encodeURIComponent(hoveredClub.nombre_club || hoveredClub.id || '');
                        setHoveredClub(null);
                        navigate(`/clubs/${safeName}`);
                      }}
                    >
                      Ver club
                    </Button>
                  </Box>
                </Box>

                {hoveredClub.reservacion === true && (
                  <Box
                    sx={{
                      position: 'sticky',
                      left: 10,
                      right: 10,
                      bottom: -10,
                      bgcolor: '#d32f2f',
                      color: '#fff',
                      px: 1.2,
                      py: 0.5,
                      borderRadius: 1,
                      textAlign: 'center',
                      fontWeight: 800,
                      zIndex: 4000,
                      boxShadow: 4,
                      fontSize: 12,
                      pointerEvents: 'auto'
                    }}
                  >
                    Requiere reservación
                    <br /><br />
                  </Box>
                )}
              </Box>
            </InfoWindow>
          )}
        </GoogleMap>
      </Box>
    </Box>
  );
}
