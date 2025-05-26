import React from 'react';
import '../../styles/Comunidad.css';

const Comunidad = () => {
  return (
    <div className="comunidad-container">
      <section className="comunidad-content">
        <h1>Únete a Nuestra Comunidad</h1>
        <p>
          Sé parte de un movimiento revolucionario donde el cooperativismo 6.0 y la innovación se encuentran. Nuestra comunidad no es solo un grupo más; es un espacio donde las ideas toman vida, las colaboraciones florecen y el futuro se construye juntos.
        </p>
        <p>
          Al unirte a nuestro grupo de WhatsApp, tendrás acceso directo a personas apasionadas como tú, que están dispuestas a compartir conocimiento, herramientas y recursos para hacer realidad un cambio significativo. ¡Tu voz y tus ideas son esenciales para nosotros!
        </p>
        <a href="https://chat.whatsapp.com/H5GM7PJPIjE5z2Rkh4p95k" className="join-button" target="_blank" rel="noopener noreferrer">
          Únete al Grupo de WhatsApp
        </a>
      </section>
    </div>
  );
};

export default Comunidad;
