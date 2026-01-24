import React, { useEffect } from 'react'
import {
  Box,
  Typography,
  Grid,
  TextField,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Divider,
} from "@mui/material";
import CofeprisFolioSection from './CofeprisFolioSection';

/**
 * ============================================================
 * Componente: GestionCofepris
 * ------------------------------------------------------------
 * Maneja:
 *  - Solicitud de gestión completa del trámite COFEPRIS
 *  - Captura de folio cuando el trámite ya fue concluido
 * ============================================================
 */
const GestionCofepris = ({
  form,
  isActivaMembresia,
  consumoOption,
  selectConsumoOption,
  handleFormChange,
  handleNestedChange,
  user,
  setFocusedField,
  goGeneradorLibre,
}) => {

  /**
   * Normalizamos el estado de la membresía
   * Puede llegar como función o como booleano
   */
  const membresiaActiva =
    typeof isActivaMembresia === "function"
      ? isActivaMembresia()
      : !!isActivaMembresia;

  /**
   * Si hay membresía activa y no hay opción definida,
   * por defecto se selecciona "gestión"
   */
  useEffect(() => {
    if (membresiaActiva && !consumoOption) {
      selectConsumoOption("gestion");
    }
  }, [membresiaActiva, consumoOption, selectConsumoOption]);

  return (
    <>
      <Divider sx={{ my: 3, borderColor: "rgba(104, 64, 92, 0.57)" }} />

      <Typography variant="h6" mb={2}>
        <u>Permiso COFEPRIS / Trámite</u>
      </Typography>

      <Typography variant="body2" mb={2} sx={{ color: "#9c27b0" }}>
        Selecciona la opción que corresponda a tu situación.
      </Typography>

      <FormGroup>

        {/* =====================================================
            OPCIÓN 1 (PRINCIPAL)
            SOLICITAR LA GESTIÓN COMPLETA DEL TRÁMITE
            - Visible solo con membresía activa
            - Opción por defecto
        ===================================================== */}
        {membresiaActiva && (
          <FormControlLabel
            control={
              <Checkbox
                name="opcGestion"
                checked={consumoOption === "gestion"}
                onChange={() => selectConsumoOption("gestion")}
                color="success"
              />
            }
            label="📝 Solicitar la gestión de mi trámite"
          />
        )}

        {/* =====================================================
            CONTENIDO DE LA OPCIÓN: GESTIÓN
        ===================================================== */}
        {consumoOption === "gestion" && membresiaActiva && (
          <Box
            sx={{
              pl: 4,
              pr: 2,
              pb: 2,
              mt: 1,
              borderLeft: "3px solid rgba(156,39,176,0.12)"
            }}
          >
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

              {/* ================= DOMICILIO ================= */}
              <Grid item xs={12}>
                <Typography variant="subtitle2">
                  Domicilio para el trámite:
                </Typography>

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
                    label={
                      form?.direccion
                        ? "Usar domicilio que ya tenemos"
                        : "No hay domicilio guardado"
                    }
                  />
                </FormGroup>

                {/* Mostrar domicilio existente */}
                {(form.direccion && form.usarDireccionExistente) && (
                  <Typography variant="body2" sx={{ ml: 4 }}>
                    {form.direccion}
                  </Typography>
                )}

                {/* Captura manual del domicilio */}
                {!(form.usarDireccionExistente ?? !!form?.direccion) && (
                  <Box sx={{ mt: 1 }}>
                    <Grid container spacing={1}>
                      {["calle", "numero", "colonia", "municipio", "estado", "cp"].map((campo) => (
                        <Grid
                          item
                          xs={12}
                          sm={campo === "calle" ? 8 : campo === "numero" ? 4 : 6}
                          key={campo}
                        >
                          <TextField
                            label={campo.charAt(0).toUpperCase() + campo.slice(1)}
                            fullWidth
                            margin="dense"
                            name={campo}
                            value={form.direccionGestion?.[campo] || ""}
                            onChange={handleNestedChange("direccionGestion")}
                            color="success"
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Grid>

              {/* ================= TELÉFONO ================= */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">
                  Teléfono de contacto:
                </Typography>

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
                    label={
                      form?.whatsapp
                        ? `Usar whatsapp: ${form.whatsapp}`
                        : "No hay whatsapp guardado"
                    }
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

              {/* ================= EMAIL ================= */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">
                  Correo electrónico:
                </Typography>

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
                    label={
                      user?.email
                        ? `Usar email: ${user.email}`
                        : "No hay email de usuario"
                    }
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
        )}

        {/* =====================================================
            OPCIÓN 2
            YA CUENTO CON UN FOLIO (TRÁMITE CONCLUIDO)
        ===================================================== */}
        <FormControlLabel
          sx={{ mt: consumoOption === "gestion" ? 2 : 0 }}
          control={
            <Checkbox
              name="opcFolio"
              checked={consumoOption === "folio"}
              onChange={() => selectConsumoOption("folio")}
              color="success"
            />
          }
          label="✅ Ya cuento con un folio"
        />

        {consumoOption === "folio" && (
            <CofeprisFolioSection 
                form={form}
                handleFormChange={handleFormChange}
                setFocusedField={setFocusedField}
            />
        )}

      </FormGroup>
    </>
  )
}

export default GestionCofepris
