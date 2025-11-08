import React from "react";
import { Card, CardContent, Grid, Typography, Button } from "@mui/material";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";

const StatusCard = ({ curado, secado, totalCuradoSecado, linkVideos }) => (
  <Card sx={{ mb: 3, borderRadius: 2, boxShadow: "0 12px 30px rgba(2,6,23,0.06)" }}>
    <CardContent>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={8}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Estado de curado y secado</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Curado: <b>{curado}</b> días · Secado: <b>{secado}</b> días · Total acumulado: <b>{totalCuradoSecado}</b> días
          </Typography>
          <Typography variant="caption" sx={{ display: "block", mt: 1, color: "text.secondary" }}>
            Estos valores se obtienen de tu perfil (campo <code>curado</code> y <code>secado</code>).
          </Typography>
        </Grid>

        <Grid item xs={12} md={4} sx={{ textAlign: { xs: "left", md: "right" } }}>
          {linkVideos ? (
            <Button startIcon={<PlayCircleOutlineIcon />} variant="contained" color="primary" sx={{ textTransform: "none" }} onClick={() => window.open(linkVideos, "_blank")}>
              Carpeta de videos
            </Button>
          ) : (
            <Button variant="outlined" disabled sx={{ textTransform: "none" }}>
              Carpeta de videos no disponible
            </Button>
          )}
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

export default StatusCard;
