import React from 'react';
import { Button } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';

/**
 * BotonEditar
 * Props:
 * - handleEdit: función a ejecutar al hacer clic
 * - autor_email: email del autor para condicionar visibilidad
 * - sx: objeto de estilos para MUI (opcional)
 */
const BotonEditar = ({ handleEdit, autor_email, sx }) => {
  const { isAuthenticated, isLoading, user } = useAuth0();

  if (isLoading) return null; // opcional: spinner u otro placeholder
  if (!isAuthenticated || !user || user.email !== autor_email) return <></>;

  return (
    <Button
      onClick={handleEdit}
      variant="outlined"
      size="small"
      sx={{
        display: 'flex',
        alignItems: 'center',
        // permite inyección de estilos desde props
        ...sx,
      }}
    >
      <span className="material-icons" style={{ marginRight: 4 }}>edit</span>
      Editar
    </Button>
  );
};

export default BotonEditar;
