import React from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { Controller } from 'react-hook-form';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const EditorHTML = ({
  quillRefLibre,
  quillRefRestringido,
  quillModules,
  insertLogoLibre,
  insertLogoRestringido,
  control,
  register,
  modo = 'libre',
  htmlModeLibre,
  htmlModeRestringido,
  setHtmlModeLibre,
  setHtmlModeRestringido,
  disabled = false,
  restringido = false, // estado booleano que controla si está activo
}) => {
  const isRestringido = modo === 'restringido';
  const quillRef = isRestringido ? quillRefRestringido : quillRefLibre;
  const insertLogo = isRestringido ? insertLogoRestringido : insertLogoLibre;
  const htmlMode = isRestringido ? htmlModeRestringido : htmlModeLibre;
  const setHtmlMode = isRestringido ? setHtmlModeRestringido : setHtmlModeLibre;
  const nombreCampo = isRestringido ? 'contenido_restringido' : 'contenido_libre';

  // Se muestra el editor si no está deshabilitado, o si está deshabilitado pero el usuario activó el contenido restringido
  const mostrarEditor = !disabled || (disabled && restringido);

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          {isRestringido
            ? 'Contenido restringido (HTML exclusivo para miembros)'
            : 'Contenido libre (HTML público)'}
        </Typography>

        {isRestringido && (
          <FormControlLabel
            control={
              <Checkbox
                {...register('restringido')}
                defaultChecked={restringido}
                disabled={!mostrarEditor && disabled} // solo desactivado si está bloqueado y no activado
              />
            }
            label="¿Contenido extendido exclusivo para miembros?"
          />
        )}

        {mostrarEditor ? (
          <Controller
            name={nombreCampo}
            control={control}
            render={({ field }) => (
              <>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <Button
                    onClick={() => setHtmlMode(!htmlMode)}
                    variant="outlined"
                    size="small"
                  >
                    {htmlMode ? 'Editor Visual' : 'Editor HTML'}
                  </Button>

                  {!htmlMode && (
                    <Button
                      onClick={insertLogo}
                      variant="outlined"
                      size="small"
                    >
                      Insertar Logo
                    </Button>
                  )}
                </Box>

                {htmlMode ? (
                  <TextField
                    multiline
                    minRows={8}
                    fullWidth
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value)}
                    variant="outlined"
                  />
                ) : (
                  <ReactQuill
                    ref={(el) => {
                      quillRef.current = el;
                    }}
                    theme="snow"
                    value={field.value ?? ''}
                    onChange={(content, delta, source, editor) => {
                      const html = editor.getHTML();
                      field.onChange(html);
                    }}
                    style={{ height: '200px', marginBottom: '1rem' }}
                    modules={quillModules}
                  />
                )}
              </>
            )}
          />
        ) : (
          <Typography variant="body2" color="textSecondary">
            Activa la casilla para agregar contenido restringido.
          </Typography>
        )}
      </Grid>
    </>
  );
};

export default EditorHTML;
