import React, { useState } from "react";
import { useSnackbar } from 'notistack';
import { Box } from "@mui/material";
import { useRoles } from "../../../Contexts/RolesContext";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { createFileHandlers } from '../../../utils/FileHelpers';
import IneSection from './IneSection.jsx';

// Componentes hijos
import CofeprisSection from './CofeprisSection.jsx';
import FotosGenerales from './FotosGenerales.jsx';
import Skills from './Skills.jsx';
import GestionCofepris from './GestionCofepris.jsx';

export default function Archivos({ form, setForm, tipo }) {

  // Campo actualmente enfocado (para ayudas visuales)
  const [focusedField, setFocusedField] = useState(null);

  // Opción seleccionada para COFEPRIS:
  // "folio" | "gestion" | "pormi"
  const [consumoOption, setConsumoOption] = useState(Array.isArray(form.tipo_club) && form.tipo_club.includes("cultivo") ? "gestion" : "folio");

  // Control de certificados dentro de Skills
  const [certificados, setCertificados] = useState(false);

  // Snackbar para mensajes al usuario
  const { enqueueSnackbar } = useSnackbar();

  // ======================================================
  // 📎 MANEJO DE ARCHIVOS (IMÁGENES + PDF)
  // ======================================================
// Para archivos del club (ya existente)
const {
    handleFilesAdd: handleDocsAdd,
    handleRemoveFile: handleDocRemove,
    getExtension: getDocExt,
} = createFileHandlers({
    allowedExtensions: ['jpg','jpeg','png','webp','pdf'],
    setForm,
    fieldName: 'archivos_club', // mantiene el array original
    enqueueSnackbar,
    errorMessage: '⚠️ Solo se permiten imágenes o archivos PDF',
});

// Para certificaciones (Skills)
const {
    handleFilesAdd: handleCertificadosAdd,
    handleRemoveFile: handleCertificadosRemove,
    getExtension: getCertExt,
} = createFileHandlers({
    allowedExtensions: ['jpg','jpeg','png','webp','pdf'],
    setForm,
    fieldName: 'certificados_archivos', // nuevo array separado
    enqueueSnackbar,
    errorMessage: '⚠️ Solo se permiten imágenes o archivos PDF',
});

// Para INE frente
const {
    handleFilesAdd: handleIneFrenteAdd,
    handleRemoveFile: handleIneFrenteRemove,
    getExtension: getIneExt,
} = createFileHandlers({
    allowedExtensions: ['jpg','jpeg','png','webp','pdf'],
    setForm,
    fieldName: 'ine_frente', // nuevo campo individual
    enqueueSnackbar,
    errorMessage: '⚠️ Solo se permiten imágenes o PDF',
});

// Para INE reverso
const {
    handleFilesAdd: handleIneReversoAdd,
    handleRemoveFile: handleIneReversoRemove,
    getExtension: getIneExt2,
} = createFileHandlers({
    allowedExtensions: ['jpg','jpeg','png','webp','pdf'],
    setForm,
    fieldName: 'ine_reverso', // nuevo campo individual
    enqueueSnackbar,
    errorMessage: '⚠️ Solo se permiten imágenes o PDF',
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
    setForm((prev) => {
      const next = {
        ...prev,
        cofeprismode: option,
      };

      // ==========================
      // LIMPIEZA POR MODO ACTIVO
      // ==========================

      // 👉 Si NO es gestión → borramos campos de gestión
      if (option !== "gestion") {
        delete next.curp;
        delete next.rfc;
        delete next.direccionGestion;
        delete next.telefonoGestion;
        delete next.emailGestion;
        delete next.usarDireccionExistente;
        delete next.usarTelefonoExistente;
        delete next.usarEmailExistente;
      }

      // 👉 Si NO es folio → borramos campos de folio
      if (option !== "folio") {
        delete next.cofepris;
        delete next.tipoResolucion;
      }

      return next;
    });

    // UX: subir un poco si entra a folio
    if (option === "folio") {
      window.scrollBy({
        top: -250,
        left: 0,
        behavior: "smooth",
      });
    }
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
        handleCertificadosAdd={handleCertificadosAdd}
        getCertExt={getCertExt}
        handleCertificadosRemove={handleCertificadosRemove}
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

      <IneSection
        form={form}
        setForm={setForm}
        // función proveniente de createFileHandlers en Archivos.jsx
        handleIneFrenteAdd={handleIneFrenteAdd}
        // función de eliminación proveniente de createFileHandlers
        handleIneFrenteRemove={handleIneFrenteRemove}
        // ayuda para detectar extensión si la tienes
        handleIneReversoAdd={handleIneReversoAdd}
        // función de eliminación proveniente de createFileHandlers
        handleIneReversoRemove={handleIneReversoRemove}
        // ayuda para detectar extensión si la tienes
        getDocExt={getIneExt}
      />

    </Box>
  );
}
