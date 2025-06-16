//import React from 'react';

import '../../styles/NotificationsMenu.css';
//import Sesion from './Sesion';
//import { gapi } from 'gapi-script';
import { useState, useEffect } from 'react';
import wikiImage from '../../assets/wiki_marihuanas_club.png'; 
import quienesImage from '../../assets/quienes.png'; 
import logoImage from '../../assets/logo_cuadro.png'; 
import helpImage from '../../assets/help.png'; 
import contactImage from '../../assets/faq.png'; 
import VideosImage from '../../assets/videos.png'; 

import '../../styles/MenuInfo.css';
//import '../../styles/AccountMenu.css';

const MenuInfo = ({ handleLogout, isOpen, onClose,  onLogout, containerRef, setIsOpen }) => {

    const items = [
      { href: "/", img: logoImage, alt: "Presentación", label: "Presentación" },
      { href: "/info/quienes", img: quienesImage, alt: "¿Quiénes Somos?", label: "¿Quiénes Somos?" },
      { href: "https://wiki.marihuanas.club", img: wikiImage, alt: "Wiki Ciudadan", label: "Wiki", target: "_blank" },
      { href: "/info/contacto", img: contactImage, alt: "Preguntas Frecuentes", label: "Preguntas Frecuentes" },
      { href: "/info/ayuda", img: helpImage, alt: "Ayuda", label: "Ayuda" },
      { href: "/info/videoteca", img: VideosImage, alt: "Canal YT", label: "Canal YT", target: "_blank" },
    ];



  return (
    <div ref={containerRef}>
    <div className={`notifications-menu ${isOpen ? 'open' : 'closed'} verde`}>
    <div className="grid-container verde">
        {items.map((item, index) => (
          <div className="grid-item margin-bot" key={index} onClick={onClose}>
            <a 
              href={item.href} 
              target={item.target || "_self"} /* Abre en una nueva pestaña si está definido, de lo contrario en la misma */
              rel={item.target === "_blank" ? "noopener noreferrer" : undefined} /* Solo agrega 'noopener' si target es _blank */
            >
              <img src={item.img} width="50px" alt={item.alt} />
              <p>{item.label}</p>
            </a>
          </div>
        ))}
      </div>
  </div>
  </div>
  );
};

export default MenuInfo;
