export const consola = {
  log: (cadena) => {
    if (process.env.NODE_ENV !== 'development') return;
    console.log(`Konsola-  ${cadena}`);
  }
};