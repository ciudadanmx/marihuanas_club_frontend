import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import leafPattern from "../assets/leaf-pattern.png";
import leafSmall from "../assets/leaf-small.png";
import "../styles/home.css";

export default function Home() {
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    const count = 15;
    const newLeaves = [];
    for (let i = 0; i < count; i++) {
      newLeaves.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 10,
        durationFall: 5 + Math.random() * 6,
        durationSway: 3 + Math.random() * 3,
        swayDistance: 15 + Math.random() * 15,
        scale: 0.5 + Math.random() * 0.8,
        rotateStart: Math.random() * 360,
        rotateEnd: Math.random() * 360,
      });
    }
    setLeaves(newLeaves);
  }, []);

  const paragraphs = [
    `Marihuanas.club es una comunidad para quienes buscan consumir, cultivar y convivir con cannabis de forma libre, responsable y dentro del marco legal mexicano.`,
    `📍 Conecta con clubes cannábicos en todo el país: espacios seguros donde puedes disfrutar tu planta con respeto y tranquilidad.`,
    `🌱 ¿No puedes cultivar en casa? Únete a un club de cultivo solidario y deja que expertos cuiden tus plantas por ti.`,
    `🏡 ¿Tienes un espacio seguro para fumar o cultivar? Afíliate como club y ofrece tu espacio a la comunidad. No necesitas ser un establecimiento comercial.`,
    `📄 Te acompañamos con tu permiso COFEPRIS, tu amparo, y todo el proceso legal para que ejerzas tu derecho al autoconsumo.`,
    `🎓 Compra y Vende en nuestra marketplace sin comisión por compra ni por venta.`,
    `🎓 Accede a cursos, talleres, asesorías legales y agronómicas, además de contenido exclusivo y descuentos en toda la red.`,
    `🫱‍🫲 No cobramos comisiones a los clubes ni a los instructores. Solo pedimos que ofrezcan descuentos a nuestros miembros.`,
    `¿Cómo funciona?`,
    `🔒 Membresía mensual, semestral o anual.`,
    `🧾 Con tu membresía anual te tramitamos el permiso de autoconsumo sin costo adicional.`,
    `⚖️ Amparo a precio preferencial tras tu primer semestre o con anualidad.`,
    `💚 ¡Sé parte de una red que protege tus derechos y apoya el uso libre e informado del cannabis!`,
  ];

  return (
    <div className="home-container">
      {/* ZONA DESPUÉS DE LA NAVBAR */}
      <div className="fall-zone">
        {/* Fondo con patrón giratorio */}
        <motion.div
          className="leaves-overlay"
          style={{ backgroundImage: `url(${leafPattern})` }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
        />

        {/* Hojas cayendo */}
        {leaves.map((leaf) => (
          <motion.img
            key={leaf.id}
            src={leafSmall}
            alt="hoja"
            className="falling-leaf"
            style={{
              left: `${leaf.left}%`,
              width: 30 * leaf.scale,
              height: 30 * leaf.scale,
              opacity: 1,
            }}
            initial={{ y: -60, opacity: 0, rotate: leaf.rotateStart }}
            animate={{
              y: "110%",
              opacity: [1, 1, 0],
              rotate: [leaf.rotateStart, leaf.rotateEnd],
              x: [
                0,
                leaf.swayDistance,
                0,
                -leaf.swayDistance,
                0,
              ],
            }}
            transition={{
              delay: leaf.delay,
              duration: leaf.durationFall,
              ease: "linear",
              repeat: Infinity,
              repeatType: "loop",
            }}
          />
        ))}

        {/* Contenido */}
        <div className="content-wrapper">
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{
              color: "#4a8c3f",
              textAlign: "center",
              marginBottom: "2rem",
            }}
          >
            🌿💚 Bienvenid@ a Marihuanas.Club
          </motion.h1>

          {paragraphs.map((text, i) => (
            <motion.p
              key={i}
              style={{
                whiteSpace: "pre-line",
                maxWidth: 700,
                margin: "0 auto 1.5rem",
                color: "#2d3a24",
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.3 }}
            >
              {text}
            </motion.p>
          ))}
        </div>
      </div>
    </div>
  );
}
