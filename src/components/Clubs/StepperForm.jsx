import React, { useState, useEffect, useMemo } from "react";
import RequisitosJardinero from '../../Pages/Clubs/RequisitosJardinero';
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
import PreCargador from "../PreCargador.jsx";
import Confirmacion from "./steps/Confirmacion";
import Archivos from "./steps/Archivos";
import Contacto from "./steps/Contacto.jsx";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { useRoles } from '../../Contexts/RolesContext'; 
import Ingresa from "../Usuarios/Ingresa.jsx";
import { handleSubmitClub } from './steps/HandleSubmitClub.js';
import { handleNextStep  } from './steps/Validaciones.js';

export default function StepperForm({
  tipo,
  form,
  setForm,
  user,
  isAuthenticated,
  userId,
  loginWithRedirect,
}) {

  const handleNext = () => {
    handleNextStep({
      form,
      steps,
      activeStep,
      setActiveStep,
      enqueueSnackbar,
      user,
    });
  };
  
  const handleSubmit = () => {
    handleSubmitClub({
      form,
      isAuthenticated,
      userId,
      user,
      setLoading,
      setPreCargador, // <-- se pasa para que handleSubmitClub controle el preloader durante el envío
      enqueueSnackbar,
      navigate,
    });
  };

  const { isClub, isActivaMembresia } = useRoles();
  const [cofeprisOption, setCofeprisOption] = useState();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  // 🔹 STEPS DINÁMICOS SEGÚN TIPO
  const steps = useMemo(() => {
    const baseSteps = [];

    if (tipo.tipo.tipo === "consumo") {
      baseSteps.push({
        label: "Instrucciones",
        component: <RequisitosJardinero tipo={tipo} />,
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
        label: "Horarios y Contacto",
        component: <Contacto form={form} setForm={setForm} />,
      },
      {
        label: "Archivos",
        component: <Archivos form={form} setForm={setForm} tipo={tipo} user={user} setCofeprisOption={setCofeprisOption}/>,
      },
      {
        label: "Confirmación",
        component: <Confirmacion form={form} isActivaMembresia={isActivaMembresia} user={user} />,
      }
    );
    return baseSteps;
  }, [tipo, form, setForm, user, isActivaMembresia]);

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  // Por defecto visible mientras carga el contenido a renderizar
  const [preCargador, setPreCargador] = useState(true);

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const isLastStep = activeStep === steps.length - 1;

  useEffect(() => {
    if (isClub === true) {
      navigate("/clubs/miclub/info", { replace: true });
    }
  }, [isClub, navigate]);

  useEffect(() => {
    console.log('posicionando');
    const el = document.getElementById("marihuanasclub-app");
    el?.scrollTo({ top: 0, behavior: "auto" });
  }, [activeStep]);

  useEffect(() => {
    const behavior = 'auto';
    const targetId = 'marihuahasclub-app';
      const el = document.getElementById(targetId);
      if (el) {
        if (typeof el.scrollTo === 'function') {
          el.scrollTo({ top: 0, left: 0, behavior });
        } else {
          el.scrollTop = 0;
        }
        return;
      }
    
    if (typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, left: 0, behavior });
    } else {
      window.scroll(0, 0);
    }
  }, [activeStep]); 

  // Oculta el preloader inicial cuando el contenido (usuario/steps) esté listo.
  useEffect(() => {
    // se apaga UNA SOLA VEZ al montar
    const t = setTimeout(() => setPreCargador(false), 150);
    return () => clearTimeout(t);
  }, []);

  if (preCargador) {
    return <PreCargador text="Enviando datos..." />;
  }

  if (isClub === true) {
    return <Typography>Redirigiendo a tu club...</Typography>;
  }

  if (!user) {
    return <Ingresa />
  }

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