// Html5QrScanner.jsx
import React, { useEffect, useRef, useState } from "react";
import { Fab, TextareaAutosize, Button } from "@material-ui/core";
import { ArrowBack } from "@material-ui/icons";
import { Link } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";

/**
 * Html5QrScanner
 * - Usa html5-qrcode (Html5QrcodeScanner) para escaneo robusto y sencillo.
 * - Maneja selección de cámara interna del scanner y limpieza al desmontar.
 * - Ideal como primer intento antes de usar soluciones más "manuales".
 *
 * Recomendaciones OBS: resolución >= 1280x720, QR grande y sin blur.
 */

export default function QrScanner() {
  const [result, setResult] = useState("No result");
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);
  const containerId = "html5qr-scanner";

  useEffect(() => {
    // configuración recomendada: fps alto, tamaño QRbox grande para OBS virtual cam
    const config = {
      fps: 20,                       // frames por segundo
      qrbox: { width: 480, height: 480 }, // el tamaño del recuadro de escaneo (ajusta si QR es grande/pequeño)
      disableFlip: false,            // permitir flip (útil en front cameras)
      formatsToSupport: ["QR_CODE"], // limitar formatos
      // intenta usar BarcodeDetector cuando esté disponible (faster)
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true
      },
      videoConstraints: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "environment"
      }
    };

    // crea el scanner (renderiza UI propia con selector de cámaras)
    const verbose = false;
    const scanner = new Html5QrcodeScanner(containerId, config, verbose);
    scannerRef.current = scanner;

    // callback que se llama al detectar un código
    const onScanSuccess = (decodedText, decodedResult) => {
      console.log("[html5-qrcode] detected:", decodedText, decodedResult);
      setResult(decodedText);
      // si quieres detener después de 1 lectura: scanner.clear();
      // si quieres seguir leyendo, no hacer nada
    };

    // callback de error por frame (no pasa nada por cada falla)
    const onScanFailure = (error) => {
      // console.debug("[html5-qrcode] scan failure", error);
    };

    // Renderiza y arranca el scanner con los callbacks
    scanner.render(onScanSuccess, onScanFailure);
    setScanning(true);

    return () => {
      // cleanup completo cuando el componente se desmonta
      setScanning(false);
      // clear detiene la cámara y libera recursos
      try {
        scanner.clear().then(() => {
          console.log("[html5-qrcode] scanner cleared");
        }).catch((e) => {
          console.warn("[html5-qrcode] clear() falló:", e);
        });
      } catch (e) {
        console.warn("[html5-qrcode] cleanup error:", e);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // monta solo una vez

  // botones de control para forzar reinicio (útil con virtual cams)
  const handleRestart = () => {
    if (!scannerRef.current) return;
    // clear + re-render
    scannerRef.current.clear().then(() => {
      console.log("[html5-qrcode] cleared (manual)");
      scannerRef.current.render(
        (decodedText) => {
          console.log("[html5-qrcode] detected after restart:", decodedText);
          setResult(decodedText);
        },
        (err) => {}
      );
      setScanning(true);
    }).catch((e) => {
      console.warn("[html5-qrcode] restart error:", e);
    });
  };

  return (
    <div style={{ padding: 12 }}>
      <h1>QR Scanner (html5-qrcode)</h1>

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
        <Link to="/">
          <Fab style={{ marginRight: 10 }} color="primary" size="small"><ArrowBack/></Fab>
        </Link>

        <Button variant="outlined" onClick={handleRestart}>Reiniciar scanner</Button>
      </div>

      <div id={containerId} style={{ width: "100%", maxWidth: 960 }} />

      <div style={{ marginTop: 12 }}>
        <b>Resultado:</b>
        <TextareaAutosize style={{ fontSize: 14, width: "100%", height: 120, marginTop: 8 }} value={result} readOnly />
      </div>

      <div style={{ marginTop: 12, color: "#444", fontSize: 13 }}>
        <b>Consejos:</b>
        <ul>
          <li>En OBS: setea la Virtual Camera a 1280x720 o 1920x1080 y asegúrate que la fuente QR sea grande y nítida.</li>
          <li>Si la Virtual Cam parece congelarse, presiona "Reiniciar scanner".</li>
          <li>Si la lectura tarda, aumenta <code>qrbox</code> o sube FPS en config.</li>
        </ul>
      </div>
    </div>
  );
}
