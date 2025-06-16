//import React from 'react';

import '../../styles/NotificationsMenu.css';
//import Sesion from './Sesion';
//import { gapi } from 'gapi-script';
import { useState, useEffect } from 'react';


const NotificationsMenu = ({ handleLogout, isOpen, setIsOpen, containerRef, onClose,  onLogout }) => {



  return (
    <div ref={containerRef}>
    <div className={`notifications-menu ${isOpen ? 'open' : 'closed'} purple`}>
    <ul>
     
        <>

          <li onClick={handleLogout}>1Cerrar sesión.</li>
          <li onClick={handleLogout}>2Cerrar sesión.</li>
          <li onClick={handleLogout}>3Cerrar sesión.</li>
          <li onClick={handleLogout}>4Cerrar sesión.</li>
          <li onClick={handleLogout}>5Cerrar sesión.</li>
          <li onClick={handleLogout}>6Cerrar sesión.</li>
          <li onClick={handleLogout}>7Cerrar sesión.</li>
          
          
        </>
      
      
      
    </ul>
  </div>
  </div>
  );
};

export default NotificationsMenu;
