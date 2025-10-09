import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const STRAPI_URL = process.env.REACT_APP_STRAPI_URL;

const RolesContext = createContext();

export const useRoles = () => useContext(RolesContext); // ✅ Ahora está exportado

export const RolesProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth0();
  const [roles, setRoles] = useState(['invitado']); // Rol por defecto

  const fetchRoles = async () => {
    console.log('🔄 Fetching roles...');
    if (isAuthenticated && user) {
      try {
        console.log('🔍 Buscando roles en el servidor...');
        const response = await fetch(`${STRAPI_URL}/api/users?filters[email][$contains]=${user.email}`);
        const data = await response.json();
        
        if (data.length > 0 && data[0].roles) {
          setRoles(data[0].roles);
          console.log(`✅ Roles obtenidos: ${JSON.stringify(data[0].roles)}`);
        } else {
          setRoles(['usuario']);
          console.log('⚠ Usuario sin roles asignados.');
        }
      } catch (error) {
        console.error('❌ Error obteniendo roles:', error);
        setRoles(['usuario']);
      }
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [isAuthenticated, user]);

  return (
    <RolesContext.Provider value={{ roles, fetchRoles }}>
      {children}
    </RolesContext.Provider>
  );
};
