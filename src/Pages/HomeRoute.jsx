import React from 'react';
import marihuanasImg from '../assets/marihuanas_club_home.png';

const HomeRoute = () => {
  return (
    <section>
    <div className="page max-w-6xl mx-auto px-4">
      <h1 className="mb-4">
        Bienvenid<font color="#ff4dff">@</font> a la Red de Club's Cannábicos, Segura y Legal en México
      </h1>
      <br />
      <br />

      {/* Contenedor horizontal: imagen + h3 */}
      
      <div className="separar mb-6">
        <div className='zeparador'>
        </div>
        <img
          src={marihuanasImg}
          alt="Marihuanas Club Home"
          className="image-home rounded shadow-md"
        />
        <h3 className="text-right font-bold ml-4">
          <div className='intro'>
            <center><big><strong><font color="orange"><i><u> Marihuanas.club </u></i></font></strong> es una comunidad para quienes buscan consumir, cultivar y convivir con cannabis de forma libre, responsable y dentro del marco legal mexicano.</big></center>
          </div>
        </h3>
      </div>

      {/* Lista de beneficios */}
      <ul className="no-list-style space-y-2 mt-4 beneficios">
        <li>
          📍 Conecta con <strong>clubes cannábicos</strong> en todo el país: espacios seguros donde puedes disfrutar tu planta con respeto y tranquilidad.
        </li>
        <li>
          🌱 ¿No puedes cultivar en casa? Únete a un <strong>club de cultivo solidario</strong> y deja que expertos cuiden tus plantas por ti.
        </li>
        <li>
          🏡 ¿Tienes un espacio seguro para fumar o cultivar? <strong>Afíliate como club</strong> y ofrece tu espacio a la comunidad. No necesitas ser un establecimiento comercial.
        </li>
        <li>
          📄 Te acompañamos con tu <strong>permiso COFEPRIS</strong>, tu <strong>amparo</strong>, y todo el proceso legal para que ejerzas tu derecho al autoconsumo.
        </li>
        <li>
          🎓 Compra y Vende en nuestra <strong>marketplace</strong> sin comisión por compra ni por venta.
        </li>
        <li>
          🎓 Accede a <strong>cursos</strong>, <strong>talleres</strong>, <strong>asesorías legales y agronómicas</strong>, además de contenido exclusivo y descuentos en toda la red.
        </li>
        <li>
          🫱‍🫲 No cobramos comisiones a los clubes ni a los instructores. Solo pedimos que ofrezcan <strong>descuentos a nuestros miembros</strong>.
        </li>
      </ul>

      <br />

      {/* Sección de funcionamiento */}
      <h2 className="text-xl font-semibold my-4"><u>¿Cómo funciona?</u></h2>
      <ul className="list-disc list-inside space-y-2">
        <li>🔒 <strong>Membresía mensual, semestral o anual</strong></li>
        <li>🧾 Con tu membresía anual te tramitamos el permiso de autoconsumo sin costo adicional</li>
        <li>⚖️ Amparo a precio preferencial tras tu primer semestre o con anualidad</li>
        <li>💚 ¡Sé parte de una red que protege tus derechos y apoya el uso libre e informado del cannabis!</li>
      </ul>
    </div>
    </section>
  );
};

export default HomeRoute;
