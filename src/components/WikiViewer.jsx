import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

export default function WikiViewer() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ID de la nota de Notion
  const pageId = "286ccd6ede7b8088993dc99af29e0b2f"; // este es tu pageId extraído de la URL

  useEffect(() => {
    const fetchWiki = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3000/wiki/${pageId}`);
        if (!response.ok) throw new Error("Error al obtener la nota");
        const text = await response.text();
        setContent(text);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWiki();
  }, [pageId]);

  if (loading) return <p>Cargando nota...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="prose mx-auto p-4">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}