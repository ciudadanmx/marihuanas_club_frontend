// src/components/Clubs/MiClubBar.jsx
import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Box, Typography, Chip, CircularProgress } from '@mui/material';

/**
 * MiClubBar: busca el usuario en Strapi por email y muestra los campos relevantes.
 * Requiere en .env:
 *  REACT_APP_STRAPI_URL=https://mi-strapi.com
 *  (opcional) REACT_APP_STRAPI_TOKEN=<token-si-tu-endpoint-esta-protegido>
 *
 * Endpoint usado (Strapi v4):
 *  GET ${REACT_APP_STRAPI_URL}/api/users?filters[email][$eq]=<email>&populate=*
 *
 * Ajusta el endpoint si tu colección de usuarios se llama distinto.
 */

const MiClubBar = () => {
  const { user, isAuthenticated } = useAuth0();
  const [loading, setLoading] = useState(false);
  const [strapiUser, setStrapiUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.email) {
      setStrapiUser(null);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const fetchUser = async () => {
      setLoading(true);
      setError(null);

      try {
        const base = process.env.REACT_APP_STRAPI_URL;
        if (!base) {
          throw new Error('REACT_APP_STRAPI_URL no configurada en .env');
        }

        // Construye URL: filtra por email (Strapi v4 filter syntax)
        const url = `${base.replace(/\/$/, '')}/api/users?filters[email][$eq]=${encodeURIComponent(
          user.email
        )}&populate=*`;

        const headers = {
          'Content-Type': 'application/json',
        };

        // Si tienes token para Strapi (por ejemplo, un API token), añádelo
        const token = process.env.REACT_APP_STRAPI_TOKEN;
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const res = await fetch(url, {
          method: 'GET',
          headers,
          signal: controller.signal,
        });

        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(`Strapi responded ${res.status} ${res.statusText} ${text}`);
        }

        const json = await res.json();

        // Strapi devuelve { data: [ ... ] } para collection-type
        const dataArr = Array.isArray(json?.data) ? json.data : [];

        if (dataArr.length === 0) {
          setStrapiUser(null);
          setError(null); // no es error, solo no encontrado
          setLoading(false);
          return;
        }

        // Tomamos el primer resultado
        const first = dataArr[0];

        // En Strapi los atributos están en .attributes
        // Ajusta según tu modelo si guardas distinto
        const attrs = first.attributes || first;

        setStrapiUser({
          raw: first,
          attributes: attrs,
        });
        setLoading(false);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Error fetching Strapi user:', err);
        setError(err.message || String(err));
        setLoading(false);
      }
    };

    fetchUser();

    return () => controller.abort();
  }, [isAuthenticated, user?.email]);

  // Helper para leer campo con multiples nombres posibles
  const readField = (attrs, ...keys) => {
    if (!attrs) return undefined;
    for (const k of keys) {
      if (Object.prototype.hasOwnProperty.call(attrs, k)) return attrs[k];
    }
    return undefined;
  };

  const attrs = strapiUser?.attributes;

  // Buscar variantes comunes
  const haveclub = readField(attrs, 'haveclub', 'haveClub', 'have_club', 'hasClub', 'has_club');
  const membresiaVigente = readField(attrs, 'membresia_vigente', 'membresiaVigente', 'membresia?.activa', 'membresia_activa');
  const membresiaTipo = readField(attrs, 'membresiatipo', 'membresia_tipo', 'membresiatype');

  const displayValue = (v) => {
    if (v === true) return 'true';
    if (v === false) return 'false';
    if (v === null || v === undefined) return 'no value';
    return String(v);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 1,
        bgcolor: '#fffdf0',
        borderRadius: 1,
        border: '1px solid rgba(0,0,0,0.06)',
      }}
      role="region"
      aria-label="Mi club status"
    >
      <Box>
        <Typography variant="subtitle2" sx={{ color: '#2e7d32' }}>
          MiClubBar
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <CircularProgress size={16} />
            <Typography variant="body2">Cargando datos de membresía...</Typography>
          </Box>
        ) : error ? (
          <Typography variant="body2" color="error">
            Error: {error}
          </Typography>
        ) : !strapiUser ? (
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Usuario no encontrado en Strapi (email: <strong>{user?.email}</strong>)
          </Typography>
        ) : (
          <>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              haveclub: <strong>{displayValue(haveclub)}</strong>
            </Typography>

            <Typography variant="body2" sx={{ mt: 0.5 }}>
              membresia_vigente: <strong>{displayValue(membresiaVigente)}</strong>
            </Typography>

            <Typography variant="body2" sx={{ mt: 0.5 }}>
              membresiatipo: <strong>{displayValue(membresiaTipo)}</strong>
            </Typography>
          </>
        )}

        {/* Debug: muestra dónde está el raw objeto si estás en dev */}
        {process.env.NODE_ENV === 'development' && (
          <details style={{ marginTop: 8 }}>
            <summary style={{ cursor: 'pointer' }}>DEBUG: raw Strapi user</summary>
            <pre style={{ maxHeight: 250, overflow: 'auto' }}>
              {JSON.stringify(strapiUser?.raw || strapiUser?.attributes || {}, null, 2)}
            </pre>
          </details>
        )}
      </Box>

      <Box sx={{ ml: 'auto' }}>
        <Chip
          label={
            loading
              ? 'Cargando'
              : error
              ? 'Error'
              : !strapiUser
              ? 'No encontrado'
              : membre siaVigenteDisplay(membresiaVigente)
          }
          color={strapiUser ? (membresiaVigente ? 'success' : 'default') : 'warning'}
        />
      </Box>
    </Box>
  );
};

// helper local para etiqueta legible en chip (evitar crash si variable undefined)
function membresiaVigenteDisplay(v) {
  if (v === true) return 'Membresía activa';
  if (v === false) return 'Sin membresía';
  if (v == null) return 'No definido';
  return String(v);
}

export default MiClubBar;
