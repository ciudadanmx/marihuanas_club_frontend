// src/utils/CodigosPlantas.js
const COLORES = ['rojo', 'amarillo', 'verde', 'azul', 'rosa', 'plata'];

/**
 * Convierte email a slug usable en código
 * ciudadanmx@gmail.com -> ciudadanmx-gmail.com
 */
export function emailToSlug(email) {
  if (!email) return null;
  return String(email).replace('@', '-').toLowerCase();
}

const pad2 = (n) => String(n).padStart(2, '0');

function formatDateParts(fecha) {
  const d = fecha instanceof Date ? fecha : new Date(fecha);
  if (Number.isNaN(d.getTime())) {
    // fallback a now
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: pad2(now.getMonth() + 1),
      day: pad2(now.getDate()),
      hour: pad2(now.getHours()),
      minute: pad2(now.getMinutes()),
      second: pad2(now.getSeconds()),
    };
  }
  return {
    year: d.getFullYear(),
    month: pad2(d.getMonth() + 1),
    day: pad2(d.getDate()),
    hour: pad2(d.getHours()),
    minute: pad2(d.getMinutes()),
    second: pad2(d.getSeconds()),
  };
}

/**
 * Parsea un código de planta de forma robusta aunque el userSlug tenga guiones.
 *
 * Formato esperado (normalizado):
 * user-slug-YYYY-MM-DD-HH-mm-ss-color-indice
 *
 * Ejemplo:
 * ciudadanmx-gmail.com-2026-02-05-17-00-03-verde-4
 */
export function parseCodigoPlanta(codigo) {
  if (!codigo || typeof codigo !== 'string') return null;

  const parts = codigo.split('-');
  // Necesitamos al menos: userSlug(1+) + 6 fecha parts + color + indice = ≥9
  if (parts.length < 9) return null;

  // Extraemos desde el final para permitir userSlug con guiones
  const idxStr = parts.pop();
  const color = parts.pop();

  // Sacamos los 6 elementos de fecha (en orden year..second)
  const second = parts.pop();
  const minute = parts.pop();
  const hour = parts.pop();
  const day = parts.pop();
  const month = parts.pop();
  const year = parts.pop();

  const userSlug = parts.join('-');

  const fechaIso = `${year}-${month}-${day}T${hour}:${minute}:${second}`;

  return {
    userSlug,
    fecha: new Date(fechaIso),
    color,
    indice: Number(idxStr),
    raw: { year, month, day, hour, minute, second },
    codigoOriginal: codigo,
  };
}

/**
 * Pedir propiedades concretas de un código
 */
export function getPropiedadesCodigo(codigo, props = []) {
  const parsed = parseCodigoPlanta(codigo);
  if (!parsed) return null;
  if (!props || props.length === 0) return parsed;
  return props.reduce((acc, p) => {
    acc[p] = parsed[p];
    return acc;
  }, {});
}

/**
 * Calcula color y número (indice) a partir de un índice global (0-based).
 *
 * indexGlobal: 0 -> rojo-1
 * indexGlobal: 1 -> amarillo-1
 * ...
 * indexGlobal: 6 -> rojo-2
 */
export function calcularColorYNumeroDesdeIndexGlobal(indexGlobal) {
  if (indexGlobal == null || Number.isNaN(Number(indexGlobal))) {
    throw new Error('indexGlobal inválido');
  }
  const idx = Number(indexGlobal);
  const colorIndex = idx % COLORES.length;
  const color = COLORES[colorIndex];
  const numero = Math.floor(idx / COLORES.length) + 1; // 1-based
  return { color, numero, colorIndex, indexGlobal: idx };
}

/**
 * Genera el siguiente color+indice según plantasExistentes (igual que antes).
 * plantasExistentes: [{ codigo: '...' }, ...]
 * Devuelve { color, indice } (uso para 1 sola generación).
 */
export function getSiguienteColorIndice(plantasExistentes = []) {
  const conteo = {};
  for (const planta of plantasExistentes || []) {
    if (!planta || !planta.codigo) continue;
    const parsed = parseCodigoPlanta(planta.codigo);
    if (!parsed) continue;
    const { color, indice } = parsed;
    if (!color || !indice) continue;
    conteo[color] = Math.max(conteo[color] || 0, indice);
  }

  for (let i = 1; i <= 999; i++) { // límite alto para nunca bloquear (ajustable)
    for (const color of COLORES) {
      if ((conteo[color] || 0) < i) {
        return { color, indice: i };
      }
    }
  }

  throw new Error('Límite de colores/semillas alcanzado');
}

/**
 * Genera un código para una planta.
 *
 * Opciones:
 * - pasar indexGlobal (recomendado si conoces la posición global 0-based)
 * - o pasar plantasExistentes (array) para generar *una* siguiente según lo ya registrado
 *
 * Retorna:
 * { codigo, color, indice, indexGlobal (si se pudo calcular) }
 */
export function generarCodigoPlanta({
  email,
  plantasExistentes = [],
  fecha = new Date(),
  indexGlobal = null,
}) {
  const userSlug = emailToSlug(email);
  if (!userSlug) throw new Error('Email inválido para generar código');

  const dateParts = formatDateParts(fecha);

  let color, indice, idxGlobalComputed = null;

  if (indexGlobal != null) {
    const res = calcularColorYNumeroDesdeIndexGlobal(Number(indexGlobal));
    color = res.color;
    indice = res.numero;
    idxGlobalComputed = res.indexGlobal;
  } else if (plantasExistentes && plantasExistentes.length >= 0) {
    // fallback: calcular siguiente según lo ya registrado (para generación única)
    const sig = getSiguienteColorIndice(plantasExistentes);
    color = sig.color;
    indice = sig.indice;
    // calculamos indexGlobal equivalente (por si alguien lo necesita)
    const colorIndex = COLORES.indexOf(color);
    if (colorIndex >= 0) {
      idxGlobalComputed = (indice - 1) * COLORES.length + colorIndex;
    }
  } else {
    // último recurso: indexGlobal = 0
    const res = calcularColorYNumeroDesdeIndexGlobal(0);
    color = res.color;
    indice = res.numero;
    idxGlobalComputed = 0;
  }

  // índice formateado con 2 dígitos (mantener consistencia)
  const indiceStr = String(indice).padStart(2, '0');

  const codigo = [
    userSlug,
    dateParts.year,
    dateParts.month,
    dateParts.day,
    dateParts.hour,
    dateParts.minute,
    dateParts.second,
    color,
    indiceStr,
  ].join('-');

  return {
    codigo,
    color,
    indice,
    indexGlobal: idxGlobalComputed,
  };
}

/**
 * Genera un lote de códigos secuenciales a partir de un indexGlobal inicial.
 *
 * útil para crear varios registros con una sola llamada:
 *
 * generarLoteCodigos({ email, fecha, startIndexGlobal: 8, count: 4 })
 *
 * devuelve array [{ codigo, color, indice, indexGlobal }, ...]
 */
export function generarLoteCodigos({ email, fecha = new Date(), startIndexGlobal = 0, count = 1 }) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const gen = generarCodigoPlanta({ email, fecha, indexGlobal: startIndexGlobal + i });
    out.push(gen);
  }
  return out;
}
