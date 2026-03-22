import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';

const AprobarAfiliacion = ({ id }) => {
  const navigate = useNavigate();

  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Obtener solicitud
  useEffect(() => {
    const fetchSolicitud = async () => {
      try {
        const res = await fetch(`${API_URL}/api/solicitudafiliaciones/${id}?populate=*`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error?.message || 'Error al cargar solicitud');

        setSolicitud(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchSolicitud();
  }, [id]);

  const handleAprobar = async () => {
    if (!window.confirm('¿Seguro que quieres aprobar esta afiliación?')) return;

    setProcessing(true);
    try {
      const res = await fetch(`${API_URL}/api/solicitudafiliaciones/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            status: 'aprobada',
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Error al aprobar');

      alert('Afiliación aprobada correctamente');
      navigate('/clubs/miclub/afiliar');
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <p>Cargando solicitud...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!solicitud) return <p>No se encontró la solicitud</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Aprobar Afiliación</h2>

      <div style={{ marginBottom: 20 }}>
        <p><strong>ID:</strong> {solicitud.id}</p>
        <p><strong>Estatus actual:</strong> {solicitud.attributes?.estatus}</p>
      </div>

      <button
        onClick={handleAprobar}
        disabled={processing}
        style={{
          padding: '10px 20px',
          background: 'green',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {processing ? 'Procesando...' : 'Confirmar Aprobación'}
      </button>
    </div>
  );
};

export default AprobarAfiliacion;
