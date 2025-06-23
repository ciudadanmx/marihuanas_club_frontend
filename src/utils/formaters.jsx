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

const formaters = { formatTime, formatPrice };
export default formaters;
