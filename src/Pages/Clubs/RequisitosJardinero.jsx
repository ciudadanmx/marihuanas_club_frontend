import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Tooltip,
} from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import InfoIcon from '@mui/icons-material/Info';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';

// importar video (asegúrate que el archivo existe en la ruta indicada)
import requisitosVideo from "../../assets/requisitosjardinero.mp4";

const GradientBox = ({ children, sx }) => (
  <Box
    sx={{
      background: "linear-gradient(135deg,#0f3b1f 0%, #1fbf4a 40%, #8a3bd6 100%)",
      color: "#fff",
      borderRadius: 3,
      p: 2,
      boxShadow: "0 8px 30px rgba(31,191,74,0.18)",
      overflow: 'hidden',
      ...sx,
    }}
  >
    {children}
  </Box>
);

export default function RequisitosJardinero() {
  const navigate = useNavigate();

  const downloadChecklist = () => {
    const text = `CHECKLIST REQUISITOS JARDINERO\n\n1. Ver el video informativo (obligatorio).\n2. Pagar Kit de Jardinero.\n3. Subir Constancia de Situaci\u00f3n Fiscal (SAT).\n4. Subir INE anverso y reverso.\n5. Subir Carta de No Pertenencia (formato en panel).\n6. Registrar cuenta OpenPay para cobros.\n7. Fotos y videos del espacio de cultivo (mín. 9 m2 por 7 miembros).\n8. Completar datos: domicilio, CURP, RFC y tel.\n\nRecuerda: mientras tu club siga afiliado y cumpla las normas, la membres\u00eda no tiene costo adicional.`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "checklist_requisitos_jardinero.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: 980 }}
      >
        <GradientBox sx={{ p: { xs: 2, md: 3 } }}>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12} md={5}>
              <Box sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.25)' }}>
                <video
                  src={requisitosVideo}
                  controls
                  playsInline
                  style={{ width: '100%', height: '100%', display: 'block' }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<UploadFileIcon />}
                  onClick={() => navigate("/clubs/agregar-club/cultivo")}
                  sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#fff', textTransform: 'none' }}
                >
                  Completar documentos
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<DownloadIconMock />}
                  onClick={downloadChecklist}
                  sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.18)', textTransform: 'none' }}
                >
                  Descargar checklist
                </Button>
              </Box>

            </Grid>

            <Grid item xs={12} md={7}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Avatar sx={{ bgcolor: '#fff', width: 56, height: 56, boxShadow: '0 6px 18px rgba(0,0,0,0.25)' }}>
                  <PlayCircleOutlineIcon sx={{ color: '#1fbf4a' }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
                    ¡No es solo pagar el Kit! — Lee y sigue estos pasos 🎯
                  </Typography>

                  <Typography sx={{ mt: 1, mb: 1.5, opacity: 0.95 }}>
                    Antes de finalizar, <strong>es obligatorio ver el video</strong> (arriba). Allí explicamos con claridad tus responsabilidades,
                    beneficios y el proceso completo de activación del Club. Después del pago tendrás que subir documentos y validar tu espacio.
                  </Typography>

                  <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.12)' }} />

                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon sx={{ color: '#dfffb3' }} />
                      </ListItemIcon>
                      <ListItemText primary={"Acceso al panel privado del Club y herramientas de membresía"} />
                    </ListItem>

                    <ListItem>
                      <ListItemIcon>
                        <VerifiedUserIcon sx={{ color: '#ffe79c' }} />
                      </ListItemIcon>
                      <ListItemText primary={"Soporte legal: gestionamos permiso COFEPRIS y amparo (si aplica)"} />
                    </ListItem>

                    <ListItem>
                      <ListItemIcon>
                        <AccountBalanceWalletIcon sx={{ color: '#bfeeff' }} />
                      </ListItemIcon>
                      <ListItemText primary={"Tu Club podrá recibir pagos automáticos por servicios de jardinería — asegúrate de tu Constancia SAT y OpenPay"} />
                    </ListItem>
                  </List>

                  <Typography variant="subtitle2" sx={{ mt: 1, mb: 1.5 }}>
                    <strong>Requisitos del espacio (sé detallista):</strong>
                  </Typography>

                  <Box sx={{ background: 'rgba(255,255,255,0.04)', p: 1.5, borderRadius: 2 }}>
                    <Typography sx={{ fontWeight: 700 }}>Área de cultivo • mínimo</Typography>
                    <Typography sx={{ fontSize: 13, opacity: 0.95, mt: 0.5 }}>
                      • <strong>9 m² por cada 7 miembros</strong>. Espacio cerrado, acceso restringido y señalizado.
                    </Typography>
                    <Typography sx={{ fontSize: 13, opacity: 0.95 }}>
                      • Ventilación mecánica o natural con control de temperatura y humedad.
                    </Typography>
                    <Typography sx={{ fontSize: 13, opacity: 0.95 }}>
                      • Instalación eléctrica segura (cableado, breakers y protección contra sobrecargas).
                    </Typography>
                    <Typography sx={{ fontSize: 13, opacity: 0.95 }}>
                      • Acceso a agua y drenaje; superficies resistentes a la humedad; materiales no inflamables.
                    </Typography>
                    <Typography sx={{ fontSize: 13, opacity: 0.95 }}>
                      • Área limpia, organizada y separada de zonas de convivencia o alimentos.
                    </Typography>

                    <Divider sx={{ my: 1 }} />

                    <Typography sx={{ fontSize: 13, opacity: 0.95 }}>
                      <strong>Requisitos de evidencia:</strong> fotos detalladas del espacio, videos cortos mostrando ventilación, mediciones, iluminación y tablero eléctrico.
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={() => navigate("/clubs/agregar-club/cultivo")}
                      sx={{ textTransform: 'none', bgcolor: '#fff', color: '#1b3b20', fontWeight: 700 }}
                    >
                      Completar documentos
                    </Button>

                    <Button
                      variant="outlined"
                      onClick={() => navigate("/membresias/pagar/order/2")}
                      sx={{ textTransform: 'none', borderColor: 'rgba(255,255,255,0.16)', color: '#fff' }}
                    >
                      Continuar pago
                    </Button>
                  </Box>

                </Box>
              </Box>
            </Grid>

          </Grid>

          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: 13, opacity: 0.9 }}>
              Mientras tu Club esté afiliado y cumpla con las normas, <strong>no pagarás cuotas adicionales</strong> — solo el Kit inicial. Incluye herramientas, documentos y tramitación.
            </Typography>

            <Box>
              <Tooltip title="Más info legal y acompañamiento">
                <Button startIcon={<InfoIcon />} sx={{ color: '#fff', textTransform: 'none' }}>Ayuda legal</Button>
              </Tooltip>
            </Box>
          </Box>

        </GradientBox>
      </motion.div>
    </Box>
  );
}

// Icon placeholder (Material icons import conflict in some environments)
function DownloadIconMock() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3V15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
