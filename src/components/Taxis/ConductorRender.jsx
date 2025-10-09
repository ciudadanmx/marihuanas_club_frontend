import React from 'react';
import formaters from '../../utils/formaters';

import UserLocation from '../Usuarios/UserLocation';
import { RolPasajero, RolConductor } from './Roles';
import ConductorContainer from './ConductorContainer';
import EsperandoViaje from './EsperandoViaje.jsx';

const { formatTime, formatPrice } = formaters;

const ConductorRender = ({
  isWaiting,
  googleMapsLoaded,
  mapRef,
  userCoords,
  setUserCoords,
  travelData,
  consultedTravel,
  handleTravelCardClick,
  handleBackButtonClick,
  handleCloseButtonClick,
  handleAcceptTrip,
  handlePasajero,
  handleConductor,
  ElapsedTimer,
  showTabs,
  hideTabs,
}) => {
  return (
    <ConductorContainer>
      {googleMapsLoaded && mapRef.current && (
        <UserLocation onLocation={setUserCoords} map={mapRef.current} />
      )}
      {isWaiting ? (
        <div>
          <EsperandoViaje
          handlePasajero={handlePasajero}
          handleConductor={handleConductor}
          rol='conductor'
        />
        </div>
      ) : (
        <div className="travel-list">
          {consultedTravel === null ? (
            travelData.map((travel, index) => (
              <a
                href="#"
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  handleTravelCardClick(index);
                }}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="travel-container">
                  <button
                    className="close-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseButtonClick(index);
                    }}
                  >
                    ✖
                  </button>
                  <div className="travel-header">
                    <div className="travel-info-container">
                      <div className="travel-row">
                        <p className="travel-label"><strong>De:</strong></p>
                        <p className="travel-info">{travel.originAdress}</p>
                      </div>
                      <div className="travel-row">
                        <p className="travel-label"><strong>A:</strong></p>
                        <p className="travel-info">{travel.destinationAdress || 'sin datos'}</p>
                      </div>
                    </div>
                    <div className="travel-price">
                      <span className="price-amount">
                        $ {travel && travel.price ? formatPrice(travel.price, 'enteros') : ''}.
                        <sup>{travel && travel.price ? formatPrice(travel.price, 'decimales') : ''}</sup>
                      </span>
                      <span className="travel-distance">
                        {(travel.totalDistance / 1000).toFixed(2)} km – {travel && travel.totalTime ? formatTime(travel.totalTime) : ''} min
                      </span>
                      <span className="travel-time">
                        <ElapsedTimer startTime={travel.requestTime} />
                      </span>
                    </div>
                  </div>
                  <div className="travel-buttons">
                  <button
                    className="accept-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAcceptTrip(index); // Pasar el índice correcto
                    }}
                  >
                    ➕ Aceptar Viaje
                  </button>
                  </div>
                </div>
              </a>
            ))
          ) : (
            <div className="single-travel-container">
              {/* Aquí se mostraría el detalle del viaje seleccionado */}
              <button className="back-button" onClick={handleBackButtonClick}>🔙 Atrás</button>
            </div>
          )}
        </div>
      )}
      <div className="taxis-map">
        <div id="map" style={{ width: '100%', height: '100%' }}></div>
      </div>
      {!showTabs && !hideTabs ? (
        <RolPasajero 
          handlePasajero={handlePasajero}
          handleConductor={handleConductor}
          rol='pasajero'
        />
      ) : (
        <RolConductor
          handlePasajero={handlePasajero}
          handleConductor={handleConductor}
          rol='conductor'
        />
      )}
    </ConductorContainer>
  );
};

export default ConductorRender;
