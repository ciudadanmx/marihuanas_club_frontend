import React, { useEffect, useState } from 'react';
import {
  Typography,
  TextField,
  Button,
  Stack,
  Card,
  CardContent,
  Divider,
  Box,
  CircularProgress
} from '@mui/material';
import BoltIcon from "@mui/icons-material/Bolt";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';

import { useCart } from '../../Contexts/CartContext';
import useFavoritos from '../../hooks/useFavoritos';
import { useAuth0 } from '@auth0/auth0-react';

import '../../styles/DetalleProducto.css';

const MotionButton = motion(Button);

const DetalleProducto = ({
  producto,
  precio,
  marca,
  stock,
  vendidos,
  localidad,
  estado,
  cantidad,
  handleCantidadChange
}) => {
  const STRAPI_URL = process.env.REACT_APP_STRAPI_URL;
  const [costoEnvio, setCostoEnvio] = useState('Calculando...');
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const { user, isAuthenticated } = useAuth0();

  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const [favLoading, setFavLoading] = useState(false);
  const [favAdded, setFavAdded] = useState(false);

  const { addFavorito } = useFavoritos({
    user: user
      ? {
          email: user.email,
        }
      : null,
    token: null,
  });

  const calcularEnvio = async () => {
    try {
      const cp_origen = producto?.attributes?.cp_origen || '01000';
      const cp_destino = producto?.attributes?.cp_destino || '02800';
      const largo= 2;
      const ancho= 2;
      const alto= 2;
      const peso= 2;

      const response = await fetch(`${STRAPI_URL}/api/shipping/calcular`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cp_origen, cp_destino, cantidad, largo, ancho, alto, peso })
      });

      if (response.ok) {
        const res = await response.json();
        setCostoEnvio(`$${res.costo}`);
      } else {
        setCostoEnvio('No disponible');
      }
    } catch (e) {
      console.error('[ENVÍO] Error:', e);
      setCostoEnvio('No disponible');
    }
  };

  useEffect(() => {
    calcularEnvio();
    console.log('envio');
  }, [cantidad]);

  const handleAddToCart = async () => {
    if (!producto?.id || !producto?.attributes) return;
    if (adding) return;

    setAdding(true);
    try {
      const result = addToCart({
        id: producto.id,
        nombre: producto.attributes.nombre,
        marca: producto.attributes.marca,
        precio: producto.attributes.precio,
        imagen_predeterminada: producto.attributes.imagen_predeterminada?.data?.attributes,
      }, cantidad);

      if (result && typeof result.then === 'function') {
        await result;
      }

      await new Promise((r) => setTimeout(r, 500));
      setAdded(true);
    } catch (e) {
      console.error('[CART] Error al agregar:', e);
    } finally {
      setAdding(false);
    }
  };

  const handleAddFavorito = async () => {
    if (!isAuthenticated || !producto?.id) return;
    if (favLoading || favAdded) return;

    setFavLoading(true);
    try {
      await addFavorito({
        tipo: 'producto',
        id: producto.id,
        url: `/market/producto/${producto?.attributes?.slug || producto.id}`,
      });

      setFavAdded(true);
    } catch (e) {
      console.error('[FAVORITOS] Error:', e);
    } finally {
      setFavLoading(false);
    }
  };

  const handleBuy = () => {
    const slug = producto?.attributes?.slug || producto?.id;
    navigate(`/market/comprar/${slug}`);
  };

  return (
    <div className="mt-6 z-10 producto-layout">
      <Card className="producto-card" elevation={10}>
        <CardContent>
          <Typography variant="h3" className="producto-precio">
            ${precio?.toFixed(2) || '0.00'}
          </Typography>

          <Divider sx={{ my: 3, borderColor: '#A5D6A7' }} />

          <Box className="producto-detalle">
            <Typography variant="body1"><strong>🌿 Marca:</strong> {marca || 'Desconocida'}</Typography>
            <Typography variant="body1"><strong>📦 Stock:</strong> {stock ?? 'N/A'}</Typography>
            <Typography variant="body1"><strong>🔥 Vendidos:</strong> {vendidos ?? 0}</Typography>
            <Typography variant="body1"><strong>📍 Localidad:</strong> {localidad ?? 'N/A'}, {estado ?? ''}</Typography>
            <Typography variant="body1"><strong>🚚 Envío:</strong> {costoEnvio}</Typography>
          </Box>

          <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" className="cantidad-stack">
            <Button className="icon-button" onClick={() => handleCantidadChange(Math.max(1, cantidad - 1))}>
              <span className="material-icons">remove</span>
            </Button>
            <TextField
              value={cantidad}
              onChange={(e) => handleCantidadChange(Number(e.target.value))}
              type="number"
              inputProps={{ min: 1, max: stock }}
              size="small"
              className="cantidad-input"
            />
            <Button className="icon-button" onClick={() => handleCantidadChange(Math.min(stock, cantidad + 1))}>
              <span className="material-icons">add</span>
            </Button>
          </Stack>

          <MotionButton
            onClick={ added ? () => navigate('/market/carrito') : handleAddToCart }
            variant="contained"
            startIcon={
              adding ? <CircularProgress size={18} /> : <AddShoppingCartIcon />
            }
            sx={{
              backgroundColor: "#fff200",
              color: "#000",
              fontWeight: 700,
              textTransform: "none",
              borderRadius: "12px",
              padding: "10px 18px",
              "&:hover": { backgroundColor: "#e6d700" },
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            disabled={adding}
          >
            { adding ? 'Cargando...' : (added ? 'Ir al carrito' : 'Agregar al carrito') }
          </MotionButton>

          <MotionButton
            onClick={handleAddFavorito}
            variant="outlined"
            startIcon={
              favLoading
                ? <CircularProgress size={18} />
                : favAdded
                ? <FavoriteIcon />
                : <FavoriteBorderIcon />
            }
            sx={{
              borderColor: "#fff200",
              color: "#000",
              fontWeight: 700,
              textTransform: "none",
              borderRadius: "12px",
              padding: "10px 18px",
              mt: 2,
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            disabled={favLoading || favAdded || !isAuthenticated}
          >
            {favLoading ? 'Guardando...' : favAdded ? 'En favoritos' : 'Agregar a favoritos'}
          </MotionButton>

          <MotionButton
            onClick={handleBuy}
            variant="contained"
            startIcon={<BoltIcon />}
            sx={{
              backgroundColor: "#6d6e71",
              color: "#fff",
              fontWeight: 700,
              textTransform: "none",
              borderRadius: "12px",
              padding: "10px 18px",
              mt: 2,
              "&:hover": { backgroundColor: "#56575a" },
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            Comprar
          </MotionButton>

        </CardContent>
      </Card>
    </div>
  );
};

export default DetalleProducto;
