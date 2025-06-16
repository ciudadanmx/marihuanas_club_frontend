import React from 'react';
import { IoIosNotifications } from "react-icons/io";
import { TbHelpTriangleFilled } from "react-icons/tb";
import NotificationsMenu from './NotificationsMenu';
import MenuInfo from './MenuInfo';
import '../../styles/MessagesIcon.css';

const MenuIcon = ({ count = 0, handleLogout, action = 'info', containerRef, isOpen, setIsOpen }) => {
  const toggleMenu = () => {
    setIsOpen(!isOpen); // ahora usamos el estado externo
  };

  return (
    <div ref={containerRef} className="message-icon-container" onClick={toggleMenu}>
      {action === 'info' ? (
        <>
          <TbHelpTriangleFilled className="message-icon" />
          {count > 0 && <span className="message-count">{count}</span>}
          <MenuInfo
            handleLogout={handleLogout}
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
          />
        </>
      ) : (
        <>
          <IoIosNotifications className="message-icon" />
          {count > 0 && <span className="message-count">{count}</span>}
          <NotificationsMenu
            handleLogout={handleLogout}
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
          />
        </>
      )}
    </div>
  );
};

export default MenuIcon;
