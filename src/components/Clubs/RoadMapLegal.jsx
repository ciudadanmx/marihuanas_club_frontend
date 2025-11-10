import React, { useEffect, useRef, useState } from "react";

// StepSlider preparado para importar imágenes desde ../../assets
// Importa los 10 assets que nos pasaste (la ruta relativa es ../../assets/).
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
      setCanScrollLeft(el.scrollLeft > 3);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 3);
    }
    const t = setTimeout(check, 40);
    el.addEventListener("scroll", check);
    window.addEventListener("resize", check);
    return () => {
      clearTimeout(t);
      el.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [scrollerRef, steps]);

  function scrollBy(dir = 1) {
    const el = scrollerRef.current;
    if (!el) return;
    // ahora desplazamos por 1 tarjeta (su ancho + gap) para control más preciso
    const card = el.querySelector('.ss-card');
    const gap = 12; // debe coincidir con CSS
    const cardWidth = card ? card.getBoundingClientRect().width : Math.round(el.clientWidth * 0.6);
    const amount = (cardWidth + gap) * dir;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  }

  function handleContinueLocal(step) {
    if (onContinue) return onContinue(step);
    console.log('Continuar paso:', step);
  }

  const css = `
  .ss-root{ --pistacho:#f6fff2; --pistacho-2:#eef9ee; --neon-violet: #b973ff; --neon-violet-2: #9f43ff; --dark-green: #05160d; }
  .ss-wrap{ background: linear-gradient(180deg,var(--pistacho), var(--pistacho-2)); padding:10px; border-radius:10px; box-shadow: 0 8px 30px rgba(10,12,25,0.06); }
  .ss-scroller{ display:flex; gap:12px; overflow-x:auto; scroll-behavior:smooth; padding:8px 10px; }

  /* Tarjetas MUCHO más pequeñas */
  .ss-card{ min-width:130px; width:130px; background: white; border-radius:10px; padding:8px; box-shadow: 0 4px 12px rgba(10,10,10,0.03); border: 1px solid rgba(0,0,0,0.04); position:relative; flex:0 0 auto; transition: transform .22s ease, box-shadow .22s ease; }
  .ss-card:hover{ transform: translateY(-3px); box-shadow: 0 10px 24px rgba(18,10,60,0.06); }
  .ss-image{ height:64px; border-radius:6px; display:flex; align-items:center; justify-content:center; background:linear-gradient(180deg,#ffffff 0%, rgba(255,255,255,0.98) 60%); overflow:hidden; position:relative; }
  .ss-image img{ max-height:100%; max-width:100%; transition: transform .28s cubic-bezier(.2,.9,.3,1), filter .22s ease; filter: saturate(1.02) contrast(1.01); }
  .ss-card:hover .ss-image img{ transform: scale(1.04) rotate(-0.6deg); filter: brightness(1.06) saturate(1.12); }

  .ss-glow{ position:absolute; inset:0; pointer-events:none; border-radius:10px; mix-blend-mode:screen; opacity:0.07; background: radial-gradient(160px 50px at 12% 8%, rgba(159,67,255,0.12), transparent 12%), linear-gradient(120deg, rgba(185,115,255,0.04), rgba(159,67,255,0.02)); }

  .ss-title{ margin-top:6px; font-weight:800; text-align:center; font-size:12px; color:#111; min-height:34px; display:flex; align-items:center; justify-content:center; padding:0 6px; }
  .ss-footer{ margin-top:6px; display:flex; align-items:center; justify-content:center; gap:6px; }

  /* Botón mucho más visible: blanco con borde neon y sombra + glow animado */
  .ss-btn{ padding:7px 10px; border-radius:8px; background: linear-gradient(90deg, white 0%, #f7f7ff 100%); color: var(--dark-green); font-weight:900; border: 2px solid var(--neon-violet); cursor:pointer; box-shadow: 0 6px 22px rgba(159,67,255,0.18), 0 0 10px rgba(159,67,255,0.06) inset; font-size:13px; text-shadow: 0 1px 0 rgba(255,255,255,0.3); }
  .ss-btn:hover{ transform: translateY(-2px); box-shadow: 0 12px 40px rgba(159,67,255,0.22), 0 0 22px rgba(159,67,255,0.18); }
  .ss-btn::after{ content:''; position:absolute; left:0; right:0; bottom:-8px; height:6px; background: linear-gradient(90deg, rgba(159,67,255,0.12), rgba(185,115,255,0.08)); filter: blur(6px); border-radius:6px; opacity:0.9; }

  .ss-done{ padding:6px 8px; border-radius:999px; background: #e9fff2; color:#007a45; font-weight:900; border:1px solid rgba(0,148,74,0.08); font-size:12px; }
  .ss-pend{ color:#8a8a8a; font-weight:800; font-size:12px; }
  .ss-disabled{ filter: grayscale(1) contrast(.9) brightness(.82); opacity:.6; }

  /* Flechas: fondo verdoso oscuro casi negro y flechas neon morado con glow */
  .ss-arrow{ position:absolute; top:50%; transform:translateY(-50%); width:42px; height:42px; border-radius:10px; background: linear-gradient(180deg, rgba(6,20,12,1), rgba(3,10,6,1)); box-shadow: 0 8px 28px rgba(2,6,4,0.6), 0 0 24px rgba(159,67,255,0.06); display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:60; }
  .ss-arrow.left{ left:6px; }
  .ss-arrow.right{ right:6px; }
  .ss-arrow svg{ width:18px; height:18px; filter: drop-shadow(0 0 8px rgba(159,67,255,0.45)); }
  .ss-arrow svg path{ stroke: var(--neon-violet-2); stroke-width:2.6; stroke-linecap:round; stroke-linejoin:round; }
  .ss-arrow:hover{ transform: translateY(-50%) scale(1.06); box-shadow: 0 12px 36px rgba(2,6,4,0.7), 0 0 32px rgba(159,67,255,0.22); }

  /* Flechas mostradas u ocultas en móvil */
  @media (max-width: 700px){ .ss-arrow{ display:none; } }

  .ss-indicator{ display:flex; gap:8px; justify-content:center; margin-top:10px; }
  .ss-dot{ width:10px; height:5px; border-radius:6px; }
  `;

  return (
    <div style={{ padding: 6 }}>
      <style>{css}</style>
      <div className="ss-wrap">
        <div style={{ position: 'relative' }}>
          <div
            className={`ss-arrow left ${!canScrollLeft ? 'ss-arrow--inactive' : ''}`}
            onClick={() => scrollBy(-1)}
            aria-hidden
            role="button"
            tabIndex={0}
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </div>

          <div
            className={`ss-arrow right ${!canScrollRight ? 'ss-arrow--inactive' : ''}`}
            onClick={() => scrollBy(1)}
            aria-hidden
            role="button"
            tabIndex={0}
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </div>

          <div ref={scrollerRef} className="ss-scroller" role="list">
            {steps.map((step, idx) => {
              const isDone = step.status === 'done';
              const isFirstIncomplete = idx === firstIncompleteIndex;
              const disabled = !isDone && !isFirstIncomplete;

              return (
                <div key={step.id} className={`ss-card ${disabled ? 'ss-disabled' : ''}`} role="listitem">
                  <div className="ss-image">
                    {step.image ? (
                      <img src={step.image} alt={step.title} />
                    ) : (
                      <svg width="120" height="64" viewBox="0 0 120 64" xmlns="http://www.w3.org/2000/svg">
                        <rect x="6" y="6" width="108" height="52" rx="6" fill="#fff" stroke="#111" strokeWidth="2" />
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
                        {step.btnText && step.btnText.length ? step.btnText : 'Continuar'}
                      </button>
                    ) : (
                      <div className="ss-pend">Pendiente</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="ss-indicator">
          {steps.map((s, i) => (
            <div key={`dot-${s.id}`} className="ss-dot" style={{ background: s.status === 'done' ? '#05b35a' : i === firstIncompleteIndex ? '#9f43ff' : '#d6d6d6' }} />
          ))}
        </div>
      </div>
    </div>
  );
}
