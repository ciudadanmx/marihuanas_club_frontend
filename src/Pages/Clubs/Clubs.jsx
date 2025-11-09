// src/pages/Clubs.jsx
import React, {
  useEffect,
  useRef,
  useState,
  lazy,
  Suspense,
  useCallback,
  useTransition,
} from 'react';
import {
  Box,
  Button,
  Typography,
  useMediaQuery,
  Skeleton,
  Stack,
  Tabs,
  Tab,
} from '@mui/material';
import { useRoles } from '../../Contexts/RolesContext'; 
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react'; // <- usamos auth0 para obtener user
import clubs from '../../assets/red_de_clubs_marihuanas_club.png';
import afilia from '../../assets/afilia_tu_club.png';
import ContadorClubs from '../../components/Clubs/ContadorClubs.jsx';
import '../../styles/clubs.css';

// IMPORTS LAZY: no se importan hasta que haya intención/visibilidad
const importMapaClubs = () => import('../../components/Clubs/MapaClubs.jsx');
const importInfoClubs = () => import('../../components/Clubs/InfoClubs.jsx');
const importSuscribete = () => import('../../components/Clubs/Suscribete.jsx');
const importDirectorioClubs = () => import('../../components/Clubs/DirectorioClubs.jsx');
const importMiClubBar = () => import('../../components/Clubs/MiClubBar.jsx');

const MapaClubsLazy = lazy(importMapaClubs);
const InfoClubsLazy = lazy(importInfoClubs);
const SuscribeteLazy = lazy(importSuscribete);
const DirectorioClubsLazy = lazy(importDirectorioClubs);
const MiClubBarLazy = lazy(importMiClubBar);

/* Hook para detectar visibilidad on-screen */
const useOnScreen = (ref, rootMargin = '0px') => {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIntersecting(entry.isIntersecting),
      { rootMargin }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return isIntersecting;
};

/* Prefetch helper - dispara la importación para cachear el módulo */
const prefetchModule = (importFn) => {
  importFn();
};

const Clubs = () => {
  const { membresia } = useRoles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  // auth0 user
  const { user } = useAuth0();

  // refs para observar sección mapa / info / suscribe
  const ref1 = useRef(); // para la primera imagen (mantener compatibilidad)
  const ref2 = useRef(); // para la segunda imagen (mantener compatibilidad)
  const mapContainerRef = useRef(null);
  const infoContainerRef = useRef(null);
  const susContainerRef = useRef(null);

  const visible1 = useOnScreen(ref1, '-100px');
  const visible2 = useOnScreen(ref2, '-100px');

  // estados de carga de imágenes (se usan para mostrar Skeleton inicialmente)
  const [img1Loaded, setImg1Loaded] = useState(false);
  const [img2Loaded, setImg2Loaded] = useState(false);

  // estado para saber si hemos intentado cargar el mapa/otros (intención explícita)
  const [mapRequested, setMapRequested] = useState(false);
  const [infoRequested, setInfoRequested] = useState(false);
  const [susRequested, setSusRequested] = useState(false);

  // tab del mapa: 0 => Mapa, 1 => Directorio
  const [mapTab, setMapTab] = useState(0);

  // transición para operaciones no bloqueantes (opcional)
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // Si el contenedor del mapa entra en viewport, prefetcheamos el módulo (non-blocking)
    if (mapContainerRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              startTransition(() => {
                prefetchModule(importMapaClubs);
                setMapRequested(true); // marcar que lo hemos prefeteado/solicitado
              });
            }
          });
        },
        { rootMargin: '-120px' }
      );
      observer.observe(mapContainerRef.current);
      return () => observer.disconnect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapContainerRef.current]);

  useEffect(() => {
    // Prefetch ligero para Info cuando su contenedor entra en viewport
    if (infoContainerRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              startTransition(() => {
                prefetchModule(importInfoClubs);
                setInfoRequested(true);
              });
            }
          });
        },
        { rootMargin: '-120px' }
      );
      observer.observe(infoContainerRef.current);
      return () => observer.disconnect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [infoContainerRef.current]);

  useEffect(() => {
    // Prefetch ligero para Suscribete cuando su contenedor entra en viewport
    if (susContainerRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              startTransition(() => {
                prefetchModule(importSuscribete);
                setSusRequested(true);
              });
            }
          });
        },
        { rootMargin: '-120px' }
      );
      observer.observe(susContainerRef.current);
      return () => observer.disconnect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [susContainerRef.current]);

  // navegación al listado de tipos (CTA principal)
  const handleAfiliaClick = useCallback(() => {
    navigate('/clubs/tipos-clubs');
  }, [navigate]);

  // prefetch por intención cuando el usuario hace hover/focus en CTA
  const handleAfiliaHover = useCallback(() => {
    prefetchModule(importInfoClubs);
    prefetchModule(importMapaClubs);
    prefetchModule(importSuscribete);
    // marcamos que se hizo intento (útil si queremos render condicional)
    startTransition(() => {
      setMapRequested(true);
      setInfoRequested(true);
      setSusRequested(true);
    });
  }, []);

  // manejar cambio de tab dentro del mapa: si el usuario va a Directorio, prefetch/import
  const handleMapTabChange = (event, newValue) => {
    setMapTab(newValue);
    if (newValue === 1) {
      // intención explícita de ver el directorio
      startTransition(() => {
        prefetchModule(importDirectorioClubs);
      });
    } else if (newValue === 0) {
      // si vuelve a mapa, aseguramos que el mapa esté prefeteado
      startTransition(() => prefetchModule(importMapaClubs));
    }
  };

  return (
    <Box
      className="clubs-wrapper"
      maxWidth="lg"
      mx="auto"
      px={2}
      py={4}
      sx={{
        backgroundColor: '#f4ffe2',
        borderRadius: 4,
        boxShadow: '0 4px 25px rgba(0,0,0,0.1)',
      }}
    >
      <Typography
        variant="h3"
        textAlign="center"
        fontWeight="bold"
        mb={3}
        className="section-title animated-box fade-in-top"
        sx={{
          textShadow: '0 1px 2px rgba(0,0,0,0.2)',
          color: '#2e7d32',
        }}
      >
        🌿 Red de Clubs Cannábicos en México
      </Typography>

      <Box
        display="flex"
        flexDirection={{ xs: 'column', md: 'row' }}
        alignItems="center"
        justifyContent="center"
        gap={4}
        mb={4}
      >
        {/* Imagen 1 */}
        <Box
          ref={ref1}
          className={`animated-box ${visible1 ? 'fade-zoom-left' : ''}`}
          component="img"
          src={clubs}
          alt="Red de Clubs"
          onLoad={() => setImg1Loaded(true)}
          sx={{
            width: { xs: '100%', md: '48%' },
            borderRadius: 3,
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
          }}
          loading="lazy"
        />

        {/* Botón solo en móviles */}
        {isMobile && (
          <Button
            variant="contained"
            color="success"
            sx={{
              my: 2,
              backgroundColor: '#66bb6a',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              padding: '12px 24px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
            fullWidth
            onMouseEnter={handleAfiliaHover}
            onFocus={handleAfiliaHover}
          >
            Ver el Directorio de Clubs 420
          </Button>
        )}

        {/* Imagen 2 con botón flotante (sin cambios visuales, sólo prefetch en hover) */}
        <Box
          ref={ref2}
          className={`animated-box ${visible2 ? 'fade-zoom-right' : ''}`}
          sx={{
            width: { xs: '100%', md: '48%' },
            borderRadius: 3,
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            component="img"
            src={afilia}
            alt="Afilia tu Club"
            onLoad={() => setImg2Loaded(true)}
            sx={{
              width: '100%',
              display: 'block',
              borderRadius: 3,
            }}
            loading="lazy"
          />

          {/* Botón con borde y glow */}
          <Button
            onClick={handleAfiliaClick} // <-- Navegación
            onMouseEnter={handleAfiliaHover}
            onFocus={handleAfiliaHover}
            variant="contained"
            sx={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#43a047',
              color: '#fff',
              fontWeight: 'bold',
              padding: '10px 24px',
              borderRadius: '999px',
              fontSize: '1rem',
              textTransform: 'none',
              zIndex: 2,
              border: '2px solid #fff200',
              boxShadow: '0 0 15px #fff200cc, 0 4px 10px rgba(0,0,0,0.4)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                backgroundColor: '#388e3c',
                boxShadow: '0 0 20px #fff200ee, 0 6px 12px rgba(0,0,0,0.5)',
              },
            }}
          >
            🌱 Afilia gratis tu club
          </Button>
        </Box>
      </Box>

      {/* Título inferior */}
      <Typography
        variant="h4"
        textAlign="center"
        fontWeight="600"
        color="text.secondary"
        className="animated-box fade-in-bottom"
        sx={{ mt: 4 }}
      >
        {/* Aquí mantenemos la misma posición del mapa como antes, pero con Tabs:
            - "Mapa" muestra MapaClubs
            - "Directorio" muestra DirectorioClubs
            Lazy + Suspense para ambos */}
        <Box ref={mapContainerRef} sx={{ width: '100%' }}>
          {/* Si membresia?.activa === true mostramos MiClubBar por encima de las tabs */}
          {membresia?.activa === true ? (
            <Suspense fallback={null}>
              <MiClubBarLazy />
            </Suspense>
          ) : null}

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}>
            <ContadorClubs lugares={1000} clubs={20}/>
            <Tabs
              value={mapTab}
              onChange={handleMapTabChange}
              aria-label="Mapa o Directorio de clubs"
              centered={isMobile ? false : true}
            >
              <Tab label="Mapa" id="tab-mapa" aria-controls="tabpanel-mapa" />
              <Tab label="Directorio" id="tab-directorio" aria-controls="tabpanel-directorio" />
            </Tabs>
          </Box>

          {/* Panel Mapa */}
          {mapTab === 0 && (
            <Suspense
              fallback={
                <Box sx={{ width: '100%', display: 'block', py: { xs: 2, md: 4 } }}>
                  <Skeleton variant="rectangular" height={isMobile ? 180 : 360} />
                  <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
                    <Skeleton variant="rectangular" width={100} height={36} />
                    <Skeleton variant="rectangular" width={100} height={36} />
                  </Stack>
                </Box>
              }
            >
              <MapaClubsLazy />
            </Suspense>
          )}

          {/* Panel Directorio */}
          {mapTab === 1 && (
            <Suspense
              fallback={
                <Box sx={{ width: '100%', display: 'block', py: { xs: 2, md: 4 } }}>
                  <Skeleton variant="rectangular" height={isMobile ? 180 : 360} />
                  <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
                    <Skeleton variant="rectangular" width={140} height={36} />
                  </Stack>
                </Box>
              }
            >
              <DirectorioClubsLazy />
            </Suspense>
          )}
        </Box>
      </Typography>

      {/* InfoClubs (manteniendo exactamente lo que tenías, pero lazy) */}
      <Box ref={infoContainerRef} sx={{ mt: 3 }}>
        <Suspense
          fallback={
            <Box sx={{ width: '100%', py: 2 }}>
              <Skeleton variant="rectangular" height={140} />
            </Box>
          }
        >
          <InfoClubsLazy />
        </Suspense>
      </Box>


            <Box ref={susContainerRef} sx={{ mt: 2 }}>
        <Box
          sx={{
            textAlign: "center",
            mt: { xs: 3, md: 4 },
            mb: { xs: 1, md: 2 },
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: "#006400", // verde fuerte
              mb: 0.5,
              fontFamily: "'Righteous', cursive",
              fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
            }}
          >
            ¿Cuentas con un espacio para recibir consumidores o alojar plantas?
          </Typography>

          <Typography
            onClick={() => navigate("/clubs/tipos-clubs")}
            sx={{
              display: "inline-block",
              fontSize: { xs: "0.85rem", sm: "0.9rem" },
              color: "#39FF14", // verde neón-limoso
              textDecoration: "none",
              fontFamily: "'Tilt Neon', sans-serif",
              letterSpacing: 0.3,
              cursor: "pointer",
              transition: "all 0.3s ease",
              "&:hover": {
                color: "#00C853",
                textShadow: "0 0 6px rgba(57,255,20,0.6)",
                transform: "scale(1.03)",
              },
            }}
          >
            Abre / Afilia tu Club a la red <b>marihuanas.club</b>
          </Typography>
        </Box>
      </Box>

      {/* Suscribete (mantener estructura original, pero lazy load para rendimiento) */}
      <Box ref={susContainerRef} sx={{ mt: 2 }}>
        <Suspense
          fallback={
            <Box sx={{ width: '100%', py: 2 }}>
              <Skeleton variant="rectangular" height={96} />
            </Box>
          }
        >
          <SuscribeteLazy />
        </Suspense>
      </Box>
    </Box>


    

  );
};

export default Clubs;
