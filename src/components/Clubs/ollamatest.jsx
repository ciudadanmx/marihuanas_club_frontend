import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useRoles } from '../../Contexts/RolesContext';
import { Box, Typography, Button, Card, CardContent, Chip, Stack, Divider, Alert } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import PreLoader from '../PreLoader';

// Función auxiliar para crear el usuario
function crearUsuario(nombre, email) {
  console.log('Creando usuario:', { nombre, email });
  // Lógica para crear usuario aquí
  return { nombre, email, creado: true };
}

// Componente principal que trae el usuario de Auth0 y maneja roles
export default function OllamaTest() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const { 
    roles, 
    userData, 
    membresia, 
    isJardinero, 
    isAdmin, 
    isRoot, 
    isEditor, 
    isClub, 
    haveClub, 
    isActivaMembresia,
    verificado,
    setEditor,
    setAdmin,
    setRoot
  } = useRoles();

  const [usuarioCreado, setUsuarioCreado] = useState(null);
  const [error, setError] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);

  // Efecto para crear usuario cuando Auth0 y roles cargan
  useEffect(() => {
    if (isLoading || !isAuthenticated || !userData) return;

    const crearUsuarioDesdeAuth0 = async () => {
      try {
        setProcesando(true);
        // Obtener datos del usuario de Auth0
        const nombre = user?.name || user?.email?.split('@')[0] || 'Usuario';
        const email = user?.email;

        if (!email) {
          throw new Error('No se encontró email en Auth0');
        }

        // Llamar función para crear usuario
        const resultado = crearUsuario(nombre, email);
        setUsuarioCreado(resultado);
        console.log('Usuario creado exitosamente:', resultado);
      } catch (err) {
        console.error('Error creando usuario:', err);
        setError(err.message);
      } finally {
        setProcesando(false);
      }
    };

    crearUsuarioDesdeAuth0();
  }, [user, isAuthenticated, isLoading, userData]);

  // Mientras carga Auth0 o los roles
  if (isLoading) {
    return <PreLoader />;
  }

  // Si no está autenticado
  if (!isAuthenticated) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">Por favor, inicia sesión</Typography>
      </Box>
    );
  }

  const handleToggleRole = async (role, setter) => {
    try {
      setToggleLoading(true);
      const isActive = roles.includes(role);
      await setter(!isActive);
      console.log(`✓ Rol ${role} actualizado a: ${!isActive}`);
    } catch (err) {
      setError(`Error al actualizar rol ${role}: ${err.message}`);
    } finally {
      setToggleLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Tarjeta de Usuario */}
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              👤 Información del Usuario
            </Typography>
            <Divider sx={{ my: 2 }} />

            {procesando && <PreLoader />}

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            {!procesando && (
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="textSecondary">Nombre</Typography>
                  <Typography variant="body1">{user?.name || 'No disponible'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">Email</Typography>
                  <Typography variant="body1">{user?.email || 'No disponible'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">Email Verificado</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {user?.email_verified ? (
                      <>
                        <CheckCircle sx={{ color: 'green' }} />
                        <Typography variant="body1">Sí</Typography>
                      </>
                    ) : (
                      <>
                        <Cancel sx={{ color: 'red' }} />
                        <Typography variant="body1">No</Typography>
                      </>
                    )}
                  </Box>
                </Box>
                {user?.picture && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>Foto de Perfil</Typography>
                    <img 
                      src={user.picture} 
                      alt="Foto de perfil" 
                      style={{ borderRadius: '50%', width: 100, height: 100, border: '2px solid #ccc' }}
                    />
                  </Box>
                )}
              </Stack>
            )}
          </CardContent>
        </Card>

        {/* Tarjeta de Roles */}
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              🎭 Roles y Permisos
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>Roles Actuales:</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {roles && roles.length > 0 ? (
                    roles.map((role) => (
                      <Chip key={role} label={role} color="primary" variant="outlined" />
                    ))
                  ) : (
                    <Chip label="invitado" color="default" />
                  )}
                </Stack>
              </Box>

              <Divider />

              {/* Controles de Roles */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>Gestionar Roles:</Typography>
                <Stack spacing={1}>
                  <Button 
                    variant={roles.includes('editor') ? 'contained' : 'outlined'}
                    onClick={() => handleToggleRole('editor', setEditor)}
                    disabled={toggleLoading}
                    fullWidth
                  >
                    {roles.includes('editor') ? '✓' : ''} Editor {isEditor() ? '(Activo)' : ''}
                  </Button>
                  <Button 
                    variant={roles.includes('admin') ? 'contained' : 'outlined'}
                    onClick={() => handleToggleRole('admin', setAdmin)}
                    disabled={toggleLoading}
                    fullWidth
                  >
                    {roles.includes('admin') ? '✓' : ''} Admin {isAdmin() ? '(Activo)' : ''}
                  </Button>
                  <Button 
                    variant={roles.includes('root') ? 'contained' : 'outlined'}
                    onClick={() => handleToggleRole('root', setRoot)}
                    disabled={toggleLoading}
                    fullWidth
                  >
                    {roles.includes('root') ? '✓' : ''} Root {isRoot() ? '(Activo)' : ''}
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Tarjeta de Datos de Usuario Strapi */}
        {userData && (
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                📊 Datos en Strapi
              </Typography>
              <Divider sx={{ my: 2 }} />

              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="textSecondary">ID</Typography>
                  <Typography variant="body1">{userData?.id || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">Jardinero</Typography>
                  <Chip 
                    label={isJardinero() ? 'Sí' : 'No'} 
                    color={isJardinero() ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">Es Club</Typography>
                  <Chip 
                    label={isClub() ? 'Sí' : 'No'} 
                    color={isClub() ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">Tiene Club</Typography>
                  <Chip 
                    label={haveClub() ? 'Sí' : 'No'} 
                    color={haveClub() ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">Verificado</Typography>
                  <Chip 
                    label={verificado() ? 'Sí' : 'No'} 
                    color={verificado() ? 'success' : 'warning'}
                    size="small"
                  />
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">Membresía Activa</Typography>
                  <Chip 
                    label={isActivaMembresia() ? 'Sí' : 'No'} 
                    color={isActivaMembresia() ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
                {membresia && (
                  <Box>
                    <Typography variant="body2" color="textSecondary">Membresía:</Typography>
                    <Typography variant="body1">{JSON.stringify(membresia)}</Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Resumen */}
        {usuarioCreado && (
          <Card sx={{ bgcolor: '#e8f5e9' }}>
            <CardContent>
              <Typography variant="h6" color="success.main" gutterBottom>
                ✓ Usuario Procesado
              </Typography>
              <Typography variant="body2" component="pre" sx={{ overflow: 'auto', bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
                {JSON.stringify(usuarioCreado, null, 2)}
              </Typography>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Box>
  );
}