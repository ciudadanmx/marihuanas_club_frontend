// src/components/MapaClubs.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLoadScript, GoogleMap, Marker, InfoWindow, StandaloneSearchBox } from '@react-google-maps/api';
import { Box, CircularProgress, Typography, Button, Avatar, Chip, TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { useNavigate } from 'react-router-dom';
import { useRoles } from '../../Contexts/RolesContext'; 

import cultivoIcon from '../../assets/marcador_club_cultivo.png';
import consumoIcon from '../../assets/marcador_club_consumo.png';
import ambosIcon from '../../assets/marcador_club_ambos.png';

// placeholder SVG (usado para precarga/inicial) y GIF (interacción)
import markerPlaceholderSVG from '../../assets/club_ambos.svg';
import markerHoverGIF from '../../assets/marcador_club_ambos.gif';

const STRAPI_URL = process.env.REACT_APP_STRAPI_URL || '';
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const libraries = ['places'];

const activar = '/membresias';

const mapContainerStyle = {
  width: '100%',
  maxWidth: '1100px',
  height: '420px',
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

export default function MapaClubs() {
  const { isLoaded, loadError } = useLoadScript({ googleMapsApiKey: GOOGLE_MAPS_API_KEY, libraries });

  const { membresia } = useRoles();
  const [hasAccess, setHasAccess] = useState(membresia);
  const [center, setCenter] = useState(defaultCenter);
  const [zoom, setZoom] = useState(defaultZoom);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // índice del marker que está en hover (para mostrar GIF) -> única fuente para popup también
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // precarga de PNGs por tipo
  const [pngReadyMap, setPngReadyMap] = useState({
    cultivo: false,
    consumo: false,
    ambos: false,
  });
  const [gifReady, setGifReady] = useState(false);

  // buscador
  const [cityOnly, setCityOnly] = useState(true);
  const searchBoxRef = useRef(null);

  const mapRef = useRef();
  const markerRefs = useRef({}); // <-- guardamos instancia de cada marker aquí
  const infoWindowRef = useRef(null); // <-- InfoWindow única reutilizable

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

  /* ==========================
     Precarga PNGs y GIF + placeholder
     - objetivo: nunca quedarse en limbo; si PNG falla usamos placeholder
     ========================== */
  useEffect(() => {
    const mapping = {
      cultivo: cultivoIcon,
      consumo: consumoIcon,
      ambos: ambosIcon,
    };

    Object.entries(mapping).forEach(([key, src]) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setPngReadyMap(prev => ({ ...prev, [key]: true }));
      };
      img.onerror = () => {
        // si falla, dejamos false (seguir usando placeholder)
        setPngReadyMap(prev => ({ ...prev, [key]: false }));
      };
    });

    // precargar GIF interactivo (opcional)
    const gif = new Image();
    gif.src = markerHoverGIF;
    gif.onload = () => setGifReady(true);
    gif.onerror = () => setGifReady(false);

    // también pre-cargamos svg placeholder (suele ser instantáneo)
    const svg = new Image();
    svg.src = markerPlaceholderSVG;
    // no hace falta onload handler estrictamente
  }, []);

  /* ================= INFOWINDOW ÚNICO ================= */
  useEffect(() => {
    if (window.google && !infoWindowRef.current) {
      infoWindowRef.current = new window.google.maps.InfoWindow({
        pixelOffset: new window.google.maps.Size(0, -30),
      });
    }

    // cerrar al desmontar componente
    return () => {
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
        infoWindowRef.current = null;
      }
    };
  }, []);

  const closeInfoWindow = () => {
    if (infoWindowRef.current) infoWindowRef.current.close();
  };

  // Construye el HTML del contenido del popup (replica el contenido principal)
  const buildInfoContent = (club) => {
    const wrapper = document.createElement('div');
    wrapper.style.maxWidth = '340px';
    wrapper.style.fontFamily = "'Roboto', sans-serif";
    wrapper.style.display = 'flex';
    wrapper.style.gap = '8px';
    wrapper.style.alignItems = 'flex-start';

    // Imagen / avatar
    const img = document.createElement('img');
    img.style.width = '56px';
    img.style.height = '56px';
    img.style.borderRadius = '6px';
    img.style.objectFit = 'cover';
    img.src = club.foto_de_perfil?.url || club.fotoUrl || '';
    wrapper.appendChild(img);

    const right = document.createElement('div');
    right.style.display = 'flex';
    right.style.flexDirection = 'column';
    right.style.minWidth = '0';

    // Nombre + chips (simplificado visualmente)
    const topRow = document.createElement('div');
    topRow.style.display = 'flex';
    topRow.style.flexWrap = 'wrap';
    topRow.style.gap = '6px';
    topRow.style.alignItems = 'center';

    const name = document.createElement('div');
    name.textContent = club.nombre_club || 'Club sin nombre';
    name.style.fontWeight = '700';
    name.style.fontSize = '15px';
    name.style.whiteSpace = 'nowrap';
    name.style.overflow = 'hidden';
    name.style.textOverflow = 'ellipsis';
    name.style.maxWidth = '180px';
    topRow.appendChild(name);

    // Chip tipo simple
    const tipo = (club.tipo || '').toString().toLowerCase();
    if (tipo === 'consumo' || tipo === 'cultivo' || tipo.includes('ambas') || tipo.includes('consumo') || tipo.includes('cultivo')) {
      const chip = document.createElement('div');
      chip.style.padding = '2px 6px';
      chip.style.borderRadius = '6px';
      chip.style.fontSize = '11px';
      chip.style.fontWeight = '700';
      chip.style.marginLeft = '4px';
      if (tipo === 'consumo') { chip.textContent = 'Club de Consumo'; chip.style.background = '#ffb74d'; chip.style.color = '#3e2723'; }
      else if (tipo === 'cultivo') { chip.textContent = 'Club de Cultivo'; chip.style.background = '#a5d6a7'; chip.style.color = '#1b5e20'; }
      else { chip.textContent = 'Club de Cultivo y Consumo'; chip.style.background = '#ce93d8'; chip.style.color = '#4a148c'; }
      topRow.appendChild(chip);
    }

    right.appendChild(topRow);

    // Descripción
    const desc = document.createElement('div');
    desc.style.color = '#666';
    desc.style.fontSize = '13px';
    desc.style.maxHeight = '40px';
    desc.style.overflow = 'hidden';
    desc.style.textOverflow = 'ellipsis';
    desc.textContent = club.descripcion || 'Sin descripción.';
    right.appendChild(desc);

    // Productos (lista corta)
    if (Array.isArray(club.productos) && club.productos.length > 0) {
      const productsWrapper = document.createElement('div');
      productsWrapper.style.marginTop = '6px';
      const title = document.createElement('div');
      title.style.fontSize = '11px';
      title.style.fontWeight = '700';
      title.textContent = 'Productos';
      productsWrapper.appendChild(title);

      const list = document.createElement('div');
      list.style.display = 'flex';
      list.style.flexWrap = 'wrap';
      list.style.gap = '6px';
      club.productos.slice(0,6).forEach(p => {
        const chip = document.createElement('div');
        chip.style.padding = '2px 6px';
        chip.style.border = '1px solid #ddd';
        chip.style.borderRadius = '6px';
        chip.style.fontSize = '11px';
        chip.textContent = (typeof p === 'string' ? p : (p.nombre || p.titulo || JSON.stringify(p))).slice(0,30);
        list.appendChild(chip);
      });
      productsWrapper.appendChild(list);
      right.appendChild(productsWrapper);
    }

    // Servicios (lista)
    if (Array.isArray(club.servicios) && club.servicios.length > 0) {
      const servWrapper = document.createElement('div');
      servWrapper.style.marginTop = '6px';
      const title = document.createElement('div');
      title.style.fontSize = '11px';
      title.style.fontWeight = '700';
      title.textContent = 'Servicios';
      servWrapper.appendChild(title);

      const list = document.createElement('div');
      list.style.display = 'flex';
      list.style.flexDirection = 'column';
      list.style.gap = '4px';
      club.servicios.slice(0,4).forEach(s => {
        const row = document.createElement('div');
        row.style.fontSize = '12px';
        row.style.color = '#666';
        row.textContent = '• ' + (typeof s === 'string' ? s : (s.nombre || s.descripcion || JSON.stringify(s)));
        list.appendChild(row);
      });
      servWrapper.appendChild(list);
      right.appendChild(servWrapper);
    }

    // Horarios (simplificado: muestra hasta dos tipos)
    if (club.horarios && typeof club.horarios === 'object') {
      const horariosWrapper = document.createElement('div');
      horariosWrapper.style.marginTop = '6px';
      ['consumo','cultivo'].forEach(tipoKey => {
        const bloque = club.horarios[tipoKey];
        if (!bloque) return;
        const title = document.createElement('div');
        title.style.fontSize = '11px';
        title.style.fontWeight = '700';
        title.textContent = tipoKey === 'consumo' ? 'Horario de Consumo' : 'Horario de Cultivo';
        horariosWrapper.appendChild(title);

        const grid = document.createElement('div');
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
        grid.style.gap = '4px';
        ['lunes','martes','miércoles','jueves','viernes','sábado','domingo'].forEach(dia => {
          const d = bloque[dia] || bloque[dia.toLowerCase()] || { abre: 'cerrado', cierra: '' };
          const abierto = d.abre && d.abre.toString().toLowerCase() !== 'cerrado' && d.abre !== '';
          const row = document.createElement('div');
          row.style.display = 'flex';
          row.style.justifyContent = 'space-between';
          row.style.fontSize = '12px';
          const left = document.createElement('div');
          left.style.color = '#666';
          left.textContent = dia.charAt(0).toUpperCase() + dia.slice(1);
          const rightT = document.createElement('div');
          rightT.style.fontWeight = '600';
          rightT.textContent = abierto ? `${d.abre} — ${d.cierra}` : 'Cerrado';
          row.appendChild(left);
          row.appendChild(rightT);
          grid.appendChild(row);
        });
        horariosWrapper.appendChild(grid);
      });
      right.appendChild(horariosWrapper);
    }

    // Botón ver club
    const btn = document.createElement('button');
    btn.textContent = 'Ver club';
    btn.style.marginTop = '8px';
    btn.style.padding = '6px 10px';
    btn.style.background = '#1976d2';
    btn.style.color = '#fff';
    btn.style.border = 'none';
    btn.style.borderRadius = '6px';
    btn.style.cursor = 'pointer';
    btn.onclick = () => {
      if (infoWindowRef.current) infoWindowRef.current.close();
      navigate(`/clubs/${encodeURIComponent(club.nombre_club || club.id || '')}`);
    };
    right.appendChild(btn);

    // Barra reservación (si aplica)
    if (club.reservacion === true) {
      const r = document.createElement('div');
      r.textContent = 'Requiere reservación';
      r.style.background = '#d32f2f';
      r.style.color = '#fff';
      r.style.padding = '6px';
      r.style.borderRadius = '6px';
      r.style.fontWeight = '800';
      r.style.marginTop = '8px';
      right.appendChild(r);
    }

    wrapper.appendChild(right);
    return wrapper;
  };

  const handlePlacesChanged = () => {
    const sb = searchBoxRef.current;
    if (!sb) return;
    const places = sb.getPlaces ? sb.getPlaces() : [];
    if (!places || places.length === 0) return;
    const place = places[0];
    if (place.geometry) {
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

  const fetchClubs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${STRAPI_URL}/api/clubs?populate=*&pagination[pageSize]=1000`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const itemsRaw = json.data || [];

      const items = itemsRaw.map(item => {
        const a = item.attributes || {};
        const fotoData = a.foto_de_perfil?.data?.attributes || null;
        let fotoUrl = null;
        if (fotoData && fotoData.url) {
          fotoUrl = fotoData.url.startsWith('http') ? fotoData.url : `${STRAPI_URL}${fotoData.url}`;
        }
        return { ...a, fotoUrl };
      });

      const filtered = items.filter(club => {
        if (!club.lat || !club.lng) return false;
        try {
          return haversineDistance(center.lat, center.lng, club.lat, club.lng) <= RADIUS_KM;
        } catch { return false; }
      });

      setClubs(filtered);
      // limpiar hover por si había algún índice inválido (evita popups vacíos)
      setHoveredIndex(null);
      // cerrar cualquier infowindow abierta al actualizar clubes
      closeInfoWindow();
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }, [center]);

  useEffect(() => { fetchClubs(); }, [fetchClubs]);

  // hoveredClub derivado desde hoveredIndex -> evita inconsistencias
  const hoveredClub = (hoveredIndex !== null && clubs[hoveredIndex]) ? clubs[hoveredIndex] : null;

  // cuando cambia hoveredIndex abrimos / cerramos la única InfoWindow
  useEffect(() => {
    if (!infoWindowRef.current || !mapRef.current) return;

    if (hoveredIndex === null) {
      infoWindowRef.current.close();
      return;
    }

    const marker = markerRefs.current[hoveredIndex];
    const club = clubs[hoveredIndex];
    if (!marker || !club) {
      infoWindowRef.current.close();
      return;
    }

    // setContent con DOM node
    const content = buildInfoContent(club);
    infoWindowRef.current.setContent(content);
    // abrir anclada al marker
    try {
      infoWindowRef.current.open({ anchor: marker, map: mapRef.current, shouldFocus: false });
    } catch (e) {
      // fallback por si la forma de abrir falla
      infoWindowRef.current.open(mapRef.current);
      infoWindowRef.current.setPosition({ lat: club.lat, lng: club.lng });
    }

    // cleanup: si desaparece el marker o cambia hoveredIndex se cerrará en siguiente efecto
  }, [hoveredIndex, clubs]);

  if (loadError) return <Typography color="error">Error loading maps</Typography>;
  if (!isLoaded) return <Box sx={{ textAlign: 'center', my: 4 }}><CircularProgress /></Box>;

  const searchOptions = cityOnly ? { types: ['(cities)'], componentRestrictions: { country: 'mx' } } : {};

  return (
    <Box sx={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
      <Box sx={mapContainerStyle}>

        {/* BUSCADOR */}
        <Box sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            zIndex: 30,
            display: 'flex',
            gap: 1,
            alignItems: 'center',
            flexWrap: 'wrap',
            maxWidth: 'calc(100% - 20px)'
          }}>
          <StandaloneSearchBox
            onLoad={handleSearchLoad}
            onPlacesChanged={handlePlacesChanged}
            options={searchOptions}
          >
            <TextField
              size="small"
              placeholder={cityOnly ? 'Buscar ciudad...' : 'Buscar lugar o dirección...'}
              variant="outlined"
              sx={{ width: { xs: '100%', sm: 320 }, bgcolor: 'background.paper' }}
              InputProps={{
                startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>),
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
                <Button variant="contained" onClick={() => navigate(activar)} sx={{ mt: 1 }}>Activar membresía</Button>
          </Box>
        )}

        {loading && (<Box sx={{ textAlign: 'center', my: 2 }}><CircularProgress /><Typography>Cargando clubes...</Typography></Box>)}
        {error && (<Typography color="error">Error: {error}</Typography>)}

        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={center}
          zoom={zoom}
          onLoad={onMapLoad}
          onZoomChanged={onZoomChanged}
          options={{ zoomControl: true, mapTypeControl: false, streetViewControl: false, fullscreenControl: false }}
        >
          {/* MARKERS */}
          {hasAccess && clubs.map((club, idx) => {
            // determinamos cuál PNG es el final para este club
            let finalIcon = ambosIcon;
            let typeKey = 'ambos';
            const tipoStr = (club.tipo || '').toString().toLowerCase();
            if (tipoStr.includes('cultivo') && !tipoStr.includes('consumo')) {
              finalIcon = cultivoIcon;
              typeKey = 'cultivo';
            } else if (tipoStr.includes('consumo') && !tipoStr.includes('cultivo')) {
              finalIcon = consumoIcon;
              typeKey = 'consumo';
            } else {
              // club_ambos (ambos o mezcla) se queda en 'ambos'
              finalIcon = ambosIcon;
              typeKey = 'ambos';
            }

            // si PNG para este tipo ya está listo, úsalo; si no, usa placeholder SVG
            const iconIfReady = pngReadyMap[typeKey] ? finalIcon : markerPlaceholderSVG;

            // si este marker está en hover y gif está listo usamos gif (interacción) — GIF siempre es el de 'ambos'
            const isHovered = hoveredIndex === idx;
            const iconToShow = (isHovered && gifReady) ? markerHoverGIF : iconIfReady;

            const size = Math.max(28, 18 + (typeof zoom === 'number' ? zoom : defaultZoom));

            const onMarkerClick = () => {
              const safeName = encodeURIComponent(club.nombre_club || club.id || `club-${idx}`);
              setHoveredIndex(null); // cerrar popup si clickean y navegar
              navigate(`/clubs/${safeName}`);
            };

            return (
              <Marker
                key={`${idx}-${pngReadyMap[typeKey] ? '1' : '0'}`} // fuerza re-render solo cuando cambia el estado de PNG disponible
                position={{ lat: club.lat, lng: club.lng }}
                title={club.nombre_club}
                icon={{
                  url: iconToShow,
                  scaledSize: new window.google.maps.Size(size, size)
                }}
                clickable
                onClick={onMarkerClick}
                onMouseOver={() => { if (hoveredIndex !== idx) setHoveredIndex(idx); }}
                onMouseOut={() => { if (hoveredIndex === idx) setHoveredIndex(null); }}
                onLoad={(marker) => { markerRefs.current[idx] = marker; }}
                onUnmount={() => { delete markerRefs.current[idx]; }}
              />
            );
          })}

          {/* Nota: ya no usamos <InfoWindow> de React — manejamos una sola instancia nativa para evitar fantasmas */}
        </GoogleMap>
      </Box>
    </Box>
  );
}
