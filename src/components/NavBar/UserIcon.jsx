import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import '../../styles/AccountMenuInfo.css';
import UserMenu from './UserMenu';

const UserIcon = ({ handleLogin, handleLogout, isMenuOpen, setIsMenuOpen, handleLinkClick, defaultProfileImage, guestImage }) => {
  const { user, isAuthenticated, loginWithRedirect, logout } = useAuth0();

  const toggleDropdown = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>


        {/* <Avatar src={user?.picture || defaultProfileImage} alt="Profile" /> */}

        <span className="nav-linky">
                        <div className="cuenta-icon-container" onClick={() => { isAuthenticated ? toggleDropdown() : handleLogin(); }}>
                          <img
                            src={isAuthenticated ? (user?.picture || defaultProfileImage) : guestImage}
                            alt="Profile"
                            className="cuenta-icon"
                          />

                          <UserMenu
                                      handleLogin={handleLogin}
                                      handleLogout={handleLogout}
                                      isMenuOpen={isMenuOpen}
                                      setIsMenuOpen={setIsMenuOpen}
                                      handleLinkClick={handleLinkClick}
                                      defaultProfileImage={defaultProfileImage}
                                      guestImage={guestImage}
                                      isOpen={isMenuOpen}
                                      onClose={() => setIsMenuOpen(false)}
                                    />
                        </div>
                      </span>

    </>
  );
};

export default UserIcon;
