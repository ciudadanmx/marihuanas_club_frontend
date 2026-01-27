// IneSection.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Box,
  Button,
  Input,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from '@mui/icons-material/Visibility';

const IneSection = ({ form = {}, setForm }) => {
  const FIELD_FRENTE = "ine_frente";
  const FIELD_REVERSO = "ine_reverso";

    const ineFrenteCargado = Boolean(form[FIELD_FRENTE]);
  const ineReversoCargado = Boolean(form[FIELD_REVERSO]);

  const [objectUrls, setObjectUrls] = useState({});

  // Lista de archivos a mostrar (solo frente y reverso)
  const archivos = useMemo(() => {
    const list = [];
    if (form[FIELD_FRENTE]) {
      list.push({ key: FIELD_FRENTE, file: form[FIELD_FRENTE], label: "INE - Frente" });
    }
    if (form[FIELD_REVERSO]) {
      list.push({ key: FIELD_REVERSO, file: form[FIELD_REVERSO], label: "INE - Reverso" });
    }
    return list;
  }, [form]);

  // Genera URL para ver archivos locales
  const getUrlForFile = useCallback((file, key) => {
    if (!file) return null;
    if (typeof file === "string") return file;
    if (objectUrls[key]) return objectUrls[key];
    const url = URL.createObjectURL(file);
    setObjectUrls(prev => ({ ...prev, [key]: url }));
    return url;
  }, [objectUrls]);

  // Revocar URLs al desmontar
  useEffect(() => {
    return () => {
      Object.values(objectUrls).forEach(u => {
        try { URL.revokeObjectURL(u); } catch (e) {}
      });
    };
  }, [objectUrls]);

  // Subida de archivo único
  const onFileSelected = (fieldName) => (e) => {
    const files = e?.target?.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setForm(prev => ({ ...prev, [fieldName]: file }));
    e.target.value = "";
  };

  // Eliminar archivo
  const onRemove = (key) => {
    setForm(prev => ({ ...prev, [key]: null }));
    if (objectUrls[key]) {
      try { URL.revokeObjectURL(objectUrls[key]); } catch {}
      setObjectUrls(prev => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  // Ver archivo
  const onView = (item) => {
    const url = getUrlForFile(item.file, item.key);
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Box sx={{ mt: 3 }}>
      {/* Título de sección */}
      <Typography variant="h6" mb={2}>
        <u>INE / Identificación Oficial</u>
      </Typography>

      {/* Botones */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
<Tooltip
  title={
    ineFrenteCargado
      ? "Ya cargaste el INE frente"
      : "Sube el anverso (frente) de tu INE"
  }
>
  <span>
    <Button
      variant="contained"
      component="label"
      disabled={ineFrenteCargado}
      sx={{
        backgroundColor: "#9c27b0",
        pointerEvents: ineFrenteCargado ? "none" : "auto",
        opacity: ineFrenteCargado ? 0.6 : 1,
        "&:hover": { backgroundColor: "#7b1fa2" }
      }}
    >
      ⬆️ INE - Frente
      <Input
        type="file"
        name={FIELD_FRENTE}
        accept=".jpg,.jpeg,.png,.webp,.pdf"
        sx={{ display: "none" }}
        disabled={ineFrenteCargado}
        onChange={onFileSelected(FIELD_FRENTE)}
      />
    </Button>
  </span>
</Tooltip>

<Tooltip
  title={
    ineReversoCargado
      ? "Ya cargaste el INE reverso"
      : "Sube el reverso (dorso) de tu INE"
  }
>
  <span>
    <Button
      variant="outlined"
      component="label"
      disabled={ineReversoCargado}
      sx={{
        color: "#9c27b0",
        borderColor: "#9c27b0",
        pointerEvents: ineReversoCargado ? "none" : "auto",
        opacity: ineReversoCargado ? 0.6 : 1,
        "&:hover": { backgroundColor: "#f3e5f5" }
      }}
    >
      ⬆️ INE - Reverso
      <Input
        type="file"
        name={FIELD_REVERSO}
        accept=".jpg,.jpeg,.png,.webp,.pdf"
        sx={{ display: "none" }}
        disabled={ineReversoCargado}
        onChange={onFileSelected(FIELD_REVERSO)}
      />
    </Button>
  </span>
</Tooltip>

      </Box>

      {/* Lista de archivos */}
      <List dense>
        {archivos.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No hay archivos cargados para INE.
          </Typography>
        )}

        {archivos.map((item, i) => {
          const file = item.file;
          const filename = file?.name || file?.filename || `Archivo ${i + 1}`;
          const sizeText = file?.size ? `${Math.round(file.size / 1024)} KB` : "";

          return (
            <ListItem key={item.key} sx={{ py: 0.5 }}>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {item.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {filename} {sizeText ? `· ${sizeText}` : ""}
                    </Typography>
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <Tooltip title="Ver / Abrir">
                  <IconButton edge="end" onClick={() => onView(item)} aria-label={`ver-${item.key}`}>
                    <VisibilityIcon sx={{ color: "#6d6e71" }} />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Eliminar">
                  <IconButton edge="end" onClick={() => onRemove(item.key)} aria-label={`eliminar-${item.key}`}>
                    <DeleteIcon sx={{ color: "#f30f0f" }} />
                  </IconButton>
                </Tooltip>
              </ListItemSecondaryAction>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default IneSection;
