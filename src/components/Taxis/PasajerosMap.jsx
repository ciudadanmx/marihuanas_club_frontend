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
    return loadGoogleMaps(setGoogleMapsLoaded);
  }, []);

  useEffect(() => {
    if (googleMapsLoaded && window.google) {
      mapRef.current = new window.google.maps.Map(document.getElementById('map'), {
        center: { lat: 19.432607, lng: -99.133209 },
        zoom: 14,
      });
      setMap(mapRef.current);
    }
  }, [googleMapsLoaded]);

  // Escuchar la oferta del conductor
  useEffect(() => {
    const socket = io(process.env.REACT_APP_SOCKET_URL);

    socket.on('oferta', (data) => {
      if (data) {
        console.log('Oferta recibida:', data); // Muestra los detalles de la oferta en consola
        setTripOffer(data); // Actualiza el estado con los datos de la oferta

        if (map && window.google) {
          // Añadir marcador del conductor
          addTaxiMarker(map, data.coordinates, taxiIcon);

          // Si hay una ruta, actualizar la dirección
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
        });
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
