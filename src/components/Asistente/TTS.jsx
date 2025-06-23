import React, { useState, useEffect, useRef } from "react";
import LazyLoad from "react-lazyload";
import asistenteMin from "../../assets/asistente_min.png";
import { IoSend } from "react-icons/io5";

const TTS = () => {
  const [mensajes, setMensajes] = useState([
    { from: "bot", text: "🌿 Soy Mary-Bot. Pregúntame lo que quieras sobre Marihuanas.Club 💬" }
  ]);

  const chatEndRef = useRef(null);

  useEffect(() => {
  if (chatEndRef.current) {
    chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }
}, [mensajes]);

  const enviarMensaje = (mensajeUsuario) => {
    if (!mensajeUsuario.trim()) return;
    setMensajes((prev) => [
      ...prev,
      { from: "user", text: mensajeUsuario },
      { from: "bot", text: "😅 Lo siento, aún no sé responder, estoy siendo entrenada..." }
    ]);
  };

  const [input, setInput] = useState("");

  const manejarEnvio = (e) => {
    e.preventDefault();
    enviarMensaje(input);
    setInput("");
  };
  

  return (
  <div style={{ width: "100%", height: "100%" }}>
    <div className="chat-container">
      <div className="chat-mensajes">
        {mensajes.map((msg, idx) => (
          <div
            key={idx}
            className={`mensaje ${msg.from === "bot" ? "bot" : "user"}`}
            style={{ alignSelf: msg.from === "bot" ? "flex-start" : "flex-end" }}
          >
            {msg.text}
          </div>
        ))}

        {/* 🔽 Este div invisible es donde se hace scroll automáticamente */}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={manejarEnvio} className="chat-input-area">
        <input
          type="text"
          placeholder="Escribe tu pregunta..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="chat-input"
        />
        <button type="submit" className="chat-enviar">
          <IoSend size="1.4em" />
        </button>
      </form>
    </div>

    <LazyLoad height={100} offset={100}>
      <div className="hada-float">
        <img
          src={asistenteMin}
          alt="Hada Mary"
          className="hada-img"
        />
      </div>
    </LazyLoad>
  </div>
);

};

export default TTS;
