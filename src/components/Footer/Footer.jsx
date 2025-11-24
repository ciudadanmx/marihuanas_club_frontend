// src/components/Footer.jsx
import React from "react";

const WHATSAPP_LINK = "https://chat.whatsapp.com/LXuqt3SAlTGK17CzmWSrHP";

export default function Footer() {
  return (
    <footer
      style={{
        position: "absolute",
        left: 0,
        width: "100%",
        background: "#000",
        padding: "15px 10px",
        textAlign: "center",
        borderTop: "2px solid #39ff14",
        zIndex: 9999999,
      }}
    >
      <p
        style={{
          color: "#39ff14",
          fontSize: "16px",
          fontFamily: "monospace",
          margin: "0 0 8px 0",
        }}
      >
        ciudadan.org está en construcción — participa, únete al grupo de WhatsApp
      </p>

      <a
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: "#39ff14",
          fontSize: "16px",
          fontFamily: "monospace",
          textDecoration: "none",
          border: "1px solid #39ff14",
          padding: "6px 12px",
          borderRadius: "6px",
          display: "inline-block",
        }}
      >
        Entrar al grupo
      </a>
    </footer>
  );
}
