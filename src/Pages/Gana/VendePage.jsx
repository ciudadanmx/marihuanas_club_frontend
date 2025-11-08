// src/pages/VendePage.jsx
import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import EmojiNatureIcon from '@mui/icons-material/EmojiNature';
import { useNavigate } from 'react-router-dom';
import bazar420 from '../../assets/bazar420.gif';

export default function VendePage() {
  const navigate = useNavigate();

  const beneficios = [
    {
      icon: <VerifiedUserIcon fontSize="large" sx={{ color: '#00ff88' }} />,
      title: 'Vende Legalmente',
      description:
        'Cumple con todos los requisitos legales y permisos para vender productos cannábicos de forma segura.',
    },
    {
      icon: <LocalShippingIcon fontSize="large" sx={{ color: '#00ffa6' }} />,
      title: 'Gestión de Pedidos',
      description:
        'Controla tus ventas, inventario, envíos y estado de pedidos desde tu dashboard personal.',
    },
    {
      icon: <EmojiNatureIcon fontSize="large" sx={{ color: '#00ffc3' }} />,
      title: 'Conecta con la Comunidad',
      description:
        'Tus productos llegarán a clientes conscientes y responsables, fomentando la cultura cannábica.',
    },
  ];

  return (
    <Box
      sx={{
        p: 4,
        minHeight: '100vh',
        background: `
          linear-gradient(135deg, rgba(0,0,0,0.9), rgba(25,25,25,0.8), rgba(255,255,255,0.1))
        `,
        backgroundSize: '400% 400%',
        animation: 'neonBreath 12s ease infinite',
        '@keyframes neonBreath': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <Box
        sx={{
          backgroundColor: 'rgba(255,255,255,0.93)',
          borderRadius: 3,
          p: 4,
          mt: '-23px',
          boxShadow: '0 0 25px rgba(0,255,170,0.6)',
          width: '100%',
          maxWidth: 1200,
          position: 'relative',
          zIndex: 10,
        }}
      >
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={7}>
            <Typography
              variant="h4"
              fontWeight="bold"
              textAlign="left"
              sx={{
                mb: 2,
                background: 'linear-gradient(90deg, #00ffa6, #00ffaa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Vende en marihuanas.club 🌿
            </Typography>

            <Typography variant="body1" sx={{ mb: 2 }}>
              En nuestra plataforma <b>no cobramos comisiones ocultas</b>. Ofrecemos dos modalidades de cobro: pagos gestionados por la plataforma (Open Pay / procesador) y transferencias directas del comprador al vendedor.
            </Typography>

            {/* --- BLOQUE FISCAL REESCRITO --- */}
            <Box
              sx={{
                backgroundColor: 'rgba(230,255,240,0.98)',
                borderLeft: '6px solid #00ff88',
                p: 2.5,
                mb: 4,
                maxWidth: { xs: '100%', md: '95%' },
                color: '#003300',
                textAlign: 'justify',
                borderRadius: 1,
              }}
            >
              <Typography variant="subtitle1" fontWeight="700" sx={{ mb: 1 }}>
                📌 Nota importante sobre impuestos y formas de cobro
              </Typography>

              <Typography variant="body2" sx={{ mt: 1 }}>
                <b>1) Transferencia directa (el comprador te transfiere a ti):</b>  
                En este método <b>nosotros no tocamos el dinero</b>. El cliente paga directamente a la cuenta del vendedor, por lo que marihuanas.club no interviene en el flujo del pago ni realiza retenciones.  
                Eso significa que <b>la obligación de declarar y pagar IVA (tasa general 16%) e ISR corresponde al vendedor</b>, quien debe emitir factura cuando le pidan y llevar su contabilidad. Recomendamos siempre pedir RFC y comprobante fiscal al vendedor para evitar problemas posteriores.
              </Typography>

              <Typography variant="body2" sx={{ mt: 1 }}>
                <b>2) Pago a través del procesador / plataforma (ej. Open Pay):</b>  
                Cuando el cobro se hace por medio del procesador que integra la plataforma, marihuanas.club recibe la transacción y luego hace el pago al vendedor (transferencias periódicas). En este caso aplican reglas fiscales específicas para <i>marketplaces</i>:
                <ul>
                  <li>Si el vendedor proporciona RFC y emite CFDI (factura), la operación se procesa normalmente y la plataforma <b>no practica retención adicional</b> sobre el importe que corresponde al vendedor (solo se descuentan las comisiones del procesador —p. ej. ~3%— y el IVA trasladado cuando corresponda).</li>
                  <li>Si el vendedor <b>no</b> proporciona RFC o no puede facturar, la plataforma puede estar obligada por la ley a retener impuestos sobre los ingresos que canaliza. En la práctica y conforme a las reglas que regulan a las plataformas tecnológicas, esto suele traducirse en retenciones sobre IVA e ISR que la plataforma debe enterar al SAT y documentar con CFDI de retención.</li>
                </ul>
              </Typography>

              <Typography variant="body2" sx={{ mt: 1 }}>
                ✅ En resumen práctico:  
                - <b>Transferencia directa:</b> la plataforma no toca el dinero → el vendedor es responsable fiscal.  
                - <b>Pago por plataforma:</b> si no hay RFC/factura, la plataforma puede retener (y enterar) impuestos por ley; si sí hay RFC/factura, la retención normalmente no aplica.
              </Typography>

              <Typography variant="body2" sx={{ mt: 1 }}>
                ℹ️ Ten en cuenta que <b>las tasas y obligaciones pueden variar</b> según la naturaleza del vendedor (persona física vs moral), su cumplimiento fiscal, y las reglas/actualizaciones que publique el SAT. En el debate público y en propuestas recientes se han planteado esquemas con retenciones agregadas (por ejemplo, propuestas que hablan de ~8% IVA + entre 1% y 2.5% de ISR en ciertos supuestos para vendedores que no cumplen). Por eso es importante: 1) registrar tu RFC, 2) emitir CFDI cuando proceda y 3) revisar tus reportes mensuales en el panel para descargar las constancias/CFDI de retención si las hubiera.
              </Typography>

              <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                (Resumen de obligaciones sujeto a cambios regulatorios — ver políticas y avisos fiscales en tu panel).
              </Typography>
            </Box>
            {/* --- FIN BLOQUE FISCAL --- */}

            <Box textAlign="left" mt={4}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  background: 'linear-gradient(90deg, #00ffa6, #00ffaa)',
                  color: '#000',
                  fontWeight: 'bold',
                  boxShadow: '0 0 20px rgba(0,255,200,0.7)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #00ff99, #00ffaa)',
                    boxShadow: '0 0 35px rgba(0,255,200,1)',
                  },
                }}
                onClick={() => navigate('/registro-vendedor')}
              >
                Regístrate como Vendedor
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={5} textAlign="center">
            <Box
              component="img"
              src={bazar420}
              alt="Bazar 420"
              sx={{
                width: { xs: '70%', sm: '60%', md: '85%' },
                maxWidth: 500,
                borderRadius: 3,
                boxShadow: '0 0 40px rgba(0,255,170,0.8)',
              }}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 8 }}>
          <Grid container spacing={4} justifyContent="center">
            {beneficios.map((b, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Card
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    borderRadius: 3,
                    background:
                      'linear-gradient(180deg, rgba(0,0,0,0.85), rgba(0,255,200,0.1))',
                    boxShadow: '0 0 15px rgba(0,255,170,0.4)',
                    color: '#fff',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 0 25px rgba(0,255,200,0.9)',
                    },
                  }}
                >
                  <Box sx={{ mb: 2 }}>{b.icon}</Box>
                  <CardContent>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      gutterBottom
                      sx={{ color: '#00ff99' }}
                    >
                      {b.title}
                    </Typography>
                    <Typography variant="body2">{b.description}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
