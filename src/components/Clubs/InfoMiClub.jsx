import React, { useEffect, useState } from 'react';
import Club from '../../Pages/Clubs/Club';
import { useAuth0 } from "@auth0/auth0-react";

const STRAPI_URL = process.env.REACT_APP_STRAPI_URL;

const InfoMiClub = () => {
  const { user, isLoading } = useAuth0();
  const [nombreClub, setNombreClub] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isLoading || !user?.email) return;

    let mounted = true;

    const fetchClubFromUser = async () => {
      try {
        const q = `${STRAPI_URL}/api/users?filters[email][$eq]=${encodeURIComponent(
          user.email
        )}&populate=club`;

        console.log('🔍 BUSCANDO USER EN STRAPI:', q);

        const res = await fetch(q);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) {
          throw new Error('Usuario no encontrado en Strapi');
        }

        const userStrapi = data[0];
        const clubRel = userStrapi.club;

        if (!clubRel || !clubRel.nombre_club) {
          throw new Error('Usuario sin club asignado');
        }

        if (mounted) {
          setNombreClub(clubRel.nombre_club);
        }
      } catch (err) {
        console.error(err);
        if (mounted) setError(err.message);
      }
    };

    fetchClubFromUser();
    return () => { mounted = false; };
  }, [user, isLoading]);

  if (isLoading) return null;
  if (error) return <div>Error: {error}</div>;
  if (!nombreClub) return <div>Cargando club…</div>;

  return (
    <>
      <div>InfoMiClub</div>

      {/* AQUÍ YA PASAS EL NOMBRE CORRECTO */}
      <Club miclub={nombreClub} />
    </>
  );
};

export default InfoMiClub;
