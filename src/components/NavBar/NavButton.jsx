import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/NavBar.css"; // Importa los estilos necesarios

const NavButton = ({ section, activeTab, handleNavigation, iconMap }) => {
  const navigate = useNavigate();
  const isActive = activeTab === `/${section}`;
  

  return (
    <span
      className={`nav-link ${isActive ? "active" : ""}`}
      onClick={() => handleNavigation(`/${section}`)}
      style={{ cursor: "pointer", position: "relative" }}
    >
      <span className="small-icon" style={{ position: "relative" }}>
        {iconMap[section]}
      
      </span>
      <span className="nav-text">
        {section.charAt(0).toUpperCase() + section.slice(1)}
      </span>
    </span>
  );
};

export default NavButton;