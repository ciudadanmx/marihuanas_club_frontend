import React, { useState } from "react";
import { useSnackbar } from 'notistack';
import {
  Box,
  Button,
  Divider,
  Typography,
  Input,
  TextField,
  Checkbox,
  FormControlLabel,
  FormGroup,
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
      <FotosGenerales
        handleFileChange = {handleFileChange}
        form = {form}
        removeFotoClub = {removeFotoClub}
        handleFormChange = {handleFormChange}
      />
      
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
