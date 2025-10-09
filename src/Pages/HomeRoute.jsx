import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

export default function WikiViewer() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const pageId = "286ccd6ede7b8088993dc99af29e0b2f";

  useEffect(() => {
    const fetchWiki = async () => {
      console.log("🌐 [Frontend] Iniciando fetch a /wiki/:pageId", pageId);
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`http://localhost:33034/wiki/${pageId}`);
        console.log("📥 [Frontend] Response status:", response.status);

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const text = await response.text();

        console.log("📝 [Frontend] Markdown recibido:", text.slice(0, 100) + "..."); // muestra primeros 100 chars
        setContent(text);
      } catch (err) {
        console.error("❌ [Frontend] Fetch error:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWiki();
  }, [pageId]);

  if (loading) return <p>⏳ Cargando nota...</p>;
  if (error) return <p>💥 Error: {error}</p>;

  return (
    <div className="prose mx-auto p-4">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}