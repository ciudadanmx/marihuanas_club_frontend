// src/components/Clubs/steps/Confirmacion.jsx

/**
 * =========================================================
 * COMPONENTE: Confirmacion
 * ---------------------------------------------------------
 * Muestra un resumen FINAL de toda la información del club
 * antes de enviarla.
 *
 * ✔ No modifica datos
 * ✔ Solo lee y muestra
 * ✔ Todo es visual / confirmación
 * =========================================================
 */

import React, { useState, useEffect } from "react";

/* =========================
   UI / ANIMACIONES
========================= */
import { Box, Typography, Grid, Card, CardContent, Divider } from "@mui/material";
import { motion } from "framer-motion";

/* =========================
   ICONOS
========================= */
import {
  Person as PersonIcon,
  Home as HomeIcon,
  Category as CategoryIcon,
  Info as InfoIcon,
  ShoppingCart as ShoppingCartIcon,
  Build as BuildIcon,
  CalendarToday as CalendarIcon,
  Image as ImageIcon,
  Photo as PhotoIcon,
  Chat as ChatIcon,
  Visibility as VisibilityIcon,
  Yard as YardIcon,
  Forest as ForestIcon,
  Gavel as MedicalServicesIcon,
} from "@mui/icons-material";


/* =========================
   UTILIDADES
========================= */
import formaters from "../../../utils/formaters";
import { createFileHandlers } from "../../../utils/FileHelpers";

// Componente para manejar creación y revocación de objectURL de forma segura
const FileLink = ({ file, children }) => {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }

    // Si file es un string (URL ya lista), úsala directamente
    if (typeof file === "string") {
      setUrl(file);
      return;
    }

    // Si file es un objeto con .url o .filename (backend), intenta construir url
    if (file?.url) {
      setUrl(file.url);
      return;
    }
    if (file?.filename && typeof file.filename === "string") {
      setUrl(file.filename);
      return;
    }

    // Si es un File/Blob (cliente) -> creamos objectURL y lo revocamos al desmontar
    if (file instanceof Blob || file instanceof File) {
      const u = URL.createObjectURL(file);
      setUrl(u);
      return () => {
        try { URL.revokeObjectURL(u); } catch (e) {}
      };
    }

    // fallback
    setUrl(null);
    return;
  }, [file]);

  if (!url) return <>{children}</>; // si no hay url, muestra solo el contenido sin link
  return (
    <a href={url} target="_blank" rel="noreferrer" style={{ textDecoration: "none", color: "#1976d2" }}>
      {children}
    </a>
  );
};


/* =========================================================
   CONSTANTES GLOBALES
========================================================= */

/**
 * Props comunes de animación
 * (las reutilizamos en TODOS los motion.div)
 */
const motionProps = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

/**
 * Estilo base de todas las tarjetas
 */
const cardStyle = {
  borderRadius: 3,
  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
  border: "1px solid #9c27b0",
};

/**
 * Días de la semana (orden fijo)
 */
const DIAS_SEMANA = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

/* =========================================================
   COMPONENTES REUTILIZABLES
========================================================= */

/**
 * CardInfo
 * ---------------------------------------------------------
 * Tarjeta genérica con:
 *  - Ícono
 *  - Título
 *  - Contenido libre
 *
 * Se usa para evitar repetir el mismo Card 20 veces
 */

const CardInfo = ({ icon: Icon, title, children }) => (
  <motion.div {...motionProps}>
    <Card sx={cardStyle}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={1}>
          <Icon color="primary" sx={{ mr: 1 }} />
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
        </Box>
        {children}
      </CardContent>
    </Card>
  </motion.div>
);

/**
 * Galería de imágenes
 * ---------------------------------------------------------
 * Reutilizable para:
 *  - Fotos del club
 *  - Fotos documentales
 */
const ImageGallery = ({ files }) => {
  if (!files || files.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No hay fotos cargadas
      </Typography>
    );
  }

  return (
    <Grid container spacing={1}>
      {files.map((file, index) => (
        <Grid item xs={4} sm={3} md={2} key={index}>
          <img
            src={URL.createObjectURL(file)}
            alt={`foto-${index}`}
            style={{
              width: "100%",
              height: 100,
              borderRadius: 8,
              objectFit: "cover",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
          />
        </Grid>
      ))}
    </Grid>
  );
};

/* =========================================================
   FUNCIONES AUXILIARES
========================================================= */

/**
 * Convierte un arreglo en texto separado por comas
 */
const renderArray = (arr) =>
  Array.isArray(arr) && arr.length > 0 ? arr.join(", ") : "-";

/**
 * Renderiza horarios de forma segura
 * (aunque vengan incompletos o vacíos)
 */
const renderHorarios = (horarios) => {
  const horariosNormalizados =
    horarios && Object.keys(horarios).length > 0
      ? horarios
      : DIAS_SEMANA.reduce((acc, dia) => {
          acc[dia] = {
            abierto: false,
            apertura: "-",
            cierre: "-",
          };
          return acc;
        }, {});

  return Object.entries(horariosNormalizados).map(([dia, horas]) => {
    const abierto = horas?.abierto === true;

    // 👇 CLAVE: si está cerrado, FORZAMOS guiones
    const apertura = abierto ? horas?.apertura || "-" : "-";
    const cierre   = abierto ? horas?.cierre   || "-" : "-";

    return (
      <Typography key={dia} variant="body2" sx={{ ml: 2 }}>
        <strong>{dia}:</strong>{" "}
        {abierto ? "Abierto" : "Cerrado"} ({apertura} - {cierre})
      </Typography>
    );
  });
};


const getSafeFileData = (file, index, getExtension) => {
  const name =
    file?.name ||
    file?.filename ||
    (typeof file === "string"
      ? file.split("/").pop()
      : `archivo-${index + 1}`);

  const ext = getExtension
    ? getExtension(name)
    : (name?.split(".").pop() || "").toLowerCase();

  return { name, ext };
};



/* =========================================================
   COMPONENTE PRINCIPAL
========================================================= */

export default function Confirmacion({ form, isActivaMembresia, user }) {
  /**
   * Handler para archivos (PDF / imágenes)
   */
  const { getExtension } = createFileHandlers({
    allowedExtensions: ["jpg", "jpeg", "png", "webp", "pdf"],
    fieldName: "archivos_club",
  });

    //se inyectan los servicios del paso 1 (cursos, eventos, cocina...) a los ingresados en el campo servicios
    const serviciosArray = [
    // servicios explícitos
    ...(Array.isArray(form.servicios) ? form.servicios : []),

    // servicios inferidos desde tipo_club
    ...(Array.isArray(form.tipo_club)
      ? form.tipo_club.filter(
          t => !["cultivo", "consumo"].includes(t)
        )
      : []),
  ];


  
  // Normalizamos los archivos de INE para que siempre tengamos arrays (aunque vengan como File único o bajo otro nombre)
const ineFrenteFiles = (() => {
  const v = form.ine_frente_archivos ?? form.ine_frente ?? form.ineFrente ?? null;
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
})();

const ineTrasFiles = (() => {
  const v = form.ine_tras_archivos ?? form.ine_reverso ?? form.ine_tras ?? form.ineTras ?? null;
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
})();




  return (
    <Box>
      {/* =================== TÍTULO =================== */}
      <Typography variant="h4" mb={3} fontWeight="bold" color="#6a1b9a">
        Confirma la información del club
      </Typography>

      <Grid container spacing={2}>

        {/* =================== DATOS BÁSICOS =================== */}
        <Grid item xs={12} sm={6}>
          <CardInfo icon={CategoryIcon} title="Nombre del Club">
            <Typography variant="h6">{form.nombre_club || "-"}</Typography>
          </CardInfo>
        </Grid>

        <Grid item xs={12} sm={6}>
          <CardInfo icon={PersonIcon} title="Nombre completo del titular">
            <Typography variant="h6">{formaters.capitalizeWords(form.nombre_titular) || "-"}</Typography>
          </CardInfo>
        </Grid>

        <Grid item xs={12} sm={6}>
          <CardInfo icon={CategoryIcon} title="Tipo de club">
          <Typography>
            {Array.isArray(form.tipo_club) &&
            form.tipo_club.includes("cultivo") &&
            form.tipo_club.includes("consumo")
              ? "Híbrido"
              : form.tipo_club.includes("cultivo")
                ? "cultivo"
                : "consumo"}
          </Typography>
          </CardInfo>
        </Grid>

        <Grid item xs={12} sm={6}>
          <CardInfo icon={ChatIcon} title="Whatsapp">
            <Typography variant="h6">{form.whatsapp || "-"}</Typography>
          </CardInfo>
        </Grid>

        {/* =================== DIRECCIÓN =================== */}
        <Grid item xs={12}>
          <CardInfo icon={HomeIcon} title="Dirección">
            <Typography>
              {formaters.capitalizeWords(formaters.formatearDireccionConInterior(
                form.direccion_formateada,
                form.numero_interior
              )) || formaters.capitalizeWords(form.direccion) || "-"}
            </Typography>
          </CardInfo>
        </Grid>

        {/* =================== IMÁGENES =================== */}
        <Grid item xs={12}>
          <CardInfo icon={PhotoIcon} title="Foto de Portada">
            {form.foto_perfil ? (
              <img
                src={URL.createObjectURL(form.foto_perfil)}
                alt="Foto de portada"
                style={{
                  width: 250,
                  borderRadius: 10,
                  objectFit: "cover",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                }}
              />
            ) : (
              <Typography color="text.secondary">
                No hay foto de portada
              </Typography>
            )}
          </CardInfo>
        </Grid>

        <Grid item xs={12}>
          <CardInfo icon={ImageIcon} title="Fotos del Club">
            <ImageGallery files={form.fotos_club} />
          </CardInfo>
        </Grid>

        

        {/* =================== DESCRIPCIÓN =================== */}
        <Grid item xs={12}>
          <CardInfo icon={InfoIcon} title="Descripción">
            <Typography sx={{ whiteSpace: "pre-line" }}>
              {formaters.capitalizePhrase(form.descripcion) || "-"}
            </Typography>
          </CardInfo>
        </Grid>

        {/* =================== FOTOS DOCUMENTALES =================== */}
        {form.documentales && (
          <Grid item xs={12}>
            <CardInfo
              icon={ImageIcon}
              title="Fotos Documentales de Áreas de Cultivo"
            >
              <ImageGallery files={form.documentales} />
            </CardInfo>
          </Grid>
        )}

        {/* =================== SKILLS / ARMARIOS =================== */}
        {form.armarios && (
          <Grid item xs={12}>
            <CardInfo icon={YardIcon} title="Habilidades del Jardinero">
              <Typography sx={{ whiteSpace: "pre-line" }}>
                {formaters.capitalizePhrase(form.skills) || "No especificadas."}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography color="success.main">
                <ForestIcon /> Espacio para{" "}
                <strong style={{ fontSize: "1.5rem", color: "#ff9800" }}>
                  {form.armarios}
                </strong>{" "}
                plantas
              </Typography>

              {Array.isArray(form.certificados_archivos) && form.certificados_archivos.length > 0 && (
                <>
                  {Array.isArray(form.certificados_archivos) &&
                    form.certificados_archivos.length > 0 && (
                      <>
                        {form.certificados_archivos.map((file, index) => {
                          const { name, ext } = getSafeFileData(file, index, getExtension);

                          return (
                            <Box
                              key={`certificado-${index}`}
                              sx={{
                                display: "flex",
                                alignItems: "flex-start",
                                mt: 1,
                              }}
                            >
                              <span style={{ fontSize: 20, marginTop: 2 }}>
                                {ext === "pdf" ? "📄" : "🖼️"}
                              </span>

                              <Typography
                                sx={{
                                  ml: 1,
                                  flex: 1,
                                  fontSize: 14,
                                  lineHeight: 1.3,
                                  whiteSpace: "normal",
                                  wordBreak: "break-word",
                                  overflowWrap: "anywhere",
                                }}
                              >
                                <FileLink file={file}>
                                  <u>{name}</u>
                                </FileLink>
                              </Typography>

                              <FileLink file={file}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    fontSize: 14,
                                    color: "#1976d2",
                                    ml: 1,
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  <VisibilityIcon color="success" sx={{ mr: 0.5 }} />
                                  Ver
                                </Box>
                              </FileLink>
                            </Box>
                          );
                        })}
                      </>
                  )}
                </>
              )}

            </CardInfo>
          </Grid>
        )}

        {/* =================== PRODUCTOS / SERVICIOS =================== */}
        {Array.isArray(form.tipo_club) && form.tipo_club.includes("consumo") && (
          <>
            {/* =================== PRODUCTOS =================== */}
            <Grid item xs={12} sm={6}>
              <CardInfo icon={ShoppingCartIcon} title="Productos">
                <Typography>{renderArray(form.productos)}</Typography>
              </CardInfo>
            </Grid>

            {/* =================== SERVICIOS =================== */}
            <Grid item xs={12} sm={6}>
              <CardInfo icon={BuildIcon} title="Servicios">
                <Typography>{renderArray(serviciosArray)}</Typography>
              </CardInfo>
            </Grid>
          </>
        )}


        {/* =================== HORARIOS =================== */}
        <Grid item xs={12}>
          <CardInfo icon={CalendarIcon} title="Horarios">
            {renderHorarios(form.horarios)}
          </CardInfo>
        </Grid>

        {/* =================== RESERVACIÓN =================== */}
        <Grid item xs={6} sm={6}>
          <CardInfo icon={HomeIcon} title="Se requiere reservar para asistir">
            <Typography>
              {form.reservacion ? "SÍ" : "NO"}
            </Typography>
          </CardInfo>
        </Grid>
      
        
        {/* =================== STATUS LEGAL =================== */}
        <Grid item xs={6} sm={6}>
          <CardInfo icon={MedicalServicesIcon} title="Trámite COFEPRIS">
            <Typography>
              {form.cofeprismode === 'folio' ? (
                <>
                  Ya tienes el trámite {(form.tipoResolucion === 'enproceso' || form.tipoResolucion === 'desconozco') ? 'iniciado, con el status de: ' : 'realizado en la modalidad:'}, <b>{form.tipoResolucion}</b> con el folio:
                  <i>{form.cofepris}</i>
                  <br />
                </>
              ) : (
                 <>
                    Gestionaremos tu trámite con los siguientes datos:
                    {form.usarDireccionExistente ? 'Misma dirección que en los datos anteriores.' : (
                      <>
                        <>
                          {`${form.direccionGestion?.calle} no. ${form.direccionGestion?.numero}, Colonia ${form.direccionGestion?.colonia} Municipio de ${form.direccionGestion?.municipio}, ${form.direccionGestion?.estado}, CP. ${form.direccionGestion?.cp}`}
                        </>
                      </>
                    )}

                    {form.usarWhatsappExistente === true 
                      ? `Mismo teléfono que el Whatsapp registrado. [${form.whatsapp}]` 
                      : `Teléfono de Contacto para trámite: [${form.telefonoGestion}]`
                    }

                    {form.usarEmailExistente 
                      ? `Mismo e-mail que el asociado a tu cuenta. [${user.email}]` 
                      : `E-Mail: [${form.emailGestion}]`
                    }

                 </>
                )
              }
            </Typography>
          </CardInfo>

          
        </Grid>

        {/* =================== INE =================== */}
        <Grid item xs={12} sm={12}>
          <CardInfo icon={MedicalServicesIcon} title="IDENTIFICACIÓN OFICIAL"> 
            {ineFrenteFiles.length === 0 ? (
              <Typography color="text.secondary">No hay INE  cargado.</Typography>
            ) : (
               
                  <>
                    {/* =================== INE - REVERSO =================== */}

                    {ineFrenteFiles.map((file, index) => {
                      const { name, ext } = getSafeFileData(file, index, getExtension);

                      return (
                        <Box
                          key={`ine-frente-${index}`}
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            mt: 1,
                          }}
                        >
                          <span style={{ fontSize: 20, marginTop: 2 }}>
                            {ext === "pdf" ? "📄" : "🖼️"}
                          </span>

                          <Typography
                            sx={{
                              ml: 1,
                              flex: 1,
                              fontSize: 14,
                              lineHeight: 1.3,
                              whiteSpace: "normal",
                              wordBreak: "break-word",
                              overflowWrap: "anywhere",
                            }}
                          >
                            <FileLink file={file}>
                              <u>{name}</u>
                            </FileLink>
                          </Typography>

                          <FileLink file={file}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                fontSize: 14,
                                color: "#1976d2",
                                ml: 1,
                                whiteSpace: "nowrap",
                                cursor: "pointer",
                              }}
                            >
                              <VisibilityIcon color="success" sx={{ mr: 0.5 }} />
                              Ver
                            </Box>
                          </FileLink>
                        </Box>
                      );
                    })}
                  </>
            )}

              {/* =================== INE - REVERSO =================== */}
                {ineTrasFiles.length === 0 ? (
                  <Typography color="text.secondary">No hay INE (reverso) cargado.</Typography>
                ) : (
                  <>
                    {ineTrasFiles.map((file, index) => {
                      const { name, ext } = getSafeFileData(file, index, getExtension);

                      return (
                        <Box
                          key={`ine-tras-${index}`}
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            mt: 1,
                          }}
                        >
                          <span style={{ fontSize: 20, marginTop: 2 }}>
                            {ext === "pdf" ? "📄" : "🖼️"}
                          </span>

                          <Typography
                            sx={{
                              ml: 1,
                              flex: 1,
                              fontSize: 14,
                              lineHeight: 1.3,
                              whiteSpace: "normal",
                              wordBreak: "break-word",
                              overflowWrap: "anywhere",
                            }}
                          >
                            <FileLink file={file}>
                              <u>{name}</u>
                            </FileLink>
                          </Typography>

                          <FileLink file={file}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                fontSize: 14,
                                color: "#1976d2",
                                ml: 1,
                                whiteSpace: "nowrap",
                                cursor: "pointer",
                              }}
                            >
                              <VisibilityIcon color="success" sx={{ mr: 0.5 }} />
                              Ver
                            </Box>
                          </FileLink>
                        </Box>
                      );
                    })}
                  </>
                )}

              
            
 
          </CardInfo>
        </Grid>

      </Grid>

      {/* =================== FOOTER =================== */}
      <Divider sx={{ my: 3 }} />
      <Typography color="text.secondary" fontStyle="italic">
        Revisa que toda la información sea correcta antes de presionar
        <strong>Enviar</strong>.
      </Typography>
    </Box>
  );
}
