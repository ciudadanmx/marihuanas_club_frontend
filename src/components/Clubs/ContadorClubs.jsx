import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

const AnimatedCounter = ({ target }) => {
  const [count, setCount] = useState(0);
  const controls = useAnimation();
  const { ref, inView } = useInView({ triggerOnce: true });

  useEffect(() => {
    if (inView) {
      controls.start({ opacity: 1, y: 0 });
      let start = 0;
      const end = target;
      const duration = 2000;
      const increment = Math.ceil(end / (duration / 16));

      const interval = setInterval(() => {
        start += increment;
        if (start >= end) {
          start = end;
          clearInterval(interval);
        }
        setCount(start);
      }, 16);
    }
  }, [inView, target, controls]);

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={controls}
      transition={{ duration: 0.6 }}
    >
      {count.toLocaleString("es-MX")}
    </motion.span>
  );
};

const ContadorClubs = () => {
  const [lugares, setLugares] = useState(0);
  const [clubsCultivo, setClubsCultivo] = useState(0);
  const [clubsConsumo, setClubsConsumo] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const url = `${process.env.REACT_APP_STRAPI_URL}/api/clubs?pagination[limit]=1000`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Error al consultar Strapi");
        const data = await res.json();

        if (!data?.data) throw new Error("Datos no válidos de Strapi");

        const activos = data.data.filter((club) => club.attributes.activo === true);

        // Clubs de cultivo (tipo cultivo o ambos)
        const cultivo = activos.filter((club) => {
          const t = club.attributes.tipo?.toLowerCase();
          return t === "cultivo" || t === "ambos";
        });

        // Clubs de consumo (tipo consumo o ambos)
        const consumo = activos.filter((club) => {
          const t = club.attributes.tipo?.toLowerCase();
          return t === "consumo" || t === "ambos";
        });

        // Cálculo de lugares disponibles solo en clubs de cultivo válidos
        const cultivoValidos = cultivo.filter((club) => {
          const c = club.attributes;
          return (
            typeof c.lugares === "number" &&
            typeof c.miembrosactivos === "number"
          );
        });

        const totalLugares = cultivoValidos.reduce((sum, club) => {
          const { lugares, miembrosactivos } = club.attributes;
          const disponibles = lugares - miembrosactivos;
          return disponibles > 0 ? sum + disponibles : sum;
        }, 0);

        setClubsCultivo(cultivo.length);
        setClubsConsumo(consumo.length);
        setLugares(totalLugares);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los datos.");
      }
    };

    fetchClubs();
  }, []);

  if (error) {
    return (
      <div
        style={{
          textAlign: "center",
          color: "#b30000",
          fontFamily: "Poppins, sans-serif",
          marginTop: "2rem",
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <motion.div
      className="text-center font-extrabold text-3xl md:text-5xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      style={{
        color: "#5d008f",
        textShadow: `
          0 0 5px #2a0045,
          0 0 10px #b300ff,
          0 0 20px #cc33ff,
          0 0 35px #ff66ff
        `,
        fontFamily: "Poppins, sans-serif",
        animation: "pulsePurple 2.5s ease-in-out infinite",
      }}
    >
      <AnimatedCounter target={lugares} /> lugares en{" "}
      <AnimatedCounter target={clubsCultivo} /> clubs de cultivo y{" "}
      <AnimatedCounter target={clubsConsumo} /> clubs de consumo
      <style>{`
        @keyframes pulsePurple {
          0%, 100% {
            text-shadow:
              0 0 5px #2a0045,
              0 0 10px #b300ff,
              0 0 20px #cc33ff,
              0 0 35px #ff66ff;
          }
          50% {
            text-shadow:
              0 0 10px #4d007a,
              0 0 20px #cc33ff,
              0 0 40px #ff66ff,
              0 0 55px #ff99ff;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default ContadorClubs;
