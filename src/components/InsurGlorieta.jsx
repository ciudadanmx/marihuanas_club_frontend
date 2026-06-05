import React from "react";
import pdfFile from "../assets/respuesta_insurglorieta.pdf";

const InsurGlorieta = () => {
  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <h2>Respuesta Insurglorieta</h2>

      <a
        href={pdfFile}
        target="_blank"
        rel="noopener noreferrer"
        download="respuesta_insurglorieta.pdf"
        style={{
          padding: "14px 22px",
          background: "#fff200",
          color: "#000",
          textDecoration: "none",
          borderRadius: "10px",
          fontWeight: "bold",
          fontSize: "18px",
        }}
      >
        Descargar PDF
      </a>
    </div>
  );
};

export default InsurGlorieta;