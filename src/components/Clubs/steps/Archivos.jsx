import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Divider,
  Typography,
  Input,
  Grid,
  TextField,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Stack,
  FormHelperText,
} from "@mui/material";
import { useRoles } from "../../../Contexts/RolesContext";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

export default function Archivos({ form, setForm, tipo }) {
  const [focusedField, setFocusedField] = useState(null);

  // Auth y roles (corrige uso)
  const { user, isAuthenticated } = useAuth0();
  const { isActivaMembresia } = useRoles();

  const navigate = useNavigate();

  // Estados de checkboxes y campos temporales para la gestión
  const [opcFolio, setOpcFolio] = useState(true); // "Ya cuento con un folio" por defecto
  const [opcGestion, setOpcGestion] = useState(false);
  const [opcPorMi, setOpcPorMi] = useState(false);

  // Campos para la gestión (si se selecciona)
  const [curp, setCurp] = useState(form?.curp || "");
  const [rfc, setRfc] = useState(form?.rfc || "");
  // Domicilio: permitimos usar el existente (form.direccion) o editar
  const [usarDireccionExistente, setUsarDireccionExistente] = useState(
    !!form?.direccion
  );
  const [direccionGestion, setDireccionGestion] = useState(
    form?.direccion || {
      calle: "",
      numero: "",
      colonia: "",
      municipio: "",
      estado: "",
      cp: "",
    }
  );

  // Teléfono: usar form.whatsapp o introducir uno
  const [usarWhatsappExistente, setUsarWhatsappExistente] = useState(
    !!form?.whatsapp
  );
  const [telefonoGestion, setTelefonoGestion] = useState(form?.whatsapp || "");

  // Email: usar user.email o editar
  const [usarEmailExistente, setUsarEmailExistente] = useState(!!user?.email);
  const [emailGestion, setEmailGestion] = useState(user?.email || "");

  // Folio para "ya cuento con un folio"
  const [folio, setFolio] = useState(form?.cofepris || "");

  useEffect(() => {
    // sincronizar algunos campos con form si cambia externamente
    setFolio(form?.cofepris || "");
    setDireccionGestion(form?.direccion || direccionGestion);
    setTelefonoGestion(form?.whatsapp || telefonoGestion);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form?.cofepris, form?.direccion, form?.whatsapp]);

  const handleFileChange = (e) => {
    const { name, files } = e.target;

    if (name === "foto_perfil") {
      setForm((f) => ({ ...f, foto_perfil: files[0] }));
    } else if (name === "fotos_club") {
      setForm((f) => ({
        ...f,
        fotos_club: [...(f.fotos_club || []), ...Array.from(files)],
      }));
    }
  };

  const removeFotoClub = (index) => {
    setForm((f) => ({
      ...f,
      fotos_club: f.fotos_club.filter((_, i) => i !== index),
    }));
  };

  // 🧠 HANDLERS CAMPOS TEXTO 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Cuando el usuario pide que gestionemos su trámite
  const handleSolicitarGestion = () => {
    // Validaciones básicas (puedes ampliarlas)
    if (!curp || !rfc) {
      alert("Por favor completa CURP y RFC antes de solicitar la gestión.");
      return;
    }
    if (!usarDireccionExistente) {
      const d = direccionGestion;
      if (!d.calle || !d.colonia || !d.municipio || !d.estado || !d.cp) {
        alert("Por favor completa el domicilio para la gestión.");
        return;
      }
    }
    if (!usarWhatsappExistente && !telefonoGestion) {
      alert("Ingresa un teléfono para contacto.");
      return;
    }
    if (!usarEmailExistente && !emailGestion) {
      alert("Ingresa un correo electrónico para contacto.");
      return;
    }

    // Construimos objeto de gestión y lo guardamos en form (o lo puedes enviar a tu API)
    const gestion = {
      tipo: "cofepris",
      solicitado_por: user?.email || form?.email || null,
      curp,
      rfc,
      direccion: usarDireccionExistente ? form?.direccion : direccionGestion,
      telefono: usarWhatsappExistente ? form?.whatsapp : telefonoGestion,
      email: usarEmailExistente ? user?.email : emailGestion,
      estado_solicitud: "pendiente",
      fecha_solicitud: new Date().toISOString(),
    };

    setForm(prev => ({ ...prev, cofeprisGestion: gestion, cofepris: prev.cofepris || "" }));
    // Aquí podrías llamar a la API para crear la gestión; por ahora dejamos todo en form.
    console.log("Solicitud de gestión COFEPRIS preparada:", gestion);
    alert("Solicitud de gestión preparada. Revisa tus datos y confirma en la siguiente pantalla (esto es un ejemplo).");
  };

  const goGeneradorLibre = () => {
    navigate("/legal/generadorlibre");
  };

  return (
    <Box>
      {/* --- Partes previas del componente --- */}
      <Typography variant="h6" mb={2}>
        <u>🖼️ Foto de Portada del Club:</u>
      </Typography>

      <Typography variant="body1" mb={2}>
        Selecciona la imagen de portada para el perfil público de tu Club.
      </Typography>

      <Button
        variant="contained"
        component="label"
        sx={{
          backgroundColor: "#9c27b0",
          "&:hover": { backgroundColor: "#7b1fa2" },
        }}
      >
        ⬆️ Subir Foto de Portada:
        <Input
          type="file"
          name="foto_perfil"
          accept="image/*"
          onChange={handleFileChange}
          sx={{ display: "none" }}
        />
      </Button>

      {form?.foto_perfil && (
        <Box mt={2}>
          <Typography
            variant="subtitle2"
            sx={{ fontStyle: "italic", color: "#9c27b0", fontSize: "0.85rem" }}
          >
            Vista previa:
          </Typography>
          <img
            src={URL.createObjectURL(form.foto_perfil)}
            alt="Vista previa perfil"
            style={{
              maxWidth: "100%",
              maxHeight: "200px",
              marginTop: "8px",
              borderRadius: 8,
            }}
          />
        </Box>
      )}

      <Divider sx={{ my: 3, borderColor: "rgba(104, 64, 92, 0.57)" }} />

      <Typography variant="h6" mt={4} mb={2}>
        <u>📸 Fotos de Galería del Club:</u>
      </Typography>

      <Typography
        variant="body1"
        mb={2}
        sx={{ fontStyle: "italic", color: "#59c054ff", fontSize: "0.85rem" }}
      >
        <strong>Éstas son las imágenes que se mostrarán en la ficha de perfil público de tu club...</strong>
      </Typography>

      <Button
        variant="contained"
        component="label"
        sx={{
          backgroundColor: "#9c27b0",
          "&:hover": { backgroundColor: "#7b1fa2" },
        }}
      >
        ⬆️ Subir Fotos del Club
        <Input
          type="file"
          name="fotos_club"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          sx={{ display: "none" }}
        />
      </Button>

      {form?.fotos_club?.length > 0 && (
        <Grid container spacing={2} mt={2}>
          {form.fotos_club.map((file, index) => (
            <React.Fragment key={index}>
              <Grid item xs={6} sm={4} md={3} position="relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`foto-${index}`}
                  style={{
                    width: "100%",
                    borderRadius: 8,
                    objectFit: "cover",
                    height: "150px",
                  }}
                />
                <button
                  onClick={() => removeFotoClub(index)}
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    background: "rgba(255,255,255,0.8)",
                    border: "none",
                    borderRadius: "50%",
                    padding: 4,
                    cursor: "pointer",
                  }}
                >
                  <span style={{ color: "#d32f2f" }}>❌ Borrar</span>
                </button>
              </Grid>
            </React.Fragment>
          ))}
        </Grid>
      )}

      {/* --- Sección COFEPRIS solo para tipo consumo --- */}
      {(tipo.tipo.tipo === "consumo") && (
        <>
          <Divider sx={{ my: 3, borderColor: "rgba(104, 64, 92, 0.57)" }} />

          <Typography variant="h6" mb={2}>
            <u>Permiso COFEPRIS / Trámite</u>
          </Typography>

          <Typography variant="body2" mb={2} sx={{ color: "#9c27b0" }}>
            Selecciona la opción que corresponda a tu situación.
          </Typography>

          <FormGroup>
            {/* Siempre mostrar "Ya cuento con un folio" */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={opcFolio}
                  onChange={(e) => setOpcFolio(e.target.checked)}
                />
              }
              label="✅ Ya cuento con un folio"
            />
            {opcFolio && (
              <Box sx={{ pl: 4, pr: 2, pb: 1 }}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Ingresa el folio de tu trámite"
                  name="cofepris"
                  value={folio}
                  onChange={(e) => {
                    setFolio(e.target.value);
                    setForm(prev => ({ ...prev, cofepris: e.target.value }));
                  }}
                  onFocus={() => setFocusedField("cofepris")}
                  onBlur={() => setFocusedField(null)}
                  helperText="Cuando tengas el folio lo puedes ingresar aquí."
                />
              </Box>
            )}

            {/* Si la membresía está activa, mostrar la opción de solicitar gestión */}
            {typeof isActivaMembresia === "function" && isActivaMembresia() ? (
              <>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={opcGestion}
                      onChange={(e) => setOpcGestion(e.target.checked)}
                    />
                  }
                  label="📝 Solicitar la gestión de mi trámite"
                />

                {opcGestion && (
                  <Box sx={{ pl: 4, pr: 2, pb: 2, borderLeft: "3px solid rgba(156,39,176,0.12)" }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Completa los datos para que generemos y gestionemos tu trámite.
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="CURP"
                          fullWidth
                          value={curp}
                          onChange={(e) => setCurp(e.target.value.toUpperCase())}
                          margin="normal"
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="RFC"
                          fullWidth
                          value={rfc}
                          onChange={(e) => setRfc(e.target.value.toUpperCase())}
                          margin="normal"
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Typography variant="subtitle2">Domicilio para el trámite:</Typography>
                        <FormGroup>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={usarDireccionExistente}
                                onChange={(e) => setUsarDireccionExistente(e.target.checked)}
                              />
                            }
                            label={form?.direccion ? "Usar domicilio que ya tenemos" : "No hay domicilio guardado"}
                          />
                        </FormGroup>

                        {!usarDireccionExistente && (
                          <Box sx={{ mt: 1 }}>
                            <Grid container spacing={1}>
                              <Grid item xs={12} sm={8}>
                                <TextField
                                  label="Calle"
                                  fullWidth
                                  margin="dense"
                                  value={direccionGestion.calle}
                                  onChange={(e) => setDireccionGestion(prev => ({ ...prev, calle: e.target.value }))}
                                />
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <TextField
                                  label="Número"
                                  fullWidth
                                  margin="dense"
                                  value={direccionGestion.numero}
                                  onChange={(e) => setDireccionGestion(prev => ({ ...prev, numero: e.target.value }))}
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  label="Colonia"
                                  fullWidth
                                  margin="dense"
                                  value={direccionGestion.colonia}
                                  onChange={(e) => setDireccionGestion(prev => ({ ...prev, colonia: e.target.value }))}
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  label="Municipio / Alcaldía"
                                  fullWidth
                                  margin="dense"
                                  value={direccionGestion.municipio}
                                  onChange={(e) => setDireccionGestion(prev => ({ ...prev, municipio: e.target.value }))}
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  label="Estado"
                                  fullWidth
                                  margin="dense"
                                  value={direccionGestion.estado}
                                  onChange={(e) => setDireccionGestion(prev => ({ ...prev, estado: e.target.value }))}
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  label="Código Postal"
                                  fullWidth
                                  margin="dense"
                                  value={direccionGestion.cp}
                                  onChange={(e) => setDireccionGestion(prev => ({ ...prev, cp: e.target.value }))}
                                />
                              </Grid>
                            </Grid>
                          </Box>
                        )}
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">Teléfono de contacto:</Typography>
                        <FormGroup>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={usarWhatsappExistente}
                                onChange={(e) => setUsarWhatsappExistente(e.target.checked)}
                              />
                            }
                            label={form?.whatsapp ? `Usar whatsapp: ${form.whatsapp}` : "No hay whatsapp guardado"}
                          />
                        </FormGroup>
                        {!usarWhatsappExistente && (
                          <TextField
                            label="Teléfono (ej. 55xxxxxxxx)"
                            fullWidth
                            margin="dense"
                            value={telefonoGestion}
                            onChange={(e) => setTelefonoGestion(e.target.value)}
                          />
                        )}
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">Correo electrónico:</Typography>
                        <FormGroup>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={usarEmailExistente}
                                onChange={(e) => setUsarEmailExistente(e.target.checked)}
                              />
                            }
                            label={user?.email ? `Usar email: ${user.email}` : "No hay email de usuario"}
                          />
                        </FormGroup>
                        {!usarEmailExistente && (
                          <TextField
                            label="Email de contacto"
                            fullWidth
                            margin="dense"
                            value={emailGestion}
                            onChange={(e) => setEmailGestion(e.target.value)}
                          />
                        )}
                      </Grid>
                    </Grid>

                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        onClick={handleSolicitarGestion}
                        sx={{
                          backgroundColor: "#6d6e71",
                          "&:hover": { backgroundColor: "#565657" },
                        }}
                      >
                        📩 Solicitar gestión
                      </Button>

                      <Button
                        variant="outlined"
                        onClick={() => {
                          // cancelar / limpiar campos de gestión
                          setOpcGestion(false);
                          setCurp("");
                          setRfc("");
                          setDireccionGestion(form?.direccion || { calle: "", numero: "", colonia: "", municipio: "", estado: "", cp: "" });
                          setTelefonoGestion(form?.whatsapp || "");
                          setEmailGestion(user?.email || "");
                        }}
                      >
                        Cancelar
                      </Button>
                    </Stack>
                  </Box>
                )}
              </>
            ) : null}

            {/* Opción por mí mismo (siempre visible; si membresía inactiva también aparece) */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={opcPorMi}
                  onChange={(e) => setOpcPorMi(e.target.checked)}
                />
              }
              label="🔧 Realizar el trámite por mí mismo con las herramientas del sitio"
            />

            {opcPorMi && (
              <Box sx={{ pl: 4, pr: 2, pb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Puedes generar tu escrito libre con el generador. Ahí mismo encontrarás el link para agendar cita y las instrucciones paso a paso.
                  Cuando tengas el folio regresa a este formulario y agrégalo en "Ya cuento con un folio".
                </Typography>

                <Button
                  variant="contained"
                  onClick={goGeneradorLibre}
                  sx={{
                    backgroundColor: "#6a1b9a",
                    "&:hover": { backgroundColor: "#4a148c" },
                    color: "#fff",
                  }}
                >
                  ✍️ Ir al Generador de Escrito Libre
                </Button>
              </Box>
            )}

            {/* Cuando la membresía no está activa: ocultamos la opción "Solicitar gestión" (ya lo hicimos arriba),
                pero igualmente mostramos las otras dos opciones (folio y por mí mismo). */}
            {(!isActivaMembresia || (typeof isActivaMembresia === "function" && !isActivaMembresia())) && (
              <FormHelperText sx={{ mt: 1 }}>
                Nota: la gestión por parte del equipo sólo está disponible si tu membresía está activa.
              </FormHelperText>
            )}
          </FormGroup>
        </>
      )}
    </Box>
  );
}
