// Registrar.jsx
// Componente: toma datos de Auth0 y asegura que exista un usuario en Strapi.
// Ahora con manejo robusto para marcar `registrado: true` desde la creación
// o inmediatamente después, según disponibilidad de ADMIN_API_KEY.

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import PreLoader from '../../components/PreLoader';
import {
  registerUserInStrapi,
  findUserInStrapi
} from '../../utils/strapiUserService';

const API_URL = process.env.REACT_APP_STRAPI_URL;
const ADMIN_API_KEY = process.env.REACT_APP_STRAPI_ADMIN_KEY || null;

export default function Registrar() {
  const { user, isLoading: auth0Loading, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState(null);
  const [attemptCount, setAttemptCount] = useState(0);

  const MAX_RETRIES = 3;
  const RETRY_DELAY = 800;
  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  /**
   * createUserWithAdminKey
   * ---------------------
   * Crea un usuario usando la API admin de Strapi (/api/users) con un token de administrador.
   * Ventaja: podemos crear el usuario directamente con `registrado: true` y otros campos
   * sin necesidad de que el usuario haga login con password en Strapi.
   *
   * - payload: campos a setear en la entidad users (email, username, registrado, etc.)
   *
   * Nota: Strapi requiere password al crear un usuario por admin API; generamos uno aleatorio.
   */
  const createUserWithAdminKey = async (payload) => {
    if (!ADMIN_API_KEY) throw new Error('No hay ADMIN_API_KEY configurada para crear usuario como admin');

    // Asegurar campos mínimos
    const password = Math.random().toString(36).slice(-12);
    const body = {
      data: {
        ...payload,
        password,
        provider: 'local',
        confirmed: true
      }
    };

    const url = `${API_URL}/api/users`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ADMIN_API_KEY}`
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Crear usuario (admin) falló: ${res.status} ${text}`);
    }

    const json = await res.json();
    // Strapi retorna estructura: { data: { id, attributes: { ... } } } o similar
    // Intentamos normalizar al usuario creado
    const created = json?.data || json?.user || json;
    return created;
  };

  /**
   * updateStrapiUserWithJwt
   * -----------------------
   * Actualiza con el jwt del mismo usuario (si existiera).
   */
  const updateStrapiUserWithJwt = async (userId, jwt, payload) => {
    if (!userId || !jwt) throw new Error('falta userId o jwt para actualizar con token de usuario');

    const url = `${API_URL}/api/users/${userId}`;
    const resp = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`
      },
      body: JSON.stringify({ data: payload })
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
   * Actualiza usuario usando la API token admin (si está disponible).
   */
  const updateStrapiUserWithAdminKey = async (userId, payload) => {
    if (!ADMIN_API_KEY) throw new Error('No hay ADMIN_API_KEY configurada');
    if (!userId) throw new Error('falta userId para actualizar con admin key');

    const url = `${API_URL}/api/users/${userId}`;
    const resp = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ADMIN_API_KEY}`
      },
      body: JSON.stringify({ data: payload })
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
   * Lógica principal (comentada paso a paso).
   */
  const mainFlow = useCallback(async () => {
    setProcessing(true);
    setError(null);

    try {
      // Esperar a Auth0
      if (auth0Loading) {
        setProcessing(true);
        return;
      }

      if (!isAuthenticated || !user?.email) {
        setError('No hay usuario autenticado. Inicia sesión primero.');
        setProcessing(false);
        return;
      }

      const email = user.email;
      const username = user.nickname || user.name || (email ? email.split('@')[0] : `u_${Date.now()}`);

      // 1) Intentar encontrar usuario en Strapi (reintentos)
      let attempt = 0;
      let found = null;
      while (attempt < MAX_RETRIES && !found) {
        try {
          const data = await findUserInStrapi(email);
          found = Array.isArray(data) ? data[0] : data?.[0] || null;
          if (found) break;
        } catch (err) {
          console.warn(`findUserInStrapi intento ${attempt + 1} fallido:`, err);
        }
        attempt++;
        if (attempt < MAX_RETRIES) await sleep(RETRY_DELAY);
      }

      // Payload estándar que queremos asegurar
      const basePayload = {
        registrado: true,
        fecha_registro: new Date().toISOString(),
        nombre_completo: user.name || user.nickname || username,
        email,
        username
      };

      // 2) Si NO existe: crearlo y asegurarnos de marcar registrado=true
      if (!found) {
        // Si tenemos ADMIN_API_KEY: crear directamente por admin con registrado:true
        if (ADMIN_API_KEY) {
          try {
            // Crear usuario con admin key y marcar registrado:true desde el inicio
            await createUserWithAdminKey(basePayload);
            // Creación + marcado completados -> redirigir
            setProcessing(false);
            navigate('/', { replace: true });
            return;
          } catch (err) {
            // Si falla la creación admin, reportamos el error y fallback a register normal
            console.error('Crear usuario via ADMIN_API_KEY falló, intentando register normal:', err);
            // no hacemos return porque intentaremos registerUserInStrapi a continuación
          }
        }

        // Sin admin key (o creación admin falló) -> usar registerUserInStrapi
        const registerResult = await registerUserInStrapi(email, username);

        if (!registerResult) {
          throw new Error('registerUserInStrapi devolvió null. Imposible crear usuario.');
        }

        // Intentamos extraer jwt y user creado del helper
        const jwt = registerResult.jwt || registerResult?.data?.jwt || null;
        const createdUser =
          registerResult.user ||
          registerResult?.user ||
          registerResult?.data?.user ||
          registerResult?.data ||
          null;

        let userId = createdUser?.id || createdUser?._id || createdUser?.data?.id || null;

        // Si no tenemos userId, reintentar obtener por email mediante findUserInStrapi
        if (!userId) {
          try {
            const reFound = await findUserInStrapi(email);
            const candidate = Array.isArray(reFound) ? reFound[0] : reFound?.[0] || null;
            userId = candidate?.id || candidate?._id || null;
          } catch (err) {
            console.warn('No se pudo recuperar userId tras register; seguiré con lo que haya', err);
          }
        }

        // Si tenemos jwt y userId -> actualizar con jwt
        if (jwt && userId) {
          try {
            await updateStrapiUserWithJwt(userId, jwt, basePayload);
            setProcessing(false);
            navigate('/', { replace: true });
            return;
          } catch (err) {
            console.warn('Update con jwt falló, intentar con admin key si disponible', err);
            // intentar admin key abajo
          }
        }

        // Si no hay jwt pero sí ADMIN_API_KEY y userId -> actualizar con admin
        if (!jwt && ADMIN_API_KEY && userId) {
          try {
            await updateStrapiUserWithAdminKey(userId, basePayload);
            setProcessing(false);
            navigate('/', { replace: true });
            return;
          } catch (err) {
            console.error('update con admin key falló después de register:', err);
            // no retornamos para que se muestre error al final
          }
        }

        // Si llegamos aquí: creamos el usuario pero NO pudimos marcarlo como registrado automáticamente
        // Informamos claramente qué falta: o jwt o admin key
        const missingExplain =
          (!jwt ? 'no se obtuvo jwt desde registerUserInStrapi' : '') +
          ( !ADMIN_API_KEY ? (jwt ? '' : '; tampoco hay ADMIN_API_KEY configurada') : '' );

        console.warn('Usuario creado pero no se pudo marcar registrado:', missingExplain);
        setError(
          'Usuario creado, pero no se pudo marcar `registrado: true` automáticamente. ' +
            'Para que la app pueda completar el marcado automáticamente, ' +
            'asegura una de las siguientes opciones:\n' +
            '- Configura REACT_APP_STRAPI_ADMIN_KEY con un API token de Strapi con permisos de administrador, O\n' +
            '- Asegúrate de que registerUserInStrapi devuelva un jwt válido (y que la creación incluya el jwt para actualizar con token de usuario).'
        );
        setProcessing(false);
        return;
      }

      // 3) Si EXISTE en Strapi:
      // Si ya está registrado → solo redirigir
      if (found && found.registrado === true) {
        setProcessing(false);
        navigate('/', { replace: true });
        return;
      }

      // 4) Si existe pero NO está 'registrado' -> intentar marcarlo (preferir admin key)
      const userId = found?.id || found?._id || null;
      if (!userId) {
        throw new Error('Usuario encontrado en Strapi pero no se pudo determinar su id.');
      }

      const payload = {
        registrado: true,
        fecha_registro: new Date().toISOString(),
        nombre_completo: found.nombre_completo || user.name || user.nickname || username
      };

      // Intentamos admin key primero (más fiable)
      if (ADMIN_API_KEY) {
        try {
          await updateStrapiUserWithAdminKey(userId, payload);
          setProcessing(false);
          navigate('/', { replace: true });
          return;
        } catch (err) {
          console.error('No se pudo actualizar con admin key:', err);
          // si falla, no devolvemos aún: intentaremos otras opciones si existen
        }
      }

      // Sin admin key: no podemos actualizar un usuario existente (a menos que tengamos el jwt de Strapi)
      // Aquí deberíamos pedir al usuario que use soporte / admin, o configurar ADMIN_API_KEY.
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

  useEffect(() => {
    mainFlow();
  }, [mainFlow, attemptCount]);

  if (processing || auth0Loading) {
    return <PreLoader />;
  }

  return (
    <div style={{ padding: 20 }}>
      {error ? (
        <div>
          <h3>Hubo un problema al registrar tu cuenta en Strapi</h3>
          <p style={{ whiteSpace: 'pre-wrap' }}>{error}</p>
          <div style={{ marginTop: 12 }}>
            <button
              onClick={() => {
                setError(null);
                setAttemptCount((c) => c + 1);
                setProcessing(true);
              }}
            >
              Reintentar
            </button>
            <button
              style={{ marginLeft: 8 }}
              onClick={() => {
                navigate('/', { replace: true });
              }}
            >
              Ir al inicio
            </button>
          </div>

          <div style={{ marginTop: 12, fontSize: 13, color: '#666' }}>
            <strong>Nota técnica:</strong>{' '}
            Para que el proceso sea 100% automático recomendamos configurar un token de administrador en tu .env:
            <br />
            <code>REACT_APP_STRAPI_ADMIN_KEY=tu_api_token</code>
            <br />
            Con eso la app podrá crear y marcar usuarios directamente, evitando estos escenarios.
          </div>
        </div>
      ) : (
        <div>
          <h3>Registro completado</h3>
          <p>Tu cuenta ya está lista. Te redirigiremos al inicio.</p>
        </div>
      )}
    </div>
  );
}
