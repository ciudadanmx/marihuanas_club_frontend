import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Stack,
  Chip
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DescriptionIcon from "@mui/icons-material/Description";
import { motion } from "framer-motion";

/* ================= helpers ================= */

const extractText = (text = "", limit = 180) =>
  text.length > limit ? text.slice(0, limit).trim() + "…" : text;

const formatDateTime = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

/* ================= componente ================= */

const DetallePlanta = ({ codigo, user }) => {
  const [planta, setPlanta] = useState(null);
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);

        /* ========= planta ========= */
        const plantaRes = await fetch(
          `${process.env.REACT_APP_STRAPI_URL}/api/plantas?filters[codigo][$eq]=${codigo}&populate=*`
        );
        const plantaJson = await plantaRes.json();
        setPlanta(plantaJson?.data?.[0] || null);

        /* ========= registros bitácora ========= */
        const registrosRes = await fetch(
          `${process.env.REACT_APP_STRAPI_URL}/api/registrosbitacoras` +
            `?filters[codigoplanta][$eq]=${codigo}` +
            `&sort[0]=createdAt:desc` +
            `&populate=*`
        );
        const registrosJson = await registrosRes.json();
        setRegistros(registrosJson?.data || []);
      } catch (err) {
        console.error("❌ Error cargando DetallePlanta:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [codigo]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

  const plantaAttr = planta?.attributes;

  return (
    <Box width="100%">
      {/* ================= HEADER PLANTA ================= */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Stack spacing={1.2} mb={4}>
          <Typography variant="h5" fontWeight={800}>
            🌱 Detalle de la planta
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Código: <code>{codigo}</code>
          </Typography>

          {plantaAttr?.nombre && (
            <Typography variant="body1">
              {plantaAttr.nombre}
            </Typography>
          )}

          {typeof plantaAttr?.viva !== "undefined" && (
            <Typography variant="body2">
              Estado:{" "}
              <b>{String(plantaAttr.viva) === "true" ? "Viva" : "No viva"}</b>
            </Typography>
          )}

          <Divider />
        </Stack>
      </motion.div>

      {/* ================= REGISTROS ================= */}
      <Typography variant="h6" fontWeight={700} mb={2}>
        📒 Registros de Bitácora
      </Typography>

      <List sx={{ width: "100%" }}>
        {registros.map((r, index) => {
          const a = r.attributes || {};
          const docsCount = a.documentos?.data?.length || 0;

          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <ListItem
                alignItems="flex-start"
                sx={{
                  mb: 1.5,
                  px: 2,
                  py: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  backgroundColor: "background.paper",
                }}
              >
                <ListItemText
                  primary={
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      mb={0.5}
                      flexWrap="wrap"
                    >
                      <AccessTimeIcon fontSize="small" color="action" />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {formatDateTime(a.createdAt)}
                      </Typography>

                      {a.tipo && (
                        <Chip
                          size="small"
                          label={a.tipo}
                          variant="outlined"
                        />
                      )}

                      {docsCount > 0 && (
                        <Chip
                          size="small"
                          icon={<DescriptionIcon />}
                          label={docsCount}
                          variant="outlined"
                        />
                      )}
                    </Stack>
                  }
                  secondary={
                    <Typography variant="body2">
                      {extractText(a.observaciones || a.status || "")}
                    </Typography>
                  }
                />
              </ListItem>
            </motion.div>
          );
        })}

        {registros.length === 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            mt={2}
          >
            Aún no hay registros de bitácora para esta planta.
          </Typography>
        )}
      </List>
    </Box>
  );
};

export default DetallePlanta;
