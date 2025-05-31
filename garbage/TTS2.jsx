import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import LazyLoad from "react-lazyload";

// Importando las imágenes directamente
import cerrada from "../../assets/sara/cerrada.png";
import casicerrada from "../../assets/sara/casicerrada.png";
import semiabierta from "../../assets/sara/semiabierta.png";
import media from "../../assets/sara/media.png";
import abierta from "../../assets/sara/abierta.png";
import ojosAbiertos from "../../assets/sara/ojos_abiertos.png";
import ojosCerrados from "../../assets/sara/ojos_cerrados.png";

// Importar hook useLmAiChat
import { useLmAiChat } from "../src/hooks/UseLmAiChat";

// Crear socket para la conexión
const socket = io("http://localhost:3003", {
  transports: ["websocket"],
  reconnection: true,
});

const TTS = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasStartedSpeaking, setHasStartedSpeaking] = useState(false); // Nuevo estado para controlar el div "pensando"
  const blinkIntervalRef = useRef(null);
  const [currentPrompt, setCurrentPrompt] = useState(null);

  const { response, isLoading, thinkingPhase, sendPrompt } = useLmAiChat();

  useEffect(() => {
    console.log("🟢 TTS Component Mounted");
    console.log("🔄 Conectando a WebSocket...");

    startBlinking(); // Iniciar parpadeo al cargar

    socket.on("connect", () => {
      console.log("✅ Conectado con ID:", socket.id);
    });

    // Al recibir el evento, se detiene el parpadeo y se llama al hook con el prompt modificado
    socket.off("speakTTS").on("speakTTS", (data) => {
      console.log("📥 Received speakTTS event:", data);
      if (!data) {
        console.warn("⚠️ Mensaje vacío");
        return;
      }
      stopBlinking(); // Detener parpadeo al iniciar el proceso
      // Reiniciamos la bandera para mostrar el div "pensando"
      setHasStartedSpeaking(false);
      const modifiedPrompt = `${data} contesta siempre en español y enfocate en dirigir todas las respuestas a que eres pandora una asistnete virtual de ciudadan.org`;
      setCurrentPrompt(modifiedPrompt);
      sendPrompt(modifiedPrompt);
    });

    socket.on("disconnect", () => {
      console.warn("🔴 Disconnected from socket");
    });

    return () => {
      // Limpiar los listeners al desmontar
      socket.off("speakTTS");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  // Cuando la respuesta final está lista, se inicia la síntesis de voz
  useEffect(() => {
    if (currentPrompt && !isLoading && !thinkingPhase && response) {
      speakMessage(response);
      setCurrentPrompt(null);
    }
  }, [isLoading, thinkingPhase, response, currentPrompt]);

  const startBlinking = () => {
    console.log("🌟 Start blinking");
    if (!blinkIntervalRef.current) {
      blinkIntervalRef.current = setInterval(() => {
        console.log("💬 Blink interval triggered");
        const imgElement = document.getElementById("asistenteImage");
        if (imgElement) {
          imgElement.src = ojosCerrados;
          console.log("👀 Ojos cerrados - src:", ojosCerrados);
          setTimeout(() => {
            if (imgElement) {
              imgElement.src = ojosAbiertos;
              console.log("👀 Ojos abiertos - src:", ojosAbiertos);
            }
          }, 300);
        }
      }, 2500);
    }
  };

  const stopBlinking = () => {
    console.log("❌ Stop blinking");
    if (blinkIntervalRef.current) {
      clearInterval(blinkIntervalRef.current);
      blinkIntervalRef.current = null;
      const imgElement = document.getElementById("asistenteImage");
      if (imgElement) {
        imgElement.src = getMouthPosition("");
        console.log("🖼️ Cambiar a imagen de la boca al detener parpadeo");
      }
    }
  };

  const getMouthPosition = (syllable) => {
    console.log("🔤 Getting mouth position for syllable:", syllable);
    const abiertas = /[aeo]/;
    const medias = /[iu]/;
    const semiabiertas = /[mn]/;
    const casicerradas = /[srd]/;
    const cerradas = /[pbtk]/;

    if (abiertas.test(syllable)) return abierta;
    if (medias.test(syllable)) return media;
    if (semiabiertas.test(syllable)) return semiabierta;
    if (casicerradas.test(syllable)) return casicerrada;
    return cerrada;
  };

  const speakMessage = (text) => {
    console.log("🗣️ Starting speech synthesis with:", text);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES";
    utterance.rate = 1;
    utterance.pitch = 1;

    setIsSpeaking(true); // Indicar que está hablando

    const syllables = text.match(/.{1,2}/g) || [];
    let index = 0;

    utterance.onstart = () => {
      console.log("🔊 Speech synthesis started");
      // Ocultar el div "pensando" cuando comienza a hablar
      setHasStartedSpeaking(true);
      const animateMouth = () => {
        if (index < syllables.length) {
          const syllable = syllables[index].toLowerCase();
          console.log("💋 Animating mouth, syllable:", syllable);
          const imgElement = document.getElementById("asistenteImage");
          if (imgElement) {
            imgElement.src = getMouthPosition(syllable);
            console.log("🖼️ Mouth image changed to:", getMouthPosition(syllable));
          }
          index++;
          setTimeout(animateMouth, 180);
        }
      };
      animateMouth();
    };

    utterance.onend = () => {
      console.log("🔇 Speech synthesis ended");
      setIsSpeaking(false);
      const imgElement = document.getElementById("asistenteImage");
      if (imgElement) {
        imgElement.src = cerrada;
        console.log("🖼️ Mouth image changed to cerrada");
      }
      startBlinking(); // Reiniciar parpadeo al finalizar el habla
    };

    window.speechSynthesis.speak(utterance);
    console.log("✅ Speech synthesis invoked, utterance:", utterance);
  };

  return (
    <div style={{ textAlign: "center", position: "relative" }}>
      {/* Div que se muestra hasta que inicia la síntesis de voz */}
      {!hasStartedSpeaking && response && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#ffffffaa",
            padding: "10px",
            borderRadius: "5px",
            zIndex: 10,
          }}
        >
          <h3>La asistente</h3>
        </div>
      )}
      <LazyLoad height={200} offset={100}>
        <h3>La asistente!!</h3>
        <img
          id="asistenteImage"
          src={ojosAbiertos}
          alt="Asistente"
          style={{
            width: "48vw",
            height: "auto",
            maxWidth: "480px",
          }}
        />
      </LazyLoad>
    </div>
  );
};

export default TTS;
