import React from 'react'

import { useAuthInfo } from '../Contexts/AuthContext.jsx';

const Probador = () => {

const { accessToken } = useAuthInfo();
fetch('https://back.ciudadan.org/protected', {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});

console.log('ACCESS TOKEN:', accessToken);

  return (
    <div>Probador</div>
  )
}

export default Probador