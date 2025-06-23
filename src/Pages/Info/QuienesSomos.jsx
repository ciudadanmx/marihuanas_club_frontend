import { useEffect } from "react";
import { motion } from "framer-motion";
import leafPattern from "../../assets/leaf-pattern.png";
import "../../styles/quienes.css";

export default function QuienesSomos() {
  useEffect(() => {
    const leaves = document.querySelectorAll(".falling-leaf");
    leaves.forEach((leaf) => {
      const delay = Math.random() * 10;
      const duration = 5 + Math.random() * 5;
      leaf.style.animationDelay = `${delay}s`;
      leaf.style.animationDuration = `${duration}s`;
    });
  }, []);

  return (
    <div className="quienes-container">
      <div
        className="leaves-overlay"
        style={{ backgroundImage: `url(${leafPattern})` }}
      ></div>

      <div className="content-wrapper">
        <motion.h1 initial={{ opacity: 0, scale: 0.8 }}
                   whileInView={{ opacity: 1, scale: 1 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.8 }}>
          🌿 ¿Quiénes somos?
        </motion.h1>

        {[
          `Marihuanas.Club es la primera plataforma digital todo en uno 4:20...`,
          `Estos clubs ofrecen eventos, cursos, talleres, cocina cannábica...`,
          `🌍 ¿Tienes un espacio para recibir consumidores o cuidar plantas? Puedes afiliar tu club completamente gratis...`,
          `Nuestra marketplace 4:20 te permite comprar lo mejor..., y vender sin comisiones.`,
          `Ofrecemos asesorías legales, cultivo, inversión, aula virtual...`,
          `Si estás en México, te ayudamos a tramitar tu permiso o amparo...`,
          `Y claro, ofrecemos contenido exclusivo sobre cultivo, medicina, psiconáutica...`,
        ].map((text, i) => (
          <motion.p key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.3, duration: 0.8 }}>
            {text}
          </motion.p>
        ))}
      </div>
    </div>
  );
}
