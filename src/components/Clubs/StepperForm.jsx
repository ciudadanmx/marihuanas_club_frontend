import React, { useState, useMemo } from "react";
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  Typography,
} from "@mui/material";
import Instrucciones from "./steps/Instrucciones.jsx";
import DatosGenerales from "./steps/DatosGenerales";
import Direccion from "./steps/Direccion";
import Confirmacion from "./steps/Confirmacion";
import Archivos from "./steps/Archivos";
import Contacto from "./steps/Contacto.jsx";

const STRAPI_URL = process.env.REACT_APP_STRAPI_URL;

export default function StepperForm({
  tipo,
  form,
  setForm,
  user,
  isAuthenticated,
  userId,
  loginWithRedirect,
}) {

  // 🔹 STEPS DINÁMICOS SEGÚN TIPO
  const steps = useMemo(() => {
    const baseSteps = [];

    console.log('klub si steper', tipo?.tipo.tipo);
    if (tipo.tipo.tipo === "consumo") {
      console.log('klub si stepper consumo', tipo)
      baseSteps.push({
        label: "Instrucciones",
        component: <Instrucciones tipo={tipo} />,
      });
    }

    baseSteps.push(
      {
        label: "Datos Generales",
        component: <DatosGenerales form={form} setForm={setForm} tipo={tipo} />,
      },
      {
        label: "Dirección",
        component: <Direccion form={form} setForm={setForm} />,
      },
      {
        label: "Archivos",
        component: <Archivos form={form} setForm={setForm} />,
      },
      {
        label: "Horarios y Contacto",
        component: <Contacto form={form} setForm={setForm} />,
      },
      {
        label: "Confirmación",
        component: <Confirmacion form={form} />,
      }
    );

    return baseSteps;
  }, [tipo, form, setForm]);

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!isAuthenticated || !userId) {
      console.warn("❗ Usuario no autenticado o sin userId");
      return;
    }

    setLoading(true);

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

      dataToSend.append("data", JSON.stringify(payload));

      if (form.foto_perfil) {
        dataToSend.append("files.foto_perfil", form.foto_perfil);
      }

      form.fotos_club.forEach((foto) => {
        dataToSend.append("files.fotos_club", foto);
      });

      const res = await fetch(`${STRAPI_URL}/api/clubs`, {
        method: "POST",
        body: dataToSend,
      });

      if (res.ok) {
        alert("🎉 Club creado con éxito");
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

  const isLastStep = activeStep === steps.length - 1;

  return (
    <Box sx={{ width: "100%", maxWidth: 800, mx: "auto" }}>
      <Stepper
        activeStep={activeStep}
        alternativeLabel
        sx={{
          "& .MuiStepIcon-root": { color: "lightgreen" },
          "& .MuiStepIcon-root.Mui-active": { color: "green" },
          "& .MuiStepIcon-root.Mui-completed": { color: "green" },
          "& .MuiStepLabel-label.Mui-active": {
            fontWeight: "bold",
            color: "green",
          },
        }}
      >
        {steps.map((step, i) => (
          <Step key={i}>
            <StepLabel>{step.label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ my: 4 }}>
        {steps[activeStep]?.component || (
          <Typography>Formulario no encontrado.</Typography>
        )}
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Button
          disabled={activeStep === 0 || loading}
          onClick={handleBack}
          color="success"
        >
          Atrás
        </Button>

        <Button
          color="success"
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
