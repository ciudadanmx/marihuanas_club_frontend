// TarjetasInfoModal.jsx
import React from "react";
import {
  Modal,
  Box,
  Typography,
  Stack,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  FaCcVisa,
  FaCcMastercard,
  FaCcAmex,
  FaCcDiscover,
  FaCcDinersClub,
} from "react-icons/fa";

export default function TarjetasInfoModal({ open, onClose }) {
  // cálculo (digit-by-digit): 15000 / 12 = 1250
  const total = 15000;
  const cuotas = 12;
  const cuota = total / cuotas;

  const containerStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: { xs: "94%", sm: 760, md: 1000 },
    bgcolor: "transparent", // lo dejamos transparente para que la barra superior destaque
    outline: "none",
    maxHeight: "90vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    p: 2,
  };

  const modalCard = {
    width: "100%",
    bgcolor: "background.paper",
    boxShadow: 24,
    borderRadius: 2,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    maxHeight: "80vh",
  };

  const headerBar = {
    background: "linear-gradient(90deg, #7b2cff 0%, #b300ff 50%, #7b2cff 100%)",
    color: "#fff",
    px: 3,
    py: 1.25,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  };

  const contentBox = {
    p: 3,
    overflowY: "auto",
    // para que el header y footer no se sobrepongan al scroll
    flex: "1 1 auto",
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="tarjetas-info-title"
      aria-describedby="tarjetas-info-desc"
      BackdropProps={{ sx: { backgroundColor: "rgba(0,0,0,0.45)" } }}
    >
      <Box sx={containerStyle}>
        <Box sx={modalCard}>
          {/* Barra de título purpurona */}
          <Box sx={headerBar}>
            <Typography id="tarjetas-info-title" variant="h6" component="h2" sx={{ fontWeight: 700 }}>
              Formas de pago · Condiciones
            </Typography>

            {/* botón cerrar superior */}
            <IconButton
              onClick={onClose}
              size="small"
              aria-label="cerrar"
              sx={{
                color: "rgba(255,255,255,0.95)",
                bgcolor: "rgba(255,255,255,0.08)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.12)" },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Contenido scrollable */}
          <Box sx={contentBox} tabIndex={-1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
                Compra por <strong>$ {total.toLocaleString("es-MX")} MXN</strong>
              </Typography>

              <Chip label={`${cuotas} MSI`} size="small" color="primary" />
            </Stack>

            <Divider sx={{ mb: 2 }} />

            {/* Tarjetas aceptadas */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700 }}>
                Tarjetas aceptadas (Stripe en México)
              </Typography>

              <Stack direction="row" spacing={3} alignItems="center" sx={{ flexWrap: "wrap", mb: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center" }} aria-hidden>
                  <FaCcVisa size={44} />
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <FaCcMastercard size={44} />
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <FaCcAmex size={44} />
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <FaCcDiscover size={44} />
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <FaCcDinersClub size={44} />
                </Box>
              </Stack>

              <Typography variant="body2" color="text.secondary">
                Stripe permite aceptar las principales redes: <strong>Visa, Mastercard, American Express</strong>,
                así como otras marcas (Discover / Diners) y tarjetas tipo Carnet (tarjetas de restaurante) según configuración.{" :contentReference[oaicite:2]{index=2}"}
              </Typography>

              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Nota: la presencia de una marca en este listado no garantiza que todas las tarjetas de esa marca
                cualifiquen para 12 MSI; la disponibilidad de promociones de meses sin intereses depende del banco
                emisor y de las promociones vigentes.{" :contentReference[oaicite:3]{tabindex=3}"}
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Resumen de pagos */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700 }}>
                Resumen de pagos (ejemplo)
              </Typography>

              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Total"
                    secondary={`$ ${total.toLocaleString("es-MX")} MXN`}
                  />
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary={`${cuotas} mensualidades sin intereses (si aplica según banco)`}
                    secondary={`$ ${cuota.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN por mes — ${cuotas} pagos`}
                  />
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="Primer cargo"
                    secondary="Se realizará al confirmar la compra. Los cargos siguientes se harán automáticamente cada mes si la promoción aplica."
                  />
                </ListItem>
              </List>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Condiciones generales */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700 }}>
                Condiciones generales
              </Typography>

              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Promoción 12 MSI"
                    secondary="La promoción de 12 meses sin intereses aplica únicamente en comercios y bancos participantes. Ciudadan no garantiza que todas las tarjetas admitan la promoción."
                  />
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="Autorización del emisor"
                    secondary="La aprobación final depende del banco emisor. En caso de rechazo, el cliente deberá usar otro método de pago."
                  />
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="Comisiones y cargos"
                    secondary="Cargos por comisiones bancarias, impuestos o diferencias cambiarias (si aplicaran) son responsabilidad del cliente según el emisor."
                  />
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="Devoluciones y reembolsos"
                    secondary="Política de reembolso sujeta a términos de la tienda: reembolsos se procesan una vez que se apruebe la devolución y pueden tardar varios días según el banco."
                  />
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="Contacto"
                    secondary="Para dudas o aclaraciones, contacta soporte: soporte@ciudadan.org"
                  />
                </ListItem>
              </List>
            </Box>
          </Box>

          {/* Footer con botón cerrar grande verdesón */}
          <Box sx={{ p: 3, borderTop: "1px solid rgba(0,0,0,0.06)", display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              onClick={onClose}
              sx={{
                bgcolor: "#004d00",
                color: "#fff",
                fontWeight: 700,
                px: 3,
                py: 1,
                "&:hover": { bgcolor: "#003b00" },
                boxShadow: "0 8px 20px rgba(0,77,0,0.18)",
              }}
            >
              Cerrar
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}
