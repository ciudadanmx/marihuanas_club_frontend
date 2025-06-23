import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import "../../styles/faq.css";

const categorias = [
  {
    titulo: "🌿 Clubs Cannábicos",
    preguntas: [
      {
        pregunta: "¿Puedo afiliar mi club?",
        respuesta:
          "Sí. Si tienes un espacio donde se pueda fumar, cultivar o convivir con cannabis, puedes afiliarte como club cannábico solidario. No necesitas ser un local comercial.",
      },
      {
        pregunta: "¿Qué es un club de cultivo solidario?",
        respuesta:
          "Es un espacio donde expertos cuidan tus plantas si no puedes cultivarlas en casa. Tú sigues siendo el titular legal del cultivo, pero se hospeda en un club afiliado.",
      },
    ],
  },
  {
    titulo: "🛒 Marketplace",
    preguntas: [
      {
        pregunta: "¿Cómo funciona el marketplace?",
        respuesta:
          "Cualquier persona puede comprar productos 4:20. Si eres miembro vendedor, no pagas comisiones. Si eres miembro comprador, recibes descuentos permanentes.",
      },
      {
        pregunta: "¿Puedo vender si no soy miembro?",
        respuesta:
          "Sí, pero se aplican comisiones. Los miembros vendedores no pagan comisión por venta.",
      },
    ],
  },
  {
    titulo: "⚖️ Legales",
    preguntas: [
      {
        pregunta: "¿Me ayudan con asesoría legal?",
        respuesta:
          "Sí. Ofrecemos acompañamiento legal, trámites de permiso de autoconsumo y conexiones con abogados especializados.",
      },
      {
        pregunta: "¿Marihuanas.Club vende cannabis?",
        respuesta:
          "No. Facilitamos el contacto legal entre clubes y usuarios, educación y comercio legal de productos relacionados. El consumo y cultivo es responsabilidad de cada usuario.",
      },
    ],
  },
  {
    titulo: "💳 Membresía",
    preguntas: [
      {
        pregunta: "¿Qué incluye la membresía?",
        respuesta:
          "Descuentos del 10% en toda la red, marketplace sin comisiones, acceso a cursos, trámites legales, acompañamiento personalizado y más.",
      },
      {
        pregunta: "¿Puedo cancelar mi membresía?",
        respuesta:
          "Sí, puedes cancelarla en cualquier momento. Los beneficios aplican mientras tu membresía esté activa.",
      },
    ],
  },
];

export default function PreguntasFrecuentes() {
  return (
    <div className="faq-container">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="faq-title"
      >
        ❓ Preguntas Frecuentes
      </motion.h1>

      <motion.div
        className="faq-wrapper"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        {categorias.map((cat, i) => (
          <details key={i} className="faq-category">
            <summary>
              {cat.titulo}
              <ChevronDown className="chevron" size={18} />
            </summary>
            <div className="faq-items">
              {cat.preguntas.map((item, j) => (
                <details key={j} className="faq-question">
                  <summary>
                    {item.pregunta}
                    <ChevronDown className="chevron" size={16} />
                  </summary>
                  <p>{item.respuesta}</p>
                </details>
              ))}
            </div>
          </details>
        ))}
      </motion.div>
    </div>
  );
}
