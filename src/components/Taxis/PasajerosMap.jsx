import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import io from 'socket.io-client';
import '../../styles/taxis.css';
import { initializeMap, addTaxiMarker, loadGoogleMaps, createDirectionsRenderer, getDirections } from '../../utils/mapUtils';
import taxiIcon from '../../assets/taxi_marker.png';
import UserLocation from '../Usuarios/UserLocation';

const Pasajero = ({ setShowTabs, setHideTabs, showTabs, hideTabs, setActiveTab, setShiftToConductor }) => {
  const { user, isAuthenticated } = useAuth0();
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [userCoords, setUserCoords] = useState(null);
  const [tripOffer, setTripOffer] = useState(null);
  const [map, setMap] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);

  const mapRef = useRef(null);

  // Cargar Google Maps y configurar el mapa
  useEffect(() => {
    console.log('useEffect: iniciando loadGoogleMaps');
    // llama la función y no devuelvas la promesa directamente
    const cleanup = loadGoogleMaps(setGoogleMapsLoaded);
    // si loadGoogleMaps devuelve una función de limpieza, devuélvela; si no, devuelve undefined
    return typeof cleanup === 'function' ? cleanup : undefined;
  }, []);

  // Inicializa el mapa cuando googleMapsLoaded sea true
  useEffect(() => {
    console.log('useEffect: googleMapsLoaded =>', googleMapsLoaded);
    if (googleMapsLoaded && window.google) {
      console.log('Inicializando mapa DOM #map');
      const el = document.getElementById('map');
      if (!el) {
        console.error('#map no existe en DOM al inicializar');
        return;
      }
      // Asegura height mínimo para evitar 0px
      if (!el.style.height) el.style.height = '100vh';

      mapRef.current = new window.google.maps.Map(el, {
        center: { lat: 19.432607, lng: -99.133209 },
        zoom: 14,
      });
      setMap(mapRef.current);
      console.log('Mapa inicializado correctamente', mapRef.current);
    }
  }, [googleMapsLoaded]);

  // Escuchar la oferta del conductor
  useEffect(() => {
    const socket = io(process.env.REACT_APP_SOCKET_URL);
    socket.on('oferta', (data) => {
      if (data) {
        console.log('Oferta recibida:', data);
        setTripOffer(data);
        if (map && window.google) {
          addTaxiMarker(map, data.coordinates, taxiIcon);
          const directionsService = new window.google.maps.DirectionsService();
          const directionsRenderer = new window.google.maps.DirectionsRenderer();
          directionsRenderer.setMap(map);
          setDirectionsRenderer(directionsRenderer);
          getDirections(data.originAddress, data.destinationAddress, directionsService, directionsRenderer);
        }
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [map]);

  // Configurar el mapa con la localización del pasajero
  useEffect(() => {
    const fetchUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const { latitude, longitude } = position.coords;
          setUserCoords({ lat: latitude, lng: longitude });
          if (map && window.google) {
            map.setCenter({ lat: latitude, lng: longitude });
          }
        }, (err) => {
          console.warn('Geolocation error:', err);
        });
      } else {
        console.warn('Geolocation no disponible en este navegador');
      }
    };
    fetchUserLocation();
  }, [map]);

  const handleConductor = () => {
    setShowTabs(false);
    setActiveTab('conductor');
    setShiftToConductor(true);
  };

  return (
    <div className="pasajero-container">
      <div id="map" style={{ height: '100vh', width: '100%' }}></div>
      {tripOffer && (
        <div className="trip-details">
          <p><strong>Origen:</strong> {tripOffer.originAddress}</p>
          <p><strong>Destino:</strong> {tripOffer.destinationAddress}</p>
        </div>
      )}
      <button onClick={handleConductor}>Ver conductor</button>
    </div>
  );
};

export default Pasajero;
