// Helpers compartidos (STRAPI base, formatos, extractor de imagen)
export const STRAPI_BASE = (process.env.REACT_APP_STRAPI_URL || "").replace(/\/$/, "");

export const firstImageFromMedia = (mediaField) => {
  try {
    if (!mediaField) return null;
    const data = Array.isArray(mediaField.data) ? mediaField.data : mediaField;
    const first =
      Array.isArray(data) ? data.find((d) => d?.attributes?.mime?.startsWith?.("image")) || data[0] : data;
    const attrs = first?.attributes ?? first;
    const url =
      attrs?.formats?.small?.url ??
      attrs?.formats?.medium?.url ??
      attrs?.formats?.thumbnail?.url ??
      attrs?.url ??
      null;
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${STRAPI_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
  } catch {
    return null;
  }
};

export const formatFechaEnEsp = (isoDate) => {
  try {
    if (!isoDate) return null;
    const d = new Date(isoDate);
    if (Number.isNaN(d.getTime())) return null;
    const day = d.getDate();
    const month = new Intl.DateTimeFormat("es-MX", { month: "long" }).format(d);
    const year = d.getFullYear();
    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
    return `${day} de ${capitalizedMonth} del ${year}`;
  } catch {
    return null;
  }
};

export const COLORS = [
  { key: "rojo", label: "Rojo", bg: "linear-gradient(135deg,#ff4d4f,#ff7875)", accent: "#fff" },
  { key: "amarillo", label: "Amarillo", bg: "linear-gradient(135deg,#ffd666,#ffec3d)", accent: "#111" },
  { key: "verde", label: "Verde", bg: "linear-gradient(135deg,#95de64,#52c41a)", accent: "#fff" },
  { key: "azul", label: "Azul", bg: "linear-gradient(135deg,#69c0ff,#40a9ff)", accent: "#fff" },
  { key: "rosa", label: "Rosa", bg: "linear-gradient(135deg,#ff85c0,#ff4d6d)", accent: "#fff" },
  { key: "plata", label: "Plata", bg: "linear-gradient(135deg,#e6e9ee,#bfc7d6)", accent: "#111" },
];

export const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'><rect width='100%' height='100%' fill='#fafafa'/><g fill='#cbd5e1' font-family='Arial' text-anchor='middle'><text x='50%' y='50%' dy='-6' font-size='20'>Sin foto</text><text x='50%' y='50%' dy='18' font-size='12'>Añade imágenes en la bitácora</text></g></svg>`
  );

export const cardVariants = {
  initial: { scale: 0.985, y: 6, opacity: 0 },
  enter: { scale: 1, y: 0, opacity: 1, transition: { duration: 0.36, ease: "easeOut" } },
  hover: { scale: 1.02 },
};
