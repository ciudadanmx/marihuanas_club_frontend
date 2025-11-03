// QrScanner.jsx (import de icono cambiado a FileCopy)
import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextareaAutosize,
  Typography,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";

// IMPORTS DE ICONOS PUNTUALES
// Si usas Material-UI v4: npm i @material-ui/icons
// import FileCopyIcon from "@material-ui/icons/FileCopy";
// Si usas MUI v5: npm i @mui/icons-material  -> importar desde '@mui/icons-material/FileCopy'
import FileCopyIcon from "@material-ui/icons/FileCopy";
import RefreshIcon from "@material-ui/icons/Refresh";
import OpenIcon from "@material-ui/icons/OpenInNew";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";

import { motion } from "framer-motion";

/* ...el resto del componente mantiene la misma lógica que ya tenías... */

export default function QrScanner({
  onResult = null,
  actionText = "A B R I R",
  qrbox = 480,
  openInNewTab = false,
  title = "Escanear código QR",
  subtitle = "Apunta la cámara al código QR para consultar información: ver estado de membresía, ficha de planta o historial de actividad."
}) {
  const containerId = "html5qr-scanner";
  const scannerRef = useRef(null);
  const mountedRef = useRef(true);
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  const [lastText, setLastText] = useState("");
  const [scanning, setScanning] = useState(false);
  const [available, setAvailable] = useState(true);
  const [infoMsg, setInfoMsg] = useState("Coloca el QR dentro del recuadro. Al detectarlo podrás ver su información.");

  useEffect(() => {
    mountedRef.current = true;
    setInfoMsg("Coloca el QR dentro del recuadro. Al detectarlo podrás ver su información.");
    const config = {
      fps: 18,
      qrbox: { width: qrbox, height: qrbox },
      disableFlip: false,
      formatsToSupport: ["QR_CODE"],
      experimentalFeatures: { useBarCodeDetectorIfSupported: true },
      videoConstraints: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "environment" },
    };

    try {
      const scanner = new Html5QrcodeScanner(containerId, config, false);
      scannerRef.current = scanner;

      const success = (decodedText /*, decodedResult */) => {
        if (!mountedRef.current) return;
        if (!decodedText || decodedText === lastText) return;
        setLastText(decodedText);
        setInfoMsg("Código detectado. Cargando información...");

        if (typeof onResult === "function") {
          try {
            onResult(decodedText);
            setInfoMsg("Datos obtenidos.");
          } catch (e) {
            console.error("QrScanner onResult callback error:", e);
            setInfoMsg("Ocurrió un problema al procesar el código.");
          }
          return;
        }

        try {
          const isAbsolute = /^https?:\/\//i.test(decodedText);
          if (isAbsolute) {
            if (openInNewTab) {
              window.open(decodedText, "_blank", "noopener,noreferrer");
            } else {
              window.location.href = decodedText;
            }
            setInfoMsg("Abriendo enlace...");
          } else {
            navigate(decodedText);
            setInfoMsg("Abriendo detalle...");
          }
        } catch (e) {
          console.warn("QrScanner navigate/open error:", e);
          setInfoMsg("No se pudo abrir el enlace. Copia el texto manualmente.");
        }
      };

      const failure = () => { /* noop */ };

      scanner.render(success, failure);
      setScanning(true);
    } catch (e) {
      console.error("QrScanner init failed:", e);
      setAvailable(false);
      setInfoMsg("El escáner no está disponible en este navegador.");
    }

    return () => {
      mountedRef.current = false;
      setScanning(false);
      if (scannerRef.current) {
        scannerRef.current.clear().then(() => {
          scannerRef.current = null;
        }).catch((err) => {
          scannerRef.current = null;
          console.warn("QrScanner clear error:", err);
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRestart = () => {
    setLastText("");
    setInfoMsg("Reiniciando el escáner...");
    if (!scannerRef.current) return;
    scannerRef.current.clear().then(() => {
      scannerRef.current.render(
        (decodedText) => {
          if (!mountedRef.current) return;
          if (!decodedText || decodedText === lastText) return;
          setLastText(decodedText);
          if (typeof onResult === "function") onResult(decodedText);
          else {
            const isAbsolute = /^https?:\/\//i.test(decodedText);
            if (isAbsolute) {
              if (openInNewTab) window.open(decodedText, "_blank", "noopener,noreferrer");
              else window.location.href = decodedText;
            } else {
              navigate(decodedText);
            }
          }
        },
        () => { /* noop */ }
      );
      setInfoMsg("Escáner listo — apunta el QR.");
      setScanning(true);
    }).catch((e) => {
      console.warn("QrScanner restart error:", e);
      setInfoMsg("No se pudo reiniciar el escáner.");
    });
  };

  const handleActionClick = () => {
    if (!lastText) return;
    if (typeof onResult === "function") {
      onResult(lastText);
      return;
    }
    const isAbsolute = /^https?:\/\//i.test(lastText);
    if (isAbsolute) {
      if (openInNewTab) window.open(lastText, "_blank", "noopener,noreferrer");
      else window.location.href = lastText;
    } else {
      navigate(lastText);
    }
  };

  const copyToClipboard = async () => {
    if (!lastText) return;
    try {
      await navigator.clipboard.writeText(lastText);
      setInfoMsg("Texto copiado al portapapeles.");
    } catch {
      setInfoMsg("No se pudo copiar al portapapeles.");
    }
  };

  // Colores y estilos (fondo oscuro, espaciado bajo navbar)
  const bgDark = "#0d3505ff";
  const card = "#0b5722ff";
  const accent = "#e7e83a";
  const primary = "#23a55a";
  const textMuted = "#9fb29a";
  const headerColor = "#bdebb0";

  if (!available) {
    return (
      <Box px={2} pt={4} pb={6} style={{ background: bgDark, minHeight: "60vh" }}>
        <Box maxWidth={1100} mx="auto" pt={6}>
          <Typography variant="h5" style={{ color: headerColor, fontWeight: 900 }}>{title}</Typography>
          <Typography variant="body1" style={{ color: textMuted, marginTop: 12 }}>
            El escáner no está disponible en este navegador. Prueba con otro navegador o dispositivo.
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
      <Box
        style={{ background: bgDark, paddingTop: 22, paddingBottom: 44, minHeight: "60vh" }}
      >
        <Box style={{ maxWidth: 1200, margin: "0 auto", padding: "0 18px" }}>
          {/* Header */}
          <Box display="flex" alignItems="flex-start" gap={2} mb={2} mt={2}>
            <Box>
              <Typography variant={isSmall ? "h6" : "h4"} style={{ color: headerColor, fontWeight: 900 }}>
                {title}
              </Typography>
              <Typography variant="body1" style={{ color: textMuted, marginTop: 8, maxWidth: 760 }}>
                {subtitle}
              </Typography>
            </Box>

            
          </Box>

          {/* Content area */}
          <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={3}>
            {/* Left: Scanner */}
            <Box flex={1} style={{ background: card, borderRadius: 12, padding: 14, boxShadow: "0 12px 40px rgba(39, 66, 4, 0.76)" }}>
              <div id={containerId} style={{ width: "100%", maxWidth: 920, margin: "0 auto" }} />
              <Typography variant="caption" style={{ display: "block", marginTop: 12, color: textMuted }}>
                {infoMsg}
              </Typography>
              
            </Box>

            {/* Right: Result card */}
            <Box width={{ xs: "100%", md: 420 }} style={{ background: "#06310aff", borderRadius: 12, padding: 16, border: `1px solid rgba(255,255,255,0.04)` }}>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box>
                  <Typography variant="subtitle1" style={{ color: headerColor, fontWeight: 900 }}>Resultado</Typography>
                  <Typography variant="body2" style={{ color: textMuted, marginTop: 6 }}>
                    {lastText ? "Se detectó un código. Revisa la información y pulsa Ver detalle para continuar." : "No se ha detectado ningún QR aún."}
                  </Typography>
                </Box>

                <TextareaAutosize
                  value={lastText || ""}
                  readOnly
                  placeholder="Esperando lectura..."
                  style={{
                    width: "100%",
                    minHeight: 120,
                    marginTop: 6,
                    padding: 12,
                    fontSize: 14,
                    borderRadius: 10,
                    border: `1px solid rgba(255,255,255,0.04)`,
                    background: "#051017",
                    color: "#dff6e0",
                    resize: "none",
                  }}
                />

                <Box display="flex" gap={1} alignItems="center">
                  <Button
                    variant="contained"
                    onClick={handleActionClick}
                    disabled={!lastText}
                    startIcon={<OpenIcon style={{ color: "#071018" }} />}
                    style={{
                      background: primary,
                      color: "#071018",
                      padding: "10px 14px",
                      fontWeight: 900,
                      textTransform: "none",
                      boxShadow: "0 10px 30px rgba(35,165,90,0.12)"
                    }}
                  >
                    {actionText}
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={copyToClipboard}
                    disabled={!lastText}
                    startIcon={<FileCopyIcon style={{ color: accent }} />}
                    style={{
                      borderColor: accent,
                      color: accent,
                      fontWeight: 700,
                      textTransform: "none",
                      background: "transparent"
                    }}
                  >
                    Copiar
                  </Button>

                  <Box marginLeft="auto" textAlign="right">
                    <Typography variant="caption" style={{ color: textMuted }}>Estado</Typography>
                    <Typography variant="subtitle2" style={{ color: scanning ? primary : "#6b6f74", fontWeight: 800 }}>
                      {scanning ? "Escaneando" : "Inactivo"}
                    </Typography>
                  </Box>
                </Box>

                <Box style={{ color: textMuted, fontSize: 13 }}>
                  <strong>Notas para un mejor resultado</strong>
                  <ul style={{ marginTop: 8 }}>
                    <li>Mantén el código dentro del recuadro y espera la lectura automática.</li>
                    <li>Si la lectura tarda, acerca el dispositivo o mueve el QR hasta que esté nítido en la vista previa.</li>
                    <li>Si hay problemas de lectura frecuentes, pulsa <em>Reiniciar escáner</em>.</li>
                  </ul>
                </Box>
              </Box>

              <Box marginLeft="auto" display="flex" gap={1} alignItems="center">
              <Button
                onClick={handleRestart}
                startIcon={<RefreshIcon style={{ color: "#fff" }} />}
                style={{
                  background: card,
                  color: "#fff",
                  border: `1px solid ${accent}`,
                  padding: "8px 14px",
                  fontWeight: 800,
                  textTransform: "none",
                }}
              >
                Reiniciar escáner
              </Button>
            </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
}
