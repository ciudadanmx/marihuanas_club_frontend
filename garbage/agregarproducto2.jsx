import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, MenuItem, Switch, FormControlLabel,
  Button, Paper, Divider, Fade, Slide
} from '@mui/material';  
import { useAuth0 } from '@auth0/auth0-react';
import useProductos from '../src/hooks/useProductos'; // ✅ usamos hook personalizado
import '../styles/AgregarProducto.css';

const AgregarProducto = () => {
  const { user, isAuthenticated } = useAuth0();
  const { getCategorias, getStoreByEmail, crearProducto } = useProductos(); // ✅ del hook

  const [categorias, setCategorias] = useState([]);
  const [imagenes, setImagenes] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [storeId, setStoreId] = useState(null);
  const [guardado, setGuardado] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    marca: '',
    categoria: '',
    stockEnabled: false,
    stock: '',
  });

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const data = await getCategorias();
        setCategorias(data);
      } catch (err) {
        console.error('Error al cargar categorías', err);
      }
    };
    fetchCategorias();
  }, [getCategorias]);

  useEffect(() => {
    const fetchStoreId = async () => {
      if (!user?.email) return;
      try {
        const tienda = await getStoreByEmail(user.email);
        if (tienda?.id) {
          setStoreId(tienda.id);
        }
      } catch (err) {
        console.error('Error al buscar tienda', err);
      }
    };
    if (isAuthenticated) fetchStoreId();
  }, [user, isAuthenticated, getStoreByEmail]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImagenes = (e) => {
    const files = Array.from(e.target.files);
    setImagenes(prev => [...prev, ...files]);
    setPreviewImages(prev => [
      ...prev,
      ...files.map(file => URL.createObjectURL(file)),
    ]);
  };

  const eliminarImagen = (index) => {
    setImagenes(prev => prev.filter((_, i) => i !== index));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!storeId) return alert('No se ha vinculado tienda para este usuario.');

    const stockValue = formData.stockEnabled ? parseFloat(formData.stock) : -1;

    const productoData = {
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      precio: formData.precio,
      marca: formData.marca,
      stock: stockValue,
      store_email: user.email,
      categoria: formData.categoria,
      store_id: String(storeId),
    };

    try {
      await crearProducto(productoData, imagenes); // ✅ usamos la función del hook
      setFormData({
        nombre: '', descripcion: '', precio: '', marca: '',
        categoria: '', stockEnabled: false, stock: ''
      });
      setImagenes([]);
      setPreviewImages([]);
      setGuardado(true);
    } catch (err) {
      console.error('Error al guardar producto:', err);
      alert(`Error al guardar producto: ${err.message || 'ver consola'}`);
    }
  };

  if (!isAuthenticated) return <p className="mensaje-sesion">Debes iniciar sesión para agregar productos.</p>;
  if (guardado) return <Fade in><p className="mensaje-exito">✅ Producto guardado con éxito.</p></Fade>;
  if (!storeId) return <p className="mensaje-sesion">No se encontró ninguna tienda asociada</p>;

  return (
    <Paper elevation={4} className="agregar-producto-container">
      <Typography variant="h5" fontWeight="bold" mb={2}>
        <span className="titulo">🛒 Agregar Producto</span>
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <form onSubmit={handleSubmit} className="agregar-producto-form">
        <Slide direction="up" in mountOnEnter unmountOnExit>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField label="Nombre" name="nombre" value={formData.nombre} onChange={handleChange} required fullWidth />
            <TextField label="Descripción" name="descripcion" value={formData.descripcion} onChange={handleChange} multiline rows={3} fullWidth />
            <TextField label="Precio" name="precio" type="number" value={formData.precio} onChange={handleChange} required fullWidth />
            <TextField label="Marca" name="marca" value={formData.marca} onChange={handleChange} fullWidth />
            <TextField select label="Categoría" name="categoria" value={formData.categoria} onChange={handleChange} fullWidth>
              {categorias.map(cat => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.attributes?.nombre}
                </MenuItem>
              ))}
            </TextField>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.stockEnabled}
                  onChange={() =>
                    setFormData(prev => ({
                      ...prev,
                      stockEnabled: !prev.stockEnabled,
                      stock: !prev.stockEnabled ? '' : prev.stock
                    }))
                  }
                />
              }
              label="Habilitar control de stock"
            />

            {formData.stockEnabled && (
              <TextField label="Stock" name="stock" type="number" value={formData.stock} onChange={handleChange} fullWidth />
            )}

            <div>
              <Button variant="outlined" component="label" className="boton-subir">
                📸 Subir Imágenes
                <input type="file" accept="image/*" hidden multiple onChange={handleImagenes} />
              </Button>

              <div className="preview-container">
                {previewImages.map((src, index) => (
                  <div key={index} className="preview-item">
                    <img src={src} alt={`preview-${index}`} className="preview-img" />
                    <Button onClick={() => eliminarImagen(index)}>❌</Button>
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" variant="contained" color="primary">
              Guardar Producto
            </Button>
          </Box>
        </Slide>
      </form>
    </Paper>
  );
};

export default AgregarProducto;
