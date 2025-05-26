import React, { useState } from "react";
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  Typography,
} from "@mui/material";
import DatosGenerales from "./steps/DatosGenerales";
import Direccion from "./steps/Direccion";
import Confirmacion from "./steps/Confirmacion";
import Archivos from "./steps/Archivos";
import Contacto from "./steps/Contacto.jsx"

export default function StepperForm({ form, setForm, user, isAuthenticated, userId, loginWithRedirect }) {
  const steps = [
    { label: "Datos Generales", component: <DatosGenerales form={form} setForm={setForm} /> },
    { label: "Dirección", component: <Direccion form={form} setForm={setForm} /> },
    { label: "Archivos", component: <Archivos form={form} setForm={setForm} /> },
    { label: "Horarios y Contacto", component: <Contacto form={form} setForm={setForm} /> },
    { label: "Confirmación", component: <Confirmacion form={form} /> },
  ];

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSubmit = async () => {
    if (!isAuthenticated || !user || !userId) {
      loginWithRedirect();
      return;
    }

    setLoading(true);
    try {
      const dataToSend = new FormData();
      dataToSend.append("data", JSON.stringify({
        nombre_club: form.nombre_club,
        direccion: form.direccion,
        nombre_titular: form.nombre_titular,
        descripcion: form.descripcion,
        status_legal: form.status_legal,
        lat: form.lat,
        lng: form.lng,
        productos: form.productos,
        servicios: form.servicios,
        users_permissions_user: userId,
        auth_name: user.name || "desconocido",
        horarios: form.horarios,
        whatsapp: form.whatsapp,
      }));

      if (form.foto_perfil) {
        dataToSend.append("files.foto_de_perfil", form.foto_perfil);
      }
      form.fotos_club.forEach((foto) => {
        dataToSend.append("files.fotos", foto);
      });

      const res = await fetch("http://localhost:1337/api/clubs", {
        method: "POST",
        body: dataToSend,
      });

      if (res.ok) {
        alert("🎉 Club creado con éxito");
        // Opcional: resetear formulario y stepper si quieres
        // setForm(initialFormState);
        // setActiveStep(0);
      } else {
        const error = await res.json();
        alert("❌ Error: " + JSON.stringify(error));
      }
    } catch (err) {
      alert("❌ Error de red: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStepContent = (step) => {
    switch (step) {
      case 0:
        return <DatosGenerales form={form} setForm={setForm} />;
      case 1:
        return <Direccion form={form} setForm={setForm} />;
      case 2:
        return <Archivos form={form} setForm={setForm} />;
      case 3:
        return <Contacto form={form} setForm={setForm} />;
      case 4:
        return <Confirmacion form={form} />;
      default:
        return <Typography>Formulario no encontrado.</Typography>;
    }
  };

  const isLastStep = activeStep === steps.length - 1;

  return (
    <Box sx={{ width: "100%", maxWidth: 800, mx: "auto" }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((step, i) => (
          <Step key={i}>
            <StepLabel>{step.label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ my: 4 }}>{handleStepContent(activeStep)}</Box>

      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Button disabled={activeStep === 0 || loading} onClick={handleBack}>
          Atrás
        </Button>

        <Button
          variant="contained"
          onClick={isLastStep ? handleSubmit : handleNext}
          disabled={loading}
        >
          {loading ? "Guardando..." : isLastStep ? "Enviar" : "Siguiente"}
        </Button>
      </Box>
    </Box>
  );
}
