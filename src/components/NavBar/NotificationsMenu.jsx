//import React from 'react';

import '../../styles/NotificationsMenu.css';
//import Sesion from './Sesion';
//import { gapi } from 'gapi-script';
import { useState, useEffect } from 'react';


const NotificationsMenu = ({ handleLogout, isOpen, onClose,  onLogout }) => {



  return (
    <div className={`notifications-menu ${isOpen ? 'open' : 'closed'}`}>
    <ul>
     
        <>

          <li onClick={handleLogout}>Cerrar sesión.</li>
          <li onClick={handleLogout}>Cerrar sesión.</li>
          <li onClick={handleLogout}>Cerrar sesión.</li>
          <li onClick={handleLogout}>Cerrar sesión.</li>
          <li onClick={handleLogout}>Cerrar sesión.</li>
          <li onClick={handleLogout}>Cerrar sesión.</li>
          <li onClick={handleLogout}>Cerrar sesión.</li>
          
          
        </>
      
      
      
    </ul>
  </div>
  );
};

export default NotificationsMenu;
