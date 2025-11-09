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

const ContadorClubs = ({ lugares = 1000, clubs = 50 }) => {
  return (
    <motion.div
      className="text-center font-extrabold text-3xl md:text-5xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      style={{
        color: "#6b00b8", // púrpura oscuro base
        textShadow: `
          0 0 5px #3a005f,
          0 0 10px #b300ff,
          0 0 20px #cc33ff,
          0 0 35px #ff66ff
        `,
        fontFamily: "Poppins, sans-serif",
        animation: "pulsePurple 2.5s ease-in-out infinite",
      }}
    >
      <AnimatedCounter target={lugares} /> Lugares en{" "}
      <AnimatedCounter target={clubs} /> Clubs
      <style>{`
        @keyframes pulsePurple {
          0%, 100% {
            text-shadow:
              0 0 5px #3a005f,
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
