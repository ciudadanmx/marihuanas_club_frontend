// src/hooks/useContenido.jsx
import { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { slugify } from '../utils/slugify';
import { useMembresia } from './useMembresia.jsx';
import { useRolEditor } from './useRolEditor.jsx';
import { useAuth0 } from '@auth0/auth0-react';

const API_URL = `${process.env.REACT_APP_STRAPI_URL}/api`;
const UPLOAD_URL = `${process.env.REACT_APP_STRAPI_URL}/api/upload`;

export function useContenido() {
  const tieneMembresia = useMembresia();
  const { user } = useAuth0();
  const esEditor = useRolEditor(user?.email);

  const [contenidos, setContenidos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchContenidos();
    fetchCategorias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ------- OBTENER CONTENIDOS -------
  async function fetchContenidos() {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/contenidos?populate=deep`);
      const data = await res.json();

      // Si data.data es null o indefinido, lo tratamos como arreglo vacío
      const items = Array.isArray(data.data) ? data.data : [];

      const parsed = items.map(item => {
        const a = item.attributes;
        const cat = a.categoria?.data;

        return {
          id: item.id,
          titulo: a.titulo,
          slug: a.slug,
          autor: a.autor?.data?.attributes?.username || 'Anónimo',
          contenido_libre: DOMPurify.sanitize(a.contenido_libre || ''),
          contenido_restringido: DOMPurify.sanitize(a.contenido_restringido || ''),
          status: a.status,
          portada: a.portada?.data?.attributes?.url || null,
          galeria_libre: Array.isArray(a.galeria_libre?.data)
            ? a.galeria_libre.data.map(m => m.attributes?.url)
            : [],
          galeria_restringida: Array.isArray(a.galeria_restringida?.data)
            ? a.galeria_restringida.data.map(m => m.attributes?.url)
            : [],
          videos_libres: Array.isArray(a.videos_libres?.data)
            ? a.videos_libres.data.map(v => v.attributes?.url)
            : [],
          videos_restringidos: Array.isArray(a.videos_restringidos?.data)
            ? a.videos_restringidos.data.map(v => v.attributes?.url)
            : [],
          tags: a.tags,
          fecha_publicacion: a.fecha_publicacion,
          resumen: a.resumen,
          categoria: cat
            ? {
                id: cat.id,
                nombre: cat.attributes.nombre,
                slug: cat.attributes.slug,
              }
            : null,
        };
      });

      setContenidos(parsed);
    } catch (err) {
      console.error('Error al obtener contenidos:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  // ------- OBTENER CATEGORÍAS -------
  async function fetchCategorias() {
    try {
      const res = await fetch(`${API_URL}/categorias`);
      const data = await res.json();

      // Si data.data es null o indefinido, lo tratamos como arreglo vacío
      const cats = Array.isArray(data.data) ? data.data : [];

      const parsed = cats.map(cat => ({
        id: cat.id,
        nombre: cat.attributes.nombre,
        slug: cat.attributes.slug,
      }));

      setCategorias(parsed);
    } catch (err) {
      console.error('Error al obtener categorías:', err);
      setError(err);
    }
  }

  // ------- CREAR CATEGORÍA -------
  async function crearCategoria(nombre) {
    const slug = slugify(nombre, { lower: true });
    const res = await fetch(`${API_URL}/categorias`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { nombre, slug } }),
    });
    if (!res.ok) throw new Error('Error al crear categoría');
    await fetchCategorias();
  }

  // ------- SUBIR MEDIA -------
  async function subirMedia(files) {
    const formData = new FormData();
    [...files].forEach(file => formData.append('files', file));

    const res = await fetch(UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error('Error al subir archivos');
    const data = await res.json();
    // Strapi devuelve un array de objetos con { id, ... }
    // Así que devolvemos solo los IDs para relacionarlos luego en el contenido
    return data.map(file => file.id);
  }

  // ------- CREAR CONTENIDO -------
  async function crearContenido(nuevo, media = {}) {
    if (!esEditor) throw new Error('Se requiere rol editor');

    const slug = slugify(nuevo.titulo, { lower: true });
    const contenido = { ...nuevo, slug };

    // Agrega IDs de medios si existen
    if (media.portada) contenido.portada = media.portada[0];
    if (media.galeria_libre) contenido.galeria_libre = media.galeria_libre;
    if (media.galeria_restringida) contenido.galeria_restringida = media.galeria_restringida;
    if (media.videos_libres) contenido.videos_libres = media.videos_libres;
    if (media.videos_restringidos) contenido.videos_restringidos = media.videos_restringidos;

    const res = await fetch(`${API_URL}/contenidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: contenido }),
    });
    if (!res.ok) throw new Error('Error al crear contenido');
    await fetchContenidos();
  }

  // ------- EDITAR CONTENIDO -------
  async function editarContenido(id, cambios, media = {}) {
    const data = { ...cambios };

    // Agrega media si hay nuevos uploads
    if (media.portada) data.portada = media.portada[0];
    if (media.galeria_libre) data.galeria_libre = media.galeria_libre;
    if (media.galeria_restringida) data.galeria_restringida = media.galeria_restringida;
    if (media.videos_libres) data.videos_libres = media.videos_libres;
    if (media.videos_restringidos) data.videos_restringidos = media.videos_restringidos;

    const res = await fetch(`${API_URL}/contenidos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });
    if (!res.ok) throw new Error('Error al editar contenido');
    await fetchContenidos();
  }

  // ------- ELIMINAR CONTENIDO -------
  async function eliminarContenido(id) {
    const res = await fetch(`${API_URL}/contenidos/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Error al eliminar contenido');
    await fetchContenidos();
  }

  // ------- OBTENER CONTENIDO POR ID (incluye filtrar según membresía) -------
  function getContenidoById(id) {
    const c = contenidos.find(c => c.id === id);
    if (!c) return null;
    return {
      ...c,
      contenido: {
        libre: c.contenido_libre,
        restringido: tieneMembresia ? c.contenido_restringido : null,
      },
      galeria: {
        libre: c.galeria_libre,
        restringida: tieneMembresia ? c.galeria_restringida : [],
      },
      videos: {
        libres: c.videos_libres,
        restringidos: tieneMembresia ? c.videos_restringidos : [],
      },
    };
  }

  // ------- FILTRAR POR CATEGORÍA -------
  function filtrarPorCategoria(slug) {
    return contenidos.filter(c => c.categoria?.slug === slug);
  }

  // ------- BUSCAR POR TEXTO -------
  function buscarPorTexto(texto) {
    const t = texto.toLowerCase();
    return contenidos.filter(c =>
      c.titulo.toLowerCase().includes(t) ||
      c.resumen?.toLowerCase().includes(t) ||
      c.tags?.join(',').toLowerCase().includes(t)
    );
  }

  return {
    contenidos,
    categorias,
    loading,
    error,
    crearCategoria,
    crearContenido,
    editarContenido,
    eliminarContenido,
    subirMedia,
    getContenidoById,
    filtrarPorCategoria,
    buscarPorTexto,
  };
}
