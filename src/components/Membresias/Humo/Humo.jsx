import React, { useState } from "react";
import SmokeScene from "./SmokeScene.jsx";
import PointsSmoke from "./PointsSmoke.jsx";

export default function Humo() {
  const [mode, setMode] = useState("shader"); // 'shader' o 'points'

  return (
    <div className="app-root">
      <header className="topbar">
        <div className="brand">ciudadan • smoke demo</div>
        <div style={{ marginLeft: "auto" }}>
          <button onClick={() => setMode("shader")} className={mode === "shader" ? "active" : ""}>ShaderMaterial</button>
          <button onClick={() => setMode("points")} className={mode === "points" ? "active" : ""}>Points (liviano)</button>
        </div>
      </header>

      <main className="main-area">
        <div className="canvas-wrap">
          {mode === "shader" ? <SmokeScene /> : <PointsSmoke />}
        </div>

        <aside className="hero-content">
          <h2>Efecto humo — ShaderMaterial</h2>
          <p>Movimiento basado en ruido procedural, varias luces y mezcla con meshes estándar.</p>
          <p>Puedes cambiar a la versión <strong>Points</strong> (más liviana) con los botones arriba.</p>
        </aside>
      </main>
    </div>
  );
}
