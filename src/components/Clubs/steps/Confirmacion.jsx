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

export default function Confirmacion({ form }) {
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

const renderHorarios = (horarios) => {
  if (!horarios || Object.keys(horarios).length === 0) return "-";

  return Object.entries(horarios).map(([dia, horas]) => {
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

    // por si acaso viene como string
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
                <Typography variant="body1">{form.direccion || "-"}</Typography>
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
                <Typography variant="body1">{form.descripcion || "-"}</Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

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
      </Grid>

      <Divider sx={{ my: 3, borderColor: "rgba(156, 39, 176, 0.3)" }} />

      <Typography variant="body1" color="text.secondary" fontStyle="italic">
        Revisa que toda la información sea correcta antes de presionar <strong>Enviar</strong>.
      </Typography>
    </Box>
  );
}
