import React, { useEffect } from 'react';
import { useRoles } from '../Contexts/RolesContext'; 

const MiMembresia = () => {
  const { roles, membresia } = useRoles();

  useEffect(() => {
    if (membresia?.activo) {
      console.log('⏳ Membresía activa hasta:', membresia.fechaFin);
    } else {
      console.log('🚫 Sin membresía activa');
    }
  }, [membresia]);

  return (
    <div>
      <h1>Mi Membresía</h1>
      {membresia?.activo ? (
        <div>
          <p><strong>Tipo:</strong> {membresia.tipo}</p>
          <p><strong>Inicio:</strong> {membresia.fechaInicio}</p>
          <p><strong>Fin:</strong> {membresia.fechaFin}</p>
        </div>
      ) : (
        <p>No tienes una membresía activa.</p>
      )}
    </div>
  );
};

export default MiMembresia;
