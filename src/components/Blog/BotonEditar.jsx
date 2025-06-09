import React from 'react';
import { Button } from '@mui/material';

const BotonEditar = ({ handleEdit }) => {
  return (
    <Button 
      onClick={handleEdit} 
      variant="outlined" 
      size="small" 
      sx={{ display: 'flex', alignItems: 'center' }}
    >
      <span className="material-icons" style={{ marginRight: 4 }}>edit</span>
      Editar
    </Button>
  );
};

export default BotonEditar;
