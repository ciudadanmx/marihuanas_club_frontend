import React, { useState } from "react";
import { useSnackbar } from 'notistack';
import { Box } from "@mui/material";
import { useRoles } from "../../../Contexts/RolesContext";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { createFileHandlers } from '../../../utils/FileHelpers';

// Componentes hijos
import CofeprisSection from './CofeprisSection.jsx';
import FotosGenerales from './FotosGenerales.jsx';
import Skills from './Skills.jsx';
import GestionCofepris from './GestionCofepris.jsx';

export default function Archivos({ form, setForm, tipo }) {

  // Campo actualmente enfocado (para ayudas visuales)
  const [focusedField, setFocusedField] = useState(null);

  // Flag específico para manejo de folio propio (no tocar, depende de negocio)
  const [cultivoFolioPropio, setCultivoFolioPropio] = useState(false);

  // Opción seleccionada para COFEPRIS:
  // "folio" | "gestion" | "pormi"
  const [consumoOption, setConsumoOption] = useState("folio");

  // Control de certificados dentro de Skills
  const [certificados, setCertificados] = useState(false);

  // Snackbar para mensajes al usuario
  const { enqueueSnackbar } = useSnackbar();

  // ======================================================
  // 📎 MANEJO DE ARCHIVOS (IMÁGENES + PDF)
  // ======================================================
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

  // ======================================================
  // AUTH, ROLES Y NAVEGACIÓN
  // ======================================================
  const { user } = useAuth0();
  const { isActivaMembresia } = useRoles();
  const navigate = useNavigate();

  // ======================================================
  // LÓGICA DE OPCIÓN COFEPRIS
  // ======================================================
  const selectConsumoOption = (option) => {
    setConsumoOption(option);
  };

  // ======================================================
  // MANEJO DE INPUTS SIMPLES (TEXT + CHECKBOX)
  // ======================================================
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Checkbox usa checked, inputs usan value
    let nuevo = type === "checkbox" ? checked : value;

    // Normalización automática para CURP y RFC
    if (["curp", "rfc"].includes(name) && typeof nuevo === "string") {
      nuevo = nuevo.toUpperCase();
    }

    setForm((prev) => ({
      ...prev,
      [name]: nuevo,
    }));
  };

  // ======================================================
  // MANEJO DE CAMPOS ANIDADOS (ej. direccionGestion)
  // ======================================================
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

  // ======================================================
  // MANEJO DE ARCHIVOS INDIVIDUALES
  // ======================================================
  const handleFileChange = ({ target: { name, files } }) => {
    setForm((f) => ({
      ...f,
      [name]:
        name === "foto_perfil"
          ? files[0]
          : [...(f[name] || []), ...Array.from(files)],
    }));
  };

  // Elimina una foto específica del club
  const removeFotoClub = (index) => {
    setForm((f) => ({
      ...f,
      fotos_club: f.fotos_club.filter((_, i) => i !== index),
    }));
  };

  // Navega al generador de escrito libre
  const goGeneradorLibre = () => {
    navigate("/legal/generadorlibre");
  };

  // ======================================================
  // RENDER
  // ======================================================
  return (
    <Box>

      {/* ================================================== */}
      {/* 📸 FOTOS GENERALES DEL CLUB                         */}
      {/* ================================================== */}
      <FotosGenerales
        handleFileChange={handleFileChange}
        form={form}
        removeFotoClub={removeFotoClub}
        handleFormChange={handleFormChange}
        setForm={setForm}
      />

      {/* ================================================== */}
      {/* 🌱 SKILLS DEL JARDINERO / CLUB                      */}
      {/* ================================================== */}
      <Skills
        form={form}
        handleFormChange={handleFormChange}
        focusedField={focusedField}
        setFocusedField={setFocusedField}
        certificados={certificados}
        setCertificados={setCertificados}
        handleDocsAdd={handleDocsAdd}
        getDocExt={getDocExt}
        handleDocRemove={handleDocRemove}
        setForm={setForm}
      />

      {/* ================================================== */}
      {/* 🏛️ SECCIÓN COFEPRIS                                 */}
      {/* ================================================== */}

      {Array.isArray(form.tipo_club) && form.tipo_club.includes("cultivo") ? (
        
        /* -------------------------------------------------- */
        /* CLUB DE CULTIVO → SECCIÓN COMPLETA COFEPRIS        */
        /* -------------------------------------------------- */
        <GestionCofepris
          tipo={tipo}
          form={form}
          setForm={setForm}
          handleFormChange={handleFormChange}
          isActivaMembresia={isActivaMembresia}
          consumoOption={consumoOption}
          selectConsumoOption={selectConsumoOption}
          setFocusedField={setFocusedField}
          handleNestedChange={handleNestedChange}
          goGeneradorLibre={goGeneradorLibre}
          user={user}
        />
      ) : (
        /* -------------------------------------------------- */
        /* CLUB DE CONSUMO → COFEPRIS OPCIONAL                */
        /* -------------------------------------------------- */
       <CofeprisSection
          consumoOption={consumoOption}
          selectConsumoOption={selectConsumoOption}
          handleFormChange={handleFormChange}
          setFocusedField={setFocusedField}
          isActivaMembresia={isActivaMembresia}
          form={form}
          handleNestedChange={handleNestedChange}
          user={user}
          goGeneradorLibre={goGeneradorLibre}
          setForm={setForm}
        />
      )}

    </Box>
  );
}
