import React, { useState, useEffect } from 'react';
import '../../styles/taxis.css';
import useGoogleMaps from '../../hooks/UseGoogleMaps';

const Pasajero = () => {
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [fromCoordinates, setFromCoordinates] = useState({ lat: 19.432608, lng: -99.133209 });
  const [toCoordinates, setToCoordinates] = useState({ lat: 19.4374453, lng: -99.14651119999999 });
  const [fromMarkerPosition, setFromMarkerPosition] = useState({ lat: 19.432608, lng: -99.133209 });
  const [toMarkerPosition, setToMarkerPosition] = useState({ lat: 19.432608, lng: -99.133209 });
  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");

  // Llamamos al hook para manejar la carga del mapa y la lógica relacionada
  useGoogleMaps(
    fromCoordinates,
    setFromCoordinates,
    setFromMarkerPosition,
    toCoordinates,
    setToCoordinates,
    setToMarkerPosition,
    setFromAddress,
    setToAddress,
    setGoogleMapsLoaded,
    googleMapsLoaded // Pasamos googleMapsLoaded como parámetro
  );

  const buscarTaxistas = async () => {
    console.log("Buscando taxistas cercanos...");
    
    const payload = {
      origin: fromCoordinates,
      destination: toCoordinates,
      originAdress: fromAddress,
      destinationAdress: toAddress,
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_STRAPI_URL}/api/conductores-cercanos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Error en la petición");
      }

      const data = await response.json();
      console.log("Taxis encontrados:", data);
    } catch (error) {
      console.error("Error al buscar taxistas:", error);
    }
  };

  return (
    <div className='taxis-container'>
      <span className='formulario-pasajero trip-title'>
        <center>Buscar un viaje</center>
      </span>
      <input
        id="from-input"
        type="text"
        placeholder="Origen"
        value={fromAddress}
        onChange={(e) => setFromAddress(e.target.value)}
        className='lugar-input formulario-pasajero pasajero-origen'
      />

      <input
        id="to-input"
        type="text"
        placeholder="Destino"
        value={toAddress}
        onChange={(e) => setToAddress(e.target.value)}
        className='lugar-input formulario-pasajero pasajero-origen'
      />

      {/* Botón para buscar taxistas */}
      <button 
        onClick={buscarTaxistas} 
        className="buscar-taxistas formulario-pasajero pasajero-buscar"
      >
        Buscar Taxistas
      </button>

      <div className='taxis-map formulario-pasajero tapado'>
        <div id="map" style={{ width: '100%', height: '100%' }}></div>
      </div>

      <div className='cuadro-coordenadas formulario-pasajero tapado'>
        <h4>Coordenadas actuales:</h4>
        <p><strong>Latitud:</strong> {fromCoordinates.lat}</p>
        <p><strong>Longitud:</strong> {fromCoordinates.lng}</p>
      </div>
      
    </div>
  );
};

export default Pasajero;
