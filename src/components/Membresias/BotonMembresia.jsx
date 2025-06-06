import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@mui/material";
import '../../styles/membresias.css';

function BotonMembresia({ plan = 'mensual', color = '#4caf50' }) {
  const { user } = useAuth0();

  const iniciarCheckout = async () => {
    try {
      let priceId;
      if (plan === 'mensual') {
        priceId = process.env.REACT_APP_STRIPE_PRICE_ID_MENSUAL;
      } else if (plan === 'semestral') {
        priceId = process.env.REACT_APP_STRIPE_PRICE_ID_SEMESTRAL;
      } else if (plan === 'anual') {
        priceId = process.env.REACT_APP_STRIPE_PRICE_ID_ANUAL;
      } else {
        console.error("Plan no reconocido:", plan);
        return;
      }

      const res = await axios.post(`${process.env.REACT_APP_STRAPI_URL}/api/checkout`, {
        email: user.email,
        priceId,
      });

      window.location.href = res.data.url;
    } catch (err) {
      console.error("Error al iniciar el checkout:", err);
    }
  };

  return (
    <Button
      variant="contained"
      onClick={iniciarCheckout}
      className="boton-membresia"
      style={{ backgroundColor: color }}
      sx={{
        '&:hover': {
          backgroundColor: `${color}cc`,
          boxShadow: `0 0 20px ${color}`,
        }
      }}
    >
      Comprar membresía
    </Button>
  );
}

export default BotonMembresia;
