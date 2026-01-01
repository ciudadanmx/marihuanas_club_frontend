import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate, Link } from 'react-router-dom';
import { Avatar, MenuItem, ListItemIcon, Typography, Box } from '@mui/material';
import { useStores } from '../../hooks/useStores';

// Context de roles y membresía
import { useRoles } from '../../Contexts/RolesContext';

import '../../styles/AccountMenuInfo.css';
import '../../styles/NotificationsMenu.css';
import '../../styles/MenuInfo.css';

// Iconos desde CDN (material-icons)
const Icon = ({ name }) => (
  <span
    className="material-icons"
    style={{ fontSize: 20, verticalAlign: 'middle' }}
  >
    {name}
  </span>
);

const UserMenu = ({ handleLogin, handleLogout, isOpen, onClose, containerRef, defaultProfileImage }) => {
  const { roles, membresia } = useRoles();
  const { user, isAuthenticated, loginWithRedirect, logout } = useAuth0();
  const {
    isAdmin,
    isEditor,
    isRoot,
    isActivaMembresia,
    userData,
    isClub,
    haveClub
  } = useRoles();

  const [checking, setChecking] = useState(false);
  const { getStoreByEmail } = useStores();
  const navigate = useNavigate();

  const handleVender = async () => {
    if (!isAuthenticated) return;

    setChecking(true);
    try {
      const stores = await getStoreByEmail(user.email);
      console.log('*** Obteniendo stores');
      if (stores.length > 0 && stores[0].attributes.terminado) {
        const slug = stores[0].attributes.slug;
        navigate(`/market/store/${slug}`);
      } else {
        navigate('/registro-vendedor');
      }
    } catch (err) {
      console.error('Error al verificar tienda:', err);
      navigate('/registro-vendedor');
    } finally {
      setChecking(false);
    }
  };

  // Opciones con label dinámico para membresía
  const membershipLabel = isActivaMembresia() ? 'Mi Membresía' : 'Membresías';
  const options = [
    { label: membershipLabel, icon: 'card_membership', onClick: () => navigate('/membresias'), show: true },
    {
      label: 'Tu Club',
      icon: 'home',
      onClick: () => {
        if (isClub() || haveClub()) {
          navigate('/clubs/miclub/info');
        } else {
          navigate('/clubs');
        }
      },
      show: isAuthenticated
    },
    { label: 'Tus Anuncios', icon: 'campaign', onClick: () => navigate('/comunidad/mis-anuncios'), show: isAuthenticated },
    { label: 'Tus Compras', icon: 'shopping_bag', onClick: () => navigate('/market/compras/pedidos'), show: isAuthenticated },
    { label: 'Tu Tienda', icon: 'shopping_cart', onClick: () => handleVender(), show: isAuthenticated },
    { label: 'Tus Cursos', icon: 'menu_book', onClick: () => navigate('/cursos/mis-cursos'), show: isAuthenticated },
    { label: 'Dashboard Admin', icon: 'dashboard', component: Link, to: '/admin/dashboard', show: isAdmin() },
    { label: 'Editor', icon: 'edit', component: Link, to: '/editor', show: isEditor() },
    { label: 'Root Tools', icon: 'admin_panel_settings', component: Link, to: '/root/tools', show: isRoot() },
  ];

  return (
    <div ref={containerRef}>
      <Box className={`notifications-menu ${isOpen ? 'open' : 'closed'} purple`} p={2}>
        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1}>
          {/* Bienvenida */}
          {isAuthenticated && user && (
            <Box gridColumn="1 / span 2">
              <MenuItem onClick={() => navigate(`/perfil/${user.name.replace(/\s+/g, '-')}`)}>
                <ListItemIcon>
                  <Avatar
                    src={userData?.foto_credencial || user.picture || defaultProfileImage}
                    alt={user.name}
                    sx={{ width: 48, height: 48, border: '2px solid #cecdcfff' }}
                  />
                </ListItemIcon>
                <Box>
                  <Typography variant="h6">
                    Bienvenido {userData?.nombre_completo || user.name}
                  </Typography>
                  <Typography variant="body2" color="#cecdcfff">
                    Tu Perfil / QR
                  </Typography>
                </Box>
              </MenuItem>
            </Box>
          )}

          {/* Opciones en grid */}
          {options.filter(opt => opt.show).map((opt, idx) => (
            <Box key={idx}>
              <MenuItem
                component={opt.component || 'button'}
                to={opt.to}
                onClick={opt.onClick}
                sx={{
                  '&:hover': {
                    backgroundColor: '#d5ee66ff',
                    color: '#000814',
                    textShadow: '0 0 6px #00ff99',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <ListItemIcon>
                  <Icon name={opt.icon} />
                </ListItemIcon>
                <Typography>{opt.label}</Typography>
              </MenuItem>
            </Box>
          ))}

          {/* Login / Logout */}
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
