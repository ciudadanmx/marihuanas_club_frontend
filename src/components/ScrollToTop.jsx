// src/components/ScrollToTop/ScrollToTop.jsx
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop({
  behavior = 'auto',
  targetId = 'marihuanasclub-app',
}) {
  const { pathname } = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  // 🔹 scroll al cambiar de ruta
  useEffect(() => {
    const el = document.getElementById(targetId);

    if (el && el.scrollHeight > el.clientHeight) {
      el.scrollTo({ top: 0, behavior });
    } else {
      window.scrollTo({ top: 0, behavior });
    }
  }, [pathname, behavior, targetId]);

  // 🔹 detectar scroll (contenedor O window)
  useEffect(() => {
    const el = document.getElementById(targetId);

    const getScrollTop = () => {
      if (el && el.scrollHeight > el.clientHeight) {
        return el.scrollTop;
      }
      return window.scrollY || document.documentElement.scrollTop;
    };

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const threshold = isMobile ? 120 : 190;

    const onScroll = () => {
      setIsVisible(getScrollTop() > threshold);
    };

    // listeners
    if (el && el.scrollHeight > el.clientHeight) {
      el.addEventListener('scroll', onScroll);
    } else {
      window.addEventListener('scroll', onScroll);
    }

    return () => {
      if (el && el.scrollHeight > el.clientHeight) {
        el.removeEventListener('scroll', onScroll);
      } else {
        window.removeEventListener('scroll', onScroll);
      }
    };
  }, [targetId]);

  const scrollTop = () => {
    const el = document.getElementById(targetId);

    if (el && el.scrollHeight > el.clientHeight) {
      el.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollTop}
          style={{
            position: 'fixed',
            bottom: '42px',
            right: '280px',
            zIndex: 1000,
            cursor: 'pointer',
            backgroundColor: '#751460e3',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            fontSize: '20px',
          }}
        >
          ↑
        </button>
      )}
    </>
  );
}
