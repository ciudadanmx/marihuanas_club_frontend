// src/components/Clubs/SolicitudesAfiliacionClub.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Button,
  Alert,
} from "@mui/material";
import {
  NoteAdd as NoteAddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  QrCodeScanner as QrCodeScannerIcon,
} from "@mui/icons-material";

/**
 * SolicitudesAfiliacionClub
 *
 * Muestra las solicitudes de afiliación asociadas AL CLUB del usuario logueado.
 */

export default function SolicitudesAfiliacionClub() {
  const { user, isLoading: authLoading } = useAuth0();
  const navigate = useNavigate();

  const STRAPI = (process.env.REACT_APP_STRAPI_URL || "").replace(/\/$/, "");
  const STRAPI_TOKEN = process.env.REACT_APP_STRAPI_TOKEN || null;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [club, setClub] = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);

  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
    }),
    [STRAPI_TOKEN]
  );

  useEffect(() => {
    let mounted = true;

    const safeJson = async (res) => {
      try {
        return await res.json();
      } catch {
        return null;
      }
    };

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!STRAPI) throw new Error("REACT_APP_STRAPI_URL no está configurada");
        if (!user || !user.email) throw new Error("Usuario no disponible (Auth0)");

        const urlUser = `${STRAPI}/api/users?filters[email][$eq]=${encodeURIComponent(
          user.email
        )}&populate=club&pagination[limit]=1&populate=club`;

        const resUser = await fetch(urlUser, { headers });
        if (!resUser.ok) {
          const body = await safeJson(resUser);
          throw new Error(
            `Error buscando usuario en Strapi: ${resUser.status} ${resUser.statusText} ${body?.error?.message || ""}`
          );
        }

        const userJson = await safeJson(resUser);
        const userData = userJson?.[0] ?? null;
        const clubData = userData?.club || null;

        if (!clubData || !clubData?.id) {
          throw new Error("El usuario no tiene un club asociado en Strapi (campo 'club').");
        }

        if (!mounted) return;
        setClub(clubData);

        const clubId = clubData.id;

        const urlSol = `${STRAPI}/api/solicitudafiliaciones?filters[club][id][$eq]=${clubId}&filters[status][$notIn][]=aprobada&filters[status][$notIn][]=rechazada&pagination[limit]=100&populate=usuario`;

        const resSol = await fetch(urlSol, { headers });
        if (!resSol.ok) {
          const body = await safeJson(resSol);
          throw new Error(
            `Error buscando solicitudes: ${resSol.status} ${resSol.statusText} ${body?.error?.message || ""}`
          );
        }

        const solJson = await safeJson(resSol);
        const items = Array.isArray(solJson?.data) ? solJson.data : [];

        if (!mounted) return;
        setSolicitudes(items);
      } catch (err) {
        if (!mounted) return;
        setError(err.message || String(err));
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    if (!authLoading) load();

    return () => {
      mounted = false;
    };
  }, [authLoading, user, STRAPI, headers]);

  const handleAprobar = (id) => navigate(`/clubs/miclub/afiliar/aprobar/${id}`);
  const handleRechazar = (id) => navigate(`/clubs/miclub/afiliar/rechazar/${id}`);
  const handleAnotar = (id) => navigate(`/clubs/miclub/afiliar/anotar/${id}`);
  const handleScan = () => navigate(`/clubs/miclub/afiliar/scannear`);

  if (authLoading || loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!club) {
    return (
      <Box p={3}>
        <Alert severity="warning">No se encontró el club asociado al usuario.</Alert>
      </Box>
    );
  }

  return (
    <Box p={2}>

      {/* ===================== BOTÓN SCANNER PRO ===================== */}
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        mb={4}
      >
        <Button
          variant="contained"
          size="large"
          startIcon={<QrCodeScannerIcon />}
          onClick={handleScan}
          sx={{
            background: "linear-gradient(45deg, #7b1fa2, #9c27b0)",
            border: "2px solid #00ff99",
            boxShadow: "0 0 15px #00ff99",
            fontWeight: "bold",
            letterSpacing: "1px",
            px: 4,
            py: 1.8,
            borderRadius: "12px",
            transition: "all 0.3s ease",
            "&:hover": {
              background: "linear-gradient(45deg, #6a1b9a, #8e24aa)",
              boxShadow: "0 0 25px #00ff99",
              transform: "scale(1.05)",
            },
          }}
        >
          Scannear Código de Miembro de Club
        </Button>
      </Box>
      {/* ============================================================= */}

      <Typography variant="h5" mb={2}>
        Solicitudes de afiliación — {club?.attributes?.nombre_club ?? club?.attributes?.name ?? "Mi club"}
      </Typography>

      {(!solicitudes || solicitudes.length === 0) ? (
        <Alert severity="info">No hay solicitudes pendientes para tu club.</Alert>
      ) : (
        <List>
          {solicitudes.map((sol) => {
            const id = sol.id;
            const attrs = sol.attributes ?? {};
            const usuarioRel = attrs.usuario?.data ?? attrs.usuario ?? null;
            const usuarioAttrs = usuarioRel?.attributes ?? {};
            const nombreUsuario =
              usuarioAttrs?.nombre_completo ||
              usuarioAttrs?.username ||
              `${usuarioAttrs?.firstName ?? ""} ${usuarioAttrs?.lastName ?? ""}`.trim() ||
              usuarioAttrs?.email ||
              "Usuario";
            const emailUsuario = usuarioAttrs?.email ?? "-";
            const fechaSolicitada = attrs?.solicitada ? new Date(attrs.solicitada) : null;
            const fechaText = fechaSolicitada ? fechaSolicitada.toLocaleString() : "-";
            const status = attrs?.status ?? (attrs?.afiliacionpagada ? "pagado" : "pendiente");

            return (
              <React.Fragment key={id}>
                <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                  <ListItemAvatar>
                    <Avatar>{(nombreUsuario[0] || "U").toUpperCase()}</Avatar>
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
                        <Box>
                          <Typography variant="subtitle1">{nombreUsuario}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {emailUsuario}
                          </Typography>
                        </Box>

                        <Box textAlign="right">
                          <Typography variant="body2" color="text.secondary">
                            {fechaText}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Status: <strong>{status}</strong>
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />

                  <Box display="flex" gap={1} ml={2}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<NoteAddIcon />}
                      onClick={() => handleAnotar(id)}
                    >
                      Anotar
                    </Button>

                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      startIcon={<CheckIcon />}
                      onClick={() => handleAprobar(id)}
                    >
                      Aprobar
                    </Button>

                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      startIcon={<CloseIcon />}
                      onClick={() => handleRechazar(id)}
                    >
                      Rechazar
                    </Button>
                  </Box>
                </ListItem>

                <Divider />
              </React.Fragment>
            );
          })}
        </List>
      )}
    </Box>
  );
}
