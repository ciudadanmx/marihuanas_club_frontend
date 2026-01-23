const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
};

const formatPrice = (price, type) => {
  const priceFormatted = parseFloat(price).toFixed(2);
  const [integerPart, decimalPart] = priceFormatted.split('.');

  if (type === 'enteros') return integerPart;
  if (type === 'decimales') return decimalPart;

  return priceFormatted;
};


  const formatearDireccionConInterior = (direccion, numeroInterior) => {
  if (!direccion || typeof direccion !== "string") return "";

  // Si no hay número interior, regresamos tal cual
  if (!numeroInterior) return direccion;

  // Insertar "Interior X" justo antes de "Colonia"
  if (direccion.includes("Colonia")) {
    return direccion.replace(
      ", Colonia",
      `, Interior ${numeroInterior}, Colonia`
    );
  }

  // Fallback por si alguna dirección no trae colonia
  return `${direccion}, Interior ${numeroInterior}`;
};


const formaters = { formatTime, formatPrice, formatearDireccionConInterior };
export default formaters;
