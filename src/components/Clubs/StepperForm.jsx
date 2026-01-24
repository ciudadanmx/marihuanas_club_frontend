import React, { useState, useEffect, useMemo } from "react";
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
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { useRoles } from '../../Contexts/RolesContext'; 
import Ingresa from "../Usuarios/Ingresa.jsx";

const STRAPI_URL = process.env.REACT_APP_STRAPI_URL;

const TEXTO_REGEX = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$/;

const validarCampo = ({
  valor,
  min,
  emptyMsg,
  minMsg,
  regexMsg,
  enqueueSnackbar,
}) => {
  if (!valor) {
    enqueueSnackbar(emptyMsg, { variant: "warning" });
    return false;
  }

  if (min && valor.length < min) {
    enqueueSnackbar(minMsg, { variant: "warning" });
    return false;
  }

  if (!TEXTO_REGEX.test(valor)) {
    enqueueSnackbar(regexMsg, { variant: "error" });
    return false;
  }

  return true;
};

export default function StepperForm({
  tipo,
  form,
  setForm,
  user,
  isAuthenticated,
  userId,
  loginWithRedirect,
}) {

  const { isClub, roles, isActivaMembresia } = useRoles();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

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
        label: "Horarios y Contacto",
        component: <Contacto form={form} setForm={setForm} />,
      },
      {
        label: "Archivos",
        component: <Archivos form={form} setForm={setForm} tipo={tipo} user={user}/>,
      },
      {
        label: "Confirmación",
        component: <Confirmacion form={form} isActivaMembresia={isActivaMembresia}/>,
      }
    );
    return baseSteps;
  }, [tipo, form, setForm]);

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    // 🔒 Validación SOLO en el step "Datos Generales"
    const stepLabel = steps[activeStep]?.label;

    if (stepLabel === "Datos Generales") {
      const data = {
        nombre_club: form.nombre_club?.trim(),
        nombre: form.nombre?.trim(),
        apellido_paterno: form.apellido_paterno?.trim(),
        apellido_materno: form.apellido_materno?.trim(),
        descripcion: form.descripcion?.trim(),
      };

      if (
        !validarCampo({
          valor: data.nombre_club,
          min: 5,
          emptyMsg:
            "👽 Saca para Andar Iwal !!… Tu Club necesita un nombre, si no no existe",
          minMsg:
            "👻 Quítate la máscara Anonymous… tu club necesita un nombre de al menos 5 caracteres",
          regexMsg:
            "🌀 Nombre cósmico detectado… pero relax: solo letras, espacios y números terrenales",
          enqueueSnackbar,
        }) ||
        !validarCampo({
          valor: data.nombre,
          min: 3,
          emptyMsg:
            "👀 Quítate la máscara Anonymous, introduce tu nombre completo",
          minMsg:
            "🌀 Nombre cósmico detectado… tu nombre debe de tener al menos 3 letras",
          regexMsg:
            "🌀 Nombre cósmico detectado… pero relax: solo letras, espacios y números terrenales",
          enqueueSnackbar,
        }) ||
        !validarCampo({
          valor: data.apellido_paterno,
          min: 3,
          emptyMsg:
            "👀 Quítate la máscara Anonymous, introduce tu nombre completo con ambos apellidos",
          minMsg:
            "🌀 Nombre cósmico detectado… tu apellido debe de tener al menos 3 letras",
          regexMsg:
            "🌀 Apellido cósmico detectado… pero relax: solo letras, espacios y números terrenales",
          enqueueSnackbar,
        }) ||
        !validarCampo({
          valor: data.apellido_materno,
          min: 3,
          emptyMsg:
            "👀 Quítate la máscara Anonymous, introduce tu nombre completo con ambos apellidos",
          minMsg:
            "🌀 Nombre cósmico detectado… tu apellido debe de tener al menos 3 letras",
          regexMsg:
            "🌀 Apellido cósmico detectado… pero relax: solo letras, espacios y números terrenales",
          enqueueSnackbar,
        })
      ) {
        return;
      }
    }

    if (stepLabel === "Dirección") {
      if (!form.direccion || !form.lat || !form.lng) {
        enqueueSnackbar(
          "📍 Ey… selecciona una dirección válida del mapa... en esta dimensión",
          { variant: "warning" }
        );
        return;
      }
    }

    if (stepLabel === "Archivos") {
       if (!Array.isArray(form.fotos_club) || form.fotos_club.length < 2) {
        enqueueSnackbar(
          "😍  De la vista nace el amor mazter -- Agrega al menos 2 Fotos de tu Club",
          { variant: "warning" }
        );
        return;
      }
    }

    // ✅ todo bien → avanzamos
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

  // ================== LIMPIEZA DE DATOS ==================

  // ---- PRODUCTOS: siempre string
  const productos =
    Array.isArray(form.productos)
      ? form.productos
          .map(p => String(p).trim())
          .filter(Boolean)
          .join(", ")
      : form.productos
        ? String(form.productos)
        : "";

  // ---- SERVICIOS: combinación de form.servicios + tipo_club (excepto cultivo/consumo)
  const serviciosArray = [
    // servicios explícitos del formulario
    ...(Array.isArray(form.servicios) ? form.servicios : []),

    // servicios inferidos desde tipo_club
    ...(Array.isArray(form.tipo_club)
      ? form.tipo_club.filter(
          t => !["cultivo", "consumo"].includes(t)
        )
      : []),
  ];

  const servicios = serviciosArray
    .map(s => String(s).trim())
    .filter(Boolean)
    .filter((v, i, arr) => arr.indexOf(v) === i) // elimina duplicados
    .join(", ");

  // ---- TIPO: ENUM ESTRICTO PARA STRAPI
  // posibles valores: "cultivo" | "consumo" | "ambos"
  let tipo = "consumo"; // default seguro

  if (Array.isArray(form.tipo_club)) {
    const tieneCultivo = form.tipo_club.includes("cultivo");
    const tieneConsumo = form.tipo_club.includes("consumo");

    if (tieneCultivo && tieneConsumo) {
      tipo = "ambos";
    } else if (tieneCultivo) {
      tipo = "cultivo";
    } else {
      tipo = "consumo";
    }
  }

  // ================== FIN LIMPIEZA ==================

    try {
      const dataToSend = new FormData();
      const payload = {
        nombre_club: form.nombre_club,
        direccion: form.direccion,
        nombre_titular: form.nombre_titular,
        descripcion: form.descripcion,
        lat: form.lat,
        lng: form.lng,
        productos: productos,
        servicios: servicios,
        tipo: tipo,
        users_permissions_user: userId,
        auth_name: user?.name || "desconocido",
        horarios: form.horarios,
        whatsapp: form.whatsapp,
        reservacion: form.reservacion,
        form: "cultivo",
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
        // si targetId no existe, fallback a window
      
  
      if (typeof window.scrollTo === 'function') {
        window.scrollTo({ top: 0, left: 0, behavior });
      } else {
        window.scroll(0, 0);
      }
    }, [activeStep]); 

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
