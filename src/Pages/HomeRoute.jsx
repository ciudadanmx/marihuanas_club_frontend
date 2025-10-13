// src/pages/WikiViewer.jsx
import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

export default function WikiViewer() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const pageId = "286ccd6ede7b8088993dc99af29e0b2f";

  useEffect(() => {
    console.log("☀️☀️☀️ [3 SOLES] Componente WikiViewer montado");
    console.log("☀️☀️☀️ [3 SOLES] ID de página que se usará:", pageId);

    // 🚀 cerrar topbar al entrar aquí
    window.dispatchEvent(new Event("closeTopBar"));

    const fetchWiki = async () => {
      console.log("☀️☀️☀️ [3 SOLES] Iniciando fetch al backend...");
      console.log("☀️☀️☀️ [3 SOLES] URL completa:", `http://localhost:33034/wiki/${pageId}`);

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`http://localhost:33034/wiki/${pageId}`, {
          method: "GET",
          headers: {
            "Content-Type": "text/plain",
          },
        });

        console.log("☀️☀️☀️ [3 SOLES] Fetch completado.");
        console.log("☀️☀️☀️ [3 SOLES] Status:", response.status, "StatusText:", response.statusText);

        if (!response.ok) {
          console.error("☀️☀️☀️ [3 SOLES] ❌ Error HTTP:", response.status);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const text = await response.text();
        console.log("☀️☀️☀️ [3 SOLES] Texto recibido del backend (primeros 500 caracteres):");
        console.log("────────────────────────────────────────────────────────────");
        console.log(text.slice(0, 500));
        console.log("────────────────────────────────────────────────────────────");
        console.log("☀️☀️☀️ [3 SOLES] Longitud total del texto recibido:", text.length);

        setContent(text);
        console.log("☀️☀️☀️ [3 SOLES] Contenido almacenado en estado correctamente ✅");
      } catch (err) {
        console.error("☀️☀️☀️ [3 SOLES] 💥 Error al hacer fetch:", err);
        setError(err.message);
      } finally {
        console.log("☀️☀️☀️ [3 SOLES] Fetch finalizado (finally)");
        setLoading(false);
      }
    };

    fetchWiki();
  }, [pageId]);

  // Logs del render
  console.log("☀️☀️☀️ [3 SOLES] Renderizando componente WikiViewer...");
  console.log("☀️☀️☀️ [3 SOLES] Estado → loading:", loading, "| error:", error, "| content.length:", content.length);

  if (loading) return <p>⏳ Cargando nota...</p>;
  if (error) return <p>💥 Error: {error}</p>;

  return (
    <div className="prose mx-auto p-4">
      <h2>📖 Vista Wiki (Render de Markdown)</h2>
      <ReactMarkdown
        components={{
          h1: ({ node, ...props }) => (
            <h1 style={{ color: "#333", borderBottom: "2px solid #FFF200", paddingBottom: "0.3em" }} {...props} />
          ),
          p: ({ node, ...props }) => (
            <p style={{ marginBottom: "1em", lineHeight: "1.6" }} {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul style={{ paddingLeft: "1.5em", marginBottom: "1em" }} {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
