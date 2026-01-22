import React from "react";
import "../styles/Badge.css";

const Badge = () => {
  return (
    <div className="marihuanasclub-container">
      {/* Imagen del logo */}
      

      {/* SVG Circular para probar la posición */}
      <svg className="marihuanasclub-svg" viewBox="0 0 220 220">
        <defs>
          <path id="circle-path" d="M 110,10 A 100,100 0 1,1 109.9,10" />
        </defs>

        {/* Agrupamos el texto para animarlo */}
        <g className="marihuanasclub-text-group">
          <text className="marihuanasclub-text">
            <textPath href="#circle-path" startOffset="50%" textAnchor="middle">
              M A R I H U A N A S *CLUB
            </textPath>
          </text>
        </g>
      </svg>
    </div>
  );
};

export default Badge;
