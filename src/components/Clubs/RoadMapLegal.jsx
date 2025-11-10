import React, { useEffect, useRef, useState } from "react";

// StepSlider preparado para importar imágenes desde ../../assets/
// Asegúrate de que las rutas existan en tu proyecto
import altaDatosImg from "../../assets/rutalegal/altadatos.png";
import ingresoCofeImg from "../../assets/rutalegal/ingresocofepris.png";
import afiliacionClubImg from "../../assets/rutalegal/afiliacionclub.png";
import chequeoCofeImg from "../../assets/rutalegal/chequeocofepris.png";
import favorableImg from "../../assets/rutalegal/favorablecofepris.png";
import negativaImg from "../../assets/rutalegal/negativacofepris.png";
import periodoAmparoImg from "../../assets/rutalegal/periodoamparo.png";
import esperaAmparoImg from "../../assets/rutalegal/esperaamparo.png";
import amparadoImg from "../../assets/rutalegal/amparado.png";
import concluidoImg from "../../assets/rutalegal/concluido.png";

export default function StepSlider({ fetchFromStrapi, initialData, onContinue }) {
  const defaultSteps = [
    { id: 1, title: "Ingreso de Datos", image: altaDatosImg, status: "done", btnText: "" },
    { id: 2, title: "Ingreso de trámite a COFEPRIS", image: ingresoCofeImg, status: "done", btnText: "" },
    { id: 3, title: "Firma Acta Club", image: afiliacionClubImg, status: "not_done", btnText: "Continuar" },
    { id: 4, title: "Espera Respuesta COFEPRIS", image: chequeoCofeImg, status: "pending", btnText: "Ver status trámite" },
    { id: 5, title: "Respuesta Favorable COFEPRIS", image: favorableImg, status: "pending", btnText: "" },
    { id: 6, title: "Negativa COFEPRIS", image: negativaImg, status: "pending", btnText: "" },
    { id: 7, title: "Periodo para ingresar Amparo", image: periodoAmparoImg, status: "pending", btnText: "" },
    { id: 8, title: "Esperando Respuesta Amparo", image: esperaAmparoImg, status: "pending", btnText: "" },
    { id: 9, title: "Amparo Concedido", image: amparadoImg, status: "pending", btnText: "" },
    { id: 10, title: "Trámite Exitoso", image: concluidoImg, status: "pending", btnText: "" },
  ];

  const [steps, setSteps] = useState(initialData && initialData.length ? initialData : defaultSteps);
  const [firstIncompleteIndex, setFirstIncompleteIndex] = useState(null);
  const scrollerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (fetchFromStrapi) {
        try {
          const data = await fetchFromStrapi();
          if (mounted && Array.isArray(data) && data.length) setSteps(data);
        } catch (e) {
          console.warn("Error cargando desde Strapi:", e);
        }
      }
    }
    load();
    return () => (mounted = false);
  }, [fetchFromStrapi]);

  useEffect(() => {
    const idx = steps.findIndex((s) => s.status !== "done");
    setFirstIncompleteIndex(idx === -1 ? null : idx);
  }, [steps]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    function check() {
      const overflow = el.scrollWidth > el.clientWidth + 2;
      setCanScrollLeft(el.scrollLeft > 3);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 3);
      if (!overflow) {
        setCanScrollLeft(false);
        setCanScrollRight(false);
      }
    }

    const t = setTimeout(check, 40);
    el.addEventListener("scroll", check);

    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(check);
      ro.observe(el);
      ro.observe(document.body);
    } else {
      window.addEventListener("resize", check);
    }

    return () => {
      clearTimeout(t);
      el.removeEventListener("scroll", check);
      if (ro) ro.disconnect();
      else window.removeEventListener("resize", check);
    };
  }, [scrollerRef, steps]);

  function scrollBy(dir = 1) {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector('.ss-card');
    const gap = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--ss-gap') || '10', 10) || 10;
    const cardWidth = card ? card.getBoundingClientRect().width : Math.round(el.clientWidth * 0.8);
    const amount = (cardWidth + gap) * dir;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  }

  function handleContinueLocal(step) {
    if (onContinue) return onContinue(step);
    console.log('Continuar paso:', step);
  }

  const css = `
  :root{ --ss-gap:10px; --card-desktop-w:110px; }

  .ss-root{ --pistacho:#f6fff2; --pistacho-2:#eef9ee; --neon-violet: #b973ff; --neon-violet-2: #9f43ff; --dark-green: #05160d; }
  .ss-wrap{ background: linear-gradient(180deg,var(--pistacho), var(--pistacho-2)); padding:8px; border-radius:10px; box-shadow: 0 8px 30px rgba(10,12,25,0.06); overflow:visible; }

  .ss-center{ display:block; max-width:95%; margin:0 auto; margin-top: -20px; position:relative; overflow:hidden; }

  .ss-scroller{
    display:flex;
    gap:var(--ss-gap);
    overflow-x:auto;
    scroll-behavior:smooth;
    padding:6px 36px;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x mandatory;
    align-items:flex-start;
  }
  .ss-scroller::-webkit-scrollbar{ height:8px; }
  .ss-scroller::-webkit-scrollbar-thumb{ border-radius:999px; background: rgba(0,0,0,0.09); }

  .ss-card{
    min-width:var(--card-desktop-w);
    width:var(--card-desktop-w);
    background: white;
    border-radius:10px;
    padding:8px;
    box-shadow: 0 4px 12px rgba(10,10,10,0.03);
    border: 1px solid rgba(0,0,0,0.04);
    position:relative;
    flex:0 0 auto;
    transition: transform .22s ease, box-shadow .22s ease;
    scroll-snap-align: start;
  }
  .ss-card:hover{ transform: translateY(-3px); box-shadow: 0 10px 24px rgba(18,10,60,0.06); }

  /* IMAGEN: configura tamaño base y comportamiento de ajuste */
  .ss-image{
    height:56px;                 /* desktop pequeño (mantener similar al original) */
    border-radius:6px;
    display:flex;
    align-items:center;
    justify-content:center;
    background:linear-gradient(180deg,#ffffff 0%, rgba(255,255,255,0.98) 60%);
    overflow:hidden;
    position:relative;
    aspect-ratio: 16 / 9;        /* evita deformación extrema y ayuda a consistencia */
  }
  .ss-image img{
    width:100%;
    height:100%;
    object-fit:cover;            /* corta y centra sin estirar */
    object-position:center;
    transition: transform .28s cubic-bezier(.2,.9,.3,1), filter .22s ease;
    filter: saturate(1.02) contrast(1.01);
  }
  .ss-card:hover .ss-image img{ transform: scale(1.04) rotate(-0.6deg); filter: brightness(1.06) saturate(1.12); }

  .ss-glow{ position:absolute; inset:0; pointer-events:none; border-radius:10px; mix-blend-mode:screen; opacity:0.07; background: radial-gradient(160px 50px at 12% 8%, rgba(159,67,255,0.12), transparent 12%), linear-gradient(120deg, rgba(185,115,255,0.04), rgba(159,67,255,0.02)); }

  .ss-title{ margin-top:6px; font-weight:800; text-align:center; font-size:11px; color:#111; min-height:32px; display:flex; align-items:center; justify-content:center; padding:0 6px; }
  .ss-footer{ margin-top:6px; display:flex; align-items:center; justify-content:center; gap:6px; }

  .ss-btn{ position:relative; padding:7px 10px; border-radius:8px; color: white; font-weight:900; border: none; cursor:pointer; display:flex; align-items:center; gap:8px; font-size:13px; }
  .ss-btn svg{ width:14px; height:14px; filter: drop-shadow(0 2px 6px rgba(159,67,255,0.28)); }
  .ss-btn .label{ position:relative; z-index:2; }

  .btn-bg{ position:absolute; inset:0; border-radius:8px; z-index:1; background: linear-gradient(90deg, rgba(159,67,255,0.95), rgba(185,115,255,0.85)); box-shadow: 0 10px 30px rgba(159,67,255,0.22); overflow:hidden; }
  .btn-bg::before{ content:''; position:absolute; left:-40%; top:0; width:140%; height:100%; background: linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.12), rgba(255,255,255,0.06)); transform: skewX(-20deg); animation: slideShine 2.2s linear infinite; opacity:0.28; }
  @keyframes slideShine{ from{ transform: translateX(-30%) skewX(-20deg);} to{ transform: translateX(30%) skewX(-20deg);} }
  @keyframes pulseBtn{ 0%{ transform: scale(1); }50%{ transform: scale(1.02); }100%{ transform: scale(1); } }
  .ss-btn{ animation: pulseBtn 3s ease-in-out infinite; }

  .ss-done{ padding:5px 8px; border-radius:999px; background: #e9fff2; color:#007a45; font-weight:800; border:1px solid rgba(0,148,74,0.08); font-size:12px; }
  .ss-pend{ color:#8a8a8a; font-weight:800; font-size:12px; }
  .ss-disabled{ filter: grayscale(1) contrast(.9) brightness(.82); opacity:.6; }

  .ss-arrow{ position:absolute; top:50%; transform:translateY(-50%); width:44px; height:44px; border-radius:12px; background: linear-gradient(180deg, rgba(3,12,8,1), rgba(6,20,12,1)); box-shadow: 0 8px 34px rgba(2,6,4,0.7), 0 0 18px rgba(159,67,255,0.06); display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:120; }
  .ss-arrow.left{ left:18px; }
  .ss-arrow.right{ right:18px; }
  .ss-arrow svg{ width:20px; height:20px; }
  .ss-arrow path{ stroke: white; stroke-width:2.6; stroke-linecap:round; stroke-linejoin:round; filter: drop-shadow(0 0 8px rgba(159,67,255,0.45)); }
  .ss-arrow::after{ content:''; position:absolute; width:28px; height:28px; border-radius:8px; background: linear-gradient(90deg, rgba(159,67,255,0.18), rgba(185,115,255,0.12)); top:50%; left:50%; transform:translate(-50%,-50%); filter: blur(6px); opacity:0.9; z-index:-1; }
  .ss-arrow:hover{ transform:translateY(-50%) scale(1.05); box-shadow: 0 14px 44px rgba(2,6,4,0.75), 0 0 40px rgba(159,67,255,0.24); }

  .ss-badge{ position:absolute; top:8px; left:8px; min-width:20px; height:20px; border-radius:999px; display:flex; align-items:center; justify-content:center; font-weight:900; color:white; font-size:11px; background: linear-gradient(90deg,var(--neon-violet-2),var(--neon-violet)); box-shadow: 0 6px 18px rgba(159,67,255,0.18); }

  .ss-indicator{ display:flex; gap:8px; justify-content:center; margin-top:8px; flex-wrap:wrap; }
  .ss-ind-item{ min-width:30px; height:28px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-weight:900; color:#fff; background:#d6d6d6; font-size:12px; padding:4px 8px; }
  .ss-ind-item.active{ background: linear-gradient(90deg, var(--neon-violet-2), var(--neon-violet)); box-shadow: 0 8px 26px rgba(159,67,255,0.18); }

  /* -------------------- MOBILE ADAPTATIONS -------------------- */
  @media (max-width: 700px) {
    .ss-arrow{ display:none; }

    .ss-center{ max-width:100%; padding:0 4px; margin-top:-12px; }

    .ss-scroller{ padding:6px 10px; gap:12px; }

    /* móvil: 1 tarjeta amplia por vista, imagen más alta para mayor lectura */
    .ss-card{
      min-width:88%;
      width:88%;
      box-sizing:border-box;
      border-radius:12px;
      padding:10px;
    }
    .ss-image{
      height:140px;    /* imagen alta en móvil para mejor lectura */
      aspect-ratio: 16 / 9;
      border-radius:10px;
    }

    .ss-title{ font-size:13px; min-height:42px; padding:0 10px; }
    .ss-btn{ font-size:15px; padding:10px 14px; }
    .ss-indicator{ gap:6px; margin-top:12px; }
    .ss-ind-item{ min-width:34px; height:32px; font-size:13px; padding:6px 10px; }
  }

  /* Tablets: mostrar 1.5-2 tarjetas y altura intermedia */
  @media (min-width: 701px) and (max-width: 1024px) {
    .ss-card{ min-width:140px; width:140px; }
    .ss-image{ height:80px; aspect-ratio: 16 / 9; }
    .ss-scroller{ padding:8px 28px; gap:12px; }
  }

  /* Desktop mediano: mantener parecido al original pero con imagen un poco mayor para legibilidad */
  @media (min-width:1025px) and (max-width:1199px) {
    .ss-card{ min-width:120px; width:120px; }
    .ss-image{ height:80px; aspect-ratio: 16 / 9; border-radius:8px; }
    .ss-scroller{ padding:6px 40px; gap:12px; }
  }

  /* Desktop amplio / XL: imágenes más grandes dentro de las tarjetas */
  @media (min-width:1200px) {
    .ss-card{ min-width:140px; width:140px; }
    .ss-image{ height:100px; aspect-ratio: 16 / 9; border-radius:8px; }
    .ss-scroller{ padding:8px 48px; gap:14px; }
  }
  `;

  return (
    <div style={{ padding: 6 }} className="ss-root">
      <style>{css}</style>
      <div className="ss-wrap">
        <div className="ss-center">
          {canScrollLeft && (
            <div className="ss-arrow left" onClick={() => scrollBy(-1)} role="button" aria-label="Anterior">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </div>
          )}

          {canScrollRight && (
            <div className="ss-arrow right" onClick={() => scrollBy(1)} role="button" aria-label="Siguiente">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M9 6l6 6-6 6" />
              </svg>
            </div>
          )}

          <div ref={scrollerRef} className="ss-scroller" role="list">
            {steps.map((step, idx) => {
              const isDone = step.status === 'done';
              const isFirstIncomplete = idx === firstIncompleteIndex;
              const disabled = !isDone && !isFirstIncomplete;

              return (
                <div key={step.id} className={`ss-card ${disabled ? 'ss-disabled' : ''}`} role="listitem">
                  <div className="ss-badge">{step.id}</div>

                  <div className="ss-image">
                    {step.image ? (
                      <img src={step.image} alt={step.title} />
                    ) : (
                      <svg width="120" height="56" viewBox="0 0 120 56" xmlns="http://www.w3.org/2000/svg">
                        <rect x="6" y="6" width="108" height="44" rx="6" fill="#fff" stroke="#111" strokeWidth="2" />
                        <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fontSize="10" fill="#333">Icon</text>
                      </svg>
                    )}
                  </div>

                  <div className="ss-glow" aria-hidden />

                  <div className="ss-title">{step.title}</div>

                  <div className="ss-footer">
                    {isDone ? (
                      <div className="ss-done">Realizado</div>
                    ) : isFirstIncomplete ? (
                      <button className="ss-btn" onClick={() => handleContinueLocal(step)}>
                        <div className="btn-bg" aria-hidden />
                        <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path d="M5 12h14M13 5l7 7-7 7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="label">{step.btnText && step.btnText.length ? step.btnText : 'Continuar'}</span>
                      </button>
                    ) : (
                      <div className="ss-pend">Pendiente</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="ss-indicator">
            {steps.map((s, i) => (
              <div key={`ind-${s.id}`} className={`ss-ind-item ${i === firstIncompleteIndex ? 'active' : ''}`}>
                {s.id}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
