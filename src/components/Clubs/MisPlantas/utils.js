// Helpers compartidos (STRAPI base, formatos, extractor de imagen)
export const STRAPI_BASE = (process.env.REACT_APP_STRAPI_URL || "").replace(/\/$/, "");

export const firstImageFromMedia = (mediaField, debugLabel = "") => {
  try {
    if (!mediaField) {
      //console.log(`firstImageFromMedia(${debugLabel}): no mediaField`);
      return null;
    }

    // Normalizar varias formas
    let data = mediaField;
    if (mediaField.data) data = mediaField.data;
    if (mediaField.attributes && mediaField.attributes.data) data = mediaField.attributes.data;

    const arr = Array.isArray(data) ? data : [data];

    // Recorremos elementos hasta encontrar URL
    for (const item of arr) {
      if (!item) continue;
      // El candidate puede tener attributes o ser el objeto directo
      const candidate = item.attributes ?? item;

      // 1) provider_url (Cloudinary / external provider)
      if (candidate?.provider_url && typeof candidate.provider_url === "string") {
        // console.log(`firstImageFromMedia(${debugLabel}): provider_url ->`, candidate.provider_url);
        return candidate.provider_url;
      }

      // 2) formats (small / medium / thumbnail)
      const formats = candidate?.formats ?? null;
      if (formats) {
        const preferred = formats.small ?? formats.medium ?? formats.thumbnail ?? null;
        const urlFromFormats = preferred?.url ?? preferred?.provider_url ?? null;
        if (urlFromFormats) {
          // console.log(`firstImageFromMedia(${debugLabel}): formats ->`, urlFromFormats);
          return makeAbsoluteUrl(urlFromFormats);
        }
        // si no hay preferred, buscar cualquier format disponible
        for (const k of Object.keys(formats)) {
          const f = formats[k];
          if (f?.url) return makeAbsoluteUrl(f.url);
          if (f?.provider_url) return f.provider_url;
        }
      }

      // 3) url directo en candidate
      if (candidate?.url && typeof candidate.url === "string") {
        // console.log(`firstImageFromMedia(${debugLabel}): direct url ->`, candidate.url);
        return makeAbsoluteUrl(candidate.url);
      }

      // 4) uri (por si viene así)
      if (candidate?.uri && typeof candidate.uri === "string") {
        return makeAbsoluteUrl(candidate.uri);
      }

      // 5) nested data
      if (candidate?.data) {
        const nested = firstImageFromMedia(candidate.data, debugLabel + " > nested");
        if (nested) return nested;
      }

      // 6) provider_metadata o campos raros
      if (candidate?.provider_metadata?.public_id && candidate?.provider_metadata?.resource_type) {
        // no podemos construir la url exacta sin saber el provider, saltamos
      }
    }

    // ninguno arrojo url
    // console.log(`firstImageFromMedia(${debugLabel}): no url encontrada en mediaField`, mediaField);
    return null;
  } catch (e) {
    // console.error("firstImageFromMedia EX", e);
    return null;
  }
};

// helper para normalizar urls relativas con STRAPI_BASE
const makeAbsoluteUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  // STRAPI_BASE exportado en este archivo
  try {
    return `${STRAPI_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
  } catch {
    return url;
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
