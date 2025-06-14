//import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

import { motion } from 'framer-motion';
import { Button, Avatar, Menu, MenuItem, ListItemIcon, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import '../../styles/AccountMenuInfo.css';

import '../../styles/NotificationsMenu.css';
//import Sesion from './Sesion';
//import { gapi } from 'gapi-script';
import { useState, useEffect } from 'react';
import wikiImage from '../../assets/wikiciudadan.png'; 
import quienesImage from '../../assets/quienes.png'; 
import tokensImage from '../../assets/tokens.jpeg'; 
import helpImage from '../../assets/help.png'; 
import contactImage from '../../assets/contacto.jpeg'; 
import VideosImage from '../../assets/videos.png'; 

import '../../styles/MenuInfo.css';
//import '../../styles/AccountMenu.css';

// Importar iconos desde la CDN
const AccountCircleIcon = () => <i className="material-icons">account_circle</i>;
const ExitToAppIcon = () => <i className="material-icons">exit_to_app</i>;
const SettingsIcon = () => <i className="material-icons">settings</i>;
const DashboardIcon = () => <i className="material-icons">dashboard</i>;
const HelpIcon = () => <i className="material-icons">help</i>;
const MembershipIcon = () => <i className="material-icons">card_membership</i>;
const WalletIcon = () => <i className="material-icons">account_balance_wallet</i>;

const UserMenu = ({ handleLogin, handleLogout, isMenuOpen, setIsMenuOpen, handleLinkClick, defaultProfileImage, guestImage, isOpen, onClose  }) => {

    const { user, isAuthenticated, loginWithRedirect, logout } = useAuth0();

    return (
        <div className={`notifications-menu ${isOpen ? 'open' : 'closed'}`}>
            <>
                {isAuthenticated && user && (
                    <MenuItem onClick={() => handleLinkClick(`/perfil/${user.name.replace(/\s+/g, '-')}`)}>
                        <ListItemIcon>
                            <Avatar src={user?.picture || defaultProfileImage} alt="Profile" />
                        </ListItemIcon>
                        <Typography variant="inherit">{user.name}</Typography>
                    </MenuItem>
                )}
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
        </div>
    );
};

export default UserMenu;
