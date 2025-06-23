import React, { useContext, useEffect } from 'react';
import { AuthContext } from '../../Contexts/AuthContext';
import registerUserInStrapi from '../../utils/registerUser';

const Profile = () => {
  const { user, token } = useContext(AuthContext);

  // Llama a la función de registro cuando sea necesario
  const handleRegisterUser = async () => {
    if (user && token) {
      console.log('Iniciando registro de usuario...');
      const result = await registerUserInStrapi({
        username: user.name,  // O el campo que corresponda
        email: user.email,
        password: 'testpassword',  // Usa un valor adecuado para la contraseña
      });
      console.log('Resultado del registro:', result);
    } else {
      console.log('Usuario o token no están disponibles.');
    }
  };

  useEffect(() => {
    console.log('Componente Profile renderizado');
    console.log('Usuario:', user);
    console.log('Token:', token);
  }, [user, token]);

  return (
    <div>
      <h1>Perfil de Usuario</h1>
      {user && <p>Correo electrónico: {user.email}</p>}
      <button onClick={handleRegisterUser}>Registrar Usuario</button>
    </div>
  );
};

export default Profile;
