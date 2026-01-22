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
import Skills from './Skills.jsx';

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
      
      <Skills
        form = {form}
        handleFormChange = {handleFormChange}
        focusedField = {focusedField}
        setFocusedField = {setFocusedField}
        certificados={certificados}
        setCertificados={setCertificados}
        handleDocsAdd={handleDocsAdd}
        getDocExt={getDocExt}
        handleDocRemove={handleDocRemove}
      />

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
