// src/components/Clubs/steps/Confirmacion.jsx
import React from "react";
import { Box, Typography, Grid, Card, CardContent, Divider } from "@mui/material";
import { motion } from "framer-motion";
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
} from "@mui/icons-material";
import formaters from '../../../utils/formaters';
import { createFileHandlers } from '../../../utils/FileHelpers';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import YardIcon from '@mui/icons-material/Yard';
import ForestIcon from '@mui/icons-material/Forest';

export default function Confirmacion({ form }) {
    // 📎 IMÁGENES + PDF
    const {
      getExtension: getDocExt,
    } = createFileHandlers({
      allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
      fieldName: 'archivos_club',
    });

  const motionProps = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 },
  };

  const cardStyle = {
    borderRadius: 3,
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    border: "1px solid #9c27b0",
  };

  const renderArray = (arr) => (arr && arr.length > 0 ? arr.join(", ") : "-");

  const DIAS_SEMANA = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];

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
      if (typeof horas === "object" && horas !== null) {
        const abierto = horas.abierto ? "Abierto" : "Cerrado";
        const apertura = horas.apertura || "-";
        const cierre = horas.cierre || "-";

        return (
          <Typography key={dia} variant="body2" sx={{ ml: 2 }}>
            <strong>{dia}:</strong> {abierto} ({apertura} - {cierre})
          </Typography>
        );
      }

      return (
        <Typography key={dia} variant="body2" sx={{ ml: 2 }}>
          <strong>{dia}:</strong> {horas}
        </Typography>
      );
    });
  };
  

  return (
    <Box>
      <Typography variant="h4" mb={3} fontWeight="bold" color="#6a1b9a">
        Confirma la información del club
      </Typography>

      <Grid container spacing={2}>
        {/* Nombre del club */}
        <Grid item xs={12} sm={6}>
          <motion.div {...motionProps}>
            <Card sx={cardStyle}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <CategoryIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Nombre del Club
                  </Typography>
                </Box>
                <Typography variant="h6">{form.nombre_club || "-"}</Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Nombre completo */}
        <Grid item xs={12} sm={6}>
          <motion.div {...motionProps}>
            <Card sx={cardStyle}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <PersonIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Nombre completo del titular
                  </Typography>
                </Box>
                <Typography variant="h6">{form.nombre_titular || "-"}</Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Tipo */}
        <Grid item xs={12} sm={6}>
          <motion.div {...motionProps}>
            <Card sx={cardStyle}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <CategoryIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Tipo de club
                  </Typography>
                </Box>
                <Typography variant="body1">{form.tipo_club || "-"}</Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Dirección */}
        <Grid item xs={12} sm={6}>
          <motion.div {...motionProps}>
            <Card sx={cardStyle}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <HomeIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Dirección
                  </Typography>
                </Box>
                <Typography variant="body1">{ formaters.formatearDireccionConInterior(
                    form.direccion_formateada,
                    form.numero_interior,
                  ) || form.direccion || "-"}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Foto de perfil / portada */}
        <Grid item xs={12}>
          <motion.div {...motionProps}>
            <Card sx={cardStyle}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <PhotoIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Foto de Portada
                  </Typography>
                </Box>
                {form.foto_perfil ? (
                  <img
                    src={URL.createObjectURL(form.foto_perfil)}
                    alt="Foto de portada"
                    style={{
                      width: "250px",
                      borderRadius: 10,
                      objectFit: "cover",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                    }}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No hay foto de portada
                  </Typography>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Fotos del club */}
        <Grid item xs={12}>
          <motion.div {...motionProps}>
            <Card sx={cardStyle}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <ImageIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Fotos del Club
                  </Typography>
                </Box>
                <Grid container spacing={1}>
                  {form.fotos_club && form.fotos_club.length > 0 ? (
                    form.fotos_club.map((file, index) => (
                      <Grid item xs={4} sm={3} md={2} key={index}>
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`foto-${index}`}
                          style={{
                            width: "100%",
                            borderRadius: 8,
                            objectFit: "cover",
                            height: "100px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                          }}
                        />
                      </Grid>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No hay fotos cargadas
                    </Typography>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Fotos documentales */}
        {form.documentales && (
          <Grid item xs={12}>
            <motion.div {...motionProps}>
              <Card sx={cardStyle}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <ImageIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      Fotos Documentales de Áreas de Cultivo
                    </Typography>
                  </Box>
                  <Grid container spacing={1}>
                    {form.documentales && form.documentales.length > 0 ? (
                      form.documentales.map((file, index) => (
                        <Grid item xs={4} sm={3} md={2} key={index}>
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`foto-${index}`}
                            style={{
                              width: "100%",
                              borderRadius: 8,
                              objectFit: "cover",
                              height: "100px",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                            }}
                          />
                        </Grid>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No hay fotos cargadas
                      </Typography>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        )}

        {/* Descripción */}
        <Grid item xs={12}>
          <motion.div {...motionProps}>
            <Card sx={cardStyle}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <InfoIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Descripción
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }} > {form.descripcion || "-"}</Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* SKILLS */}
        {form.armarios && (
          <>
            <Grid item xs={12}>
              <motion.div {...motionProps}>
                <Card sx={cardStyle}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <YardIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="subtitle2" color="text.secondary"> 
                        Habilidades del Jardinero:
                      </Typography>
                    </Box>

                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }} >
                      {form.skills ? (form.skills) : ('No especificadas.') }
                    </Typography>
                    <Box>
                      <Divider sx={{ mt: 3, borderColor: "rgba(156, 39, 176, 0.3)" }} />

                      <Typography
                        variant="subtitle2"
                        color="success.main"
                        sx={{ mt: 0, mb: 0 }}
                      >
                        <ForestIcon sx={{ mb: -0.5 }} /> Espacio para{" "}
                        <span
                          style={{
                            fontSize: "1.8rem",
                            fontWeight: 800,
                            color: "#ff9800",
                            margin: "0 4px",
                          }}
                        >
                          {form.armarios}
                        </span>
                        plantas.
                      </Typography>

                      <Divider sx={{ mb: 1, borderColor: "rgba(156, 39, 176, 0.3)" }} />

                    </Box>


                    {form.archivos_club?.length > 0 && ( 
                    
                    <Box>

                      <Divider sx={{ mt: 3, borderColor: "rgba(156, 39, 176, 0.3)" }} />
                        <Typography variant="subtitle2" color="success.main" sx={{mt:0, mb:0, pt:0, pb:0, textDecoration: "italic"}}>
                          <small>
                          <WorkspacePremiumIcon 
                            sx={{ mb:-1, pb:0 }}
                          /> 
                          </small>
                          Certificaciones:
                        </Typography>
                      
                        {form.archivos_club.map((file, index) => {
                          const fileURL = URL.createObjectURL(file);

                          return (
                            <Box
                              key={index}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mb: 1,
                                mt: 1,
                              }}
                            >
                              <span style={{ fontSize: 20 }}>
                                {getDocExt(file.name) === 'pdf' ? '📄' : '🖼️'}
                              </span>

                              <Typography sx={{ ml: 1, flex: 1, decoration: 'underline' }}>
                                <a
                                  href={fileURL}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    textDecoration: 'none',
                                    fontSize: 14,
                                    color: '#1976d2',
                                    marginLeft: 8,
                                  }}
                                >
                                  <u>{file.name}</u>
                                </a>
                              </Typography>

                              <a
                                href={fileURL}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  textDecoration: 'none',
                                  fontSize: 14,
                                  color: '#1976d2',
                                  marginLeft: 8,
                                }}
                              >
                                <VisibilityIcon
                                  color="success"
                                  sx={{mb:-1, pb:0, pr:1.3}}
                                /> 
                                Ver
                              </a>
                            </Box>
                          );
                        })}
                      </Box>
                  
                    )}

                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </>
        )}    


        {/* Productos */}
        <Grid item xs={12} sm={6}>
          <motion.div {...motionProps}>
            <Card sx={cardStyle}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <ShoppingCartIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Productos
                  </Typography>
                </Box>
                <Typography variant="body1">{renderArray(form.productos)}</Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Servicios */}
        <Grid item xs={12} sm={6}>
          <motion.div {...motionProps}>
            <Card sx={cardStyle}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <BuildIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Servicios
                  </Typography>
                </Box>
                <Typography variant="body1">{renderArray(form.servicios)}</Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Horarios */}
        <Grid item xs={12}>
          <motion.div {...motionProps}>
            <Card sx={cardStyle}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <CalendarIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Horarios
                  </Typography>
                </Box>
                {renderHorarios(form.horarios)}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        
        {/* Horarios */}
        <Grid item xs={12} sm={6}>
          <motion.div {...motionProps}>
            <Card sx={cardStyle}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <HomeIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Se requiere reservar para asistir
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {form.reservacion === true ? "SÍ" : "NO"}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3, borderColor: "rgba(156, 39, 176, 0.3)" }} />

      <Typography variant="body1" color="text.secondary" fontStyle="italic">
        Revisa que toda la información sea correcta antes de presionar <strong>Enviar</strong>.
      </Typography>
    </Box>
  );
}
