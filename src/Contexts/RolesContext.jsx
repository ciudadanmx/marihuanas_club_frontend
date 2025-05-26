import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const STRAPI_URL = process.env.REACT_APP_STRAPI_URL;
const STRAPI_TOKEN = process.env.REACT_APP_STRAPI_TOKEN;

const RolesContext = createContext();

export const useRoles = () => useContext(RolesContext);

export const RolesProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth0();
  const [roles, setRoles] = useState(['invitado']); // Rol por defecto

  const fetchRoles = async () => {
    console.log('🔄 Fetching roles...');
    if (isAuthenticated && user) {
      try {
        console.log(`🔍 Buscando usuario en Strapi por email: ${user.email}`);
        const response = await fetch(`${STRAPI_URL}/api/users?filters[email][$eq]=${user.email}&populate=role`, {

          headers: {
            Authorization: `Bearer ${STRAPI_TOKEN}`,
          },
        });

        const data = await response.json();

        if (data && data.length > 0) {
          const userStrapi = data[0];
          if (userStrapi.role && userStrapi.role.name) {
            setRoles([userStrapi.role.name]);
            console.log(`✅ Roles obtenidos: ${JSON.stringify(userStrapi.roles)}`);
          } else {
            setRoles(['usuario']);
            console.log('⚠ Usuario encontrado pero sin roles.');
          }
        } else {
          console.log('🆕 Usuario no existe, creando en Strapi...');

          const password = Math.random().toString(36).slice(-10); // Random password
          const roleId = 1; // ID del rol "Authenticated" (verifícalo en Strapi)

          const createResponse = await fetch(`${STRAPI_URL}/api/users`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${STRAPI_TOKEN}`,
            },
            body: JSON.stringify({
              username: user.nickname || user.name || user.email.split('@')[0],
              email: user.email,
              password,
              role: roleId,
              provider: 'auth0',
              confirmed: true,
              blocked: false,
            }),
          });

          if (!createResponse.ok) {
            const errorText = await createResponse.text();
            throw new Error(`Error al crear usuario en Strapi: ${errorText}`);
          }

          console.log('✅ Usuario creado en Strapi');
          setRoles(['usuario']);
        }
      } catch (error) {
        console.error('❌ Error manejando usuario en Strapi:', error);
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
