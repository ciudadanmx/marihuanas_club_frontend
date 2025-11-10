// BarraRutaLegal.jsx
import React from "react";

export default function BarraRutaLegal({
  message = "⚖️  RUTA LEGAL  ⚖️",
  bg = "#000000",
  color = "#39FF14", // verde neón
}) {
  return (
    <div
      style={{
        width: "100%",
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "38px",
        lineHeight: "1",
        padding: "0",
        margin: "0",
        fontFamily: "'Rajdhani', 'Orbitron', 'Roboto Condensed', sans-serif",
        fontWeight: 900,
        textTransform: "uppercase",
        letterSpacing: "0.45em", // 👈 mucho más espaciado horizontal
        fontSize: "1rem",
        color,
        textShadow: `
          0 0 6px ${color},
          0 0 12px ${color},
          0 0 20px rgba(57,255,20,0.8)
        `,
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        zIndex: 99999,
        position: "absolute",
        marginTop: "-20px",
        marginBottom: "3px",
      }}
    >
      {message}
    </div>
  );
}
