// src/components/InfoClubs.jsx
import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  Chip,
  Divider,
  Stack,
  IconButton,
  useTheme,
  Badge,
  styled
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import PeopleIcon from "@mui/icons-material/People";
import HandshakeIcon from "@mui/icons-material/Handshake";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import { motion } from "framer-motion";

// IMPORT DEL VIDEO LOCAL (coloca clubs.mp4 en src/assets/)
import clubsVideo from "../../assets/clubs.mp4";

/**
 * InfoClubs (VERSIÓN MORADA + VIDEO)
 * - Título verde
 * - Fondos morados / degradados
 * - Video importado y mostrado debajo del título (separado 6px)
 * - Íconos de sección en amarillo
 * - MUI + framer-motion
 */

// ---------- Paleta y estilos ----------
const styles = {
  accentGradient: "linear-gradient(90deg,#8ef56b,#6ae6a6 45%,#b48bff 100%)",
  moradoGradient:
    "linear-gradient(120deg, rgba(132,94,255,0.12) 0%, rgba(175,96,255,0.08) 40%, rgba(58,12,89,0.04) 100%)",
  cardBg:
    "linear-gradient(180deg, rgba(18,10,30,0.6), rgba(40,10,60,0.45))", // morado oscuro sutil
  glassBorder: "rgba(255,255,255,0.04)",
  titleFont: `"Poppins", "Inter", "Segoe UI", Roboto, sans-serif`,
  bodyFont: `"Inter", "Roboto", "Segoe UI", sans-serif`
};

// color amarillo para íconos
const ICON_YELLOW = "#FFD54A";

// ---------- Motion Variants ----------
const parent = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { staggerChildren: 0.06 } }
};
const floaty = {
  rest: { y: 0 },
  hover: { y: -6, transition: { duration: 0.35, ease: "easeOut" } }
};

// ---------- Styled ----------
const AccentBar = styled("div")(({ theme }) => ({
  width: 8,
  borderRadius: 8,
  marginRight: 14,
  background: styles.accentGradient,
  boxShadow: "0 10px 30px rgba(88, 64, 255, 0.12)"
}));

const GlowChip = styled(Chip)(({ theme }) => ({
  borderRadius: 10,
  fontWeight: 800,
  letterSpacing: -0.2,
  boxShadow: "0 12px 36px rgba(111,66,193,0.12)",
  background: "linear-gradient(90deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
  border: `1px solid rgba(255,255,255,0.03)`
}));

// ---------- Contenido ----------
const SECCIONES = [
  {
    id: "legalidad",
    icon: <LocalFloristIcon />,
    title: "¿Se puede consumir Cannabis de forma totalmente legal en México?",
    subtitle: "No y sí — explicación legal y práctica",
    content: [
      { type: "lead", text: "No y sí." },
      {
        type: "p",
        text:
          "Técnicamente, no de forma plena. El consumo personal de cannabis sí está permitido, pero su adquisición, posesión y cultivo se enfrentan a una serie de prohibiciones y contradicciones legales. Aunque muchas ya no implican cárcel, siguen restringiendo derechos constitucionales, generando un vacío en el que ejercer libertades básicas exige moverse entre grietas del propio sistema jurídico."
      },
      {
        type: "p",
        text:
          "La legislación mexicana actual, por un lado, reconoce que el consumo es un acto legítimo, protegido por el derecho constitucional al libre desarrollo de la personalidad (artículo 1° y 4° constitucionales), pero, por otro lado, no brinda un marco legal coherente para hacerlo posible."
      },
      {
        type: "p",
        text:
          "La Ley General de Salud, en su artículo 245, fracción I, sigue clasificando al tetrahidrocannabinol (THC) y sus derivados como sustancias psicotrópicas prohibidas, lo que mantiene la planta y sus semillas en una categoría equiparable a drogas duras, ignorando su uso personal, medicinal y cultural."
      },
      {
        type: "p",
        text:
          "El simple hecho de exigir un permiso individual de COFEPRIS para ejercer un derecho ya reconocido constitucionalmente constituye una forma de discriminación legal."
      },
      {
        type: "p",
        text:
          "Así, mientras el Estado continúa tratando al usuario como ciudadano de segunda, en realidad este termina convirtiéndose en un ciudadano de una categoría aún más alta: alguien capaz de trazar rutas legales entre vacíos, ejercer el derecho a la libre determinación y defender con conocimiento jurídico lo que debería ser parte de la vida cotidiana de cualquier adulto responsable."
      },
      {
        type: "p",
        text:
          "Incluso aquellos que logran obtener los permisos de COFEPRIS para uso personal siguen atrapados en un limbo jurídico cuando intentan cultivar su propia planta."
      },
      {
        type: "p",
        text:
          "El obstáculo más claro es la ausencia de semillas legales en el país."
      },
      {
        type: "p",
        text:
          "A la fecha, no existen bancos de semillas nacionales autorizados, y solo un caso —el de Paradise Seeds México, filial de la empresa europea del mismo nombre— logró realizar una importación legal bajo autorización sanitaria, con un costo aproximado de 170 mil pesos, inaccesible para el ciudadano común."
      },
      {
        type: "p",
        text:
          "Esto deja a la mayoría en una situación de vacío legal y contradicción práctica: si no pueden pagar una importación así, la única vía posible es recurrir al mercado aún ilegal, adquiriendo pequeñas cantidades para consumo personal —en dosis menores a cinco gramos, que la propia ley reconoce como no punibles—, separar las semillas de lo adquirido y reproducirlas por cuenta propia."
      },
      {
        type: "p",
        text:
          "Aunque el origen de esas flores provenga de un mercado no regulado, el acto del usuario no constituye un delito penal, pues se realiza dentro de los márgenes de posesión permitidos y con fines de consumo personal e inmediato, protegidos por los criterios de la Suprema Corte sobre el libre desarrollo de la personalidad."
      },
      {
        type: "p",
        text:
          "En otras palabras, el usuario navega entre lo ilegal y lo legítimo sin cruzar hacia lo penal, ejerciendo su derecho de manera consciente y proporcional."
      },
      {
        type: "p",
        text:
          "Así, esta práctica —que representa el acto más elemental de soberanía y autosuficiencia— deja de ser una falta para convertirse en un gesto civil de madurez y autodeterminación: sembrar lo que se consume, sin depender del mercado ni del permiso ajeno, cultivando no solo plantas, sino también una cultura cívica de resistencia jurídica y ejercicio pleno de derechos fundamentales."
      }
    ]
  },
  {
    id: "consumo",
    icon: <PeopleIcon />,
    title: "Clubs de Consumo",
    subtitle: "Espacios seguros, comunitarios y con servicios periféricos",
    content: [
      {
        type: "p",
        text:
          "El consumo de cannabis en México sigue rodeado de estigmas y prejuicios que relegan a muchos usuarios a la clandestinidad o a entornos poco adecuados, impidiendo ejercer su derecho al consumo en condiciones seguras, responsables y dignas."
      },
      {
        type: "p",
        text:
          "Los Clubs de Consumo son espacios en los que un socio pone a disposición de otros un lugar adecuado para fumar, convivir y compartir, acompañando la experiencia con servicios de industrias periféricas: cocina cannábica elaborada con el propio material del comensal, talleres, cursos, arte, música, venta de parafernalia, extracciones y diversas actividades formativas o recreativas."
      },
      {
        type: "p",
        text:
          "Estos clubes no promueven la compraventa de cannabis, sino la organización de usuarios adultos que se asocian voluntariamente, manifestando por escrito su adhesión al principio de uso responsable, privacidad y respeto mutuo."
      },
      {
        type: "p",
        text:
          "En la Red de Clubs Marihuanas.Club, tanto usuarios como clubes firman un único consentimiento digital, respaldado con su INE vigente, que los integra al marco común de responsabilidad de toda la red."
      },
      {
        type: "p",
        text:
          "Este documento actúa como acuerdo mutuo de uso y convivencia, garantizando que cada espacio opere dentro de los principios compartidos de la comunidad."
      },
      {
        type: "p",
        text:
          "En caso de cualquier incidente o eventualidad, el club anfitrión tiene acceso inmediato a la información y consentimiento digital de todas las personas presentes, así como al documento legal del propio club, asegurando transparencia, trazabilidad y respaldo jurídico en todo momento."
      },
      {
        type: "p",
        text:
          "De esta forma, el consumo deja de ser un acto aislado o clandestino para convertirse en un ejercicio colectivo, transparente y protegido, donde la comunidad misma establece y respeta sus reglas bajo el amparo de los derechos constitucionales que le corresponden."
      }
    ]
  },
  {
    id: "cultivo",
    icon: <HandshakeIcon />,
    title: "Clubs de Cultivo Solidario",
    subtitle: "Organizados, transparentes y sin fines de lucro",
    content: [
      {
        type: "p",
        text:
          "El cultivo solidario representa el paso más maduro del movimiento cannábico en México: una forma organizada, transparente y consciente de ejercer el derecho al autocultivo personal, dentro de los márgenes que la Constitución ya reconoce."
      },
      {
        type: "p",
        text:
          "Estos clubes se conforman por usuarios con permiso o folio en trámite ante COFEPRIS, que deciden asociarse en una figura de Asociación Civil (A.C.), no para operar como empresa ni para comerciar, sino para dejar constancia, trazabilidad y respaldo legal de su actividad que es sin fines de lucro."
      },
      {
        type: "p",
        text:
          "El registro de la A.C. al no ser para la obtención de donativos ni otras actividades que requieren registro público de propiedad o comercio, se realiza sin costo ante el SAT, esto permite documentar el funcionamiento del club, la identidad de sus miembros y los espacios de cultivo, de modo que ante cualquier eventualidad legal, quede claro que no existe compraventa, sino asociación y consumo compartido entre adultos responsables."
      },
      {
        type: "p",
        text:
          "Cada socio firma físicamente los estatutos y su consentimiento en el formato proporcionado por la plataforma. A partir de ahí, se integra formalmente al club y puede participar en las distintas modalidades de cultivo, siempre bajo los principios de uso responsable, respeto, privacidad y cooperación."
      }
    ]
  }
];

// ---------- Componente ----------
export default function InfoClubs() {
  const theme = useTheme();

  return (
    <motion.div initial="hidden" animate="show" variants={parent}>
      <Card
        elevation={14}
        sx={{
          borderRadius: 3,
          overflow: "visible",
          p: 0,
          background: styles.cardBg,
          border: `1px solid ${styles.glassBorder}`,
          boxShadow: "0 30px 80px rgba(8,8,20,0.45)"
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <AccentBar />

            <Box sx={{ minWidth: 0 }}>
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.06 } }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: styles.titleFont,
                    fontWeight: 900,
                    letterSpacing: -0.6,
                    mb: 0.3,
                    color: "#7CFF5A", // TÍTULO VERDE potente
                    textShadow: "0 6px 30px rgba(124,255,90,0.08)"
                  }}
                >
                  Clubs & Cultivo — Marihuanas.Club
                </Typography>
              </motion.div>

              <Typography
                variant="body2"
                color="rgba(255,255,255,0.7)"
                sx={{ fontFamily: styles.bodyFont }}
              >
                Guía clara, con estilo y presencia — todo lo esencial sobre consumo, clubs y cultivo solidario.
              </Typography>
            </Box>

            <Box sx={{ flex: 1 }} />

            <motion.div whileHover={{ scale: 1.06, rotate: -3 }}>
              <GlowChip
                icon={<EmojiObjectsIcon />}
                label="Información verificada"
                variant="outlined"
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderColor: "rgba(255,255,255,0.04)"
                }}
              />
            </motion.div>
          </Stack>

          {/* VIDEO bajo el título (separado solo 6px como pediste) */}
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: 0.12, duration: 0.6 } }}
            style={{ marginTop: 6 }} // <-- aquí está el cambio a 6px
          >
            <Box
              sx={{
                width: "100%",
                borderRadius: 2,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.04)",
                background: styles.moradoGradient,
                boxShadow: "0 18px 60px rgba(34,16,60,0.45)"
              }}
            >
              <video
                src={clubsVideo}
                autoPlay
                muted
                loop
                playsInline
                controls={false}
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  objectFit: "cover",
                  maxHeight: 320,
                }}
              />
              {/* Overlay decorativo */}
              <Box
                sx={{
                  position: "relative",
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: 2,
                }}
              >
                <Avatar sx={{ bgcolor: "transparent", width: 48, height: 48 }}>
                  <LocalFloristIcon sx={{ color: ICON_YELLOW }} />
                </Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 800, color: "#fff" }}>
                    Bienvenido a la Red de Clubs
                  </Typography>
                  <Typography variant="caption" color="rgba(255,255,255,0.75)">
                    Video presentación — ambiente, normas y comunidad.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </motion.div>

          <Divider sx={{ my: 2, borderStyle: "dashed", borderColor: "rgba(255,255,255,0.03)" }} />

          {/* Acordeones (íconos renderizados en amarillo) */}
          <Box>
            {SECCIONES.map((s, idx) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.18 + idx * 0.06 } }}
                style={{ marginBottom: 14 }}
              >
                <Accordion
                  sx={{
                    borderRadius: 2,
                    background:
                      "linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
                    border: `1px solid rgba(255,255,255,0.02)`,
                    boxShadow: "0 8px 30px rgba(8,6,20,0.06)"
                  }}
                  disableGutters
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ fontSize: 28 }} />}
                    sx={{
                      minHeight: 64,
                      "& .MuiAccordionSummary-content": { gap: 1, alignItems: "center" },
                      px: { xs: 2, md: 3 }
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ width: "100%" }}>
                      <motion.div whileHover="hover" initial="rest" variants={floaty}>
                        <Avatar
                          sx={{
                            width: 52,
                            height: 52,
                            bgcolor: "transparent",
                            border: `1px solid rgba(255,255,255,0.03)`,
                            boxShadow: "0 8px 26px rgba(124,255,90,0.06)"
                          }}
                        >
                          {/* clonamos el icono para inyectar el color amarillo */}
                          {React.cloneElement(s.icon, { sx: { color: ICON_YELLOW, fontSize: 28 } })}
                        </Avatar>
                      </motion.div>

                      <Box sx={{ textAlign: "left" }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 900,
                            fontFamily: styles.titleFont,
                            letterSpacing: -0.3,
                            color: "#EEF2FF"
                          }}
                        >
                          {s.title}
                        </Typography>
                        <Typography variant="caption" color="rgba(255,255,255,0.65)" sx={{ fontFamily: styles.bodyFont }}>
                          {s.subtitle}
                        </Typography>
                      </Box>

                      <Box sx={{ flex: 1 }} />

                      <Badge
                        badgeContent={idx + 1}
                        color="success"
                        sx={{
                          mr: { xs: 0, md: 1 },
                          "& .MuiBadge-badge": {
                            fontWeight: 800,
                            fontFamily: styles.bodyFont,
                            boxShadow: "0 6px 20px rgba(124,255,90,0.12)"
                          }
                        }}
                      />
                    </Stack>
                  </AccordionSummary>

                  <AccordionDetails sx={{ px: { xs: 2, md: 3 }, pb: 2 }}>
                    <Box sx={{ pl: { xs: 0, md: 1 } }}>
                      {s.content.map((block, i) => {
                        if (block.type === "lead") {
                          return (
                            <Typography
                              key={i}
                              variant="h6"
                              sx={{
                                fontWeight: 800,
                                color: "#FFD86B",
                                mb: 1,
                                textShadow: "0 6px 18px rgba(0,0,0,0.12)"
                              }}
                            >
                              {block.text}
                            </Typography>
                          );
                        }
                        if (block.type === "p") {
                          const highlighted = block.text
                            .replace(/(\bCOFEPRIS\b)/g, "<b>$1</b>")
                            .replace(/(\bsemillas\b|\bSemillas\b)/g, "<b>$1</b>");
                          return (
                            <Typography
                              key={i}
                              variant="body1"
                              sx={{
                                mb: 1,
                                lineHeight: 1.6,
                                color: "rgba(255,255,255,0.92)"
                              }}
                              dangerouslySetInnerHTML={{ __html: highlighted }}
                            />
                          );
                        }
                        return null;
                      })}

                      <Stack direction="row" spacing={1} mt={1} alignItems="center">
                        <Avatar sx={{ width: 36, height: 36, bgcolor: "transparent" }}>🌿</Avatar>
                        <Typography variant="caption" color="rgba(255,255,255,0.7)">
                          {s.id === "legalidad"
                            ? "Consejo: infórmate bien y considera riesgos legales antes de cualquier decisión."
                            : s.id === "consumo"
                            ? "Beneficio: consumo colectivo, más seguro y con reglas claras."
                            : "Pro tip: documenta todo (estatutos, consentimiento y espacios). La trazabilidad es tu mejor defensa."}
                        </Typography>
                      </Stack>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </motion.div>
            ))}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
            sx={{ mt: 1 }}
          >
            <Box>
              <Typography sx={{ fontWeight: 700, color: "rgba(255,255,255,0.92)" }}>
                ¿Quieres que personalice los estatutos del club o los formatee con tu logo?
              </Typography>
              <Typography variant="caption" color="rgba(255,255,255,0.65)">
                Dime el estilo (formal, minimal, vintage) y te lo adapto.
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton
                sx={{
                  borderRadius: 2,
                  px: 1.2,
                  background: "linear-gradient(90deg, rgba(124,255,90,0.06), rgba(139,92,246,0.04))",
                  border: "1px solid rgba(255,255,255,0.03)"
                }}
                aria-label="info"
              >
                <EmojiObjectsIcon />
              </IconButton>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );
}
