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
import Contacto from "./steps/Contacto.jsx";

const STRAPI_URL = process.env.REACT_APP_STRAPI_URL;

export default function StepperForm({
  form,
  setForm,
  user,
  isAuthenticated,
  userId,
  loginWithRedirect,
}) {
  const steps = [
    { label: "Datos Generales", component: <DatosGenerales form={form} setForm={setForm} /> },
    { label: "Dirección", component: <Direccion form={form} setForm={setForm} /> },
    { label: "Archivos", component: <Archivos form={form} setForm={setForm} /> },
    { label: "Horarios y Contacto", component: <Contacto form={form} setForm={setForm} /> },
    { label: "Confirmación", component: <Confirmacion form={form} /> },
  ];

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    console.log("🔜 Avanzando al paso", activeStep + 1);
    setActiveStep((prev) => prev + 1);
  };
  const handleBack = () => {
    console.log("🔙 Volviendo al paso", activeStep - 1);
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    console.log("🚀 handleSubmit iniciado");
    console.log("Form state:", form);
    console.log("User authenticated:", isAuthenticated, "UserId:", userId);

    // 💥 Quitamos la redirección para que no se pierda el log en consola
    if (!isAuthenticated || !userId) {
      console.warn("❗ Usuario no autenticado o sin userId — no se envía nada, revisa tu sesión");
      return;
    }

    setLoading(true);
    console.warn("📡 Enviando club a Strapi en", STRAPI_URL);

    try {
      const dataToSend = new FormData();
      const payload = {
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
        auth_name: user?.name || "desconocido",
        horarios: form.horarios,
        whatsapp: form.whatsapp,
      };

      console.log("📦 Payload JSON:", payload);
      dataToSend.append("data", JSON.stringify(payload));

      if (form.foto_perfil) {
        console.log("🖼️ Adjuntando foto_perfil:", form.foto_perfil.name);
        dataToSend.append("files.foto_perfil", form.foto_perfil);
      }

      form.fotos_club.forEach((foto, idx) => {
        console.log(`🖼️ Adjuntando fotos_club[${idx}]:`, foto.name);
        dataToSend.append("files.fotos_club", foto);
      });

      console.log("🔍 Revisando FormData:");
      for (let [key, value] of dataToSend.entries()) {
        console.log(" ", key, value);
      }

      const res = await fetch(`${STRAPI_URL}/api/clubs`, {
        method: "POST",
        body: dataToSend,
      });

      console.log("📨 Respuesta HTTP:", res.status, res.statusText);

      if (res.ok) {
        const respuesta = await res.json();
        console.log("✅ Club creado:", respuesta);
        alert("🎉 Club creado con éxito");
      } else {
        const error = await res.json();
        console.error("❌ Error creando club:", error);
        alert("❌ Error: " + JSON.stringify(error));
      }
    } catch (err) {
      console.error("🌐 Error de red:", err);
      alert("❌ Error de red: " + err.message);
    } finally {
      setLoading(false);
      console.log("🏁 handleSubmit terminado");
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
