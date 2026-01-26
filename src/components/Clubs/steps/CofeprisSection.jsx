import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Divider,
  Typography,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormHelperText,
} from "@mui/material";
import CofeprisGestionDatosForm from './CofeprisGestionDatosForm';
import CofeprisFolioSection from './CofeprisFolioSection';

const CofeprisSection = ({
  handleFormChange,
  setFocusedField,
  isActivaMembresia,
  form,
  handleNestedChange,
  user,
  goGeneradorLibre,
  setForm,
}) => {
  // ✅ Estado local para controlar la opción seleccionada
  const [consumoOption, setConsumoOption] = useState(form?.cofeprismode || "");

  // Inicializamos form.cofeprismode si no existe
  useEffect(() => {
    if (!form?.cofeprismode && consumoOption) {
      setForm(prev => ({
        ...prev,
        cofeprismode: consumoOption,
      }));
    }
  }, [consumoOption, form, setForm]);

  const selectConsumoOption = (option) => {
    setConsumoOption(option);
    setForm(prev => ({
      ...prev,
      cofeprismode: option,
    }));
  };

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
        {/* ✅ Ya cuento con un folio */}
        <FormControlLabel
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

        {/* 📝 Solicitar la gestión */}
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
        {consumoOption === "gestion" && (
          <CofeprisGestionDatosForm
            form={form}
            setForm={setForm}
            handleFormChange={handleFormChange}
            handleNestedChange={handleNestedChange}
            user={user}
          />
        )}

        {/* 🔧 Realizar el trámite por mí mismo */}
        <FormControlLabel
          control={
            <Checkbox
              name="opcPorMi"
              checked={consumoOption === "pormi"}
              onChange={() => selectConsumoOption("pormi")}
              color="success"
            />
          }
          label="🔧 Realizar el trámite por mí mismo con las herramientas del sitio"
        />
        {consumoOption === "pormi" && (
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

        {(!isActivaMembresia || (typeof isActivaMembresia === "function" && !isActivaMembresia())) && (
          <FormHelperText sx={{ mt: 1 }}>
            Nota: la gestión por parte del equipo sólo está disponible si tu membresía está activa.
          </FormHelperText>
        )}
      </FormGroup>
    </>
  );
};

export default CofeprisSection;
