import React, { useState, useContext } from 'react';
//import '../styles/CuentaIcon.css';
import { TbHelpTriangleFilled } from "react-icons/tb";
import MenuMenu from './MenuMenu';
//import { gapi } from 'gapi-script';
import { useAuth0 } from '@auth0/auth0-react';
import { AuthProvider } from '../../Contexts/AuthContext'; // Importa el contexto

import '../../styles/MessagesIcon.css';
 

const MenuIcon = ({ count = 0 }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    //const { isAuthenticated, setAuthenticated, user, userData, setUserData } = useContext(AuthProvider);

  
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
      };

  return (
    
      
      <div className="message-icon-container" onClick={toggleMenu}>
       <TbHelpTriangleFilled className="message-icon" />
        
      
        <MenuMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        
      />
    </div>





  );
};

export default MenuIcon;
