import React from 'react';
import { useParams } from 'react-router-dom'; // Hook para obtener parámetros de la URL

// Componente Perfil
const Perfil = () => {
  // Obtenemos el nombre de usuario desde la URL
  const { username } = useParams();

  return (
    <div>
      <h1>Perfil de {username}</h1>
    </div>
  );
};

export default Perfil;
