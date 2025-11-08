// src/pages/TiposClub.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Grid,
  Box,
  Dialog,
  DialogContent,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import headerImage from "../../assets/tiposclubs.png";
import kitImage from "../../assets/kitjardinero.png";
import ClubConsumo from '../../components/Clubs/ClubConsumo.jsx';
import ClubConsumoTitulo from '../../components/Clubs/ClubConsumoTitulo.jsx';
import afiliaconsumo from "../../assets/afiliaconsumo.mp4";
import KitJardinero from '../../components/KitJardinero.jsx';
import ClubConsumoCard from '../../components/Clubs/ClubConsumoCard.jsx';
import ClubCultivoCard from '../../components/Clubs/ClubCultivoCard.jsx';
import AmbosClubsCard from '../../components/Clubs/AmbosClubsCard.jsx';
import LocalPlayer from '../../components/utils/LocalPlayer.jsx';

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const TiposClub = () => {
  const [loadingItems, setLoadingItems] = useState(true);
  const [kitItems, setKitItems] = useState([]);
  const [errorItems, setErrorItems] = useState(null);
  const [openKitModal, setOpenKitModal] = useState(false);
  const handleCloseKitModal = () => setOpenKitModal(false);
  const handleOpenKitModal = () => setOpenKitModal(true);

  
// ------------------------------
// Reemplazar extractImageUrl + useEffect
// ------------------------------

const extractImageUrl = (field, envBaseFallback) => {
  if (!field) return null;

  // obtener url de las formas que usamos normalmente
  let url = null;
  if (typeof field === "string") {
    url = field;
  } else if (field.attributes && field.attributes.url) {
    url = field.attributes.url;
  } else if (field.url) {
    url = field.url;
  }

  if (!url) return null;

  // normalizar base y rutas relativas mínimas
  const base = (envBaseFallback || window.location.origin).replace(/\/$/, "");
  if (url.startsWith("/")) return `${base}${url}`;
  if (url.startsWith("//")) return window.location.protocol + url;
  if (!/^https?:\/\//i.test(url)) return `${base}/${url.replace(/^\/+/, "")}`;

  return url;
};

  useEffect(() => {
    const base = (process.env.REACT_APP_STRAPI_URL || "").replace(/\/$/, "");
    if (!base) {
      setErrorItems("REACT_APP_STRAPI_URL no definido");
      setKitItems([]);
      setLoadingItems(false);
      return;
    }

    const endpoint = `${base}/api/kitjardineros?populate=*`;

    const fetchItems = async () => {
      setLoadingItems(true);
      setErrorItems(null);

      try {
        const res = await fetch(endpoint, { method: "GET", mode: "cors" });
        if (!res.ok) throw new Error(`Fetch error: ${res.status}`);

        const json = await res.json();

        let parsed = [];
        if (Array.isArray(json.data)) {
          parsed = json.data.map((d) => d.attributes || d);
        } else {
          const possible = Object.values(json).find((v) => Array.isArray(v));
          if (Array.isArray(possible)) parsed = possible;
        }

        parsed = (parsed || []).filter((it) => it && it.pack === "jardinero");

        const envBaseForImages = base || window.location.origin;
        const normalized = (parsed || []).map((it) => {
          const imageField = it.imagen ?? it.imagenes ?? it.image ?? null;
          const imagenUrl = extractImageUrl(imageField, envBaseForImages);
          return {
            cantidad: it.cantidad ?? it.Cantidad ?? 0,
            nombre: it.nombre ?? it.name ?? it.titulo ?? "",
            texto: it.texto ?? it.descripcion ?? it.description ?? "",
            precio: it.precio ?? null,
            imagenUrl,
            id: it.id ?? Math.random().toString(36).slice(2, 9),
          };
        });

        setKitItems(normalized);
        setLoadingItems(false);
      } catch (err) {
        setErrorItems(
          "Error al cargar items (revisa REACT_APP_STRAPI_URL, CORS o la ruta /api/kitjardineros)."
        );
        setKitItems([]);
        setLoadingItems(false);
      }
    };

    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <>
    <Box sx={{ backgroundColor: "#f9fdf9", color: "#1a1a1a", pb: 8 }}>
      {/* Imagen Full Width */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2 }}
        sx={{
          position: "relative",
          width: "100%",
          height: { xs: 260, md: 420 },
          overflow: "hidden",
        }}
      >
        <Box
          component="img"
          src={headerImage}
          alt="Encabezado Tipos Club"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "saturate(1.05) contrast(1.03)",
          }}
        />
      </Box>

      <Box
        component={motion.div}
        variants={fadeIn}
        initial="hidden"
        whileInView="show"
        sx={{ px: { xs: 2, md: 6 }, mt: { xs: 3, md: 6 } }}
      >
        <KitJardinero
          kitImage={kitImage} 
          loadingItems={loadingItems}
          errorItems={errorItems}
          kitItems={kitItems}
          setOpenKitModal={setOpenKitModal}
          handleOpenKitModal={handleOpenKitModal}
          LocalPlayer={LocalPlayer}
        />
        <ClubConsumoTitulo />
        <ClubConsumo 
          LocalPlayer={LocalPlayer} 
          afiliaconsumo={afiliaconsumo}
        />         
      </Box>

        {/* Modals / cards de modalidades (mantengo tu estructura original) */}
        <Grid container spacing={4} justifyContent="center" maxWidth="1200px" mx="auto">
          <ClubCultivoCard />
          <ClubConsumoCard />
          <AmbosClubsCard />
        </Grid>
    </Box>

    <Dialog
      open={openKitModal}
      onClose={handleCloseKitModal}
      maxWidth="lg"
      fullWidth
      aria-labelledby="kit-image-dialog"
    >
      <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
        <IconButton onClick={handleCloseKitModal} aria-label="Cerrar">
          <CloseIcon />
        </IconButton>
      </Box>
      <DialogContent
        id="kit-image-dialog"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: { xs: 1, md: 3 },
        }}
      >
        <Box
          component="img"
          src={kitImage}
          alt="Kit Jardinero - ampliada"
          sx={{
            maxWidth: "100%",
            maxHeight: { xs: "70vh", md: "80vh" },
            objectFit: "contain",
            borderRadius: 2,
            boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
          }}
        />
      </DialogContent>
    </Dialog>
  </>
  );
};

export default TiposClub;
