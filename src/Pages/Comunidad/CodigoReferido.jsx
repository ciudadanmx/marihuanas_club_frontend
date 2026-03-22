// src/components/GenerarCodigoReferido/GenerarCodigoReferido.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Chip,
  Typography,
  CircularProgress,
  Alert,
  Stack,
  Divider,
  Modal,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { motion } from "framer-motion";
import MostrarCodigoReferido from "./MostrarCodigoReferido";

/**
 * GenerarCodigoReferido
 *
 * - Pre-carga prefijo desde el email (parte antes de @) consultando Strapi (si existe).
 * - Comprueba si existe un codigoreferido activo asociado al usuario (por relation usuario.id
 *   o por metadata.emailAuth0).
 * - Si existe -> renderiza <MostrarCodigoReferido codigo={...} />
 * - Si no existe -> muestra el formulario para crear nuevo código, con 33 chips.
 *
 * Env:
 * - REACT_APP_STRAPI_URL
 * - REACT_APP_STRAPI_TOKEN (opcional)
 *
 * Requiere: MostrarCodigoReferido.jsx en la misma carpeta.
 */

const STRAPI_URL = process.env.REACT_APP_STRAPI_URL?.replace(/\/$/, "") || "";
const STRAPI_TOKEN = process.env.REACT_APP_STRAPI_TOKEN || "";

const SUFIJOS = [
  "rosin",
  "hash",
  "bubble",
  "tricoma",
  "terpeno",
  "maria420",
  "resina",
  "pacheclub",
  "cultivandoconsciencia",
  "sativa",
  "canamo",
  "420gen",
  "knhbsm",
  "weed",
  "cannabis",
  "indoor",
  "outdoor",
  "terpenoso",
  "lote",
  "cosechandoderechos",
  "forjandoelviaje",
  "flor",
  "semilla",
  "colmena",
  "ritual",
  "aura",
  "cosmos",
  "templo",
  "criolla",
  "tribu",
  "verdesistencia",
  "medicinadimensional",
  "conexión",
];

export default function GenerarCodigoReferido({ open = true, onClose = () => {} }) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth0();
  const [prefijo, setPrefijo] = useState("");
  const [sufijo, setSufijo] = useState("");
  const [userIdStrapi, setUserIdStrapi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingPrefijo, setCheckingPrefijo] = useState(false);
  const [prefijoDisponible, setPrefijoDisponible] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [initializing, setInitializing] = useState(true);
  const [existingCodigo, setExistingCodigo] = useState(null); // si hay código activo asociado al usuario
  const [checkingExisting, setCheckingExisting] = useState(false);

  const localpartFromEmail = (email = "") => {
    if (!email) return "";
    return email.split("@")[0] || email;
  };

  // bootstrap: obtener user id en Strapi (si posible) y precargar prefijo
  useEffect(() => {
    let mounted = true;
    const bootstrap = async () => {
      setInitializing(true);
      setError("");
      setSuccessMsg("");
      setExistingCodigo(null);

      try {
        if (!isAuthenticated) {
          setInitializing(false);
          return;
        }
        const email = user?.email || "";
        if (!email) {
          setInitializing(false);
          return;
        }

        // Intento 1: buscar user en Strapi para obtener id (si endpoint disponible)
        try {
          const usersEndpoint =
            STRAPI_URL +
            `/api/users?filters[email][$eq]=${encodeURIComponent(email)}&fields=id,email`;
          const res = await fetch(usersEndpoint, {
            headers: {
              "Content-Type": "application/json",
              ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
            },
          });
          if (res.ok) {
            const json = await res.json();
            if (json && Array.isArray(json.data) && json.data.length > 0) {
              const u = json.data[0];
              const id = u.id ?? u?.attributes?.id ?? null;
              if (mounted) {
                setUserIdStrapi(id);
                setPrefijo(localpartFromEmail(u.attributes?.email ?? user.email));
              }
            } else {
              if (mounted) {
                setPrefijo(localpartFromEmail(email));
              }
            }
          } else {
            if (mounted) setPrefijo(localpartFromEmail(email));
          }
        } catch (err) {
          if (mounted) setPrefijo(localpartFromEmail(email));
        }
      } catch (err) {
        console.error(err);
        setError("Error inicializando.");
      } finally {
        if (mounted) setInitializing(false);
      }
    };

    bootstrap();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated, user]);

  // comprobar si existe codigo activo asociado al usuario
  useEffect(() => {
    let mounted = true;
    const checkExisting = async () => {
      if (!isAuthenticated) return;
      setCheckingExisting(true);
      setExistingCodigo(null);
      try {
        // prioridad: buscar por usuario.id si la tenemos
        if (userIdStrapi) {
          const q = `${STRAPI_URL}/api/codigosreferidos?filters[usuario][id][$eq]=${userIdStrapi}&filters[activo][$eq]=true&populate=*&pagination[limit]=1`;
          const res = await fetch(q, {
            headers: {
              "Content-Type": "application/json",
              ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
            },
          });
          if (res.ok) {
            const json = await res.json();
            if (json && Array.isArray(json.data) && json.data.length > 0) {
              if (mounted) setExistingCodigo(json.data[0]);
              return;
            }
          }
        }
        // fallback: buscar por metadata.emailAuth0
        if (user?.email) {
          const q2 = `${STRAPI_URL}/api/codigosreferidos?filters[metadata][emailAuth0][$eq]=${encodeURIComponent(
            user.email
          )}&filters[activo][$eq]=true&populate=*&pagination[limit]=1`;
          const res2 = await fetch(q2, {
            headers: {
              "Content-Type": "application/json",
              ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
            },
          });
          if (res2.ok) {
            const json2 = await res2.json();
            if (json2 && Array.isArray(json2.data) && json2.data.length > 0) {
              if (mounted) setExistingCodigo(json2.data[0]);
              return;
            }
          }
        }
      } catch (err) {
        console.error("Error checking existing code:", err);
      } finally {
        if (mounted) setCheckingExisting(false);
      }
    };

    // sólo correr cuando ya hay info de inicialización
    if (!initializing) checkExisting();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated, user, userIdStrapi, initializing]);

  // comprobar disponibilidad del prefijo (debounce)
  useEffect(() => {
    let mounted = true;
    if (!prefijo) {
      setPrefijoDisponible(null);
      return;
    }
    const timer = setTimeout(async () => {
      setCheckingPrefijo(true);
      setPrefijoDisponible(null);
      setError("");
      try {
        const q = `${STRAPI_URL}/api/codigosreferidos?filters[prefijo][$eq]=${encodeURIComponent(
          prefijo
        )}&filters[activo][$eq]=true&pagination[limit]=1`;
        const res = await fetch(q, {
          headers: {
            "Content-Type": "application/json",
            ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
          },
        });
        if (!mounted) return;
        if (!res.ok) {
          setPrefijoDisponible(null);
          setError("No se pudo verificar disponibilidad del prefijo.");
        } else {
          const json = await res.json();
          const found = json && Array.isArray(json.data) && json.data.length > 0;
          setPrefijoDisponible(!found);
        }
      } catch (err) {
        console.error(err);
        setPrefijoDisponible(null);
        setError("Error comprobando prefijo.");
      } finally {
        if (mounted) setCheckingPrefijo(false);
      }
    }, 500);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [prefijo]);

  const handleSelectChip = (word) => {
    setSufijo(word);
    setSuccessMsg("");
    setError("");
  };

  const handleCrear = async () => {
    setError("");
    setSuccessMsg("");
    if (!prefijo) {
      setError("El prefijo no puede estar vacío.");
      return;
    }
    if (!sufijo) {
      setError("Selecciona un sufijo (una de las capsulitas).");
      return;
    }
    if (prefijoDisponible === false) {
      setError("El prefijo ya existe activo. Escoge otro prefijo.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        data: {
          usuario: userIdStrapi ?? null,
          prefijo: prefijo,
          sufijo: sufijo,
          descuento: 0,
          fecha_creado: new Date().toISOString(),
          metadata: {
            createdFrom: "generador-ui",
            emailAuth0: user?.email ?? null,
          },
          activo: true,
          comision: 0,
        },
      };

      const res = await fetch(`${STRAPI_URL}/api/codigosreferidos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Strapi create error:", res.status, text);
        setError(`No se pudo crear el código. Servidor respondió ${res.status}`);
      } else {
        const json = await res.json();
        setSuccessMsg("Código creado correctamente.");
        // actualizamos existingCodigo para mostrar el nuevo estado
        setExistingCodigo(json.data ?? json);
        setPrefijoDisponible(false);
      }
    } catch (err) {
      console.error(err);
      setError("Error creando el código.");
    } finally {
      setLoading(false);
    }
  };

  const previewCodigo = useMemo(() => {
    if (!prefijo) return "";
    return sufijo ? `${prefijo}-${sufijo}` : `${prefijo}-...`;
  }, [prefijo, sufijo]);

  // estilos: chips mucho más pegadas
  const styles = {
    paper: {
      borderRadius: 12,
      padding: 18,
      boxShadow:
        "0 6px 20px rgba(0,0,0,0.25), inset 0 0 18px rgba(111,0,255,0.04)",
      border: "1px solid rgba(255,255,255,0.04)",
      background:
        "linear-gradient(180deg, rgba(34,0,51,0.95) 0%, rgba(4,40,20,0.95) 100%)",
    },
    chipsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: 4,       // antes era 6 — ahora mucho más pegadas
    marginTop: 6,
    },
    chip: {
    borderRadius: 999,
    padding: "4px 8px", // más compactas
    fontWeight: 700,
    cursor: "pointer",
    userSelect: "none",
    boxShadow: "0 2px 6px rgba(0,0,0,0.20)",
    fontSize: 11,       // tamaño un poco más pequeño
    lineHeight: "18px",
    },
    neonPurple: {
      background:
        "linear-gradient(90deg, rgba(176,35,255,0.14), rgba(255,0,204,0.06))",
      color: "#f5e6ff",
      border: "1px solid rgba(255, 0, 204, 0.16)",
    },
    neonGreen: {
      background:
        "linear-gradient(90deg, rgba(0,255,144,0.06), rgba(0,255,128,0.03))",
      color: "#eafff2",
      border: "1px solid rgba(0,255,140,0.12)",
    },
  };

  // si existe un codigo activo, mostramos el componente MostrarCodigoReferido exclusivamente
  if (checkingExisting || initializing) {
    return (
      <Paper sx={{ ...styles.paper, width: "100%", maxWidth: 980, margin: "12px auto", textAlign: "center", p: 4 }}>
        <CircularProgress />
        <Typography sx={{ color: "#ddd", mt: 1 }}>Comprobando tu código...</Typography>
      </Paper>
    );
  }

  if (existingCodigo) {
    return (
      <Paper sx={{ ...styles.paper, width: "100%", maxWidth: 980, margin: "12px auto" }}>
        <MostrarCodigoReferido codigo={existingCodigo} onClose={onClose} />
      </Paper>
    );
  }

  // UI para crear nuevo código
  return (
    <Paper sx={{ ...styles.paper, width: "100%", maxWidth: 980, margin: "12px auto" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="h6" sx={{ color: "#fff" }}>
          Generar Código referido
        </Typography>
        <Box display="flex" gap={1} alignItems="center">
          {authLoading || initializing ? <CircularProgress size={20} /> : null}
          <Typography sx={{ color: "#d9d9ff", fontSize: 13 }}>
            {user?.email ?? "no autenticado"}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 2, borderColor: "rgba(255,255,255,0.04)" }} />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {successMsg && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMsg}
        </Alert>
      )}

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <Box flex={1}>
          <Typography sx={{ color: "#cfcfff", mb: 1 }}>Prefijo</Typography>
          <TextField
            size="small"
            fullWidth
            value={prefijo}
            onChange={(e) => {
              setPrefijo(e.target.value.replace(/\s+/g, "-").toLowerCase());
              setPrefijoDisponible(null);
              setSuccessMsg("");
              setError("");
            }}
            helperText={
              checkingPrefijo ? (
                <>
                  Comprobando disponibilidad... <CircularProgress size={12} />
                </>
              ) : prefijoDisponible === true ? (
                <span style={{ color: "#9affc3" }}>Disponible ✔️</span>
              ) : prefijoDisponible === false ? (
                <span style={{ color: "#ffb3b3" }}>
                  Ya existe un prefijo activo con ese nombre.
                </span>
              ) : (
                "Puedes editar el prefijo. Evita caracteres raros."
              )
            }
            inputProps={{ maxLength: 40 }}
            sx={{
              background: "rgba(255,255,255,0.02)",
              borderRadius: 1,
              "& .MuiInputBase-root": { color: "#fff" },
            }}
          />

          <Box mt={2}>
            <Typography sx={{ color: "#cfcfff", mb: 1 }}>Sufijo</Typography>
            <TextField
              size="small"
              fullWidth
              value={sufijo}
              onChange={(e) => setSufijo(e.target.value.replace(/\s+/g, "-").toLowerCase())}
              helperText="O selecciona una capsulita abajo para rellenarlo."
              sx={{
                background: "rgba(255,255,255,0.02)",
                borderRadius: 1,
                "& .MuiInputBase-root": { color: "#fff" },
                mt: 0.5,
              }}
            />
          </Box>

          <Box mt={2}>
            <Typography sx={{ color: "#cfcfff", mb: 1 }}>Preview</Typography>
            <Paper
              elevation={2}
              sx={{
                p: 1,
                borderRadius: 2,
                display: "inline-block",
                background: "linear-gradient(90deg,#120017,#012205)",
                color: "#e6ffd6",
                fontWeight: 700,
              }}
            >
              {previewCodigo}
            </Paper>
          </Box>

          <Box mt={3} display="flex" gap={2}>
            <Button
              variant="contained"
              onClick={handleCrear}
              startIcon={<CheckIcon />}
              disabled={loading}
              sx={{
                background:
                  "linear-gradient(90deg, rgba(176,35,255,0.95), rgba(123,0,255,0.95))",
                color: "#fff",
                "&:hover": {
                  filter: "brightness(1.06)",
                },
              }}
            >
              {loading ? <CircularProgress size={18} color="inherit" /> : "Crear código"}
            </Button>

            <Button
              variant="outlined"
              onClick={() => {
                setPrefijo(localpartFromEmail(user?.email));
                setSufijo("");
                setError("");
                setSuccessMsg("");
              }}
              sx={{
                color: "#ffd9ff",
                borderColor: "rgba(255,255,255,0.06)",
              }}
            >
              Reset
            </Button>
          </Box>
        </Box>

        <Box flex={1} ml={{ sm: 2 }} sx={{ minWidth: 260 }}>
          <Typography sx={{ color: "#cfcfff", mb: 1 }}>Sufijos disponibles</Typography>

          <Box sx={styles.chipsContainer}>
            {SUFIJOS.map((w) => {
              const selected = w === sufijo;
              return (
                <motion.div key={w} whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Chip
                    label={w}
                    onClick={() => handleSelectChip(w)}
                    sx={{
                      ...styles.chip,
                      ...(selected ? styles.neonGreen : styles.neonPurple),
                      textTransform: "lowercase",
                    }}
                    clickable
                  />
                </motion.div>
              );
            })}
          </Box>

          <Box mt={3}>
            <Typography sx={{ color: "#cfcfff", mb: 1 }}>Notas</Typography>
            <Typography sx={{ color: "#dfe6ff", fontSize: 13, mb: 1 }}>
              - El prefijo debe ser único mientras esté activo. Si ya existe un registro activo con ese prefijo,
              no podrás usarlo. <br />
              - El sufijo puede repetirse entre códigos. <br />
              - El código final será <strong>{previewCodigo}</strong>.
            </Typography>
          </Box>
        </Box>
      </Stack>
    </Paper>
  );
}
