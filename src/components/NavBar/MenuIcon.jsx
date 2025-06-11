import React, { useState } from 'react';
import { IoIosNotifications } from "react-icons/io";
import { TbHelpTriangleFilled } from "react-icons/tb";
import NotificationsMenu from './NotificationsMenu';
import MenuInfo from './MenuInfo';
import '../../styles/MessagesIcon.css';

const MenuIcon = ({ count = 33, handleLogout, action = 'info' }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      {action === 'info' ? (
        <div className="message-icon-container" onClick={toggleMenu}>
          <TbHelpTriangleFilled className="message-icon" />
          {count > 0 && <span className="message-count">{count}</span>}
          <MenuInfo
            handleLogout={handleLogout}
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
          />
        </div>
      ) : (
        <div className="message-icon-container" onClick={toggleMenu}>
          <IoIosNotifications className="message-icon" />
          {count > 0 && <span className="message-count">{count}</span>}
          <NotificationsMenu
            handleLogout={handleLogout}
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
          />
        </div>
      )}
    </>
  );
};

export default MenuIcon;
