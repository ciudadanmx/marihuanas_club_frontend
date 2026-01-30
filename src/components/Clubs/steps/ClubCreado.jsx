import React, { useEffect, useRef, useState } from "react";
import { Box, Typography, Button, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { motion, AnimatePresence } from "framer-motion";
import clubCreadoVideo from "../../../assets/videos/clubcreado.mp4";
import posterRef from "../../../assets/videos/clubcreado_ref.png";
import { useNavigate } from "react-router-dom";

// ClubCreado.jsx
// Versión mejorada: uso de Material UI + Framer Motion
// - Centrado perfecto del contenido
// - Video importado como asset
// - Poster / imagen de referencia integrada como overlay opcional
// - Animaciones de entrada sincronizadas con la carga del video
// - Conserva canvas de partículas pero reducido para mejor performance

export default function ClubCreado({
  message = '¡Club creado con éxito!',
  submessage = 'Tu información fue enviada y está en revisión.',
  onClose = () => {},
  videoSrc = clubCreadoVideo,
  posterImage = posterRef,
}) {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const [show, setShow] = useState(true);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    // Partículas muy ligeras para no consumir CPU en móviles
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = (canvas.width = canvas.offsetWidth);
    let h = (canvas.height = canvas.offsetHeight);
    let raf = null;

    const particles = [];
    const NUM = Math.max(6, Math.round((w * h) / 90000));

    function rand(min, max) {
      return Math.random() * (max - min) + min;
    }

    function createParticles() {
      particles.length = 0;
      for (let i = 0; i < NUM; i++) {
        particles.push({
          x: rand(0, w),
          y: rand(0, h),
          r: rand(0.8, 2.4),
          vx: rand(-0.15, 0.15),
          vy: rand(-0.06, 0.06),
          alpha: rand(0.06, 0.18),
        });
      }
    }

    function onResize() {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
      createParticles();
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (let p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }

    createParticles();
    raf = requestAnimationFrame(draw);
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Animación de entrada: esperar que el video esté listo (canplay) para mostrar
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    function onCanPlay() {
      setVideoReady(true);
    }
    v.addEventListener('canplay', onCanPlay);
    return () => v.removeEventListener('canplay', onCanPlay);
  }, []);

  function handleClose() {
    setShow(false);
    setTimeout(() => onClose && onClose(), 420);
    navigate("/clubs/miclub")
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          style={{ position: 'fixed', inset: 0, zIndex: 1400 }}
        >
          <Box sx={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>

            {/* Video */}
            <video
              ref={videoRef}
              src={videoSrc}
              poster={posterImage}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                objectFit: 'cover'
              }}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            />

            {/* Oscurecimiento inteligente */}
            <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.18), rgba(0,0,0,0.45))' }} />

            {/* Sutil overlay de marca (amarillo) */}
            <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', mixBlendMode: 'screen', background: 'radial-gradient(40% 30% at 20% 20%, rgba(255,242,0,0.12), transparent 20%), linear-gradient(180deg, rgba(255,242,0,0.06), transparent 40%)' }} />

            {/* Canvas partículas */}
            <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.9 }} />

            {/* Card central */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%,-50%)',
                width: { xs: '92%', sm: '78%', md: '60%', lg: '48%' },
                maxWidth: 900,
                p: { xs: 3, sm: 5 },
                borderRadius: 3,
                boxShadow: '0 18px 60px rgba(2,8,23,0.7)',
                bgcolor: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(10px) saturate(120%)',
                color: 'white',
                textAlign: 'center',
              }}
            >
              <IconButton
                onClick={handleClose}
                sx={{ position: 'absolute', right: 12, top: 12, color: 'rgba(255,255,255,0.9)', bgcolor: 'rgba(0,0,0,0.3)' }}
              >
                <CloseIcon />
              </IconButton>

              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <motion.img
                  src={posterImage}
                  alt="club creado"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: videoReady ? 1 : 0.98, opacity: videoReady ? 1 : 0.6 }}
                  transition={{ type: 'spring', stiffness: 90, damping: 14, duration: 0.8 }}
                  style={{ width: 140, height: 88, objectFit: 'cover', borderRadius: 10, boxShadow: '0 8px 30px rgba(0,0,0,0.5)', border: '3px solid rgba(255,242,0,0.95)' }}
                />
              </Box>

              <motion.div
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: videoReady ? 0.15 : 0.5, duration: 0.6, ease: 'easeOut' }}
              >
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
                  {message}
                </Typography>

                <Typography variant="body1" sx={{ opacity: 0.9, mb: 3 }}>
                  {submessage}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="contained" onClick={handleClose} sx={{ bgcolor: '#fff200', color: '#0b0b0b', px: 4, py: 1.25, fontWeight: 700, boxShadow: '0 10px 30px rgba(0,0,0,0.35)' }}>
                      Continuar
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="outlined" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} sx={{ color: 'rgba(255,255,255,0.95)', px: 3.5, py: 1.25, borderColor: 'rgba(255,255,255,0.12)' }}>
                      Ver detalles
                    </Button>
                  </motion.div>
                </Box>
              </motion.div>

              <Typography variant="caption" sx={{ display: 'block', mt: 2, opacity: 0.7 }}>
                Si necesitas cambiar algo, vuelve a editar.  •  {videoReady ? 'Video listo' : 'Cargando video...'}
              </Typography>
            </Box>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
