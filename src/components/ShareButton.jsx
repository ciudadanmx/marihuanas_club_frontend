import React, { useState, useRef, useEffect } from "react";
import {
  FacebookShareButton,
  WhatsappShareButton,
  TelegramShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  RedditShareButton,
  EmailShareButton,
  PinterestShareButton,
  FacebookMessengerShareButton,
} from "react-share";
import { FiShare2, FiCopy, FiX } from "react-icons/fi";

/**
 * BotonCompartirProFinal
 * - Todas las redes reciben la misma URL (urlToShare).
 * - Incluye uploadedFileUrl para redes que aceptan media (Pinterest).
 * - Modal centrado verticalmente, scroll interno, muestra la primera opción al abrir.
 *
 * Props:
 *  - url: (opcional) URL a compartir. Si no se pasa, usa window.location.href
 *  - mensaje: texto por defecto al compartir
 */
export default function ShareButton({
  url, // opcional: si se pasa, se usará
  mensaje = "Mira esto en Ciudadan 👇",
}) {
  // uploadedFileUrl: ruta local del archivo subido. El entorno/servidor debe transformar a URL pública.
  const uploadedFileUrl = "/mnt/data/86268b5f-48ab-4aa4-b66a-85bb6f4f58d1.png";

  // URL que usaremos en todos los botones (preferencia: prop url > window.location.href)
  const urlToShare =
    typeof url === "string" && url.length > 0
      ? url
      : typeof window !== "undefined"
      ? window.location.href
      : "https://ciudadan.org";

  const [open, setOpen] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [shareError, setShareError] = useState(null);
  const listRef = useRef(null);
  const firstItemRef = useRef(null);

  useEffect(() => {
    if (open) {
      setCopiado(false);
      setShareError(null);
      // Esperar a que el DOM pinte y forzar scroll top y visibilidad del primer elemento
      requestAnimationFrame(() => {
        if (listRef.current) listRef.current.scrollTop = 0;
        if (firstItemRef.current)
          firstItemRef.current.scrollIntoView({ block: "nearest", behavior: "auto" });
        if (firstItemRef.current && typeof firstItemRef.current.focus === "function")
          firstItemRef.current.focus();
      });
      // bloquear scroll body
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const copiarEnlace = async () => {
    try {
      await navigator.clipboard.writeText(urlToShare);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1600);
    } catch (e) {
      alert("No se pudo copiar. Usa Ctrl+C.");
    }
  };

  const intentarShareNativo = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Ciudadan", text: mensaje, url: urlToShare });
        setOpen(false);
      } catch (e) {
        setShareError("Compartir nativo cancelado o no disponible.");
      }
    } else {
      setShareError("Tu navegador no soporta compartir nativo.");
    }
  };

  // estilos inline para copiar-pegar fácil
  const styles = {
    mainButton: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      padding: "12px 18px",
      borderRadius: 999,
      background: "linear-gradient(180deg,#fff200 0%, #E7E300 100%)",
      color: "#1b1b1b",
      border: "3px solid #6d6e71",
      boxShadow: "0 8px 0 #6d6e71",
      fontWeight: 800,
      fontSize: 16,
      cursor: "pointer",
      textTransform: "uppercase",
    },
    modalBackdrop: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.45)",
      zIndex: 9999,
      backdropFilter: "blur(3px)",
      display: "flex",
      alignItems: "center", // centrado vertical
      justifyContent: "center",
      padding: 20,
    },
    modalShell: {
      width: "100%",
      maxWidth: 520,
      maxHeight: "86vh",
      display: "flex",
      flexDirection: "column",
      borderRadius: 18,
      overflow: "hidden",
      boxShadow: "0 18px 50px rgba(0,0,0,0.5)",
      border: "4px solid #2A6400",
      background: "linear-gradient(180deg,#E6FF00 0%, #E1FF66 100%)",
    },
    modalHeader: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: 12,
      background: "#2CB34B",
      color: "white",
      fontWeight: 900,
      fontSize: 18,
      justifyContent: "space-between",
    },
    headerLeft: { display: "flex", alignItems: "center", gap: 12 },
    headerImage: { width: 60, height: 44, objectFit: "cover", borderRadius: 8 },
    scrollList: {
      overflowY: "auto",
      WebkitOverflowScrolling: "touch",
      padding: 8,
    },
    optionRow: {
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "12px 16px",
      cursor: "pointer",
      background: "transparent",
      border: "none",
      width: "100%",
      textAlign: "left",
      fontSize: 16,
      fontWeight: 800,
      color: "#101010",
    },
    bubble: (bg) => ({
      minWidth: 44,
      minHeight: 44,
      borderRadius: 999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 18,
      color: "white",
      background: bg,
      boxShadow: "0 6px 0 rgba(0,0,0,0.18)",
    }),
    cancelRow: {
      padding: 12,
      background: "#C7EA00",
      textAlign: "center",
      fontWeight: 900,
      cursor: "pointer",
      borderTop: "4px solid rgba(0,0,0,0.12)",
    },
    microNote: { fontSize: 13, color: "#243424", opacity: 0.95 },
  };

  // header image (ruta local subida)
  const headerImageSrc = uploadedFileUrl;

  return (
    <>
      <button aria-label="Compartir" onClick={() => setOpen(true)} style={styles.mainButton}>
        <FiShare2 size={20} />
        Compartir
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          style={styles.modalBackdrop}
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div style={styles.modalShell}>
            <div style={styles.modalHeader}>
              <div style={styles.headerLeft}>
                <img src={headerImageSrc} alt="brand" style={styles.headerImage} />
                <div>
                  <div style={{ fontWeight: 900 }}>Compartir</div>
                  <div style={styles.microNote}>Comparte este enlace con tu parche</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button
                  onClick={intentarShareNativo}
                  title="Compartir (nativo)"
                  style={{
                    background: "transparent",
                    border: "2px solid rgba(255,255,255,0.18)",
                    color: "white",
                    padding: "6px 8px",
                    borderRadius: 10,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Share
                </button>

                <button
                  onClick={() => setOpen(false)}
                  aria-label="Cerrar"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "white",
                    padding: 6,
                    fontSize: 20,
                    cursor: "pointer",
                  }}
                >
                  <FiX />
                </button>
              </div>
            </div>

            {/* lista con scroll - todas las redes usan urlToShare */}
            <div ref={listRef} style={styles.scrollList}>
              {/* Facebook */}
              <div style={{ padding: 8 }}>
                <FacebookShareButton url={urlToShare} quote={mensaje} style={styles.optionRow}>
                  <div ref={firstItemRef} style={styles.bubble("#1877F2")}>f</div>
                  Facebook
                </FacebookShareButton>
              </div>

              {/* WhatsApp */}
              <div style={{ padding: 8 }}>
                <WhatsappShareButton url={urlToShare} title={mensaje} style={styles.optionRow}>
                  <div style={styles.bubble("#25D366")}>W</div>
                  WhatsApp
                </WhatsappShareButton>
              </div>

              {/* Telegram */}
              <div style={{ padding: 8 }}>
                <TelegramShareButton url={urlToShare} title={mensaje} style={styles.optionRow}>
                  <div style={styles.bubble("#2AABEE")}>✈</div>
                  Telegram
                </TelegramShareButton>
              </div>

              {/* Twitter / X */}
              <div style={{ padding: 8 }}>
                <TwitterShareButton url={urlToShare} title={mensaje} style={styles.optionRow}>
                  <div style={styles.bubble("#000000")}>X</div>
                  X / Twitter
                </TwitterShareButton>
              </div>

              {/* LinkedIn */}
              <div style={{ padding: 8 }}>
                <LinkedinShareButton url={urlToShare} title={mensaje} style={styles.optionRow}>
                  <div style={styles.bubble("#0A66C2")}>in</div>
                  LinkedIn
                </LinkedinShareButton>
              </div>

              {/* Reddit */}
              <div style={{ padding: 8 }}>
                <RedditShareButton url={urlToShare} title={mensaje} style={styles.optionRow}>
                  <div style={styles.bubble("#FF4500")}>r</div>
                  Reddit
                </RedditShareButton>
              </div>

              {/* Pinterest (usa media: la imagen subida) */}
              <div style={{ padding: 8 }}>
                <PinterestShareButton url={urlToShare} media={uploadedFileUrl} style={styles.optionRow}>
                  <div style={styles.bubble("#E60023")}>P</div>
                  Pinterest
                </PinterestShareButton>
              </div>

              {/* Facebook Messenger */}
              <div style={{ padding: 8 }}>
                <FacebookMessengerShareButton appId="1234567890" url={urlToShare} style={styles.optionRow}>
                  <div style={styles.bubble("#0078FF")}>m</div>
                  Messenger
                </FacebookMessengerShareButton>
              </div>

              {/* Email */}
              <div style={{ padding: 8 }}>
                <EmailShareButton url={urlToShare} subject={mensaje} style={styles.optionRow}>
                  <div style={styles.bubble("#BA1E1E")}>✉</div>
                  Email
                </EmailShareButton>
              </div>

              {/* FALLBACKS - abrir web/app con la URL incluida en la query */}
              <div style={{ padding: 8 }}>
                <button
                  onClick={() =>
                    window.open(
                      `https://www.instagram.com/?url=${encodeURIComponent(urlToShare)}`,
                      "_blank"
                    )
                  }
                  style={styles.optionRow}
                >
                  <div style={styles.bubble("linear-gradient(45deg,#FEDA75,#FA7E1E,#D62976,#962FBF,#4F5BD5)")}>
                    📸
                  </div>
                  Instagram (fallback)
                </button>
              </div>

              <div style={{ padding: 8 }}>
                <button
                  onClick={() =>
                    window.open(
                      `https://www.tiktok.com/share?url=${encodeURIComponent(urlToShare)}`,
                      "_blank"
                    )
                  }
                  style={styles.optionRow}
                >
                  <div style={styles.bubble("#000000")}>♪</div>
                  TikTok (fallback)
                </button>
              </div>

              <div style={{ padding: 8 }}>
                <button
                  onClick={() =>
                    window.open(
                      `https://discord.com/channels/@me?url=${encodeURIComponent(urlToShare)}`,
                      "_blank"
                    )
                  }
                  style={styles.optionRow}
                >
                  <div style={styles.bubble("#5865F2")}>💬</div>
                  Discord
                </button>
              </div>

              {/* Copiar enlace */}
              <div style={{ padding: 8 }}>
                <button onClick={copiarEnlace} style={styles.optionRow}>
                  <div style={styles.bubble("#007F00")}>
                    <FiCopy />
                  </div>
                  {copiado ? "Enlace copiado ✔" : "Copiar enlace"}
                </button>
              </div>

              {shareError && (
                <div style={{ padding: 10, color: "#600000", fontWeight: 800 }}>{shareError}</div>
              )}
            </div>

            <div onClick={() => setOpen(false)} style={styles.cancelRow}>
              Cerrar
            </div>
          </div>
        </div>
      )}
    </>
  );
}
