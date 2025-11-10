// src/components/Pestanas/Pestanas.jsx
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

const Pestanas = ({
  tabs = [],
  basePath = '',
  className = '',
  onTabChange,
  collapseAt = 640,
  children,
  topOffset = 64 // ajusta esto si tu navbar tiene otra altura
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < collapseAt : false);

  const rowRef = useRef(null);
  const btnRefs = useRef([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, visible: false });

  const normBase = useMemo(() => {
    if (!basePath) return '';
    if (basePath === '/') return '/';
    return basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
  }, [basePath]);

  const absPaths = useMemo(() => {
    return tabs.map((t) => {
      const p = (t.path || '').toString();
      if (!p) return normBase || '/';
      if (p.startsWith('/')) return p.endsWith('/') && p !== '/' ? p.slice(0, -1) : p;
      const joined = `${normBase}${p ? '/' + p.replace(/^\/+/, '') : ''}`;
      return joined.endsWith('/') && joined !== '/' ? joined.slice(0, -1) : joined;
    });
  }, [tabs, normBase]);

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < collapseAt);
      requestAnimationFrame(() => measureIndicator(activeIndex));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [collapseAt, activeIndex]);

  useEffect(() => {
    const currentRaw = (location.pathname || '').replace(/\/+$/, '') || '/';
    let bestIndex = -1;
    let bestLen = -1;
    absPaths.forEach((p, i) => {
      const pp = (p || '').replace(/\/+$/, '') || '/';
      if (currentRaw === pp) {
        bestIndex = i;
        bestLen = pp.length;
      } else if (pp !== '/' && currentRaw.startsWith(pp + '/')) {
        if (pp.length > bestLen) { bestIndex = i; bestLen = pp.length; }
      } else if (pp !== '/' && currentRaw.startsWith(pp)) {
        if (pp.length > bestLen) { bestIndex = i; bestLen = pp.length; }
      }
    });
    if (bestIndex === -1) bestIndex = 0;
    setActiveIndex(bestIndex);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, JSON.stringify(absPaths)]);

  useLayoutEffect(() => {
    measureIndicator(activeIndex);
    if (typeof onTabChange === 'function') onTabChange(activeIndex, tabs[activeIndex]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, isMobile, JSON.stringify(absPaths)]);

  const measureIndicator = (index) => {
    const row = rowRef.current;
    const btn = btnRefs.current[index];
    if (!row || !btn) {
      setIndicator({ left: 0, width: 0, visible: false });
      return;
    }
    const rowRect = row.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    const left = btnRect.left - rowRect.left + row.scrollLeft;
    const width = Math.max(24, btnRect.width);
    setIndicator({ left, width, visible: true });
    // asegurar boton visible en scroll horizontal
    try { btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }); } catch (e) {}
  };

  const handleClick = (index) => {
    const dest = absPaths[index] || '/';
    navigate(dest);
    // no hacemos setActiveIndex aquí: lo hará el effect al cambiar la URL
  };

  const handleSelectChange = (e) => {
    const idx = Number(e.target.value);
    handleClick(idx);
  };

  const setBtnRef = (el, i) => { btnRefs.current[i] = el; };

  return (
    <nav className={`pestanas-wrapper ${className || ''}`} aria-label="Pestañas" style={{ margin: 0, padding: 0 }}>
      <style>{`
        .pestanas-wrapper { width:100%; margin:0; padding:0; }
        .pestanas-bar {
          width:100%;
          background: linear-gradient(90deg, #7b2cff 0%, #b300ff 50%, #7b2cff 100%);
          color: #fff;
          padding: 13px 12px;
          position:relative;
          top: -20px;
          box-shadow: 0 1px 6px rgba(0,0,0,0.12);
          margin-bottom: 0px;
          padding-bottom: 0px;
        }
        .pestanas-row {
          display:flex;
          gap:12px;
          align-items:center;
          justify-content:flex-start;
          position:relative;
          overflow-x:auto;
          -webkit-overflow-scrolling:touch;
          scrollbar-width:none;
        }
        .pestanas-row::-webkit-scrollbar { display:none; }
        .pestana-btn {
          background:transparent;
          border:none;
          color: rgba(255,255,255,0.95);
          padding:8px 14px;
          font-weight:600;
          font-size:0.95rem;
          cursor:pointer;
          border-radius:6px;
          white-space:nowrap;
          transition: transform .12s ease, color .12s ease, background .12s ease;
        }
        .pestana-btn:hover { transform:translateY(-2px); background: rgba(255,255,255,0.06); color:#fff; }
        .pestana-btn[aria-selected="true"] { color:#fff200; }
        .pestanas-indicator {
          position:absolute;
          height:4px;
          bottom:6px;
          border-radius:4px;
          background:#fff200;
          box-shadow: 0 6px 18px rgba(255,242,0,0.16);
          transition:left 260ms cubic-bezier(.2,.9,.2,1), width 260ms cubic-bezier(.2,.9,.2,1), opacity 160ms;
        }
        .pestana-select {
          width:100%;
          padding:10px;
          border-radius:8px;
          border:1px solid rgba(255,255,255,0.12);
          background: rgba(0,0,0,0.06);
          color:#fff;
        }
        .pestanas-content { margin-top:12px; }
      `}</style>

      <div className="pestanas-bar" role="navigation">
        {isMobile ? (
          <div style={{ padding: '6px 0' }}>
            <select
              className="pestana-select"
              aria-label="Seleccionar pestaña"
              value={activeIndex}
              onChange={handleSelectChange}
            >
              {tabs.map((t, i) => <option key={t.label + i} value={i}>{t.label}</option>)}
            </select>
          </div>
        ) : (
          <div className="pestanas-row" role="tablist" aria-orientation="horizontal" ref={rowRef}>
            {tabs.map((t, i) => (
              <button
                key={t.label + i}
                ref={(el) => setBtnRef(el, i)}
                role="tab"
                aria-selected={activeIndex === i}
                id={`tab-${i}`}
                onClick={() => handleClick(i)}
                className="pestana-btn"
              >
                {t.label}
              </button>
            ))}
            <div
              className="pestanas-indicator"
              style={{
                left: indicator.visible ? `${indicator.left}px` : '-9999px',
                width: indicator.visible ? `${indicator.width}px` : '0px',
                opacity: indicator.visible ? 1 : 0
              }}
              aria-hidden="true"
            />
          </div>
        )}
      </div>

      {children ? (
        <div className="pestanas-content">
          <Paper elevation={1}>
            <Box p={2}>{children}</Box>
          </Paper>
        </div>
      ) : null}
    </nav>
  );
};

Pestanas.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string.isRequired, path: PropTypes.string })).isRequired,
  basePath: PropTypes.string,
  className: PropTypes.string,
  onTabChange: PropTypes.func,
  collapseAt: PropTypes.number,
  children: PropTypes.node,
  topOffset: PropTypes.number
};

export default Pestanas;
