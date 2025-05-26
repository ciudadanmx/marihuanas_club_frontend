import React from 'react';
import '../../styles/MenuMenu.css';
import '../../styles/AccountMenu.css';
import wikiImage from '../../assets/wikiciudadan.png'; 
import quienesImage from '../../assets/quienes.png'; 
import blogImage from '../../assets/blog.png'; 
import whitePaperImage from '../../assets/whitepaper.png'; 
import tokensImage from '../../assets/tokens.jpeg'; 
import helpImage from '../../assets/help.png'; 
import contactImage from '../../assets/contacto.jpeg'; 
import VideosImage from '../../assets/videos.png'; 

const MenuMenu = ({ isOpen, onClose }) => {
  const items = [
    { href: "https://wiki.ciudadan.org", img: wikiImage, alt: "Wiki Ciudadan", label: "Wiki", target: "_blank" },
    { href: "/info/quienes", img: quienesImage, alt: "¿Quiénes somos?", label: "¿Quiénes somos?" },
    { href: "/info/blog", img: blogImage, alt: "Blog", label: "Blog" },
    { href: "/info/whitepaper", img: whitePaperImage, alt: "LitePaper", label: "LitePaper" },
    { href: "/cartera/tokens", img: tokensImage, alt: "Comprar Tokens", label: "Comprar Token$" },
    { href: "/info/ayuda", img: helpImage, alt: "Ayuda", label: "Ayuda" },
    { href: "/info/contacto", img: contactImage, alt: "Contacto", label: "Contactos" },
    { href: "/info/videoteca", img: VideosImage, alt: "Videoteca", label: "Videoteca", target: "_blank" },
  ];

  return (
    <div className={`account-menu ${isOpen ? 'open' : 'closed'} menu-menu`}>
      <div className="grid-container">
        {items.map((item, index) => (
          <div className="grid-item" key={index} onClick={onClose}>
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
  );
};

export default MenuMenu;
