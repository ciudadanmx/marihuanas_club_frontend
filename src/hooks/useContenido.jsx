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
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(10);
  const [totalItems, setTotalItems] = useState(0);


  useEffect(() => {
    fetchContenidos();
    fetchCategorias();
  }, [pagina, porPagina]);

  async function fetchContenidos() {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_URL}/contenidos?populate=portada,autor,galeria_libre,galeria_restringida,videos_libres,videos_restringidos,categoria&pagination[page]=${pagina}&pagination[pageSize]=${porPagina}&sort[0]=fecha_publicacion:desc`
      );
      const data = await res.json();

      const items = Array.isArray(data.data) ? data.data : [];
      setTotalItems(data.meta.pagination.total);
      const parsed = items.map(item => {
        const a = item.attributes;
        const cat = a.categoria?.data;
        console.log(` * * * * * * * * * * *  useContenidos ${a.titulo}`);
        console.log(` * * * * * * * * * * *  useContenidos`, a);
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
          tags: Array.isArray(a.tags) ? a.tags.join(',') : (a.tags || ''),
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

  async function fetchCategorias() {
    try {
      const res = await fetch(`${API_URL}/categorias-contenidos`);
      const data = await res.json();

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

  async function crearCategoria(nombre) {
    const slug = slugify(nombre, { lower: true });
    const res = await fetch(`${API_URL}/categorias-contenidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { nombre, slug } }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      console.error('Error al crear categoría:', errData?.error || errData);
      throw new Error('No se pudo crear la categoría');
    }
    await fetchCategorias();
  }

  async function subirMedia(files) {
    const formData = new FormData();
    [...files].forEach(file => formData.append('files', file));

    const res = await fetch(UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      console.error('Error al subir archivos:', errData?.error || errData);
      throw new Error('No se pudo subir el archivo');
    }

    const data = await res.json();
    return data.map(file => file.id);
  }

  async function crearContenido(nuevo, media = {}) {
    if (!esEditor) throw new Error('Permiso denegado: se requiere rol editor');

    const slug = slugify(nuevo.titulo, { lower: true });
    const contenido = {
      ...nuevo,
      slug,
      tags: Array.isArray(nuevo.tags) ? nuevo.tags.join(',') : (nuevo.tags || ''),
      categoria: Number(nuevo.categoria) || null,
    };

    if (media.portada) contenido.portada = media.portada[0];
    if (media.galeria_libre) contenido.galeria_libre = media.galeria_libre;
    if (media.galeria_restringida) contenido.galeria_restringida = media.galeria_restringida;
    if (media.videos_libres) contenido.videos_libres = media.videos_libres;
    if (media.videos_restringidos) contenido.videos_restringidos = media.videos_restringidos;

    try {
      const res = await fetch(`${API_URL}/contenidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: contenido }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        console.error('Error al crear contenido:', errData?.error || errData);
        throw new Error('No se pudo crear el contenido');
      }
      await fetchContenidos();
    } catch (err) {
      console.error('Excepción al crear contenido:', err);
      throw err;
    }
  }

  async function editarContenido(id, cambios, media = {}) {
    const dataCampos = {
      ...cambios,
      tags: Array.isArray(cambios.tags) ? cambios.tags.join(',') : (cambios.tags || ''),
      categoria: Number(cambios.categoria) || null,
    };

    if (media.portada) dataCampos.portada = media.portada[0];
    if (media.galeria_libre) dataCampos.galeria_libre = media.galeria_libre;
    if (media.galeria_restringida) dataCampos.galeria_restringida = media.galeria_restringida;
    if (media.videos_libres) dataCampos.videos_libres = media.videos_libres;
    if (media.videos_restringidos) dataCampos.videos_restringidos = media.videos_restringidos;

    const res = await fetch(`${API_URL}/contenidos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: dataCampos }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      console.error('Error al editar contenido:', errData?.error || errData);
      throw new Error('No se pudo editar el contenido');
    }
    await fetchContenidos();
  }

  async function eliminarContenido(id) {
    const res = await fetch(`${API_URL}/contenidos/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      console.error('Error al eliminar contenido:', errData?.error || errData);
      throw new Error('No se pudo eliminar el contenido');
    }
    await fetchContenidos();
  }

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

  function filtrarPorCategoria(slug) {
    return contenidos.filter(c => c.categoria?.slug === slug);
  }

  function buscarPorTexto(texto) {
    const t = texto.toLowerCase();
    return contenidos.filter(c =>
      c.titulo.toLowerCase().includes(t) ||
      c.resumen?.toLowerCase().includes(t) ||
      c.tags.toLowerCase().includes(t)
    );
  }

  return {
    contenidos,
    categorias,
    loading,
    error,
    tieneMembresia,
    esEditor,
    fetchContenidos,
    fetchCategorias,
    crearCategoria,
    subirMedia,
    crearContenido,
    editarContenido,
    eliminarContenido,
    getContenidoById,
    filtrarPorCategoria,
    buscarPorTexto,
    pagina,
    setPagina,
    porPagina,
    setPorPagina,
    totalItems,
  };
}
