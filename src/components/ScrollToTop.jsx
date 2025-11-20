// src/components/ScrollToTop/ScrollToTop.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop: cada vez que cambia la ruta (pathname) hace scroll al tope.
 * - behavior: 'auto' o 'smooth'
 * - targetId: si quieres que haga scroll de un contenedor con id específico, pon el id.
 *            Si no, hace scroll del window.
 */
export default function ScrollToTop({ behavior = 'auto', targetId = null }) {
  const { pathname } = useLocation();

  useEffect(() => {
    if (targetId) {
      const el = document.getElementById(targetId);
      if (el) {
        if (typeof el.scrollTo === 'function') {
          el.scrollTo({ top: 0, left: 0, behavior });
        } else {
          el.scrollTop = 0;
        }
        return;
      }
      // si targetId no existe, fallback a window
    }

    if (typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, left: 0, behavior });
    } else {
      window.scroll(0, 0);
    }
  }, [pathname, behavior, targetId]);

  return null;
}
