import React, { useState } from "react";
import { useSnackbar } from 'notistack';
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
  MenuItem,
} from "@mui/material";
import { useRoles } from "../../../Contexts/RolesContext";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { createFileHandlers } from '../../../utils/FileHelpers';
import CofeprisSection from './CofeprisSection.jsx';
import FotosGenerales from './FotosGenerales.jsx';

export default function Archivos({ form, setForm, tipo }) {
  const [focusedField, setFocusedField] = useState(null);
  const [cultivoFolioPropio, setCultivoFolioPropio] = useState(false); // único useState extra permitido
  const [consumoOption, setConsumoOption] = useState("folio");
  const [certificados, setCertificados] = useState(false);
  // valores: "folio" | "gestion" | "pormi"
  const { enqueueSnackbar } = useSnackbar();
  
  // 📎 IMÁGENES + PDF
  const {
    handleFilesAdd: handleDocsAdd,
    handleRemoveFile: handleDocRemove,
    getExtension: getDocExt,
  } = createFileHandlers({
    allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
    setForm,
    fieldName: 'archivos_club',
    enqueueSnackbar,
    errorMessage: '⚠️ Solo se permiten imágenes o archivos PDF',
  });

  // Auth y roles
  const { user } = useAuth0();
  const { isActivaMembresia } = useRoles();

  const navigate = useNavigate();

  const selectConsumoOption = (option) => {
    setConsumoOption(option);
  };

  // Maneja cambios simples (inputs y checkboxes)
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    let nuevo = type === "checkbox" ? checked : value;

    // normalizaciones
    if (["curp", "rfc"].includes(name) && typeof nuevo === "string") {
      nuevo = nuevo.toUpperCase();
    }

    setForm((prev) => ({
      ...prev,
      [name]: nuevo,
    }));
  };

  // Maneja cambios en campos anidados, p.e. direccionGestion
  const handleNestedChange = (parent) => (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [parent]: {
        ...(prev[parent] || {}),
        [name]: value,
      },
    }));
  };

  const handleFileChange = ({ target: { name, files } }) => {
    setForm((f) => ({
      ...f,
      [name]:
        name === "foto_perfil"
          ? files[0]
          : [...(f[name] || []), ...Array.from(files)],
    }));
  };

  const removeFotoClub = (index) => {
    setForm((f) => ({
      ...f,
      fotos_club: f.fotos_club.filter((_, i) => i !== index),
    }));
  };

  const goGeneradorLibre = () => {
    navigate("/legal/generadorlibre");
  };

  return (
    <Box>
      {/* --- Fotos Generales --- */}
      <FotosGenerales />


      {form.tipo_club?.includes("consumo") && (

        <>
        <Typography variant="h6" mt={4} mb={2}>
          <u>📸 Fotos de Verificación de las áreas de cultivo:</u>
        </Typography>

        <Typography
          variant="body1"
          mb={2}
        >
          Toma en cuenta que los armarios de cultivo son de 1 x 1 m. y que requerirás pasillos por cada fila de armarios, por lo que en una zona de 3 x 3 caben hasta 7 plantas.
          
          Toma en cuenta también que uno de los armarios es para tu propio consumo, incluye también este armario e indica en total para cuántos armarios tienes espacio.
          
        </Typography>
        


        <TextField
          select
          label="Número de armarios"
          fullWidth
          name="armarios"
          value={form.armarios || ""}
          onChange={handleFormChange}
          margin="normal"
          color="success"
          helperText="Número de armarios"
          sx={{ width: 280 }}
        >
          {[...Array(11)].map((_, i) => {
            const val = i + 2;
            return (
              <MenuItem key={val} value={val}>
                {val}
              </MenuItem>
            );
          })}
        </TextField>



        <Typography
          variant="body1"
          mb={2}
          sx={{ fontStyle: "italic", color: "#59c054ff", fontSize: "0.85rem" }}
        >
          <strong>Sube al menos 5 fotos</strong>
        </Typography>

        <Button
          variant="contained"
          component="label"
          sx={{
            backgroundColor: "#9c27b0",
            "&:hover": { backgroundColor: "#7b1fa2" },
          }}
        >
          ⬆️ Subir Fotos.
          <Input
            type="file"
            name="documentales"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            sx={{ display: "none" }}
          />
        </Button>

        {form?.documentales && (
          <Box mt={2}>
            <Typography
              variant="subtitle2"
              sx={{ fontStyle: "italic", color: "#9c27b0", fontSize: "0.85rem" }}
            >
              Vista previa:
            </Typography>
            <img
              src={URL.createObjectURL(form.documentales)}
              alt="Vista previa fotos de verificación"
              style={{
                maxWidth: "100%",
                maxHeight: "200px",
                marginTop: "8px",
                borderRadius: 8,
              }}
            />
          </Box>
        )}

        {form?.documentales?.length > 0 && (
          <Grid container spacing={2} mt={2}>
            {form.documentales.map((file, index) => (
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


        <Divider sx={{ my: 3, borderColor: "rgba(104, 64, 92, 0.57)" }} />
      
        <Typography variant="h6" mt={4} mb={2}>
          <u>🌱 Habilidades Floristas:</u>
        </Typography>
        
        <TextField
          fullWidth
          margin="normal"
          label="Si tienes formación, experiencia, capacitaciones y habilidades como jardinero 4:20 descríbelas aquí..."
          name="skills"
          multiline
          minRows={3}
          value={form.skills || ""}
          onChange={handleFormChange}
          onFocus={() => setFocusedField("skills")}
          onBlur={() => setFocusedField(null)}
          color="success"
          helperText={
            focusedField === "skills"
              ? "👉 Ingresa una descripción pública para tu Club."
              : " "
          }
        />

        <FormControlLabel
          control={
            <Checkbox
              name="certificados"
              checked={certificados}
              onChange={() => setCertificados(!certificados)}
              color="success"
            />
          }
          label="🏅 Agregar Imágenes o Documentos PDF de Certificación"
        />

        {certificados && (
          <>
            {/* IMÁGENES + PDF */}
            <Button
              variant="contained"
              component="label"
              sx={{
                backgroundColor: "#9c27b0",
                "&:hover": { backgroundColor: "#7b1fa2" },
              }}
            >
              ⬆️ Subir Archivos.
              <Input
                type="file"
                name="archivos_certificados"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                multiple
                id="archivos-input"
                onChange={handleDocsAdd}
                sx={{ display: "none" }}
              />
              
            </Button>


            {form.archivos_club?.map((file, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <span style={{ fontSize: 20 }}>
                  {getDocExt(file.name) === 'pdf' ? '📄' : '🖼️'}
                </span>

                <Typography sx={{ ml: 1, flex: 1 }}>
                  {file.name}
                </Typography>

                <Button
                  size="small"
                  onClick={() => handleDocRemove(index)}
                  sx={{ color: '#751460' }}
                >
                  ✕
                </Button>
              </Box>
            ))}
          </>
        )}

        </>
      )}


      {/* --- Sección COFEPRIS para consumo --- */}
      {(tipo.tipo.tipo === "consumo") && (
        <CofeprisSection 
          consumoOption = {consumoOption}
          selectConsumoOption = {selectConsumoOption}
          handleFormChange = {handleFormChange}
          setFocusedField = {setFocusedField}
          isActivaMembresia = {isActivaMembresia}
          form = {form}
          handleNestedChange = {handleNestedChange}
          user = {user}
          goGeneradorLibre = {goGeneradorLibre}
        />
      )}

      {/* --- Sección simple para clubs de cultivo --- */}
      {tipo.tipo.tipo === "cultivo" && (
        <>
          <Divider sx={{ my: 3, borderColor: "rgba(104, 64, 92, 0.57)" }} />

          <Typography variant="h6" mb={2}>
            <u>Permiso COFEPRIS (cultivo)</u>
          </Typography>

          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={cultivoFolioPropio}
                  color="success"
                  onChange={(e) => {
                    setCultivoFolioPropio(e.target.checked);
                    // también lo guardamos en form si quieres centralizar
                    setForm(prev => ({ ...prev, cultivoFolioPropio: e.target.checked }));
                  }}
                />
              }
              label="✅ Ya cuento con un folio"
            />

            {cultivoFolioPropio && (
              <Box sx={{ pl: 4, pr: 2, pb: 1 }}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Ingresa el folio de tu trámite"
                  name="cofepris"
                  value={form.cofepris || ""}
                  onChange={handleFormChange}
                  color="success"
                />
              </Box>
            )}
          </FormGroup>
        </>
      )}
    </Box>
  );
}
