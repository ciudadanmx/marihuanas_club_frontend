import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import io from 'socket.io-client';
import '../../styles/taxis.css';
import formaters from '../../utils/formaters';
import minutesSince from '../../utils/timeSince';
import { initializeMap, addTaxiMarker, loadGoogleMaps, createDirectionsRenderer, updatePickupMarker, getDirections, resetMapZoom } from '../../utils/mapUtils';
import taxiIcon from '../../assets/taxi_marker.png';
import UserLocation from '../Usuarios/UserLocation';
import { RolPasajero, RolConductor } from './Roles';
import ConductorPresentation from './ConductorRender';

const { formatTime, formatPrice } = formaters;

const Conductor = ({ setShowTabs, setHideTabs, showTabs, hideTabs, setActiveTab, shiftToPasajero, setShiftToPasajero }) => { // Recibimos setShowTabs como prop
  const { user, isAuthenticated } = useAuth0();
  const [isWaiting, setIsWaiting] = useState(true);
  const [travelData, setTravelData] = useState([]);
  const [userId, setUserId] = useState(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [consultedTravel, setConsultedTravel] = useState(null);
  const [tabsHidden, setTabsHidden] = useState(false); // Nuevo estado para ocultar las tabs
  const zocaloCoords = { lat: 19.432607, lng: -99.133209 };
  const [userCoords, setUserCoords] = useState(null);

  const mapRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const pickupMarkerRef = useRef(null);

  // Carga del mapa
  useEffect(() => {
    return loadGoogleMaps(setGoogleMapsLoaded);
  }, []);
  
  // Renderizado del mapa
  useEffect(() => {
    if (googleMapsLoaded && window.google) {
      // Se usa getElementById en el componente de presentación; se espera que exista el div con id="map"
      mapRef.current = new window.google.maps.Map(document.getElementById('map'), {
        center: zocaloCoords,
        zoom: 14,
      });

      const fromMarker = new window.google.maps.Marker({
        map: mapRef.current,
        position: userCoords,
        icon: {
          url: '../assets/taxi_marker.png',
          scaledSize: new window.google.maps.Size(54,54 ),
        },
      });
    }
  }, [googleMapsLoaded, userCoords]);

  useEffect(() => {
    const fetchUserId = async () => {
      if (isAuthenticated && user?.email) {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_STRAPI_URL}/api/users`,
            { params: { 'filters[email]': user.email } }
          );
          if (response.data.length > 0) {
            setUserId(response.data[0].id);
          }
        } catch (error) {
          console.error('Error fetching user ID from Strapi:', error);
        }
      }
    };
    if (isAuthenticated && user) {
      fetchUserId();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    const socket = io(process.env.REACT_APP_SOCKET_URL);
    if (userId) {
      socket.on('trip-request', (data) => {
        if (data.driverId === userId) {
          setIsWaiting(false);
          setTravelData((prevTravelData) => [...prevTravelData, data]);
        }
      });
    }
    return () => {
      socket.disconnect();
    };
  }, [userId]);

  useEffect(() => {
    if (
      consultedTravel !== null &&
      googleMapsLoaded &&
      window.google &&
      mapRef.current
    ) {
      const travel = travelData[consultedTravel];
      if (
        travel &&
        travel.originAdress &&
        travel.destinationAdress &&
        travel.destinationAdress !== "sin datos"
      ) {
        const directionsService = new window.google.maps.DirectionsService();
        if (!directionsRendererRef.current) {
          directionsRendererRef.current = createDirectionsRenderer(mapRef);
        }
        getDirections(
          travel.originAdress,
          travel.destinationAdress,
          directionsService,
          directionsRendererRef,
          mapRef,
          pickupMarkerRef
        );
      }
    }
  }, [consultedTravel, googleMapsLoaded, travelData]);

  useEffect(() => {
    if (googleMapsLoaded && window.google && mapRef.current) {
      initializeMap(mapRef, userCoords);
      addTaxiMarker(mapRef, userCoords, taxiIcon);
    }
  }, [googleMapsLoaded, userCoords]);

  const handleTravelCardClick = (index) => {
    setConsultedTravel(index);
  };

  const handlePasajero = () => {
    setShowTabs(true);
    setActiveTab('pasajero');
  };
  
  const handleConductor = () => {
    setShowTabs(false);
    setActiveTab('conductor');
    setShiftToPasajero(true);
  };

  // Modificación en el handler de aceptar viaje
  const handleAcceptTrip = (index) => {
    const handleAcceptTrip = (index) => {
      console.log("🚖 aceptandooooooooooo");
      console.log("🔎 Índice recibido:", index);
      console.log("📦 travelData actual:", travelData);
    
      if (!Array.isArray(travelData)) {
        console.error("❌ travelData no es un array");
        return;
      }
    
      const selectedTrip = travelData[index]; // Accedemos al viaje correcto
    
      console.log("📍 Viaje seleccionado:", selectedTrip);
    
      if (!selectedTrip) {
        console.error(`❌ Error: No hay un viaje válido en travelData[${index}]`);
        return;
      }
    
      setConsultedTravel(selectedTrip);
      console.log("✅ Viaje aceptado:", selectedTrip);
    };
    
    
    console.log('aceptandooooooooooo');
    setHideTabs(true);
    setTabsHidden(true);
    setShowTabs(false);

    console.log('consultedTravel:', consultedTravel);
    console.log('travelData:', travelData);
    console.log('travelData[consultedTravel]:', travelData[consultedTravel]);

    let travel = travelData[consultedTravel];

    if (!travel) {
        console.error('❌ Error: No hay un viaje válido en travelData[consultedTravel]');
        return;
    }

    console.log('✅ Travel encontrado:', travel);

    const socket = io(process.env.REACT_APP_SOCKET_URL);
    socket.emit('oferta', {
        driverId: userId,
        travelId: travel.id,
        originAddress: travel.originAdress,
        destinationAddress: travel.destinationAdress,
        steps: travel.steps,
        coordinates: userCoords,
    });

    console.log('📤 Oferta enviada:', {
        driverId: userId,
        travelId: travel.id,
        originAddress: travel.originAdress,
        destinationAddress: travel.destinationAdress,
        steps: travel.steps,
    });
};

  const handleCloseButtonClick = (index) => {
    setTravelData((prevData) => prevData.filter((_, i) => i !== index));
    setIsWaiting(true); 
  };

  const handleBackButtonClick = () => {
    setConsultedTravel(null);
  };

  const ElapsedTimer = ({ startTime }) => {
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        const now = new Date();
        const start = new Date(startTime);
        const diffSeconds = Math.floor((now - start) / 1000);
        setElapsedSeconds(diffSeconds);
      }, 1000);

      return () => clearInterval(interval);
    }, [startTime]);

    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;

    return (
      <span>
        {minutes}:{seconds < 10 ? '0' : ''}{seconds}
      </span>
    );
  };

  return (
    <ConductorPresentation
      isWaiting={isWaiting}
      googleMapsLoaded={googleMapsLoaded}
      mapRef={mapRef}
      userCoords={userCoords}
      setUserCoords={setUserCoords}
      travelData={travelData}
      consultedTravel={consultedTravel}
      handleTravelCardClick={handleTravelCardClick}
      handleBackButtonClick={handleBackButtonClick}
      handleCloseButtonClick={handleCloseButtonClick}
      handleAcceptTrip={handleAcceptTrip}
      handlePasajero={handlePasajero}
      handleConductor={handleConductor}
      ElapsedTimer={ElapsedTimer}
      showTabs={showTabs}
      hideTabs={hideTabs}
    />
  );
};

export default Conductor;
