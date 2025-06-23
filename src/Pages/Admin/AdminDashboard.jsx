import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { Button, Box, Typography } from '@mui/material';
import { useRoles } from '../../Contexts/RolesContext';

const AdminDashboard = () => {
  const { isAuthenticated, isLoading } = useAuth0();
  const { isAdmin } = useRoles();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin())) {
      navigate('/');
    }
  }, [isAuthenticated, isAdmin, isLoading, navigate]);

  if (!isAuthenticated || !isAdmin()) return null;

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Panel de Administración
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate('/admin/validar-membresia')}
      >
        Validar Membresía
      </Button>
    </Box>
  );
};

export default AdminDashboard;
