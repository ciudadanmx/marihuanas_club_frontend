// src/components/Taxis/Pasajero.jsx
import React, { useEffect, useState, useCallback } from 'react';
import '../../styles/taxis.css';
import useGoogleMaps from '../../hooks/UseGoogleMaps'; // hook que ya modificamos
import { getDirections, addTaxiMarker } from '../../utils/mapUtils'; // opcional: para rutas o marcadores de taxis
import taxiIcon from '../../assets/taxi_marker.png';

const DEFAULT_FROM = { lat: 19.432608, lng: -99.133209 };
const DEFAULT_TO =   { lat: 19.4374453, lng: -99.14651119999999 };

const Pasajero = ({ onFoundDrivers = () => {} }) => {
  // datos del formulario / dirección
  const [fromAddress, setFromAddress] = useState('');
  const [toAddress, setToAddress] = useState('');

  // coordenadas (se usan para el POST y para centrar mapa)
  const [fromCoordinates, setFromCoordinates] = useState(DEFAULT_FROM);
  const [toCoordinates, setToCoordinates]     = useState(DEFAULT_TO);

  // posiciones de marker (para mantener consistencia)
  const [fromMarkerPosition, setFromMarkerPosition] = useState(DEFAULT_FROM);
  const [toMarkerPosition, setToMarkerPosition]     = useState(DEFAULT_TO);

  // loading / error UI
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [error, setError] = useState(null);

  // googleMapsLoaded lo maneja el hook internamente con setGoogleMapsLoaded
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);

  // llamamos al hook (misma firma que antes). Devuelve refs útiles.
  const { mapRef, fromMarkerRef, toMarkerRef } = useGoogleMaps(
    fromCoordinates,
    setFromCoordinates,
    setFromMarkerPosition,
    toCoordinates,
    setToCoordinates,
    setToMarkerPosition,
    setFromAddress,
    setToAddress,
    setGoogleMapsLoaded,
    googleMapsLoaded
  );

  // ------------- setear origen a ubicación actual si hay permiso -------------
  useEffect(() => {
    // Solo intentamos una vez al montar
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        // Actualizamos addresses y coordenadas; Autocomplete puede reescribir el address luego
        setFromCoordinates({ lat, lng });
        setFromMarkerPosition({ lat, lng });
        // Si el mapa ya existe, centrarlo
        if (mapRef && mapRef.current && mapRef.current.setCenter) {
          mapRef.current.setCenter({ lat, lng });
        }
        // intentamos rellenar una dirección amistosa con Geocoder (opcional)
        try {
          if (window.google && window.google.maps) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
              if (status === 'OK' && results && results[0]) {
                setFromAddress(results[0].formatted_address);
              }
            });
          }
        } catch (e) {
          // no crítico
          console.warn('Geocoder fail', e);
        }
      },
      (err) => {
        // si el usuario denegó o falló, dejamos el valor por defecto
        console.warn('Geolocation no disponible o denegada', err);
      },
      { maximumAge: 1000 * 60 * 5, timeout: 5000 }
    );
  }, [mapRef]);

  // ------------- Intercambiar origen / destino -------------
  const swapOriginDestination = useCallback(() => {
    // intercambiamos direcciones visibles
    const aAddr = fromAddress;
    const bAddr = toAddress;
    setFromAddress(bAddr);
    setToAddress(aAddr);

    // intercambiamos coordenadas y markers
    const aCoords = fromCoordinates;
    const bCoords = toCoordinates;
    setFromCoordinates(bCoords);
    setToCoordinates(aCoords);

    setFromMarkerPosition(bCoords);
    setToMarkerPosition(aCoords);

    // actualizar markers en mapa si existen
    if (fromMarkerRef && fromMarkerRef.current && toMarkerRef && toMarkerRef.current) {
      const a = fromMarkerRef.current.getPosition ? fromMarkerRef.current.getPosition() : null;
      // simple swap de posiciones
      fromMarkerRef.current.setPosition(bCoords);
      toMarkerRef.current.setPosition(aCoords);
    }

    // recentrar mapa al nuevo origen si existe
    if (mapRef && mapRef.current && mapRef.current.setCenter) {
      mapRef.current.setCenter(bCoords);
    }
  }, [fromAddress, toAddress, fromCoordinates, toCoordinates, mapRef, fromMarkerRef, toMarkerRef]);

  // ------------- Buscar taxistas (envía payload a Strapi) -------------
  const buscarTaxistas = async () => {
    setError(null);
    setLoadingSearch(true);

    const payload = {
      origin: fromCoordinates,
      destination: toCoordinates,
      originAddress: fromAddress,
      destinationAddress: toAddress,
    };

    try {
      const res = await fetch(`${process.env.REACT_APP_STRAPI_URL}/api/conductores-cercanos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // intenta parsear el error del backend si lo devuelve
        const text = await res.text().catch(() => null);
        throw new Error(text || `Error en búsqueda (${res.status})`);
      }

      const data = await res.json();
      console.log('Taxis encontrados:', data);
      onFoundDrivers(data);
    } catch (err) {
      console.error('buscarTaxistas error:', err);
      setError(err.message || 'Error buscando taxistas');
    } finally {
      setLoadingSearch(false);
    }
  };

  // ------------- UI y botones -------------
  return (
    <div className="taxis-container">
      <h3 className="trip-title" style={{ textAlign: 'center' }}>Buscar un viaje</h3>

      <div className="inputs-row" style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <label htmlFor="from-input" style={{ display: 'block', marginBottom: 4 }}>Origen</label>
          <input
            id="from-input"
            type="text"
            placeholder="Origen (tu ubicación por defecto)"
            value={fromAddress}
            onChange={(e) => setFromAddress(e.target.value)}
            className="lugar-input formulario-pasajero pasajero-origen"
            style={{ width: '100%', padding: 8 }}
          />
        </div>

        <div style={{ width: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button
            title="Intercambiar origen/destino"
            onClick={swapOriginDestination}
            style={{ padding: 8, cursor: 'pointer' }}
          >
            ⇅
          </button>
        </div>

        <div style={{ flex: 1 }}>
          <label htmlFor="to-input" style={{ display: 'block', marginBottom: 4 }}>Destino</label>
          <input
            id="to-input"
            type="text"
            placeholder="Destino"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            className="lugar-input formulario-pasajero pasajero-origen"
            style={{ width: '100%', padding: 8 }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button
          onClick={buscarTaxistas}
          disabled={loadingSearch}
          className="buscar-taxistas formulario-pasajero pasajero-buscar"
          style={{
            flex: 1,
            padding: '12px 16px',
            backgroundColor: '#ff4081',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: loadingSearch ? 'default' : 'pointer',
          }}
        >
          {loadingSearch ? 'Buscando taxistas...' : 'Buscar Taxistas'}
        </button>

        <button
          onClick={() => {
            // centrar mapa en origen actual
            if (mapRef && mapRef.current) mapRef.current.setCenter(fromCoordinates);
          }}
          style={{
            padding: '12px 12px',
            background: '#eee',
            border: '1px solid #ccc',
            borderRadius: 8,
            cursor: 'pointer',
          }}
          title="Centrar en origen"
        >
          📍
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: 8 }}>
          {error}
        </div>
      )}

      <div className="taxis-map formulario-pasajero" style={{ width: '100%', height: '60vh', borderRadius: 8, overflow: 'hidden' }}>
        {/* El hook crea el mapa buscando #map en el DOM (firma heredada) */}
        <div id="map" style={{ width: '100%', height: '100%' }} />
      </div>

      <div className="cuadro-coordenadas formulario-pasajero" style={{ marginTop: 12 }}>
        <h4>Coordenadas actuales (origen)</h4>
        <p><strong>Lat:</strong> {fromCoordinates.lat?.toFixed(6)}</p>
        <p><strong>Lng:</strong> {fromCoordinates.lng?.toFixed(6)}</p>
      </div>
    </div>
  );
};

export default Pasajero;
