import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const STRAPI_URL = process.env.REACT_APP_STRAPI_URL;

const RolesContext = createContext();

export const useRoles = () => useContext(RolesContext);

export const RolesProvider = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth0();

  const [roles, setRoles] = useState(['invitado']);
  const [membresia, setMembresia] = useState(null);

  const fetchRolesYMembresia = async () => {
    console.group('🔄 fetchRolesYMembresia');
    console.log('user:', user);
    if (!isAuthenticated || !user) {
      console.warn('⏳ No autenticado o user no listo');
      console.groupEnd();
      return;
    }

    try {
      console.log(`🔍 Buscando Strapi /users?email=${user.email}`);
      const res = await fetch(
        `${STRAPI_URL}/api/users?filters[email][$eq]=${encodeURIComponent(user.email)}&populate=role`,
        { credentials: 'include' }
      );
      const data = await res.json();
      console.log('📥 /users response:', data);

      if (data && data.length > 0) {
        const usr = data[0];
        console.log('👤 Usuario Strapi:', usr);

        // Rol
        if (usr.role?.name) {
          setRoles([usr.role.name]);
          console.log(`✅ Rol: ${usr.role.name}`);
        } else {
          setRoles(['usuario']);
          console.warn('⚠️ Sin rol, usando "usuario"');
        }

        // Membresía
        console.log('🔍 Fetch /api/mi-membresia');
        const mRes = await fetch(`${STRAPI_URL}/api/mi-membresia`, { credentials: 'include' });
        if (mRes.ok) {
          const mData = await mRes.json();
          setMembresia(mData);
          console.log('🎟️ Membresía:', mData);
        } else {
          setMembresia(null);
          console.warn(`⚠️ /mi-membresia fallo: ${mRes.status}`);
        }
      } else {
        console.log('🆕 Creando usuario Strapi...');
        const password = Math.random().toString(36).slice(-10);
        const roleId = 1;

        const cRes = await fetch(`${STRAPI_URL}/api/users`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
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

        if (!cRes.ok) {
          const errText = await cRes.text();
          throw new Error(`Crear usuario Strapi falló: ${errText}`);
        }
        console.log('✅ Usuario creado en Strapi');
        setRoles(['usuario']);
        setMembresia(null);
      }
    } catch (err) {
      console.error('❌ fetchRolesYMembresia error:', err);
      setRoles(['usuario']);
      setMembresia(null);
    }
    console.groupEnd();
  };

  useEffect(() => {
    console.group('🚦 RolesProvider useEffect');
    console.log('isLoading:', isLoading);
    console.log('isAuthenticated:', isAuthenticated);
    console.log('user:', user);

    if (!isLoading && isAuthenticated) {
      console.log('✅ Autenticado → fetchRolesYMembresia()');
      fetchRolesYMembresia();
    } else if (!isLoading && !isAuthenticated) {
      console.log('⚠️ No autenticado → usando rol invitado');
      setRoles(['invitado']);
      setMembresia(null);
    }

    console.groupEnd();
  }, [isLoading, isAuthenticated, user]);

  return (
    <RolesContext.Provider value={{ roles, membresia, fetchRolesYMembresia }}>
      {children}
    </RolesContext.Provider>
  );
};
