import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const STRAPI_URL = process.env.REACT_APP_STRAPI_URL;

const RolesContext = createContext();

export const useRoles = () => useContext(RolesContext);

export const RolesProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth0();
  const [roles, setRoles] = useState(['invitado']); // Rol por defecto
  const [membresia, setMembresia] = useState(null);  // Nueva: membresía del usuario

  const fetchRolesYMembresia = async () => {
    console.log('🔄 Fetching roles y membresía...');
    if (isAuthenticated && user) {
      try {
        console.log(`🔍 Buscando usuario en Strapi por email: ${user.email}`);
        const response = await fetch(`${STRAPI_URL}/api/users?filters[email][$eq]=${user.email}&populate=role`, {
          credentials: 'include',
        });

        const data = await response.json();

        if (data && data.length > 0) {
          const userStrapi = data[0];

          // Guardar roles
          if (userStrapi.role && userStrapi.role.name) {
            setRoles([userStrapi.role.name]);
            console.log(`✅ Rol obtenido: ${userStrapi.role.name}`);
          } else {
            setRoles(['usuario']);
            console.log('⚠ Usuario encontrado pero sin rol.');
          }

          // Obtener membresía del usuario (por ID)
          const membresiaRes = await fetch(`${STRAPI_URL}/api/mi-membresia`, {
            credentials: 'include',
          });

          if (membresiaRes.ok) {
            const membresiaData = await membresiaRes.json();
            console.log('🎟️ Membresía obtenida:', membresiaData);
            setMembresia(membresiaData);
          } else {
            console.warn('⚠️ No se pudo obtener la membresía. ¿Ruta /api/mi-membresia configurada en Strapi?');
            setMembresia(null);
          }

        } else {
          console.log('🆕 Usuario no existe, creando en Strapi...');

          const password = Math.random().toString(36).slice(-10);
          const roleId = 1; // Verifica que sea el ID correcto del rol 'Authenticated'

          const createResponse = await fetch(`${STRAPI_URL}/api/users`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
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
          setMembresia(null);
        }

      } catch (error) {
        console.error('❌ Error al manejar usuario o membresía en Strapi:', error);
        setRoles(['usuario']);
        setMembresia(null);
      }
    }
  };

  useEffect(() => {
    fetchRolesYMembresia();
  }, [isAuthenticated, user]);

  return (
    <RolesContext.Provider value={{ roles, membresia, fetchRolesYMembresia }}>
      {children}
    </RolesContext.Provider>
  );
};
