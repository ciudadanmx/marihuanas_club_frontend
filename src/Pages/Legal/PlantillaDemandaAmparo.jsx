// ---------- Helpers (nombre, dirección, validaciones) ----------
const joinFullName = ({ nombres = '', apellidoP = '', apellidoM = '' }) => {
  const parts = [];
  if (nombres) parts.push(nombres.trim());
  if (apellidoP) parts.push(apellidoP.trim());
  if (apellidoM) parts.push(apellidoM.trim());
  return parts.join(' ') || '____________________';
};

const joinAddress = ({ calle = '', numext = '', numint = '', colonia = '', municipio = '', estado = '', cp = '' }) => {
  const parts = [];
  if (calle) parts.push(calle.trim());
  if (numext) parts.push(`No. ${numext.trim()}`);
  if (numint) parts.push(`Int. ${numint.trim()}`);
  if (colonia) parts.push(`Col. ${colonia.trim()}`);
  if (municipio) parts.push(municipio.trim());
  if (estado) parts.push(estado.trim());
  if (cp) parts.push(`C.P. ${cp.trim()}`);
  return parts.join(', ') || '____________________';
};

// RFC / CURP basic format validators
function isValidRFC(rfc) {
  if (!rfc) return true; // opcional
  const re = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/i;
  return re.test(rfc.trim());
}
function isValidCURP(curp) {
  if (!curp) return true;
  const re = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/i;
  return re.test(curp.trim());
}
