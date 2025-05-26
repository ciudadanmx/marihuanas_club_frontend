import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { motion } from 'framer-motion';
import { Button, Avatar, Menu, MenuItem, ListItemIcon, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import '../../styles/AccountMenuMenu.css';


// Importar iconos desde la CDN
const AccountCircleIcon = () => <i className="material-icons">account_circle</i>;
const ExitToAppIcon = () => <i className="material-icons">exit_to_app</i>;
const SettingsIcon = () => <i className="material-icons">settings</i>;
const DashboardIcon = () => <i className="material-icons">dashboard</i>;
const HelpIcon = () => <i className="material-icons">help</i>;
const MembershipIcon = () => <i className="material-icons">card_membership</i>;
const WalletIcon = () => <i className="material-icons">account_balance_wallet</i>;

const UserMenu = ({ handleLogin, handleLogout, isMenuOpen, setIsMenuOpen, handleLinkClick, defaultProfileImage, guestImage }) => {
  const { user, isAuthenticated, loginWithRedirect, logout } = useAuth0();

  return (
    <div className="padre">
      <motion.div
        className={`account-menu-contenedor ${isMenuOpen ? 'open' : 'closed'}`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {isMenuOpen && (
          <div className="account-menu open">
            {isAuthenticated ? (
              <>
              <h1>Cerrar Sesión</h1>
                <MenuItem onClick={() => handleLinkClick(`/perfil/${user.name.replace(/\s+/g, '-')}`)}>
                  <ListItemIcon>
                    <Avatar src={user?.picture || defaultProfileImage} alt="Profile" />
                  </ListItemIcon>
                  <Typography variant="inherit">{user.name}</Typography>
                </MenuItem>
                <MenuItem onClick={handleLogin}>
                  <ListItemIcon>
                    <WalletIcon />
                  </ListItemIcon>
                  <Typography variant="inherit">Tienes 0 Laborys en tu Cartera</Typography>
                </MenuItem>
                <MenuItem onClick={handleLogin}>
                  <ListItemIcon>
                    <MembershipIcon />
                  </ListItemIcon>
                  <Typography variant="inherit">Adquirir Membresía</Typography>
                </MenuItem>
                <MenuItem onClick={handleLogin}>
                  <ListItemIcon>
                    <SettingsIcon />
                  </ListItemIcon>
                  <Typography variant="inherit">Configuración de tu Cuenta</Typography>
                </MenuItem>
                <MenuItem onClick={handleLogin}>
                  <ListItemIcon>
                    <DashboardIcon />
                  </ListItemIcon>
                  <Typography variant="inherit">Tu Dashboard</Typography>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <ExitToAppIcon />
                  </ListItemIcon>
                  <Typography variant="inherit">Salir</Typography>
                </MenuItem>
              </>
            ) : (
              <>
                <MenuItem onClick={handleLogin}>
                  <ListItemIcon>
                    <AccountCircleIcon />
                  </ListItemIcon>
                  <Typography variant="inherit">Acceder</Typography>
                </MenuItem>
                <MenuItem component={Link} to="/ayuda">
                  <ListItemIcon>
                    <HelpIcon />
                  </ListItemIcon>
                  <Typography variant="inherit">Ayuda</Typography>
                </MenuItem>
                <MenuItem onClick={handleLogin}>
                  <ListItemIcon>
                    <AccountCircleIcon />
                  </ListItemIcon>
                  <Typography variant="inherit">Iniciar sesión</Typography>
                </MenuItem>
              </>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default UserMenu;
