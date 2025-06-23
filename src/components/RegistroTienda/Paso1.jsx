import {useState} from "react"

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

export default function Paso1(storeName, user)  {


    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const connectStripe = async () => {
        setLoading(true);
        try {
          const stripeRes = await fetch(`http:localhost:1337/api/stripe/onboarding-link`, {
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

    return (<Box className="agregar-producto-form">
            <Typography>Vamos a conectar tu cuenta de Stripe</Typography>
            {error && <p className="mensaje-error">{error}</p>}
            <Button
                onClick={connectStripe}
                disabled={loading}
                variant="contained"
                color="secondary"
            >
                {loading ? <CircularProgress size={24} /> : "Conectar con Stripe"}
            </Button>
            </Box>
    );

}