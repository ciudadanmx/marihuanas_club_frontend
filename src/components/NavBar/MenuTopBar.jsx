import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

import inicioSvg from '../../assets/topbarmenu/inicio.svg';
import quienesSomosSvg from '../../assets/topbarmenu/quienes-somos.svg';
import wikiSvg from '../../assets/topbarmenu/wiki.svg';
import comprarTokensSvg from '../../assets/topbarmenu/comprar-tokens.svg';
import documentacionSvg from '../../assets/topbarmenu/documentacion.svg';
import ayudaSvg from '../../assets/topbarmenu/ayuda.svg';
import videosSvg from '../../assets/topbarmenu/videos.svg';
import anuncieseSvg from '../../assets/topbarmenu/anunciese.svg';

const DEFAULT_ITEMS = [
  { key: 'inicio', svg: inicioSvg },
  { key: 'quienes-somos', svg: quienesSomosSvg },
  { key: 'wiki', svg: wikiSvg, external: 'https://wiki.ciudadan.org' },
  { key: 'comprar-tokens', svg: comprarTokensSvg },
  { key: 'documentacion-transparencia', svg: documentacionSvg },
  { key: 'ayuda', svg: ayudaSvg },
  { key: 'videos', svg: videosSvg, external: 'https://youtube.com/@ciudadanmx' },
  { key: 'anunciese', svg: anuncieseSvg, external: 'https://publia.club' },
];

const prettyLabel = (key) =>
  key
    .replace(/-/g, ' ')
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

const MenuTopBar = ({
  items = DEFAULT_ITEMS,
  visibleKeys = null,
  isOpen = false,
  setIsOpen = () => {},
  topBarRef = null,
}) => {
  const keysToShow =
    Array.isArray(visibleKeys) && visibleKeys.length > 0
      ? items.filter((i) => visibleKeys.includes(i.key))
      : items;

  useEffect(() => {
    const logo = document.getElementById('ciudadan-logo');
    const svg = document.getElementById('ciudadan-svg');

    if (isOpen && window.innerWidth <= 1000) {
      if (logo) logo.style.position = 'static';
      if (svg) svg.style.visibility = 'hidden';
    } else {
      if (logo) logo.style.position = '';
      if (svg) svg.style.visibility = '';
    }
  }, [isOpen]);

  useEffect(() => {
    const handleCloseTopBar = () => setIsOpen(false);
    window.addEventListener('closeTopBar', handleCloseTopBar);
    return () => window.removeEventListener('closeTopBar', handleCloseTopBar);
  }, [setIsOpen]);

  return (
    <div className="menu-topbar-wrapper">
      <div
        className={`menu-topbar ${isOpen ? 'open' : ''}`}
        ref={topBarRef}
        aria-hidden={!isOpen}
      >
        {/* DESKTOP */}
        <div className="menu-topbar-desktop">
          {keysToShow.map(({ key, svg, external }) => {
            const content = (
              <div className="menu-topbar-item-content">
                <img src={svg} alt={key} className="menu-topbar-svg" />
                <span className="menu-topbar-label">{prettyLabel(key)}</span>
              </div>
            );

            if (external) {
              return (
                <a
                  key={key}
                  href={external}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="menu-topbar-item"
                  onClick={() => setIsOpen(false)}
                >
                  {content}
                </a>
              );
            }

            // 🔹 Inicio → Link SPA interno
            return (
              <Link
                key={key}
                to={key === 'inicio' ? '/' : `/${key}`}
                className="menu-topbar-item"
                onClick={() => setIsOpen(false)}
              >
                {content}
              </Link>
            );
          })}

          <button
            className="menu-topbar-close"
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar menú"
          >
            ✕
          </button>
        </div>

        {/* MOBILE */}
        <div className="menu-topbar-mobile">
          {keysToShow.map(({ key, svg, external }) => {
            const content = (
              <div className="menu-topbar-grid-inner">
                <img src={svg} alt={key} className="menu-topbar-grid-svg" />
                <small className="menu-topbar-grid-label">{prettyLabel(key)}</small>
              </div>
            );

            if (external) {
              return (
                <a
                  key={key}
                  href={external}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="menu-topbar-grid-item"
                  onClick={() => setIsOpen(false)}
                  aria-label={key}
                >
                  {content}
                </a>
              );
            }

            return (
              <Link
                key={key}
                to={key === 'inicio' ? '/' : `/${key}`}
                className="menu-topbar-grid-item"
                onClick={() => setIsOpen(false)}
                aria-label={key}
              >
                {content}
              </Link>
            );
          })}

          <button
            className="menu-topbar-close-mobile"
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar menú"
          >
            ✕
          </button>
        </div>
      </div>

      <style jsx>{`
        .menu-topbar-wrapper {
          position: relative;
        }

        .menu-topbar {
          overflow: hidden;
          transition: max-height 280ms ease, opacity 220ms ease;
          max-height: 0;
          opacity: 0;
          background: #000;
          border-bottom: 1px solid rgba(0, 255, 100, 0.2);
          box-shadow: 0 0 12px rgba(0, 255, 100, 0.25);
        }

        .menu-topbar.open {
          opacity: 1;
          max-height: 600px;
        }

        .menu-topbar-desktop {
          display: none;
        }
        .menu-topbar-mobile {
          display: none;
        }

        @media (min-width: 1001px) {
          .menu-topbar-desktop {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            align-items: center;
            gap: 24px;
            padding: 14px 20px;
          }
        }

        @media (max-width: 1000px) {
          .menu-topbar-mobile {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 18px;
            padding: 20px;
            text-align: center;
          }

          .menu-topbar-grid-inner {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }

          .menu-topbar-grid-label {
            margin-top: 6px;
            font-size: 0.85rem;
            color: #00ff88;
            font-family: 'Share Tech Mono', monospace;
            text-shadow: 0 0 6px #00ff88;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }

        .menu-topbar-item,
        .menu-topbar-grid-item {
          color: #00ff88;
          font-family: 'Share Tech Mono', monospace;
          text-decoration: none;
          text-shadow: 0 0 8px #00ff88;
          transition: all 0.2s ease-in-out;
        }

        .menu-topbar-item-content {
          display: flex;
          align-items: center; /* 🔹 Texto centrado vertical con icono */
          gap: 12px;
        }

        .menu-topbar-item:hover,
        .menu-topbar-grid-item:hover {
          color: #fff;
          text-shadow: 0 0 15px #00ff88, 0 0 30px #00ff88;
          transform: scale(1.08);
        }

        .menu-topbar-svg,
        .menu-topbar-grid-svg {
          width: 60px;
          height: 60px;
          filter: drop-shadow(0 0 4px #00ff88);
        }

        .menu-topbar-close,
        .menu-topbar-close-mobile {
          background: transparent;
          border: 1px solid #ffffff;
          color: #ffffff;
          font-size: 20px;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 10px auto;
          cursor: pointer;
          text-shadow: 0 0 8px #ffffff;
          transition: all 0.2s ease-in-out;
        }

        .menu-topbar-close:hover,
        .menu-topbar-close-mobile:hover {
          background: #00ff88;
          border-color: #00ff88;
          color: #000;
          box-shadow: 0 0 20px #00ff88;
          transform: rotate(90deg);
        }
      `}</style>
    </div>
  );
};

export default MenuTopBar;
