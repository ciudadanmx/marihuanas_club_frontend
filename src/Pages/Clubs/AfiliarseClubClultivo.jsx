// src/components/Clubs/AfiliarseClubCultivo.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Button,
  Alert,
} from "@mui/material";
import { motion } from "framer-motion";
import PaymentIcon from "@mui/icons-material/Payment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

/* ----------------------
   PLACEHOLDERS (reemplaza)
   ---------------------- */
const RealizarPagoInstalacion = ({ onSuccess }) => (
  <Box>
    <Typography>Componente de pago (placeholder)</Typography>
    <Button
      variant="contained"
      startIcon={<PaymentIcon />}
      onClick={() =>
        // simulación de pago; tu componente real llamará `onSuccess(paymentMeta)`
        setTimeout(() => onSuccess({ provider: "stripe", id: "txn_mock_123" }), 200)
      }
    >
      Simular pago exitoso
    </Button>
  </Box>
);

const InstalacionProgreso = ({ solicitud }) => (
  <Card>
    <CardContent>
      <Typography variant="h6">Progreso de instalación</Typography>
      <Typography>Solicitud ID: {solicitud?.id ?? "-"}</Typography>
      <Typography>Status: {solicitud?.attributes?.status ?? "-"}</Typography>
    </CardContent>
  </Card>
);
/* ---------------------- */

const motionProps = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.28 },
};

export default function AfiliarseClubCultivo() {
  // Hooks: siempre en el mismo orden
  const { user, isLoading: authLoading } = useAuth0();
  const { club: clubSlug } = useParams();
  const [creating, setCreating] = useState(false);

  

  const STRAPI = (process.env.REACT_APP_STRAPI_URL || "").replace(/\/$/, "");
  const STRAPI_TOKEN = process.env.REACT_APP_STRAPI_TOKEN || null;

  // estados
  const [loading, setLoading] = useState(true); // carga inicial (buscar user/club/solicitud)
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [clubId, setClubId] = useState(null);
  const [solicitud, setSolicitud] = useState(null);
  //const [creating, setCreating] = useState(false); // crear solicitud después del pago

  // Memoizamos headers para evitar que cambien en cada render
  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
    }),
    [STRAPI_TOKEN]
  );

  useEffect(() => {
    let mounted = true;

    // Si Auth0 todavía carga, no hacemos nada (pero el hook siempre se llama)
    if (authLoading) {
      // dejamos loading true para que el render muestre spinner
      return () => {
        mounted = false;
      };
    }

    const safeJson = async (res) => {
      try {
        return await res.json();
      } catch {
        return null;
      }
    };

    const init = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!STRAPI) {
          throw new Error("REACT_APP_STRAPI_URL no está configurada en .env");
        }

        if (!user?.email) {
          throw new Error("Usuario no disponible desde Auth0 (user.email faltante)");
        }

        if (!clubSlug) {
          throw new Error("Slug del club no encontrado en la ruta (:club)");
        }

        // 1) Buscar usuario por email
        const urlUser = `${STRAPI}/api/users?filters[email][$eq]=${encodeURIComponent(
          'ciudadanmx@gmail.com'
        )}&populate=club&pagination[limit]=1`;
        console.debug("[Afiliarse] GET", urlUser);
        const userRes = await fetch(urlUser);
        if (!userRes.ok) {
            alert('nooo');
          const body = await safeJson(userRes);
          throw new Error(`Error buscando usuario: ${userRes.status} ${userRes.statusText} ${body?.error?.message || ""}`);
        }
        alert('hasta acá ya llegamos');
        const userJson = await safeJson(userRes);
        console.log('afiliando userID', userJson[0]?.id);
        const uId = userJson?.[0]?.id;
        if (!uId) throw new Error("Usuario no encontrado en Strapi con ese email");
        if (!mounted) return;
        setUserId(uId);

        // 2) Buscar club por slug
        // Ajusta '/api/clubs' -> '/api/club' si tu Strapi usa diferente
        const urlClub = `${STRAPI}/api/clubs?filters[nombre_club][$eq]=${encodeURIComponent(
          clubSlug
        )}&pagination[limit]=1`;
        console.debug("[Afiliarse] GET", urlClub);
        const clubRes = await fetch(urlClub, { headers });
        if (!clubRes.ok) {
          const body = await safeJson(clubRes);
          throw new Error(`Error buscando club: ${clubRes.status} ${clubRes.statusText} ${body?.error?.message || ""}`);
        }
        const clubJson = await safeJson(clubRes);
        console.log('afiliandose club', clubJson);
        console.log()
        const cId = clubJson?.data?.[0]?.id;
        if (!cId) throw new Error(`Club con slug '${clubSlug}' no encontrado`);
        if (!mounted) return;
        setClubId(cId);

        // 3) Buscar solicitudafiliaciones (usuario + club)
        const urlSol = `${STRAPI}/api/solicitudafiliaciones?filters[usuario][id][$eq]=${uId}&filters[club][id][$eq]=${cId}&pagination[limit]=1&populate=*`;
        console.debug("[Afiliarse] GET", urlSol);
        const solRes = await fetch(urlSol, { headers });
        if (!solRes.ok) {
          const body = await safeJson(solRes);
          throw new Error(`Error buscando solicitud: ${solRes.status} ${solRes.statusText} ${body?.error?.message || ""}`);
        }
        const solJson = await safeJson(solRes);
        if (!mounted) return;
        setSolicitud(solJson?.data?.[0] || null);
      } catch (err) {
        console.error("[Afiliarse] init error:", err);
        if (!mounted) return;
        setError(err.message || String(err));
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    init();

    return () => {
      mounted = false;
    };
    // NOTA: headers está memoizado; STRAPI y clubSlug son strings estables
  }, [authLoading, user, clubSlug, STRAPI, headers]);

  // crea solicitud en Strapi (llamado tras pago exitoso)
  const createSolicitudAfiliacion = async ({ uId, cId, extra = {} }) => {
    if (!STRAPI) throw new Error("REACT_APP_STRAPI_URL no definido");
    setCreating(true);
    try {
      const body = {
        data: {
          usuario: uId,
          club: cId,
          solicitada: new Date().toISOString(),
          status: extra.status ?? "pagado",
          afiliacionpagada: extra.afiliacionpagada ?? true,
          metadata: extra.metadata ?? { pago: extra.paymentMeta ?? null },
        },
      };

      const url = `${STRAPI}/api/solicitudafiliaciones?populate=*`;
      console.debug("[Afiliarse] POST", url, body);
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      const safeJsonRes = async (r) => {
        try { return await r.json(); } catch { return null; }
      };

      if (!res.ok) {
        const txt = await safeJsonRes(res);
        throw new Error(`Error creando solicitud: ${res.status} ${res.statusText} ${txt?.error?.message || ""}`);
      }

      const json = await safeJsonRes(res);
      return json?.data ?? null;
    } finally {
      setCreating(false);
    }
  };

  // callback que pasamos al componente de pago
  const handlePagoExitoso = async (paymentMeta) => {
    try {
      setError(null);
      if (!userId || !clubId) throw new Error("Faltan userId/clubId para crear la solicitud");
      const nueva = await createSolicitudAfiliacion({
        uId: userId,
        cId: clubId,
        extra: { status: "pagado", afiliacionpagada: true, paymentMeta },
      });
      if (nueva) setSolicitud(nueva);
    } catch (err) {
      console.error("[Afiliarse] handlePagoExitoso error:", err);
      setError(err.message || String(err));
    }
  };

  // UI states
  if (authLoading || loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <motion.div {...motionProps}>
        <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
          <CardContent>
            <Box display="flex" gap={1} alignItems="center" mb={1}>
              <ErrorOutlineIcon color="error" />
              <Typography color="error">Error:</Typography>
            </Box>
            <Typography mt={1} color="text.secondary">
              {error}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2">
              Revisa en consola y Network:
              <ul>
                <li>REACT_APP_STRAPI_URL en .env</li>
                <li>Ruta correcta para clubs: /api/clubs o /api/club</li>
                <li>Si la API requiere token, usar REACT_APP_STRAPI_TOKEN o getAccessTokenSilently()</li>
                <li>Problemas CORS (respuesta 401/403 o bloqueo por CORS)</li>
              </ul>
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const solicitudPagada =
    solicitud && (solicitud?.attributes?.status === "pagado" || solicitud?.attributes?.afiliacionpagada === true);

  // RENDER final
  return (
    <motion.div {...motionProps}>
      <Box>
        <Typography variant="h4" mb={2} color="#6a1b9a" fontWeight="bold">
          Afiliarse al club
        </Typography>

        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Usuario: <strong>{user?.email}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Club (slug): <strong>{clubSlug}</strong>
            </Typography>

            <Divider sx={{ my: 1 }} />

            {solicitud ? (
              <Box display="flex" alignItems="center" gap={1}>
                <CheckCircleIcon color="success" />
                <Typography>Ya existe una solicitud registrada (ID: {solicitud?.id ?? "—"}).</Typography>
              </Box>
            ) : (
              <Box display="flex" alignItems="center" gap={1}>
                <PaymentIcon />
                <Typography>No hay solicitud de afiliación registrada para este usuario y club.</Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {solicitudPagada ? (
          <InstalacionProgreso solicitud={solicitud} />
        ) : (
          <>
            {!solicitud && (
              <Card sx={{ p: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Pasos para afiliarte
                  </Typography>
                  <Typography color="text.secondary" mb={2}>
                    Para completar tu afiliación, primero debes realizar el pago de instalación.
                    Al confirmar el pago se generará la solicitud de afiliación automáticamente.
                  </Typography>

                  <RealizarPagoInstalacion onSuccess={handlePagoExitoso} />

                  {creating && (
                    <Box mt={2}>
                      <Typography variant="body2">Creando solicitud en el servidor...</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}

            {solicitud && !solicitudPagada && (
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1">Solicitud existente</Typography>
                  <Typography color="text.secondary">
                    Status: {solicitud?.attributes?.status ?? "—"}
                  </Typography>
                  <Typography color="text.secondary">
                    Solicitada: {solicitud?.attributes?.solicitada ?? "—"}
                  </Typography>

                  <Divider sx={{ my: 1 }} />

                  <Typography color="text.secondary" mb={1}>
                    Si tu pago aún no se ha registrado, puedes intentar realizarlo de nuevo:
                  </Typography>
                  <RealizarPagoInstalacion onSuccess={handlePagoExitoso} />
                </CardContent>
              </Card>
            )}
          </>
        )}
      </Box>
    </motion.div>
  );
}
