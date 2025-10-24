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

        if (path === "/documentacion-transparencia") {
          notionUrl = "http://localhost:33034/wiki/28dccd6ede7b80199481fca15c1c3fe5";
        } else if (path === "/ayuda") {
          notionUrl = "http://localhost:33034/wiki/28dccd6ede7b80cfa079f9d15648f3f8";
        } else if (path === "/quienes-somos") {
          notionUrl = "http://localhost:33034/wiki/28cccd6ede7b80f59daec2f530992ef1";
        } else {
          notionUrl = "http://localhost:33034/wiki/286ccd6ede7b8088993dc99af29e0b2f";
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
