import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const STRAPI_URL = process.env.REACT_APP_STRAPI_URL;

// ✅ Contexto
const RolesContext = createContext();
export const useRoles = () => useContext(RolesContext);

export const RolesProvider = ({ children }) => {
  const { user: auth0User, isAuthenticated, isLoading } = useAuth0();

  const [roles, setRoles] = useState(['invitado']);
  const [membresia, setMembresia] = useState(null);
  const [userData, setUserData] = useState(null);

  // 🔹 Versión simplificada del primer código (por compatibilidad)
  const fetchRoles = async () => {
    console.group('🔄 fetchRoles (versión simple)');
    if (isAuthenticated && auth0User) {
      try {
        console.log('🔍 Buscando roles simples en Strapi...');
        const response = await fetch(
          `${STRAPI_URL}/api/users?filters[email][$contains]=${auth0User.email}`
        );
        const data = await response.json();

        if (data.length > 0 && data[0].roles) {
          setRoles(data[0].roles);
          console.log(`✅ Roles simples obtenidos: ${JSON.stringify(data[0].roles)}`);
        } else {
          setRoles(['usuario']);
          console.log('⚠ Usuario sin roles asignados (modo simple).');
        }
      } catch (error) {
        console.error('❌ Error obteniendo roles simples:', error);
        setRoles(['usuario']);
      }
    } else {
      console.log('⏳ No autenticado, asignando rol invitado.');
      setRoles(['invitado']);
    }
    console.groupEnd();
  };

  // 🔹 Versión avanzada: incluye membresías, creación de usuario y roles extra
  const fetchRolesYMembresia = async () => {
    console.group('🔄 fetchRolesYMembresia');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('auth0User:', auth0User);

    if (!isAuthenticated || !auth0User) {
      console.warn('⏳ No autenticado o user no listo');
      console.groupEnd();
      return;
    }

    try {
      const url = `${STRAPI_URL}/api/users?filters[email][$eq]=${encodeURIComponent(
        auth0User.email
      )}&populate=role,roles,direcciones`;
      console.log('🔍 Fetching Strapi user at:', url);

      const res = await fetch(url, { credentials: 'include' });
      const json = await res.json();
      console.log('📥 /users raw response:', json);

      const users = Array.isArray(json) ? json : json.data || [];
      console.log('🔍 Parsed users array:', users);

      if (!users.length) {
        console.log('⚠️ Usuario no encontrado en Strapi, creando uno nuevo...');
        await createStrapiUser();
        console.groupEnd();
        return;
      }

      const raw = users[0];
      const attrs = raw.attributes || raw;
      const usrId = raw.id || raw._id;
      console.log('👤 Usuario Strapi attributes:', attrs);
      setUserData({ id: usrId, ...attrs });

      // Roles combinados
      const primary = attrs.role?.data?.attributes?.name;
      console.log('⚙️ Primary role:', primary);

      const extraArr = Array.isArray(attrs.roles?.extra) ? attrs.roles.extra : [];
      console.log('⚙️ Extra roles array:', extraArr);

      const combined = primary
        ? [primary, ...extraArr]
        : extraArr.length
        ? extraArr
        : ['usuario'];

      console.log('✅ Setting roles to:', combined);
      setRoles(combined);

      console.log(
        '🔑 Role flags - isEditor:',
        combined.includes('editor'),
        'isAdmin:',
        combined.includes('admin'),
        'isRoot:',
        combined.includes('root')
      );

      // Membresías
      console.log('🔍 Fetching membresias for userId:', usrId);
      const membUrl = `${STRAPI_URL}/api/membresias?filters[usuario][id][$eq]=${usrId}&filters[activa][$eq]=true`;
      console.log('🔍 Membresias URL:', membUrl);

      const membRes = await fetch(membUrl, { credentials: 'include' });
      if (!membRes.ok) {
        console.warn(`⚠️ /membresias fallo: ${membRes.status}`);
        setMembresia(null);
      } else {
        const membJson = await membRes.json();
        console.log('📥 /membresias response:', membJson);
        const items = (membJson.data || []).map(item => ({
          id: item.id,
          ...item.attributes,
        }));

        const hoy = new Date();
        const vigentes = items.filter(
          m => new Date(m.fechaInicio) <= hoy && hoy <= new Date(m.fechaFin)
        );

        console.log('🔍 Membresias vigentes:', vigentes);

        if (vigentes.length) {
          vigentes.sort((a, b) => new Date(b.fechaInicio) - new Date(a.fechaInicio));
          console.log('🎟️ Seleccionada membresia vigente:', vigentes[0]);
          setMembresia(vigentes[0]);
        } else {
          console.log('ℹ️ No hay membresía vigente');
          setMembresia(null);
        }
      }
    } catch (err) {
      console.error('❌ fetchRolesYMembresia error:', err);
      setRoles(['usuario']);
      setMembresia(null);
      setUserData(null);
    }

    console.groupEnd();
  };

  // 🔹 Crear usuario en Strapi
  const createStrapiUser = async () => {
    console.group('🆕 createStrapiUser');
    console.log('Creating Strapi user for:', auth0User.email);

    const password = Math.random().toString(36).slice(-10);
    const roleId = 1;

    const payload = {
      username:
        auth0User.nickname ||
        auth0User.name ||
        auth0User.email.split('@')[0],
      email: auth0User.email,
      password,
      role: roleId,
      provider: 'auth0',
      confirmed: true,
      blocked: false,
    };

    console.log('Payload for new user:', payload);

    const createRes = await fetch(`${STRAPI_URL}/api/users`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      console.error('❌ Crear usuario falló:', errText);
      throw new Error('Failed to create Strapi user');
    }

    console.log('✅ Usuario creado en Strapi');
    setRoles(['usuario']);
    setMembresia(null);
    setUserData(null);
    console.groupEnd();
  };

  // 🔹 Helpers de roles
  const hasExtra = roleName => {
    const arr = userData?.roles?.extra;
    console.log(`🔍 Checking extra role '${roleName}' in:`, arr);
    return Array.isArray(arr) && arr.includes(roleName);
  };

  const isEditor = () => {
    const res = isAuthenticated && hasExtra('editor');
    console.log('🔑 isEditor:', res);
    return res;
  };

  const isAdmin = () => {
    const res = isAuthenticated && hasExtra('admin');
    console.log('🔑 isAdmin:', res);
    return res;
  };

  const isRoot = () => {
    const res = isAuthenticated && hasExtra('root');
    console.log('🔑 isRoot:', res);
    return res;
  };

  const isActivaMembresia = () => {
    const active = Boolean(membresia);
    console.log('🔑 isActivaMembresia:', active, 'membresia:', membresia);
    return active;
  };

  // 🔹 Actualizar roles extra
  const updateExtraRole = async (roleName, enabled) => {
    console.group(`✏️ updateExtraRole(${roleName}, ${enabled})`);
    if (!userData) {
      console.warn('⚠️ No hay userData. Abortando.');
      console.groupEnd();
      return;
    }

    const existing = Array.isArray(userData.roles?.extra)
      ? [...userData.roles.extra]
      : [];

    console.log('👥 Current extra roles:', existing);

    const idx = existing.indexOf(roleName);
    if (enabled && idx === -1) {
      existing.push(roleName);
      console.log(`➕ Agregando rol '${roleName}'`);
    }
    if (!enabled && idx > -1) {
      existing.splice(idx, 1);
      console.log(`➖ Removiendo rol '${roleName}'`);
    }

    const payload = { roles: { extra: existing } };
    console.log('Payload for update:', payload);

    const res = await fetch(`${STRAPI_URL}/api/users/${userData.id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: payload }),
    });

    if (!res.ok) {
      console.error(`❌ updateExtraRole failed: ${res.status}`);
      console.groupEnd();
      throw new Error(`Failed to update roles: ${res.status}`);
    }

    console.log('✅ updateExtraRole success');
    setUserData(prev => ({ ...prev, roles: { extra: existing } }));

    setRoles(prev => {
      const primary =
        prev[0] && !['editor', 'admin', 'root'].includes(prev[0])
          ? prev[0]
          : null;
      const newList = primary
        ? [primary, ...existing]
        : existing.length
        ? existing
        : ['usuario'];
      console.log('🔄 New combined roles:', newList);
      return newList;
    });

    console.groupEnd();
  };

  const setEditor = enabled => updateExtraRole('editor', enabled);
  const setAdmin = enabled => updateExtraRole('admin', enabled);
  const setRoot = enabled => updateExtraRole('root', enabled);

  // 🔹 Efecto principal
  useEffect(() => {
    console.group('🚦 RolesProvider useEffect');
    console.log('isLoading:', isLoading);
    console.log('isAuthenticated:', isAuthenticated);
    console.log('auth0User:', auth0User);

    if (!isLoading) {
      if (isAuthenticated) {
        fetchRolesYMembresia();
      } else {
        console.log('⚠️ No autenticado → usando invitado');
        setRoles(['invitado']);
        setMembresia(null);
        setUserData(null);
      }
    }
    console.groupEnd();
  }, [isLoading, isAuthenticated, auth0User]);

  // 🔹 Proveedor final
  return (
    <RolesContext.Provider
      value={{
        roles,
        userData,
        membresia,
        fetchRoles,
        fetchRolesYMembresia,
        isEditor,
        isAdmin,
        isRoot,
        isActivaMembresia,
        setEditor,
        setAdmin,
        setRoot,
      }}
    >
      {children}
    </RolesContext.Provider>
  );
};
