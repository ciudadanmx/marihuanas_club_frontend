return (
  <Paper elevation={4} className="agregar-producto-container">
    <Typography variant="h5" fontWeight="bold" mb={2}>
      <span className="titulo">🛒 Agregar Producto</span>
    </Typography>

    <Divider sx={{ mb: 2 }} />

    <form onSubmit={handleSubmit} className="agregar-producto-form">
      <Slide direction="up" in mountOnEnter unmountOnExit>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            className="input-text"
            label="Nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            className="input-text"
            label="Descripción"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            multiline
            rows={3}
            fullWidth
          />
          <TextField
            className="input-text"
            label="Precio"
            name="precio"
            type="number"
            value={formData.precio}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            className="input-text"
            label="Marca"
            name="marca"
            value={formData.marca}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            className="input-text"
            select
            label="Categoría"
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            fullWidth
          >
            {categorias.map(cat => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.attributes.nombre}
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
            <TextField
              className="input-text"
              label="Stock"
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleChange}
              fullWidth
            />
          )}

          {/* Campos de medidas y peso integrados correctamente */}
          <TextField
            className="input-text"
            label="Alto (cm)"
            name="alto"
            type="number"
            value={formData.alto}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            className="input-text"
            label="Ancho (cm)"
            name="ancho"
            type="number"
            value={formData.ancho}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            className="input-text"
            label="Largo (cm)"
            name="largo"
            type="number"
            value={formData.largo}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            className="input-text"
            label="Peso (kg)"
            name="peso"
            type="number"
            value={formData.peso}
            onChange={handleChange}
            required
            fullWidth
          />

          {/* Subir imágenes */}
          <div>
            <Button variant="outlined" component="label" className="boton-subir">
              📸 Subir Imágenes
              <input
                type="file"
                accept="image/*"
                hidden
                multiple
                onChange={handleImagenes}
              />
            </Button>

            <div className="preview-container">
              {previewImages.map((src, index) => (
                <div key={index} className="preview-image">
                  <img src={src} alt={`preview-${index}`} />
                  <button type="button" onClick={() => eliminarImagen(index)}>✖</button>
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