import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../../styles/WikiViewer.css";

const WikiViewer = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchWiki = async () => {
      try {
        let notionUrl = "";

        const path = window.location.pathname;

        if (path === "/wiki/faq") {
          notionUrl = "http://localhost:3033/wiki/2da8ae85d119808198fdfa1c2270ad59";
        } else if (path === "/wiki/ayuda") {
          notionUrl = "http://localhost:3033/wiki/2da8ae85d119804788d6dd577113c59a";
        } else if (path === "/wiki/legal") {
          notionUrl = "http://localhost:3033/wiki/2da8ae85d119804bbab2eccd3b57e174";
        } else if (path === "/wiki/mapa420") {
          notionUrl = "http://localhost:3033/wiki/2da8ae85d11980a98227eb5d8d7ed1b9";
        } else {
          notionUrl = "http://localhost:3033/wiki/2da8ae85d1198035990ecd7eb74a5701";
        }

        setLoading(true);
        const res = await fetch(notionUrl);
        if (!res.ok) throw new Error("Error al cargar la wiki");
        let html = await res.text();

        html = html.replace("<details>", "<details open>");

        setContent(html);
      } catch (error) {
        console.error(error);
        setContent("<p>Error al cargar el contenido.</p>");
      } finally {
        setLoading(false);
      }
    };
    fetchWiki();
  }, [location.pathname]);

  if (loading) return <p>Cargando contenido...</p>;

  const isMatrix = location.pathname === "/quienes-somos";

  return (
    <div
      className={`wiki-content ${isMatrix ? "matrix-mode" : ""}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default WikiViewer;
