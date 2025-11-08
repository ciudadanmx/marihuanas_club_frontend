import React from 'react'
import {
  Typography,
  Box,
  Tooltip,
  Chip,
} from "@mui/material";
import TarjetasModal from './TarjetasModal.jsx';

const PrecioKitJardinero = (handleOpenModal, handleCloseModal, openModal) => {
  return (
    <>
    {/* Barra de precio llamativa con estrella SVG decorativa */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                        p: 1,
                      }}
                    >
                      <Box
                        sx={{
                          flex: 1,
                          borderRadius: "12px",
                          px: 2,
                          py: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          background:
                            "radial-gradient(circle at 10% 20%, rgba(97, 224, 59, 0.95), rgba(255,223,0,0.95) 25%, rgba(255,196,0,0.9))",
                          boxShadow:
                            "0 8px 24px rgba(255,197,0,0.15), 0 3px 8px rgba(0,0,0,0.08), 0 0 18px rgba(255,223,0,0.25) inset",
                          border: "1px solid rgba(0,0,0,0.05)",
                          position: "relative",
                          overflow: "visible",
                        }}
                      >
                        {/* SVG estrella grande de fondo (decorativa) */}
                        <Box
                          component="svg"
                          viewBox="0 0 200 200"
                          sx={{
                            position: "absolute",
                            left: -20,
                            top: -30,
                            width: { xs: 80, md: 110 },
                            height: { xs: 80, md: 110 },
                            zIndex: 0,
                            opacity: 0.95,
                            filter: "drop-shadow(0 6px 18px rgba(255,200,0,0.22))",
                            transform: "rotate(-12deg)",
                            pointerEvents: "none",
                          }}
                        >
                          <defs>
                            <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
                              <stop offset="0%" stopColor="#fff200" />
                              <stop offset="100%" stopColor="#ffdd00" />
                            </linearGradient>
                            <filter id="f1" x="-50%" y="-50%" width="200%" height="200%">
                              <feGaussianBlur stdDeviation="6" result="blur" />
                              <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                              </feMerge>
                            </filter>
                          </defs>
    
                          {/* Estrella poligonal */}
                          <polygon
                            points="100,10 117,72 182,72 129,110 146,172 100,135 54,172 71,110 18,72 83,72"
                            fill="url(#g1)"
                            stroke="#6d6e71"
                            strokeWidth="2"
                            filter="url(#f1)"
                          />
                        </Box>
    
                        <Box sx={{ position: "relative", zIndex: 1 }}>
                          <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                            💸 Precio preferencial
                          </Typography>
    
                          {/* Contenedor especial para la cifra con estrellitas pequeñas */}
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                              {/* Estrellitas pequeñas a la izquierda */}
                              <Box component="span" sx={{ fontSize: 20, lineHeight: 1.1 }}>✦</Box>
                              <Box component="span" sx={{ fontSize: 14, lineHeight: 1, opacity: 0.9 }}>★</Box>
                            </Box>
    
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 900,
                                letterSpacing: 0.6,
                                display: "flex",
                                alignItems: "baseline",
                                gap: 1,
                                ml: 0.5,
                              }}
                            >
                              <Box component="span" sx={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                                {/* Cifra con fondo sutil y pequeño borde para resaltarla */}
                                <Box
                                  sx={{
                                    px: { xs: 1, md: 1.5 },
                                    py: 0.5,
                                    borderRadius: "8px",
                                    background: "rgba(255,255,255,0.65)",
                                    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
                                    position: "relative",
                                    zIndex: 2,
                                    display: "inline-block",
                                    color: "#006400",
                                  }}
                                >
                                  $ 15,000 MXN
                                </Box>
    
                                {/* Brillos / destellos pequeños (SVG) */}
                                <Box
                                  component="svg"
                                  viewBox="0 0 48 48"
                                  sx={{
                                    position: "absolute",
                                    right: -18,
                                    top: -10,
                                    width: 40,
                                    height: 40,
                                    zIndex: 0,
                                    pointerEvents: "none",
                                    opacity: 0.95,
                                    transform: "rotate(12deg)",
                                  }}
                                >
                                  <defs>
                                    <linearGradient id="g2" x1="0" x2="1">
                                      <stop offset="0%" stopColor="#fff7a6" />
                                      <stop offset="100%" stopColor="#ffd400" />
                                    </linearGradient>
                                  </defs>
                                  <polygon
                                    points="24,2 29,18 46,18 32,28 37,44 24,34 11,44 16,28 2,18 19,18"
                                    fill="url(#g2)"
                                    stroke="#6d6e71"
                                    strokeWidth="0.6"
                                  />
                                </Box>
                              </Box>
    
                              <Typography
                                component="span"
                                sx={{
                                  ml: 1,
                                  fontSize: 14,
                                  fontWeight: 700,
                                }}
                              >
                                <Box
                                  component="span"
                                  sx={{
                                    display: "inline-block",
                                    opacity: 0.95,
                                    color: "#530e45ff",
                                    textShadow: "0 0 8px #13031aff, 0 0 12px rgba(10, 1, 14, 0.6)",
                                  }}
                                >
                                  a 12 msi de $1,500
                                </Box>
                              </Typography>
                            </Typography>
                          </Box>
                        </Box>
    
                         <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            position: "relative",
                            zIndex: 1,
                          }}
                        >
                          <Tooltip
                            title={
                              <span>
                                Financia con tarjetas participantes — opciones en mensualidades.
                                <br />
                                🚀 ¡Aplica promoción lanzamiento!
                              </span>
                            }
                            arrow
                            placement="top"
                          >
                            <Chip
                              label="💳 tarjetas participantes"
                              size="small"
                              onClick={handleOpenModal}
                              sx={{
                                bgcolor: "rgba(33, 150, 243, 0.2)",
                                color: "#1976d2",
                                borderRadius: "8px",
                                fontWeight: 700,
                                cursor: "pointer",
                                transition: "all 0.2s ease-in-out",
                                "&:hover": {
                                  bgcolor: "rgba(33, 150, 243, 0.3)",
                                  transform: "scale(1.05)",
                                  boxShadow: "0 0 8px rgba(33,150,243,0.6)",
                                },
                              }}
                            />
                          </Tooltip>
                        </Box>
    
                        {/* Modal con info estática */}
                        <TarjetasModal open={openModal} onClose={handleCloseModal} />
                      </Box>
                    </Box>
    </>
  )
}

export default PrecioKitJardinero;