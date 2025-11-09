import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  useMediaQuery,
} from '@mui/material';

import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import InfoIcon from '@mui/icons-material/Info';
import { motion } from 'framer-motion';
import MariaGif from '../../assets/maria.gif';
import { useNavigate } from 'react-router-dom';

const MotionBox = motion(Box);

export default function MariaDescription() {
  const isMobile = useMediaQuery('(max-width:600px)');

  const navigate = useNavigate();

  const handleAffiliate = () => {
    navigate('/membresias');
  };

    return (
    <Box
      component="section"
      sx={{
        width: '100%',
        background: 'linear-gradient(180deg,#020603 0%, #08110b 100%)',
        py: { xs: 6, md: 4 },
        px: { xs: 3, md: 3 },
        display: 'flex',
        justifyContent: 'center',
        mt: isMobile? 0 : "-12px",
        mb: "-42px",
      }}
    >
      <MotionBox
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        sx={{
          width: '100%',
          maxWidth: 1200,
          borderRadius: 3,
          p: { xs: 3, md: 4 },
          background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
          border: '1px solid rgba(0,255,136,0.12)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={7}>
            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon sx={{ color: '#A6FF00', fontSize: 26 }} />
              <Typography variant="overline" sx={{ color: '#A6FF00', fontWeight: 700 }}>
                Conoce a María
              </Typography>
            </Box>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                mb: 2,
                lineHeight: 1.03,
                background: 'linear-gradient(90deg,#C260FF,#A6FF00,#00FFD1)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '1.6rem', md: '2.2rem' },
                textShadow: '0 0 10px rgba(0,255,136,0.08)',
              }}
            >
              María — Inteligencia Artificial Cannábica Colaborativa
            </Typography>

            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.88)', mb: 2 }}>
              María es la inteligencia artificial de <strong>Marihuanas.Club</strong>: tu asistente colaborativo para aprender, gestionar
              y transformar todo lo que rodea a la planta. Está siempre disponible en forma del hada flotante
              en la esquina inferior derecha de la pantalla; háblale en lenguaje natural y obtén respuestas rápidas y precisas.
            </Typography>

            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.72)', mb: 2 }}>
              Actualmente María puede consultar la <strong>wiki completa</strong> de Marihuanas.Club y todos nuestros contenidos temáticos:
              legislación en México y el mundo, consejos de cultivo, biología y genética, usos medicinales e industriales,
              cultura 4:20, activismo, emprendimiento cannábico, consumo responsable, ecología y mucho más.
            </Typography>

            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.72)', mb: 3 }}>
              Pregúntale desde dudas prácticas hasta asesoría para redactar documentos o resolver consultas legales básicas —
              María te ayuda a darle forma y mejorar tus textos.
            </Typography>

            <Typography variant="subtitle1" sx={{ color: '#A6FF00', fontWeight: 700, mb: 1 }}>
              En desarrollo — capacidades avanzadas
            </Typography>

            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.72)', mb: 3 }}>
              En la próxima etapa podrás subir fotos de tu cultivo y recibir diagnósticos, identificar plagas o deficiencias,
              obtener planes de acción personalizados (riego, luz, nutrientes) y llevar el seguimiento de tu bitácora.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <Button
                variant="contained"
                onClick={handleAffiliate}
                sx={{
                  background: 'linear-gradient(90deg,#A6FF00,#00FFD1)',
                  color: '#051322',
                  fontWeight: 800,
                  textTransform: 'none',
                  boxShadow: '0 8px 30px rgba(166,255,0,0.12)',
                }}
              >
                Obtén María con tu membresía
              </Button>

              <Button
                variant="outlined"
                startIcon={<WhatsAppIcon />}
                href="https://wa.me/YOUR_NUMBER" 
                target="_blank"
                sx={{
                  borderColor: '#C260FF',
                  color: '#fff',
                  textTransform: 'none',
                }}
              >
                Chatea por WhatsApp
              </Button>
            </Box>

            <Typography variant="caption" sx={{ display: 'block', color: 'rgba(255,255,255,0.6)', mt: 3 }}>
              María también te ayuda a gestionar tu club, tus plantas y tu bitácora — todo desde una sola interfaz.
            </Typography>
          </Grid>

          <Grid item xs={12} md={5}>
            <MotionBox
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.8 }}
              sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' } }}
            >
              <Box
                component="img"
                src={MariaGif}
                alt="María - AI chatbot"
                sx={{
                  width: { xs: '90%', sm: 420, md: 420 },
                  maxWidth: { xs: '90%', sm: 520 },
                  height: 'auto',
                  borderRadius: 3,
                  boxShadow: '0 8px 30px rgba(0,0,0,0.6), 0 0 40px rgba(166,255,0,0.08)',
                  border: '1px solid rgba(166,255,0,0.08)',
                  opacity: 0.5,
                }}
              />
            </MotionBox>
          </Grid>
        </Grid>
      </MotionBox>
    </Box>
  );
}
