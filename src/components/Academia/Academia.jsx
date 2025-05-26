import React from 'react';
import '../../styles/Academia.css';

const Academia = () => {
  return (
    <div className="academia-container">
      <section className="video-section">
        <div className="video-wrapper">
          <iframe
            src="https://www.youtube.com/embed/vstN2W9xaQk"
            title="Cáñamo Valley - Universidad Laboratorio"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </section>
      <section className="academia-content">
        <h1>Descubre Cáñamo Valley: Universidad Laboratorio</h1>
        <p>🌿 Cáñamo Valley (Hemp Valley) es la nueva era de las ecociudades. En 2024, este innovador proyecto se implementará en México, comenzando con un fraccionamiento impreso en 3D, incorporando energías renovables hechas en smart factories.</p>
        <p>🌍 Con el respaldo de Ciudadan.org y Laobry, la moneda del cooperativismo 6.0, estamos construyendo una comunidad donde la tecnología y la naturaleza coexisten armoniosamente.</p>
        <p>👨‍🔬 En la etapa 2, se incorporarán 500 expertos y los modelos se franquiciarán a México y el mundo. ¡Únete y sé parte del cambio!</p>
        <a href="https://www.ciudadan.org" className="cta-button">Visita Ciudadan.org</a>
      </section>
    </div>
  );
};

export default Academia;
