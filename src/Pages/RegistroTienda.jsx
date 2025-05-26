import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useStores } from "../hooks/useStores";
import {
  Stepper, Step, StepLabel, Button, TextField,
  CircularProgress, Box, Typography
} from "@mui/material";
import { useAuth0 } from "@auth0/auth0-react";
import { slugify } from "../utils/slugify.jsx";

const steps = ["Nombre de la tienda", "Conectar Stripe", "Conectar Mienvío"];

export default function RegisterStoreStepper() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, loginWithRedirect } = useAuth0();

  const [activeStep, setActiveStep] = useState(0);
  const [storeName, setStoreName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [laTienda, setLaTienda] = useState(null);

  const {
    createStore,
    getStoreBySlug,
    getStoreByEmail,
    updateStore,
    onboardingStripe,
    finishStoreSetup,
    deleteDuplicateStores
  } = useStores();

  // 1. Verificar regreso de Stripe
  useEffect(() => {
    const verificarStripeDesdeSlug = async () => {
      if (!location.state?.fromStripe || !location.state?.slug) return;
      console.log('...vengo de stripe');

      try {
        console.log('desde ek tryyyyy');
        const tiendas = await getStoreBySlug(location.state.slug);
        if (!tiendas?.length) return;
        console.log('slugify--------------');
        const tienda = tiendas[0];
        setLaTienda(tienda);
        const attrs = tienda.attributes;
        setStoreName(attrs.name);
        console.log('slugify--------------');

        if (attrs.stripeOnboarded && attrs.stripePayoutsEnabled && attrs.stripeChargesEnabled) {
          setActiveStep(2);
        } else if (attrs.stripeAccountId) {
          await updateStore(tienda.id, {
            stripeOnboarded: true,
            stripePayoutsEnabled: true,
            stripeChargesEnabled: true,
            slug: slugify(storeName),
            name: slugify(storeName)
          });
          setActiveStep(1);
        }
      } catch (err) {
        console.error("Error verificando Stripe desde slug", err);
      }
    };

    verificarStripeDesdeSlug();
  }, [location.state]);

  // 2. Verificar si ya hay tienda registrada por email
  useEffect(() => {
    const verificarTiendaDelUsuario = async () => {
      if (!user?.email) return;

      try {
        const tienda = await getStoreByEmail(user.email);
        if (!tienda || !tienda[0]?.attributes) return;

        const {
          name,
          slug,
          stripePayoutsEnabled,
          stripeChargesEnabled,
          stripeOnboarded,
          terminado
        } = tienda[0].attributes;

        setStoreName(name);
        setLaTienda(tienda[0]);

        if (terminado) {
          navigate(`/market/store/${slug}`);
        } else if (stripeOnboarded && stripePayoutsEnabled && stripeChargesEnabled) {
          setActiveStep(2);
        } else {
            console.log(`activando segundo paso --- **** ${slugify(storeName)}`);
          setActiveStep(1);
        }
      } catch (err) {
        console.error("Error buscando tienda", err);
      }
    };

    verificarTiendaDelUsuario();
  }, [user]);

  // 3. Limpiar duplicados
  useEffect(() => {
    if (storeName && user?.email) {
      const slug = slugify(storeName);
      deleteDuplicateStores(slug, user.email);
    }
  }, [storeName, user?.email]);

  // 4. Crear tienda
  const handleCheckAndCreate = async () => {
    setLoading(true);
    setError("");

    try {
      const slug = slugify(storeName);
      const tiendas = await getStoreBySlug(slug);

      if (tiendas.length > 0) {
        setError("Ese nombre ya está registrado");
      } else {
        const nueva = await createStore({ name: storeName, email: user.email });
        setLaTienda(nueva.data);
        setActiveStep(1);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al crear tienda");
    } finally {
      setLoading(false);
    }
  };

  // 5. Conectar Stripe
  const handleStripeConnect = async () => {
    setLoading(true);
    setError("");

    try {
      const url = await onboardingStripe(storeName, user.email);
      window.location.href = url;
    } catch (err) {
      setError("Error al conectar con Stripe");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 6. Conectar Mienvío
  const handleFinishSetup = async () => {
    setLoading(true);
    setError("");

    try {
      await finishStoreSetup(laTienda.id, slugify(storeName));
      setActiveStep(3);
    } catch (err) {
      console.error(err);
      setError("Error al conectar con Mienvío");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <Button onClick={loginWithRedirect}>Inicia sesión</Button>;
  }

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
            onClick={handleCheckAndCreate}
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
            onClick={handleStripeConnect}
            disabled={loading}
            variant="contained"
            color="secondary"
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : "Conectar con Stripe"}
          </Button>
        </Box>
      )}

      {activeStep === 2 && (
        <Box className="agregar-producto-form">
          <Typography>Último paso: conectar Mienvío</Typography>
          {error && <p className="mensaje-error">{error}</p>}
          <Button
            onClick={handleFinishSetup}
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
            onClick={() =>
              navigate(`/market/store/${slugify(storeName)}`)
            }
          >
            Ir a tu tienda
          </Button>
        </Box>
      )}
    </Box>
  );
}
