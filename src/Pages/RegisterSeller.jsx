// components/RegisterStoreStepper.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  CircularProgress,
  Box,
  Typography
} from "@mui/material";
import { useAuth0 } from "@auth0/auth0-react";

const steps = ["Nombre de la tienda", "Conectar Stripe", "Conectar Mienvío"];

export default function RegisterStoreStepper() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, loginWithRedirect } = useAuth0();

  const [activeStep, setActiveStep] = useState(0);
  const [storeName, setStoreName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const STRAPI_URL = process.env.REACT_APP_STRAPI_URL;

  useEffect(() => {

     setTimeout(() => {
        console.log("Han pasado 2 segundos");
        if(isAuthenticated) { console.log(`-------------- ${user.email}`) }
    else {    
        console.log('----no autenticado ----')
    }
    }, 10000);
    
    const verificarStripeDesdeSlug = async () => {
      if (!location.state?.fromStripe || !location.state?.slug) return;


     

      try {
        console.log('iniciando bíusqueda');
        const res = await fetch(`${STRAPI_URL}/api/stores?filters[name][$eq]=${storeName}`);
        const data = await res.json();

        if (data.data.length === 0) {
          console.warn("No se encontró la tienda con ese slug");
          return;
        }

        console.log(' * /* / * /*  tienda encontrada !!!  /* / * /* ');
        console.log(data.data[0]);
        const tienda = data.data[0];
        const attrs = tienda.attributes;
        setStoreName(attrs.name);

        if (attrs.stripeOnboarded && attrs.stripePayoutsEnabled && attrs.stripeChargesEnabled) {
          setActiveStep(2); // Puede pasar a Mienvío
          return;
        }

        // Actualizar a true los flags de Stripe
        const updateRes = await fetch(`${STRAPI_URL}/api/stores/${tienda.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: {
              stripeOnboarded: true,
              stripePayoutsEnabled: true,
              stripeChargesEnabled: true
            }
          })
        });

        if (updateRes.ok) {
          setActiveStep(2); // Avanza a Mienvío
          navigate("/registro-vendedor", { replace: true, state: {} }); // Limpia el estado
        } else {
          console.error("Error actualizando tienda después de Stripe");
        }

      } catch (err) {
        console.error("Error al verificar tienda después de Stripe:", err);
      }
    };

    verificarStripeDesdeSlug();
  }, [location.state, navigate, STRAPI_URL, user]);

  useEffect(() => {
    const verificarTiendaDelUsuario = async () => {
      if (!user?.email) return;
      try {
        const res = await fetch(`${STRAPI_URL}/api/stores?filters[email][$eq]=${user.email}`);
        const data = await res.json();

        if (data.data.length > 0) {
          const tienda = data.data[0];
          const nombre = tienda.attributes.name;
          const slug = tienda.attributes.slug || tienda.attributes.name;
          const { stripePayoutsEnabled, stripeChargesEnabled, stripeOnboarded, terminado } = tienda.attributes;

          setStoreName(nombre);

          if (terminado) {
            navigate(`/tienda/${slug}`);
            return;
          }

          if (stripePayoutsEnabled && stripeChargesEnabled && stripeOnboarded) {
            setActiveStep(2);
          } else {
            setActiveStep(1);
          }
        }
      } catch (err) {
        console.error("Error buscando tienda del usuario:", err);
      }
    };

    verificarTiendaDelUsuario();
  }, [user]);

  useEffect(() => {
    const eliminarTiendaDuplicada = async () => {
      if (!user?.email || !storeName) return;
      try {
        const res = await fetch(`${STRAPI_URL}/api/stores?filters[name][$eq]=${storeName}`);
        const data = await res.json();
        if (data.data.length > 1) {
          for (const tienda of data.data) {
            if (tienda.attributes.email !== user.email) {
              const id = tienda.id;
              await fetch(`${STRAPI_URL}/api/stores/${id}`, {
                method: "DELETE"
              });
              console.log("Tienda duplicada eliminada:", id);
            }
          }
        }
      } catch (err) {
        console.error("Error al eliminar tienda duplicada:", err);
      }
    };

    eliminarTiendaDuplicada();
  }, [storeName, user?.email]);

  const checkStoreName = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${STRAPI_URL}/api/stores?filters[name][$eq]=${storeName}`);
      const data = await res.json();

      if (data.data.length > 0) {
        setError("Ese nombre ya está registrado");
      } else {
        const createRes = await fetch(`${STRAPI_URL}/api/stores`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: {
              name: storeName,
              email: user.email,
              status: "pending"
            }
          })
        });
        if (createRes.ok) setActiveStep((prev) => prev + 1);
        else setError("Error al crear tienda");
      }
    } catch (err) {
      setError("Error de conexión");
    }
    setLoading(false);
  };

  const connectStripe = async () => {
    setLoading(true);
    try {
      const stripeRes = await fetch(`${STRAPI_URL}/api/stripe/onboarding-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeName, email: user.email })
      });
      const stripeData = await stripeRes.json();
      if (stripeRes.ok && stripeData.url) {
        window.location.href = stripeData.url;
      } else {
        setError("Error al conectar con Stripe");
      }
    } catch (err) {
      setError("Error en el proceso de Stripe");
    }
    setLoading(false);
  };

  const connectMienvio = async () => {
    setLoading(true);
    setError("");

    try {
      const updateRes = await fetch(`${STRAPI_URL}/api/stores?filters[email][$eq]=${user.email}`);
      const storeData = await updateRes.json();
      if (storeData.data.length === 0) throw new Error("Tienda no encontrada");
      const storeId = storeData.data[0].id;

      const patchRes = await fetch(`${STRAPI_URL}/api/stores/${storeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: {
            stripePayoutsEnabled: true,
            stripeChargesEnabled: true,
            stripeOnboarded: true,
            terminado: true
          }
        })
      });

      if (patchRes.ok) {
        setActiveStep((prev) => prev + 1);
      } else {
        throw new Error("Error al actualizar tienda");
      }
    } catch (err) {
      console.error(err);
      setError("Error al conectar con Mienvío");
    }

    setLoading(false);
  };

  if (!isAuthenticated)
    return <Button onClick={loginWithRedirect}>Inicia sesión</Button>;

  return (
    <Box className="agregar-producto-container">
      <Typography className="titulo">Registrar Tienda</Typography>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 && (
        <Box className="agregar-producto-form">
          <TextField
            label="Nombre de tu tienda"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            fullWidth
            disabled={loading}
          />
          {error && <p className="mensaje-error">{error}</p>}
          <Button
            onClick={checkStoreName}
            disabled={!storeName || loading}
            variant="contained"
            color="primary"
          >
            {loading ? <CircularProgress size={24} /> : "Siguiente"}
          </Button>
        </Box>
      )}

      {activeStep === 1 && (
        <Box className="agregar-producto-form">
          <Typography>Vamos a conectar tu cuenta de Stripe</Typography>
          {error && <p className="mensaje-error">{error}</p>}
          <Button
            onClick={connectStripe}
            disabled={loading}
            variant="contained"
            color="secondary"
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : "Conectar con Stripe"}
          </Button>
          <Typography sx={{ mt: 2 }} variant="body2">
            ¿Ya conectaste Stripe pero sigues aquí? Puede que haya fallado el proceso.
          </Typography>
          <Button
            onClick={connectStripe}
            disabled={loading}
            variant="outlined"
            color="warning"
            sx={{ mt: 1 }}
          >
            {loading ? <CircularProgress size={24} /> : "Reintentar conexión con Stripe"}
          </Button>
        </Box>
      )}

      {activeStep === 2 && (
        <Box className="agregar-producto-form">
          <Typography>Último paso: conectar Mienvío</Typography>
          {error && <p className="mensaje-error">{error}</p>}
          <Button
            onClick={connectMienvio}
            disabled={loading}
            variant="contained"
            color="success"
          >
            {loading ? <CircularProgress size={24} /> : "Conectar con Mienvío"}
          </Button>
        </Box>
      )}

      {activeStep === steps.length && (
        <Box className="mensaje-exito">
          <Typography variant="h4" gutterBottom>
            🎉 ¡Tienda registrada y conectada exitosamente!
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(`/tienda/${storeName.replace(/\s+/g, "-").toLowerCase()}`)}
          >
            Ir a tu tienda
          </Button>
        </Box>
      )}
    </Box>
  );
}
