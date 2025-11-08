import React from "react";
import { Grid, Card, Box, Chip, CardContent, Typography, CardActions, Button, IconButton } from "@mui/material";
import { motion } from "framer-motion";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { cardVariants, PLACEHOLDER } from "./utils";

const PlantCard = ({ g, navigate }) => (
  <Grid item xs={12} sm={6} md={4}>
    <motion.div initial="initial" animate="enter" whileHover="hover" variants={cardVariants}>
      <Card
        sx={{ borderRadius: 3, overflow: "hidden", cursor: "pointer", boxShadow: "0 12px 40px rgba(3,10,22,0.07)" }}
        onClick={() => navigate(`/clubs/miclub/misplantas/${encodeURIComponent(g.codigoplanta)}`)}
      >
        <Box sx={{ position: "relative", height: 220, background: g.bg }}>
          <Box
            component="img"
            src={g.imagenUrl || PLACEHOLDER}
            alt={g.codigoplanta}
            loading="lazy"
            onError={(e) => { e.currentTarget.src = PLACEHOLDER; e.currentTarget.style.objectFit = "contain"; }}
            sx={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block", transition: "transform .45s ease" }}
          />
          <Chip label={g.colorLabel} sx={{ position: "absolute", right: 12, top: 12, bgcolor: "rgba(255,255,255,0.85)", fontWeight: 700 }} />
        </Box>

        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>{g.planta?.nombre || g.codigoplanta}</Typography>

          <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
            Estado: <b>{String(g.planta?.viva) === "true" ? "Viva" : "No viva"}</b>
          </Typography>

          <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1 }}>
            Último registro: {g.registro?.createdAt ? new Date(g.registro.createdAt).toLocaleString("es-MX") : "—"}
            {" • "}Código: <code style={{ fontSize: 12 }}>{g.codigoplanta}</code>
          </Typography>
        </CardContent>

        <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
          <Button size="small" onClick={() => navigate(`/clubs/miclub/misplantas/${encodeURIComponent(g.codigoplanta)}`)}>
            Ver detalle
          </Button>
          <IconButton aria-label="foto" onClick={(e) => { e.stopPropagation(); window.open(g.registro?.imagenUrl || g.imagenUrl || "#", "_blank"); }}>
            <PhotoCameraIcon />
          </IconButton>
        </CardActions>
      </Card>
    </motion.div>
  </Grid>
);

export default PlantCard;
