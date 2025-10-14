// src/Pages/WikiViewer.jsx
import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

export default function WikiViewer() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pageId = "286ccd6ede7b8088993dc99af29e0b2f";

  useEffect(() => {
    let mounted = true;
    const fetchWiki = async () => {
      try {
        const res = await fetch(`http://localhost:33034/wiki/${pageId}`);
        const text = await res.text();
        if (!mounted) return;
        setContent(text);
      } catch (err) {
        if (mounted) setError(err.message || "Error al traer la nota");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchWiki();
    return () => {
      mounted = false;
    };
  }, [pageId]);

  if (loading)
    return <p className="text-center text-gray-500 text-lg mt-10">⏳ Cargando nota...</p>;
  if (error)
    return <p className="text-center text-red-600 text-lg mt-10">💥 Error: {error}</p>;

  function sanitizeProps(props = {}) {
    const {
      node,
      children,
      rawSourcePos,
      sourcePosition,
      data,
      ...rest
    } = props || {};
    return rest;
  }

  // ---------- SummaryRenderer (lo mantenemos para detectar el componente por referencia) ----------
  function SummaryRenderer({ children, ...propsFromMarkdown }) {
    const safeProps = sanitizeProps(propsFromMarkdown);
    console.log("📄 [SummaryRenderer] Renderizando summary con hijos:", children);
    return (
      <summary
        {...safeProps}
        className={
          (safeProps.className ? safeProps.className + " " : "") + "wiki-summary"
        }
      >
        {children}
      </summary>
    );
  }

  // ---------- Helper: busca/extráe summary recursivamente ----------
  function extractSummaryFromNode(node) {
    // Retorna { found: JSXElement | null, cleanedNode: nodeWithoutSummaryOrSameNode }
    if (!React.isValidElement(node)) {
      // texto o primitivo -> no contiene summary
      return { found: null, cleanedNode: node };
    }

    // Caso: el propio node ES el summary
    if (
      node.type === "summary" ||
      node.type === SummaryRenderer ||
      (node.props && node.props.originalType === "summary") ||
      (node.props && node.props.node && node.props.node.tagName === "summary")
    ) {
      return { found: node, cleanedNode: null }; // se elimina el nodo (porque ahora será movido arriba)
    }

    // Si tiene children, iterar recursivamente
    const originalChildren = React.Children.toArray(node.props.children);
    let found = null;
    const newChildren = [];

    for (let child of originalChildren) {
      const { found: f, cleanedNode } = extractSummaryFromNode(child);
      if (f && !found) {
        found = f;
      }
      if (cleanedNode !== null) {
        newChildren.push(cleanedNode);
      }
    }

    if (found) {
      // Recontruimos el elemento sin el summary anidado
      const cleanedElement = React.cloneElement(
        node,
        { ...node.props },
        newChildren.length === 0 ? null : newChildren
      );
      return { found, cleanedNode: cleanedElement };
    }

    // No se encontró summary en este subárbol
    return { found: null, cleanedNode: node };
  }

  // ---------- DetailsRenderer robusto ----------
  function DetailsRenderer({ children, ...propsFromMarkdown }) {
    const safeProps = sanitizeProps(propsFromMarkdown);
    const childrenArray = React.Children.toArray(children);

    console.log("🧩 [DetailsRenderer] Nuevo <details> detectado");
    console.log(
      "   ↳ raw children types:",
      childrenArray.map((c) =>
        React.isValidElement(c) ? (c.type && c.type.name) || c.type : typeof c
      )
    );

    let summary = null;
    const cleanedChildren = [];

    for (let child of childrenArray) {
      const { found, cleanedNode } = extractSummaryFromNode(child);
      if (found && !summary) {
        summary = found;
        console.log("   ✅ summary extraído:", found);
      }
      if (cleanedNode !== null) {
        cleanedChildren.push(cleanedNode);
      }
    }

    if (!summary) {
      console.log("   ⚠️ No se encontró summary directo ni anidado");
    }

    // ID debug para correlacionar en DOM
    const debugId = Math.random().toString(36).substring(2, 8);

    return (
      <details
        data-debug-id={debugId}
        {...safeProps}
        className={
          (safeProps.className ? safeProps.className + " " : "") + "wiki-detail"
        }
      >
        {summary}
        {cleanedChildren}
      </details>
    );
  }

  return (
    <section className="wiki-viewer bg-gray-50 py-20">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 md:px-14 lg:px-20 xl:px-32">
        <div className="bg-white rounded-3xl shadow border border-gray-100 px-6 md:px-14 py-12">
          <article
            className="wiki-content text-gray-800"
            style={{
              fontFamily:
                "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
              fontSize: "1.15rem",
              lineHeight: 1.9,
            }}
          >
            <ReactMarkdown
              rehypePlugins={[rehypeRaw]}
              components={{
                details: DetailsRenderer,
                summary: SummaryRenderer,
              }}
            >
              {content}
            </ReactMarkdown>
          </article>
        </div>
      </div>

      <style>{`
        .wiki-content h1, .wiki-content h2, .wiki-content h3 {
          font-family: "Merriweather", serif;
          color: #0f172a;
          margin-top: 1.6rem;
          margin-bottom: 0.6rem;
        }
        .wiki-content h1 { font-size: 2.1rem; font-weight: 700; }
        .wiki-content h2 { font-size: 1.6rem; font-weight: 600; }
        .wiki-content h3 { font-size: 1.25rem; font-weight: 600; }

        .wiki-content p { margin-bottom: 1.05rem; color: #334155; }

        .wiki-content a {
          color: #2563eb;
          text-decoration: none;
          border-bottom: 1px solid rgba(37,99,235,0.14);
        }
        .wiki-content img { max-width: 100%; display: block; margin: 1rem auto; border-radius: 0.6rem; }

        /* DETAILS / SUMMARY - comportamiento NATIVO, solo estilos ligeros */
        .wiki-detail {
          background: #fbfdff;
          border: 1px solid #eef2f7;
          border-radius: 0.75rem;
          padding: 0.8rem 1rem;
          margin: 0.8rem 0;
          overflow: visible; /* CRUCIAL: NO ocultar overflow */
        }

        .wiki-summary {
          display: list-item;
          list-style: none;
          cursor: pointer;
          font-weight: 600;
          color: #0f172a;
          padding-right: 1.2rem;
          outline: none;
        }

        .wiki-summary::-webkit-details-marker { display: none; }

        .wiki-summary::after {
          content: "▸";
          float: right;
          transform-origin: center;
          transition: transform 120ms linear;
          color: #0f172a;
        }
        .wiki-detail[open] > .wiki-summary::after { transform: rotate(90deg); }

        .wiki-detail > *:not(.wiki-summary) { margin-top: 0.6rem; }

        .wiki-detail .wiki-detail { margin-top: 0.6rem; background: #ffffff; border-color: #e6f0ff; }

        .wiki-detail, .wiki-detail * { pointer-events: auto; }

        @media (max-width: 640px) {
          .wiki-content h1 { font-size: 1.8rem; }
          .wiki-content { font-size: 1.02rem; line-height: 1.6; }
        }
      `}</style>
    </section>
  );
}
