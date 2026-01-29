import React, { useState, useEffect } from "react";
import formaters from "../../../utils/formaters";
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
  user,
}) => {
  const [datosGestion, setDatosGestion] = useState({
    direccion: "",
    telefono: "",
    email: "",
  });

  // helper: detecta si hay algún campo no vacío en direccionGestion
  const hasDireccionGestionContenido = (dg) => {
    if (!dg) return false;
    return Object.values(dg).some(
      (v) => v !== undefined && v !== null && String(v).trim() !== ""
    );
  };

  const buildDireccionLegal = (dg) => {
    if (!dg) return "-";
    // arma la dirección pensando en escritos legales
    const parts = [];

    const calleParte = dg.calle ? dg.calle : "-";
    let primeros = calleParte;
    if (dg.numero) primeros += ` no. ${dg.numero}`;
    if (dg.numero_interior) primeros += ` int. ${dg.numero_interior}`;
    parts.push(primeros);

    if (dg.colonia) parts.push(`Col. ${dg.colonia}`);

    // incluir ciudad si viene y es distinta del municipio
    if (dg.ciudad && String(dg.ciudad).trim() !== "") {
      if (!dg.municipio || dg.ciudad.trim().toLowerCase() !== String(dg.municipio).trim().toLowerCase()) {
        parts.push(dg.ciudad);
      }
    }

    if (dg.municipio) parts.push(dg.municipio);
    if (dg.estado) parts.push(dg.estado);

    const cpPart = dg.cp ? `C.P. ${dg.cp}` : null;
    if (cpPart) parts.push(cpPart);

    // unir y asegurar mayúsculas iniciales con tu utilitario
    const direccion = parts.join(", ");
    return formaters.capitalizeWords(direccion + (direccion !== "-" ? ", México" : ""));
  };

  useEffect(() => {
    // Solo aplica para gestión asistida
    if (form.cofeprismode === "folio") return;

    let direccionResuelta = "-";

    if (hasDireccionGestionContenido(form.direccionGestion)) {
      // priorizamos la dirección manual construida para escritos legales
      direccionResuelta = buildDireccionLegal(form.direccionGestion);
    } else if (form.direccion) {
      // si no hay dirección manual, usamos la dirección existente / formateada
      direccionResuelta = formaters.capitalizeWords(
        formaters.formatearDireccionConInterior(
          form.direccion_formateada,
          form.numero_interior
        ) || form.direccion || "-"
      );
    } else if (form.direccionGestion) {
      // fallback: si existe objeto pero no tiene campos útiles
      direccionResuelta = buildDireccionLegal(form.direccionGestion);
    }

    // Teléfono
    const telefonoResuelto = form.usarWhatsappExistente
      ? form.whatsapp || "-"
      : form.telefonoGestion || "-";

    // Email
    const emailResuelto = form.usarEmailExistente
      ? user?.email || "-"
      : form.emailGestion || "-";

    const nuevosDatosGestion = {
      direccion: direccionResuelta,
      telefono: telefonoResuelto,
      email: emailResuelto,
    };

    // estado local (visual)
    setDatosGestion(nuevosDatosGestion);

    // persistir en el FORM del stepper
    setForm((prev) => {
      // evita loop si ya es lo mismo
      if (
        prev?.datosGestion?.direccion === nuevosDatosGestion.direccion &&
        prev?.datosGestion?.telefono === nuevosDatosGestion.telefono &&
        prev?.datosGestion?.email === nuevosDatosGestion.email
      ) {
        return prev;
      }

      return {
        ...prev,
        datosGestion: nuevosDatosGestion,
      };
    });
  }, [form, user, setForm]);

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
                label={
                  form?.direccion ? (
                    <Box>
                      <Typography variant="body2">Usar domicilio que ya tenemos:</Typography>
                      <Typography variant="body2" sx={{ ml: 3, mt: 0.5, color: "text.secondary" }}>
                        {datosGestion.direccion}
                      </Typography>
                    </Box>
                  ) : (
                    "No hay domicilio guardado"
                  )
                }
              />
              {(form.direccion && form.usarDireccionExistente) ? `${form.direccion}` : ""}
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

                  <Grid item xs={6} sm={2}>
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

                  <Grid item xs={6} sm={2}>
                    <TextField
                      label="Número interior"
                      fullWidth
                      margin="dense"
                      name="numero_interior"
                      value={form.direccionGestion?.numero_interior || ""}
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
                      label="Ciudad / Localidad"
                      fullWidth
                      margin="dense"
                      name="ciudad"
                      value={form.direccionGestion?.ciudad || ""}
                      onChange={handleNestedChange("direccionGestion")}
                      color="success"
                      helperText="Opcional pero recomendado para escritos legales"
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

                  <Grid item xs={6} sm={3}>
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

                  <Grid item xs={6} sm={3}>
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
  );
};

export default CofeprisGestionDatosForm;
