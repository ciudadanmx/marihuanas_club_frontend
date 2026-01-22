// TarjetasModal.jsx
import React from "react";
import {
  Stack,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Button,
} from "@mui/material";
import {
  FaCcVisa,
  FaCcMastercard,
  FaCcAmex,
  FaCcDiscover,
  FaCcDinersClub,
} from "react-icons/fa";
import ModalWrapper from "../ModalWrapper"; // ajusta ruta si la colocaste en otra carpeta

export default function TarjetasModal({ open, onClose }) {
  const total = 15000;
  const cuotas = 12;
  const cuota = total / cuotas;

  // Botones que se pasarán al ModalWrapper como 'actions'
  const actions = (
    <Button
      variant="contained"
      onClick={onClose}
      sx={{
        bgcolor: "#004d00",
        color: "#fff",
        fontWeight: 700,
        px: 4,
        py: 1.2,
        "&:hover": { bgcolor: "#003b00" },
        boxShadow: "0 8px 20px rgba(0,77,0,0.18)",
      }}
    >
      Cerrar
    </Button>
  );

  return (
    <ModalWrapper open={open} onClose={onClose} title="Formas de pago · Condiciones" actions={actions}>
      {/* --- contenido (children) --- */}
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
          <FaCcVisa size={44} />
          <FaCcMastercard size={44} />
          <FaCcAmex size={44} />
          <FaCcDiscover size={44} />
          <FaCcDinersClub size={44} />
        </Stack>

        <Typography variant="body2" color="text.secondary">
          Stripe permite aceptar las principales redes: <strong>Visa, Mastercard, American Express</strong>, así como
          otras marcas (Discover / Diners) y tarjetas tipo Carnet (tarjetas de restaurante) según configuración.
        </Typography>

        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          Nota: la presencia de una marca en este listado no garantiza que todas las tarjetas de esa marca
          cualifiquen para 12 MSI; la disponibilidad depende del banco emisor y de las promociones vigentes.
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
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700 }}>
          Condiciones generales
        </Typography>

        <List dense>
          <ListItem>
            <ListItemText
              primary="Promoción 12 MSI"
              secondary="Aplica únicamente en comercios y bancos participantes. Laboratorio 420 no garantiza que todas las tarjetas admitan la promoción."
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
              secondary="Para dudas o aclaraciones, contacta soporte: soporte@marihuanas.club"
            />
          </ListItem>
        </List>
      </Box>
      {/* --- fin children --- */}
    </ModalWrapper>
  );
}
