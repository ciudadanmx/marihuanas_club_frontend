// Registrar.jsx
// Component: toma datos de Auth0 y asegura que exista un usuario en Strapi.
// Si no existe: lo crea y marca `registrado: true`.
// Si existe pero `registrado: false`: intenta marcarlo como registrado (con admin API key si está disponible).
// Muy comentado para que entiendas cada paso.

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import PreLoader from './PreLoader';
import {
  registerUserInStrapi,
  findUserInStrapi
} from '../utils/strapiUserService';

// Tomamos la URL de Strapi desde las env vars (igual que tus utils).
const API_URL = process.env.REACT_APP_STRAPI_URL;
// Opcional: una API token (admin) para poder actualizar usuarios directamente.
// Si la pones en .env como REACT_APP_STRAPI_ADMIN_KEY, el componente podrá marcar usuarios ya existentes.
const ADMIN_API_KEY = process.env.REACT_APP_STRAPI_ADMIN_KEY || null;

export default function Registrar() {
  // Datos de Auth0
  const { user, isLoading: auth0Loading, isAuthenticated } = useAuth0();

  // Navegación (al terminar registro, volvemos a / o a donde quieras)
  const navigate = useNavigate();

  // Estados de UI
  const [processing, setProcessing] = useState(true); // si true mostramos el PreLoader
  const [error, setError] = useState(null); // mensaje de error visible
  const [attemptCount, setAttemptCount] = useState(0); // para reintentos manuales

  /**
   * CONFIGURACIÓN de tolerancia a Strapi lento
   * - MAX_RETRIES: intentos para operaciones (buscar/crear/actualizar)
   * - RETRY_DELAY: ms entre intentos
   */
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 800; // ms

  // Helper simple para esperar X ms
  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  /**
   * updateStrapiUserWithJwt
   * -----------------------
   * Actualiza el usuario en Strapi usando el jwt que se obtiene al registrarlo
   * (esto permite que el propio usuario se actualice).
   *
   * - userId: id de Strapi del usuario
   * - jwt: token devuelto por /api/auth/local/register
   * - payload: objeto con campos a actualizar
   */
  const updateStrapiUserWithJwt = async (userId, jwt, payload) => {
    if (!userId || !jwt) throw new Error('falta userId o jwt para actualizar con token de usuario');

    const url = `${API_URL}/api/users/${userId}`;

    const resp = await fetch(url, {
      method: 'PUT', // Strapi v4 suele aceptar PUT/PATCH dependiendo del config
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      // Strapi v4 acepta body con { data: { ... } } para endpoints /api/*
      body: JSON.stringify({ data: payload }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`Error al actualizar usuario con jwt: ${resp.status} ${text}`);
    }

    const data = await resp.json();
    return data;
  };

  /**
   * updateStrapiUserWithAdminKey
   * ----------------------------
   * Actualiza usuario usando una API token de Strapi con permisos de administrador.
   * Requiere que pongas REACT_APP_STRAPI_ADMIN_KEY en tu .env (opcional).
   *
   * - userId: id de Strapi
   * - payload: campos a actualizar
   */
  const updateStrapiUserWithAdminKey = async (userId, payload) => {
    if (!ADMIN_API_KEY) throw new Error('No hay ADMIN_API_KEY configurada');
    if (!userId) throw new Error('falta userId para actualizar con admin key');

    const url = `${API_URL}/api/users/${userId}`;

    const resp = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ADMIN_API_KEY}`,
      },
      body: JSON.stringify({ data: payload }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`Error al actualizar usuario con admin key: ${resp.status} ${text}`);
    }

    const data = await resp.json();
    return data;
  };

  /**
   * mainFlow
   * --------
   * Función principal que:
   * 1) espera a Auth0
   * 2) busca el usuario en Strapi (reintentos)
   * 3) si no existe -> lo registra (registerUserInStrapi), luego lo actualiza para setear `registrado` y campos extra
   * 4) si existe y ya está `registrado` -> redirige
   * 5) si existe pero NO está `registrado` -> intenta marcarlo como registrado (con admin key si la hay)
   */
  const mainFlow = useCallback(async () => {
    setProcessing(true);
    setError(null);

    try {
      // 0) Esperamos a que Auth0 esté listo
      if (auth0Loading) {
        // Si Auth0 aún carga, regresamos y el efecto volverá a ejecutar luego.
        setProcessing(true);
        return;
      }

      // Si no está autenticado no tiene sentido estar en /registrar — redirigimos a login o home.
      if (!isAuthenticated || !user?.email) {
        setError('No hay usuario autenticado. Inicia sesión primero.');
        setProcessing(false);
        return;
      }

      const email = user.email;
      // Elegimos un username (puedes adaptarlo; aquí usamos el nickname o username o email)
      const username = user.nickname || user.name || (email ? email.split('@')[0] : `u_${Date.now()}`);

      // 1) Intentamos encontrar al usuario en Strapi con reintentos
      let attempt = 0;
      let found = null;
      while (attempt < MAX_RETRIES && !found) {
        try {
          const data = await findUserInStrapi(email);
          // Según tu util, `findUserInStrapi` retorna un array (o [] si nada)
          found = Array.isArray(data) ? data[0] : data?.[0] || null;

          // si encontró, salimos del loop
          if (found) break;
        } catch (err) {
          console.warn(`findUserInStrapi intento ${attempt + 1} fallido:`, err);
        }

        attempt++;
        if (attempt < MAX_RETRIES) await sleep(RETRY_DELAY);
      }

      // 2) Si NO existe, lo registramos (esto sucede 1 sola vez por usuario)
      if (!found) {
        // Usamos tu helper `registerUserInStrapi`
        // Este endpoint /api/auth/local/register típicamente devuelve { jwt, user }
        const registerResult = await registerUserInStrapi(email, username);

        if (!registerResult) {
          throw new Error('registerUserInStrapi devolvió null. Imposible crear usuario.');
        }

        // Estructura típica: { jwt: '...', user: { id: 1, email: '...', ... } }
        const jwt = registerResult.jwt || registerResult?.data?.jwt || null;
        const createdUser =
          registerResult.user ||
          registerResult?.user ||
          registerResult?.data?.user ||
          registerResult?.data ||
          null;

        // Seguridad: si no encontramos id, intentamos extraer de otros caminos
        const userId = createdUser?.id || createdUser?._id || createdUser?.data?.id || null;

        if (!userId) {
          // A veces Strapi devuelve otra forma; nos aseguramos de alertar sobre este caso.
          console.warn('No se pudo obtener userId del registro:', registerResult);
        }

        // Payload que queremos asegurar en la colección de Strapi
        const payload = {
          registrado: true,
          fecha_registro: new Date().toISOString(),
          nombre_completo: user.name || user.nickname || username,
          email: email,
          username: username,
          // agrega aquí otros campos predeterminados que quieras (telefono, ciudad, etc.)
        };

        // Si conseguimos jwt y userId, actualizamos usando el jwt (usuario se actualiza a sí mismo)
        if (jwt && userId) {
          try {
            await updateStrapiUserWithJwt(userId, jwt, payload);
          } catch (err) {
            // Si falla la actualización con jwt, intentamos también con admin key (si existe)
            console.warn('Update con jwt falló, intentando con admin key si está disponible', err);
            if (ADMIN_API_KEY && userId) {
              await updateStrapiUserWithAdminKey(userId, payload);
            } else {
              // No hay admin key — informamos por consola y seguimos (usuario fue creado al menos)
              console.warn('No hay ADMIN_API_KEY; no se pudo completar la actualización automática del usuario.');
            }
          }
        } else if (userId && ADMIN_API_KEY) {
          // Si no tenemos jwt pero sí admin key, intentamos actualización con admin key
          await updateStrapiUserWithAdminKey(userId, payload);
        } else {
          // No pudimos obtener jwt ni admin key — el usuario probablemente fue creado
          // pero no se marcaron campos extras. Dependiendo de tu Strapi, esto puede ser aceptable.
          console.warn(
            'Usuario creado pero no pudimos actualizar campos extra (falta jwt o ADMIN_API_KEY).'
          );
        }

        // Registro completado (o parcialmente completado) -> dejamos pasar
        setProcessing(false);
        // Redirigimos a home (ajusta la ruta a la que quieras llevar al usuario)
        navigate('/', { replace: true });
        return;
      }

      // 3) Si EXISTE en Strapi:
      // Si ya está registrado → sólo pasamos
      if (found && found.registrado === true) {
        setProcessing(false);
        navigate('/', { replace: true });
        return;
      }

      // 4) Si existe pero NO está 'registrado' (found.registrado === false o undefined)
      // Intentamos marcarlo como `registrado`:
      const userId = found?.id || found?._id || null;
      const payload = {
        registrado: true,
        fecha_registro: new Date().toISOString(),
        nombre_completo: found.nombre_completo || user.name || user.nickname || username,
      };

      // Si tenemos admin key, actualizamos con ella (más confiable)
      if (ADMIN_API_KEY && userId) {
        try {
          await updateStrapiUserWithAdminKey(userId, payload);
          setProcessing(false);
          navigate('/', { replace: true });
          return;
        } catch (err) {
          console.error('No se pudo actualizar con admin key:', err);
          throw err;
        }
      }

      // Si no hay admin key, no podemos forzar la actualización de un usuario existente
      // (porque no tenemos el jwt de Strapi para ese usuario). Mejor informar y pedir soporte.
      setError(
        'Usuario ya existe en Strapi pero no está marcado como registrado. ' +
          'Configura REACT_APP_STRAPI_ADMIN_KEY para que la app pueda completar el registro automáticamente, ' +
          'o marca el usuario manualmente desde el panel de Strapi.'
      );
      setProcessing(false);
      return;
    } catch (err) {
      console.error('Error en flujo de registro:', err);
      setError(err.message || 'Error desconocido durante el registro.');
      setProcessing(false);
      return;
    }
  }, [auth0Loading, isAuthenticated, user, navigate, attemptCount]);

  // Ejecutamos el flujo cuando el componente monta y cuando el usuario pulse "Reintentar"
  useEffect(() => {
    mainFlow();
  }, [mainFlow, attemptCount]);

  // UI: mientras procesamos mostramos PreLoader; si hay error mostramos mensaje + botón reintentar
  if (processing || auth0Loading) {
    return <PreLoader />;
  }

  return (
    <div style={{ padding: 20 }}>
      {error ? (
        <div>
          <h3>Hubo un problema al registrar tu cuenta en Strapi</h3>
          <p>{error}</p>
          <div style={{ marginTop: 12 }}>
            <button
              onClick={() => {
                setError(null);
                setAttemptCount((c) => c + 1); // dispara reintento
                setProcessing(true);
              }}
            >
              Reintentar
            </button>
            <button
              style={{ marginLeft: 8 }}
              onClick={() => {
                // Si el usuario quiere saltarse esto manualmente (no recomendable),
                // lo llevamos a home. AuthGate seguirá checando en futuros loads.
                navigate('/', { replace: true });
              }}
            >
              Ir al inicio
            </button>
          </div>

          <div style={{ marginTop: 12, fontSize: 13, color: '#666' }}>
            <strong>Nota técnica:</strong>{' '}
            Si el error es "usuario existe pero no está registrado", considera configurar una API
            Token de Strapi con permisos de administración en tu .env:
            <code>REACT_APP_STRAPI_ADMIN_KEY=tu_api_token</code>. Con eso el sistema podrá marcar
            automáticamente `registrado: true` cuando el usuario ya exista en la base de datos.
          </div>
        </div>
      ) : (
        // Si no hay error pero llegamos aquí, significa que no estamos procesando y no hay error.
        // Esto ocurre rara vez porque normalmente redirigimos al terminar. Pero lo cubrimos:
        <div>
          <h3>Registro completado</h3>
          <p>Tu cuenta ya está lista. Te redirigiremos al inicio.</p>
        </div>
      )}
    </div>
  );
}
