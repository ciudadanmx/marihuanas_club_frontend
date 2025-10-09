import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/NavBar.css"; // Importa los estilos necesarios
import { FaDollarSign, FaWallet, FaCarSide, FaHamburger, FaStore, FaUniversity } from "react-icons/fa";
import { BsBriefcaseFill } from "react-icons/bs";
import { AiOutlineApartment } from "react-icons/ai";

const iconMap = {
  gana: <FaDollarSign />,
  cartera: <FaWallet />,
  taxis: <FaCarSide />,
  comida: <FaHamburger />,
  market: <FaStore />,
  mCowork: <BsBriefcaseFill />,
  academia: <FaUniversity />,
  comunidad: <AiOutlineApartment />,
};

const NavButton = ({ section, activeTab, handleNavigation }) => {
  const navigate = useNavigate();
  const isActive = activeTab === `/${section}`;
  const messageCount = 10; // Placeholder para pruebas

  if (section === "taxis") {
    return (
      <div
        className={`nav-link ${activeTab === "/taxis" ? "active" : ""}`}
        onClick={() => handleNavigation("/taxis")}
        style={{ cursor: "pointer", position: "relative" }}
      >
        <span className="big-icon" style={{ position: "relative" }}>
          <FaCarSide />
          {messageCount > 0 && (
            <span id="message-count-taxis" className="message-count">
              {messageCount}
            </span>
          )}
        </span>
        <span className="nav-text taxi-subido">Taxis</span>
      </div>
    );
  }

  return (
    <div
      className={`nav-link ${isActive ? "active" : ""}`}
      onClick={() => handleNavigation(`/${section}`)}
      style={{ cursor: "pointer", position: "relative" }}
    >
      <span className="small-icon" style={{ position: "relative" }}>
        {iconMap[section]}
        {messageCount > 0 && (
          <span id={`message-count-${section}`} className="message-count">
            {messageCount}
          </span>
        )}
      </span>
      <span className="nav-text">
        {section.charAt(0).toUpperCase() + section.slice(1)}
      </span>
    </div>
  );
};

export default NavButton;
