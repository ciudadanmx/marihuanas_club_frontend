import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate, Link } from 'react-router-dom';
import { Avatar, MenuItem, ListItemIcon, Typography, Box, Switch, FormControlLabel } from '@mui/material';

// Context de roles y membresía
import { useRoles } from '../../Contexts/RolesContext';

import '../../styles/AccountMenuInfo.css';
import '../../styles/NotificationsMenu.css';
import '../../styles/MenuInfo.css';

// Iconos desde CDN (material-icons)
const Icon = ({ name }) => <span className="material-icons" style={{ fontSize: 20, verticalAlign: 'middle' }}>{name}</span>;

const UserMenu = ({ handleLogin, handleLogout, isOpen, onClose, containerRef, defaultProfileImage }) => {
  const { user, isAuthenticated, loginWithRedirect, logout } = useAuth0();
  const { isAdmin, isEditor, isRoot, isActivaMembresia, userData } = useRoles();
  const navigate = useNavigate();

  // Opciones con label dinámico para membresía
  const membershipLabel = isActivaMembresia() ? 'Mi Membresía' : 'Membresías';
  const options = [
    { label: membershipLabel, icon: 'card_membership', onClick: () => navigate('/membresias'), show: true },
    { label: 'Tu Club', icon: 'home', onClick: () => navigate('/clubs/miclub'), show: isAuthenticated },
    { label: 'Tus Anuncios', icon: 'campaign', onClick: () => navigate('/comunidad/mis-anuncios'), show: isAuthenticated },
    { label: 'Tus Compras', icon: 'shopping_bag', onClick: () => navigate('/compras'), show: isAuthenticated },
    { label: 'Tu Tienda', icon: 'shopping_cart', onClick: () => navigate('/registro-vendedor'), show: isAuthenticated },
    { label: 'Tus Cursos', icon: 'menu_book', onClick: () => navigate('/cursos/mis-cursos'), show: isAuthenticated },
    { label: 'Dashboard Admin', icon: 'dashboard', component: Link, to: '/admin/dashboard', show: isAdmin() },
    { label: 'Editor', icon: 'edit', component: Link, to: '/editor', show: isEditor() },
    { label: 'Root Tools', icon: 'admin_panel_settings', component: Link, to: '/root/tools', show: isRoot() },
  ];

  return (
    <div ref={containerRef}>
    <Box className={`notifications-menu ${isOpen ? 'open' : 'closed'} purple`} p={2}>
      {/* Grid container: 1 column title, then 2 columns options */}
      <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1}>
        {/* Welcome spans 2 columns */}
        {isAuthenticated && user && (
          <Box gridColumn="1 / span 2">
            <MenuItem onClick={() => navigate(`/perfil/${user.name.replace(/\s+/g, '-')}`)}>
              <ListItemIcon>
                <Avatar
                  src={userData?.foto_credencial || user.picture || defaultProfileImage}
                  alt={user.name}
                  sx={{ width: 48, height: 48, border: '2px solid #6b21a8' }}
                />
              </ListItemIcon>
              <Box>
                <Typography variant="h6">Bienvenido {userData?.nombre_completo || user.name}</Typography>
                <Typography variant="body2" color="text.secondary">Tu Perfil</Typography>
              </Box>
            </MenuItem>
          </Box>
        )}

        {/* Opciones en grid */}
        {options.filter(opt => opt.show).map((opt, idx) => (
          <Box key={idx}>
            {opt.component ? (
              <MenuItem component={opt.component} to={opt.to} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                <ListItemIcon><Icon name={opt.icon} /></ListItemIcon>
                <Typography>{opt.label}</Typography>
              </MenuItem>
            ) : (
              <MenuItem onClick={opt.onClick} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                <ListItemIcon><Icon name={opt.icon} /></ListItemIcon>
                <Typography>{opt.label}</Typography>
              </MenuItem>
            )}
          </Box>
        ))}

        {/* Dark mode toggle spans 2 columns */}
        <Box gridColumn="1 / span 2" display="flex" justifyContent="space-between" alignItems="center" mt={1}>
          <Typography variant="body2">Modo Oscuro (beta)</Typography>
          <FormControlLabel control={<Switch />} label="" />
        </Box>

        {/* Login/Logout spans 2 columns */}
        <Box gridColumn="1 / span 2">
          {isAuthenticated ? (
            <MenuItem onClick={() => logout({ returnTo: window.location.origin })}>
              <ListItemIcon><Icon name="logout" /></ListItemIcon>
              <Typography>Salir</Typography>
            </MenuItem>
          ) : (
            <MenuItem onClick={() => loginWithRedirect()}>
              <ListItemIcon><Icon name="account_circle" /></ListItemIcon>
              <Typography>Ingresar</Typography>
            </MenuItem>
          )}
        </Box>
      </Box>
    </Box>
    </div>
  );
};

export default UserMenu;