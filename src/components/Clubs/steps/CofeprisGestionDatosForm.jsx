import React from 'react'
import {
  Box,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
} from "@mui/material";

const CofeprisGestionDatosForm = ({    
    form,
    setForm,
    handleFormChange,
    handleNestedChange,
    user
}) => {
  return (
    <>
      <Box sx={{ pl: 4, pr: 2, pb: 2, borderLeft: "3px solid rgba(156,39,176,0.12)" }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Completa los datos para que generemos y gestionemos tu trámite.
        </Typography>

        <Grid container spacing={2}>

          {/* CURP */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="CURP"
              fullWidth
              name="curp"
              value={form.curp || ""}
              onChange={handleFormChange}
              margin="normal"
              color="success"
            />
          </Grid>

          {/* RFC */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="RFC"
              fullWidth
              name="rfc"
              value={form.rfc || ""}
              onChange={handleFormChange}
              margin="normal"
              color="success"
            />
          </Grid>

          {/* DOMICILIO */}
          <Grid item xs={12}>
            <Typography variant="subtitle2">Domicilio para el trámite:</Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    name="usarDireccionExistente"
                    checked={form.usarDireccionExistente ?? !!form?.direccion}
                    onChange={handleFormChange}
                    color="success"
                  />
                }
                label={form?.direccion ? "Usar domicilio que ya tenemos" : "No hay domicilio guardado"}
              />
              {(form.direccion && form.usarDireccionExistente) ? `${form.direccion}` : '' }
            </FormGroup>

            {!(form.usarDireccionExistente ?? !!form?.direccion) && (
              <Box sx={{ mt: 1 }}>
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={8}>
                    <TextField
                      label="Calle"
                      fullWidth
                      margin="dense"
                      name="calle"
                      value={form.direccionGestion?.calle || ""}
                      onChange={handleNestedChange("direccionGestion")}
                      color="success"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Número"
                      fullWidth
                      margin="dense"
                      name="numero"
                      value={form.direccionGestion?.numero || ""}
                      onChange={handleNestedChange("direccionGestion")}
                      color="success"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Colonia"
                      fullWidth
                      margin="dense"
                      name="colonia"
                      value={form.direccionGestion?.colonia || ""}
                      onChange={handleNestedChange("direccionGestion")}
                      color="success"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Municipio / Alcaldía"
                      fullWidth
                      margin="dense"
                      name="municipio"
                      value={form.direccionGestion?.municipio || ""}
                      onChange={handleNestedChange("direccionGestion")}
                      color="success"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Estado"
                      fullWidth
                      margin="dense"
                      name="estado"
                      value={form.direccionGestion?.estado || ""}
                      onChange={handleNestedChange("direccionGestion")}
                      color="success"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Código Postal"
                      fullWidth
                      margin="dense"
                      name="cp"
                      value={form.direccionGestion?.cp || ""}
                      onChange={handleNestedChange("direccionGestion")}
                      color="success"
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
          </Grid>

          {/* TELÉFONO */}
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Teléfono de contacto:</Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    name="usarWhatsappExistente"
                    checked={form.usarWhatsappExistente ?? !!form?.whatsapp}
                    onChange={handleFormChange}
                    color="success"
                  />
                }
                label={form?.whatsapp ? `Usar whatsapp: ${form.whatsapp}` : "No hay whatsapp guardado"}
              />
            </FormGroup>

            {!(form.usarWhatsappExistente ?? !!form?.whatsapp) && (
              <TextField
                label="Teléfono (ej. 55xxxxxxxx)"
                fullWidth
                margin="dense"
                name="telefonoGestion"
                value={form.telefonoGestion || ""}
                onChange={handleFormChange}
                color="success"
              />
              )}
          </Grid>

          {/* EMAIL */}
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Correo electrónico:</Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    name="usarEmailExistente"
                    checked={form.usarEmailExistente ?? !!user?.email}
                    onChange={handleFormChange}
                    color="success"
                  />
                }
                label={user?.email ? `Usar email: ${user.email}` : "No hay email de usuario"}
              />
            </FormGroup>

            {!(form.usarEmailExistente ?? !!user?.email) && (
              <TextField
                label="Email de contacto"
                fullWidth
                margin="dense"
                name="emailGestion"
                value={form.emailGestion || ""}
                onChange={handleFormChange}
                color="success"
              />
            )}
          </Grid>
        </Grid>

      </Box>
</>
  )
}

export default CofeprisGestionDatosForm