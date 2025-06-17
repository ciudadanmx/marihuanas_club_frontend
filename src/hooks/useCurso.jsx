import { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { slugify } from '../utils/slugify.jsx';
import { useMembresia } from './useMembresia.jsx';
import { useRolEditor } from './useRolEditor.jsx';
import { useAuth0 } from '@auth0/auth0-react';

const STRAPI_URL = `${process.env.REACT_APP_STRAPI_URL}`;
const UPLOAD_URL = `${STRAPI_URL}/api/upload`;

export function useCurso() {
const { user, getAccessTokenSilently } = useAuth0();
const [maestrosMap, setMaestrosMap] = useState({});
  const tieneMembresia = useMembresia();
  //const { user } = useAuth0();
  const esEditor = useRolEditor(user?.email);

  const [total, setTotal] = useState(0);

  const [cursos, setCursos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
  fetchCursos();
  fetchCategorias();
  fetchMaestros();           // <— añade esta llamada
}, [pagina, porPagina, user]);


  async function fetchCursos(filtros, parametros) {
    try {
      setLoading(true);
      let urlFiltrada = `${STRAPI_URL}/api/cursos?populate=portada,maestro,maestro_nombre,maestro_email,galeria,videos,categoria`;
      
      if (filtros === 'mis-cursos') {
        urlFiltrada += ``;
      }

      else {
        urlFiltrada += `&pagination[page]=${pagina}&pagination[pageSize]=${porPagina}&sort[0]=fecha_publicacion:desc`;
      }
      
      console.warn(`* * * * - * - * / * - */ / * / * /* / * /* / * /* / * /*  `, urlFiltrada);
      const res = await fetch(
        urlFiltrada
      );
      
      const data = await res.json();

      const items = Array.isArray(data.data) ? data.data : [];
      //setTotal(res.data.meta.pagination.total);
      setTotalItems(data.meta.pagination.total);
      const parsed = items.map(item => {
        const a = item.attributes;
        const cat = a.categoria?.data;
        //TODO:    EXTRAER AL USUARIO DEL CAMPO DE RELACIÓN AUTOR  CON LA COLECCIÓN USUARIOS DE STRAPI
        return {
          id: item.id,
          titulo: a.titulo,
          slug: a.slug,
          maestro: a.maestro_nombre || 'Anónimo',
          maestro_email: a.maestro_email || '',
          contenido: DOMPurify.sanitize(a.contenido_libre || ''),
          status: a.status,
          portada: a.portada?.data?.attributes?.url || null,
          galeria: Array.isArray(a.galeria?.data)
            ? a.galeria.data.map(m => m.attributes?.url)
            : [],
          videos: Array.isArray(a.videos?.data)
            ? a.videos.data.map(v => v.attributes?.url)
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

      setCursos(parsed);
    } catch (err) {
      console.error('Error al obtener contenidos:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategorias() {
    try {
      const res = await fetch(`${STRAPI_URL}/api/categorias-cursos`);
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


  async function fetchMaestros() {
  if (!user) return;
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/users?filters[email][$eq]=${encodeURIComponent(user.email)}`
    );
    const json = await res.json();
    const data = json.data || [];
    if (data.length) {
      setMaestrosMap(prev => ({
        ...prev,
        [user.email]: data[0].id,
      }));
    }
  } catch (err) {
    console.error('Error al obtener maestro Strapi:', err);
  }
}

  async function crearCategoria(nombre) {
    const slug = slugify(nombre, { lower: true });
    const res = await fetch(`${STRAPI_URL}/api/categorias-cursos`, {
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

  async function crearCurso(nuevo, media = {}) {
  if (!esEditor) throw new Error('Permiso denegado: se requiere rol editor');

  const slug = slugify(nuevo.titulo || '', { lower: true });
   const maestroId = maestrosMap[user.email] || null;

  const curso = {
    ...nuevo,
    slug,
    tags: Array.isArray(nuevo.tags)
      ? nuevo.tags.join(',')
      : nuevo.tags || '',
    categoria: nuevo.categoria ? Number(nuevo.categoria) : null,
    maestro_email: user.email,                                     // guarda el email
    maestro_nombre: user.name || user.nickname || '',
    ...(maestroId && { maestro: maestroId }),

  };

  if (media.portada?.[0]) curso.portada = media.portada[0];
  if (Array.isArray(media.galeria)) curso.galeria = media.galeria;
  if (Array.isArray(media.videos)) curso.videos = media.videos;

  try {
    const res = await fetch(`${STRAPI_URL}/api/cursos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: curso }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      console.error('Error al crear curso:', errData?.error || errData);
      throw new Error('No se pudo crear el curso');
    }

    await fetchCursos(); // Actualiza los contenidos si todo salió bien
  } catch (err) {
    console.error('Excepción al crear curso:', err);
    throw err;
  }
}


  async function editarCurso(id, cambios, media = {}) {
  // 1. Log inicial
  console.log('[useCurso] editarCurso llamado con:', { id, cambios, media });

  // 2. Construir dataCampos
  const dataCampos = {
    ...cambios,
    tags: Array.isArray(cambios.tags)
      ? cambios.tags.join(',')
      : (cambios.tags || ''),
    categoria: Number(cambios.categoria) || null,
  };
  if (media.portada) dataCampos.portada = media.portada[0];
  if (media.galeria) dataCampos.galeria = media.galeria;
  if (media.videos) dataCampos.videos = media.videos;
  console.log('[useCurso] dataCampos preparados:', dataCampos);

  // 3. Preparar petición
  const url = `${STRAPI_URL}/api/cursos/${id}`;
  const body = JSON.stringify({ data: dataCampos });
  console.log('[useCurso] Preparando PUT a:', url);
  console.log('[useCurso] Body:', body);

  // 4. Ejecutar fetch
  let res;
  try {
    res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
  } catch (networkErr) {
    console.error('[useContenido] Error de red al hacer PUT:', networkErr);
    throw new Error(`Error de red: ${networkErr.message}`);
  }

  console.log('[useContenido] Response received. Status:', res.status, 'ok:', res.ok);

  // 5. Leer cuerpo de respuesta
  let text;
  try {
    text = await res.text();
    console.log('[useCurso] Response body text:', text);
  } catch (e) {
    console.warn('[useCurso] No se pudo leer body como texto:', e);
  }

  // 6. Manejo de errores HTTP
  if (!res.ok) {
    let errData = null;
    try {
      errData = JSON.parse(text);
    } catch {}
    console.error('[useCurso] Error al editar curso:', res.status, errData);
    throw new Error(`No se pudo editar el curso (${res.status})`);
  }

  // 7. Refrescar lista de contenidos
  console.log('[useCurso] Éxito en PUT. Actualizando lista de contenidos…');
  await fetchCursos();
  console.log('[useCurso] Lista de cursos actualizada');
}


  async function eliminarCurso(id) {
    const res = await fetch(`${STRAPI_URL}/api/cursos/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      console.error('Error al eliminar curso:', errData?.error || errData);
      throw new Error('No se pudo eliminar el curso');
    }
    await fetchCursos();
  }

  function getCursoById(id) {
    const c = cursos.find(c => c.id === id);
    if (!c) return null;
    return {
      ...c,
      curso: {
        contenido: c.contenido,
      },
      galeria: {
        libre: c.galeria_libre,
      },
      videos: {
        libres: c.videos_libres,
      },
    };
  }

  function filtrarPorCategoria(slug) {
    return cursos.filter(c => c.curso?.slug === slug);
  }

  function buscarPorTexto(texto) {
    const t = texto.toLowerCase();
    return cursos.filter(c =>
      c.titulo.toLowerCase().includes(t) ||
      c.resumen?.toLowerCase().includes(t) ||
      c.tags.toLowerCase().includes(t)
    );
  }

  return {
    cursos,
    categorias,
    loading,
    error,
    tieneMembresia,
    esEditor,
    fetchCursos,
    fetchCategorias,
    crearCategoria,
    subirMedia,
    crearCurso,
    editarCurso,
    eliminarCurso,
    getCursoById,
    filtrarPorCategoria,
    buscarPorTexto,
    pagina,
    setPagina,
    porPagina,
    setPorPagina,
    totalItems,
    total
  };
}
