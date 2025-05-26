import React from 'react';
import { Modal, Box, Typography, Button, IconButton } from '@mui/material';

const RequisitosConductor = ({ modalOpen, setModalOpen }) => {
  if (!modalOpen) return null; // Evita render vacío si el modal no está abierto

  return (
    <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80%",
          maxWidth: "900px",
          bgcolor: "white",
          boxShadow: 24,
          p: 4,
          borderRadius: "10px",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
        }}
      >
        {/* Botón de cierre */}
        <IconButton
          onClick={() => setModalOpen(false)}
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            bgcolor: "red",
            color: "white",
            width: 33,
            height: 33,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            '&:hover': { bgcolor: "darkred" },
          }}
        >
          <span className="material-icons">close</span>
        </IconButton>

        <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
          Requisitos para Taxistas
        </Typography>

        <Typography>
          <b>Para registrarte en Ciudadan Taxi, debes cumplir con los siguientes requisitos:</b>
        </Typography>

        <ul>
          <li>Ser conductor de un taxi concesionado en la Ciudad de México.</li>
          <li>Tener concesión vigente y actualizada.</li>
          <li>Poseer licencia de conducir tipo B o E.</li>
          <li>Contar con tarjetón de identificación oficial.</li>
          <li>Tener tarjeta de circulación al día.</li>
        </ul>

        <Typography>
          <b>Proceso de Verificación:</b>
        </Typography>

        <ul>
          <li>Tras completar tu registro, podrás agendar una visita con uno de nuestros representantes.</li>
          <li>El representante verificará la autenticidad de tus documentos.</li>
          <li>Una vez aprobados, podrás comenzar a recibir viajes en la aplicación.</li>
        </ul>

        <Typography sx={{ mt: 2 }}>
          <b>Importante:</b> Si no cumples con los requisitos o proporcionas información falsa, tu cuenta será suspendida.
        </Typography>

        <Button 
          onClick={() => setModalOpen(false)} 
          sx={{ mt: 3, display: "block", mx: "auto", bgcolor: "gray", color: "white", '&:hover': { bgcolor: "darkred" } }}>
          Cerrar
        </Button>
      </Box>
    </Modal>
  );
};

export default RequisitosConductor;
