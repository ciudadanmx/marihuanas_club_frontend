// ==================== IMPORTS ====================

// Hooks básicos de React
import { useEffect, useState } from 'react';

// Hook de Auth0 para autenticación
import { useAuth0 } from '@auth0/auth0-react';

// Hooks de React Router
import { useLocation, useNavigate } from 'react-router-dom';

// Loader visual mientras se valida Auth0 + Strapi
import PreLoader from './components/PreLoader';

// Servicio que consulta usuarios en Strapi por email
import { findUserInStrapi } from './utils/strapiUserService';

// ==================== COMPONENTE ====================

/**
 * AuthGate
 * --------------------------------------------------
 * Este componente actúa como una "puerta" de acceso.
 *
 * Flujo real:
 * 1. Espera a que Auth0 termine
 * 2. Si el usuario está logueado → consulta Strapi
 * 3. Le da TIEMPO a Strapi (reintentos)
 * 4. SOLO redirige a /registrar si está 100% seguro
 * 5. Evita loops infinitos
 */
export default function AuthGate({ children }) {

  // Datos que vienen de Auth0
  const { isAuthenticated, isLoading, user } = useAuth0();

  // Ruta actual
  const location = useLocation();

  // Función para redirecciones
  const navigate = useNavigate();

  /**
   * Estado que controla si seguimos validando.
   * Mientras sea true, mostramos el PreLoader.
   */
  const [checking, setChecking] = useState(true);

  useEffect(() => {

    // ==================== CONFIG STRAPI ====================

    // Número máximo de intentos a Strapi
    const MAX_RETRIES = 3;

    // Tiempo entre intentos (ms)
    const RETRY_DELAY = 700;

    /**
     * Helper para esperar X milisegundos
     */
    const sleep = (ms) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    /**
     * Función principal de validación
     */
    const check = async () => {

      // Auth0 todavía está cargando → no hacemos nada
      if (isLoading) return;

      // No autenticado o sin email → no bloqueamos
      if (!isAuthenticated || !user?.email) {
        setChecking(false);
        return;
      }

      // Si ya estamos en /registrar → no redirigir otra vez
      if (location.pathname.startsWith('/registrar')) {
        setChecking(false);
        return;
      }

      let attempt = 0;
      let strapiUser = null;

      /**
       * Reintentos controlados a Strapi
       * (porque a veces despierta lento el cabrón)
       */
      while (attempt < MAX_RETRIES && !strapiUser) {
        try {
          const data = await findUserInStrapi(user.email);

          // Tomamos el primer resultado si existe
          strapiUser = data?.[0] || null;

          // Si ya respondió bien, salimos del loop
          if (strapiUser) break;

        } catch (error) {
          console.warn(
            `Intento ${attempt + 1} a Strapi fallido`,
            error
          );
        }

        attempt++;

        // Esperamos antes del siguiente intento
        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY);
        }
      }

      /**
       * AQUÍ YA SE HIZO TODO LO POSIBLE
       */

      // Si después de reintentar:
      // - el usuario NO existe en Strapi
      // - o existe pero NO terminó registro
      if (!strapiUser || strapiUser.registrado !== true) {
        navigate('/registrar', { replace: true });
        return;
      }

      // Todo OK → acceso concedido
      setChecking(false);
    };

    // Cada vez que se dispara el efecto,
    // activamos el loader
    setChecking(true);

    // Ejecutamos validación
    check();

  }, [
    location.pathname,
    isAuthenticated,
    isLoading,
    user,
    navigate,
  ]);

  // ==================== RENDER ====================

  // Mientras validamos Auth0 + Strapi (con paciencia)
  if (checking) return <PreLoader />;

  // Si todo pasó bien, renderizamos la app
  return children;
}
