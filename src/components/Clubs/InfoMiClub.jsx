import React, { useEffect, useState } from 'react';
import Club from '../../Pages/Clubs/Club';
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from 'react-router-dom';
import { 
  FaSeedling, 
  FaLeaf, 
  FaCog, 
  FaBook 
} from 'react-icons/fa';

const STRAPI_URL = process.env.REACT_APP_STRAPI_URL;

const InfoMiClub = () => {
  const { user, isLoading } = useAuth0();
  const navigate = useNavigate();

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
      {/* ÁREA DE BOTONES – ARRIBA */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '20px'
        }}
      >
        <button
          onClick={() => navigate('/clubs/miclub/misplantas/sembrar')}
          style={btnStyle}
        >
          <FaSeedling size={28} />
          <span>Ingresar<br />Semillas</span>
        </button>

        <button
          onClick={() => navigate('/clubs/miclub/retirarflores')}
          style={btnStyle}
        >
          <FaLeaf size={28} />
          <span>Retiro<br />de Flores</span>
        </button>

        <button
          onClick={() => navigate('/club/bitacora/escribir')}
          style={btnStyle}
        >
          <FaBook size={28} />
          <span>Anotar en<br />Bitácora</span>
        </button>

        <button
          onClick={() => navigate('/clubs/miclub/configuracion')}
          style={{
            ...btnStyle,
            background: '#6b4eff'
          }}
        >
          <FaCog size={28} />
          <span>Configuración</span>
        </button>
      </div>

      {/* CLUB */}
      <Club miclub={nombreClub} />
    </>
  );
};

const btnStyle = {
  height: '90px',
  borderRadius: '14px',
  border: 'none',
  cursor: 'pointer',
  background: '#fff200',
  color: '#111',
  fontWeight: '600',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  boxShadow: '0 6px 14px rgba(0,0,0,0.15)',
  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
};

export default InfoMiClub;
