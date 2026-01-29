import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Divider,
  FormControlLabel,
  FormGroup,
  Checkbox,
  FormHelperText,
} from "@mui/material";
import CofeprisFolioSection from './CofeprisFolioSection';
import CofeprisGestionDatosForm from './CofeprisGestionDatosForm';

/**
 * CofeprisSection ahora es un componente CONTROLADO:
 * recibe consumoOption y selectConsumoOption desde el padre (Archivos).
 */
const CofeprisSection = ({
  selectConsumoOption,
  handleFormChange,
  setFocusedField,
  isActivaMembresia,
  form,
  handleNestedChange,
  user,
  goGeneradorLibre,
  setForm, // se deja por compatibilidad si lo usan otras funciones
}) => {

    const consumoOption = form.cofeprismode;

    useEffect(() => {
        // solo si todavía no hay opción seleccionada
        if (!form.cofeprismode) {
            const tieneGestion =
            (typeof isActivaMembresia === "function" && isActivaMembresia()) ||
            form.tipo_club?.includes("cultivo");

            if (tieneGestion) {
            selectConsumoOption("gestion");
            } else {
            selectConsumoOption("folio");
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
              onChange={(e) =>
                e.target.checked && selectConsumoOption("folio")
              }
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
         {(isActivaMembresia() || form.tipo_club?.includes("cultivo")) && (
        <>
                <FormControlLabel
                control={
                    <Checkbox
                    name="opcGestion"
                    checked={consumoOption === "gestion"}
                    onChange={(e) =>
                        e.target.checked && selectConsumoOption("gestion")
                    }
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
        </>
        )}

        {/* 🔧 Realizar el trámite por mí mismo */}
        <FormControlLabel
          control={
            <Checkbox
              name="opcPorMi"
              checked={consumoOption === "pormi"}
              onChange={(e) =>
                e.target.checked && selectConsumoOption("pormi")
              }
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

            <Box component="button" onClick={goGeneradorLibre} sx={{
                display: 'inline-block',
                padding: '8px 12px',
                backgroundColor: '#6a1b9a',
                color: '#fff',
                borderRadius: 2,
                border: 'none',
                cursor: 'pointer'
            }}>
              ✍️ Ir al Generador de Escrito Libre
            </Box>
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
