import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@mui/material";
import '../../styles/membresias.css';

function BotonMembresia({ plan = 'mensual', color = '#4caf50' }) {
  const { user } = useAuth0();

  const iniciarCheckout = async () => {
    try {
      const res = await axios.post("http://localhost:1337/api/checkout", {
        email: user.email,
        plan,
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
