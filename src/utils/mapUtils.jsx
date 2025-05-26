// mapUtils.jsx

// Centra el mapa en unas coordenadas y ajusta el zoom a 14.5 (o el que se indique)
export const initializeMap = (mapRef, userCoords) => {
    if (mapRef.current) {
      mapRef.current.setCenter(userCoords);
      mapRef.current.setZoom(14.5);
    }
  };
  
  // Agrega un marcador de taxi en el mapa con un ícono personalizado (por ejemplo, taxi rosa)
  export const addTaxiMarker = (mapRef, userCoords, taxiIcon) => {
    if (mapRef.current && window.google) {
      return new window.google.maps.Marker({
        map: mapRef.current,
        position: userCoords,
        icon: {
          url: taxiIcon,
          scaledSize: new window.google.maps.Size(48, 48),
        },
      });
    }
    return null;
  };
  
  // Carga la API de Google Maps de forma dinámica
  export const loadGoogleMaps = (setGoogleMapsLoaded) => {
    if (window.google) {
      setGoogleMapsLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_PLACES_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleMapsLoaded(true);
    script.onerror = (error) => {
      console.error('Error al cargar Google Maps API:', error);
    };
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  };
  
  // Inicializa el mapa en el contenedor con ID 'map' usando las coordenadas centrales y el zoom indicado (por defecto 14)
  export const initMap = (mapRef, centerCoords, zoom = 14) => {
    if (!window.google || !mapRef.current) return;
    mapRef.current = new window.google.maps.Map(document.getElementById('map'), {
      center: centerCoords,
      zoom: zoom,
    });
  };
  
  // Agrega un marcador en el mapa, con opción de ícono personalizado
  export const addMarker = (mapRef, position, icon = null) => {
    if (!window.google || !mapRef.current) return;
    return new window.google.maps.Marker({
      map: mapRef.current,
      position: position,
      icon: icon ? { url: icon, scaledSize: new window.google.maps.Size(32, 32) } : null,
    });
  };
  
  // Crea un DirectionsRenderer y lo asocia al mapa
  export const createDirectionsRenderer = (mapRef) => {
    const directionsRenderer = new window.google.maps.DirectionsRenderer();
    directionsRenderer.setMap(mapRef.current);
    return directionsRenderer;
  };
  
  // Actualiza o crea el marcador del punto de recogida
  export const updatePickupMarker = (startLocation, map, pickupMarkerRef) => {
    if (!pickupMarkerRef.current) {
      pickupMarkerRef.current = new window.google.maps.Marker({
        position: startLocation,
        map: map,
        title: "Punto de recogida",
      });
    } else {
      pickupMarkerRef.current.setPosition(startLocation);
      pickupMarkerRef.current.setMap(map);
    }
  };
  
  // Solicita direcciones entre origen y destino, actualiza el DirectionsRenderer y coloca el marcador de recogida
  export const getDirections = (
    origin,
    destination,
    directionsService,
    directionsRendererRef,
    mapRef,
    pickupMarkerRef
  ) => {
    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          directionsRendererRef.current.setDirections(result);
          const startLocation = result.routes[0].legs[0].start_location;
          updatePickupMarker(startLocation, mapRef.current, pickupMarkerRef);
        } else {
          console.error("Error fetching directions", result);
        }
      }
    );
  };
  
  // Resetea el zoom del mapa al valor indicado (por defecto 17)
  export const resetMapZoom = (mapRef, zoom = 14) => {
    if (mapRef.current) {
      mapRef.current.setZoom(zoom);
    }
  };
  