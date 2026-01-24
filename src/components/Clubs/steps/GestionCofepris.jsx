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
import CofeprisGestionDatosForm from './CofeprisGestionDatosForm';

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
  setForm,
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

        {/* =====================================================
            CONTENIDO DE LA OPCIÓN: GESTIÓN
        ===================================================== */}
        {consumoOption === "gestion"  && (
             <CofeprisGestionDatosForm
                form={form}
                setForm={setForm}
                handleFormChange={handleFormChange}
                handleNestedChange={handleNestedChange}
                user={user}
            />
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
