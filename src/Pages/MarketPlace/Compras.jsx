// src/pages/Compras.jsx
import React, { useEffect, useState } from "react";
import Pestanas from "../../components/Pestanas";
import { useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  CircularProgress,
  Button,
  Chip,
  Divider,
  IconButton,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { motion } from "framer-motion";
import HistorialPagos from "../../components/MarketPlace/HistorialPagos.jsx"; // ajusta la ruta si es necesario

/**
 * Compras.jsx
 * - Strapi v4
 * - Trae pedidos del usuario autenticado (filtrado por usuario.email a través de la relación `usuario`)
 * - Usa populate=deep,3 para traer relaciones (producto, store, direcciones, etc.)
 * - REACT_APP_STRAPI_URL y opcional REACT_APP_STRAPI_TOKEN
 *
 * Ajusta nombres de atributos si tu modelo difiere.
 */

const Compras = () => {
  const location = useLocation();
  const { user, isLoading } = useAuth0();

  const [tabIndex, setTabIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [error, setError] = useState(null);

  const basePrueba = "/market/compras";

  const tabs = [
    { label: "Pedidos en curso", path: "pedidos" },
    { label: "Historial", path: "historial" },
  ];

  // responsive listener
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // sincroniza tabIndex con la URL
  useEffect(() => {
    const path = (location.pathname || "").toLowerCase();
    if (path.includes(`${basePrueba}/pedidos`)) setTabIndex(0);
    else if (path.includes(`${basePrueba}/historial`)) setTabIndex(1);
    else setTabIndex(0);
  }, [location.pathname]);

  // fetch pedidos: se ejecuta cuando cambia user/isLoading o cambia la pestaña
  useEffect(() => {
    if (isLoading) return;
    if (!user || !user.email) {
      setItems([]);
      return;
    }

    const fetchPedidos = async () => {
      setLoadingItems(true);
      setError(null);

      try {
        const baseRaw = process.env.REACT_APP_STRAPI_URL || "";
        const base = baseRaw.replace(/\/+$/, "");
        if (!base) throw new Error("REACT_APP_STRAPI_URL no definido en .env");

        // Query general: filtramos por la relación usuario.email
        // populate profundo para traer producto, store, imagen_predeterminada, direcciones, pago, etc.
        // Orden descendente por id (más recientes primero)
        const url = `${base}/api/pedidos?filters[usuario][email][$eq]=${encodeURIComponent(
          user.email
        )}&populate=deep,3&sort[0]=id:desc`;

        const headers = { "Content-Type": "application/json" };
        if (process.env.REACT_APP_STRAPI_TOKEN) {
          headers.Authorization = `Bearer ${process.env.REACT_APP_STRAPI_TOKEN}`;
        }

        const res = await fetch(url, { headers });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`Strapi error ${res.status}: ${txt}`);
        }

        const json = await res.json();
        const data = Array.isArray(json.data) ? json.data : [];
        setItems(data);
      } catch (err) {
        console.error(err);
        setError(err.message || "Error al obtener pedidos");
        setItems([]);
      } finally {
        setLoadingItems(false);
      }
    };

    fetchPedidos();
  }, [user, isLoading, tabIndex]); // rehace fetch si cambias de pestaña (para mantener datos actualizados)

  if (isLoading) return <p>Cargando autenticación...</p>;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isMobile ? "column-reverse" : "row",
        padding: 24,
        gap: 32,
        flexWrap: "wrap",
      }}
    >
      <div style={{ flex: "1 1 100%" }}>
        <Pestanas
          tabs={tabs.map((t) => ({ label: t.label, path: t.path }))}
          basePath={basePrueba}
          onTabChange={(index) => setTabIndex(index)}
          collapseAt={640}
          backgroundColor="linear-gradient(90deg, #2b0a3d 0%, #3a0f55 50%, #2b0a3d 100%)"
          textColor="#d9c9ff"
        />

        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36, ease: "easeOut" }}
          sx={{
            mt: 3,
            p: { xs: 2, md: 3 },
            borderRadius: 2,
            boxShadow: 3,
            background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.99))",
            border: `1px solid #6d6e71`,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: "#fff200",
                    border: "2px solid #6d6e71",
                    display: "inline-block",
                    mr: 1,
                  }}
                />
                Compras — {tabs[tabIndex]?.label || "Pedidos"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                API: pedidos
              </Typography>
            </Box>

            <Box sx={{ textAlign: "right" }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {user?.email}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {items.length} registros
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {loadingItems ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ py: 4 }}>
              <Typography color="error">Error: {error}</Typography>
            </Box>
          ) : tabIndex === 1 ? (
            // HISTORIAL: renderizamos componente dedicado y le pasamos lo necesario
            <Box>
              <HistorialPagos items={items} user={user} />
            </Box>
          ) : items.length === 0 ? (
            <Box sx={{ py: 6, textAlign: "center" }}>
              <Typography variant="body1">No tienes pedidos recientes.</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Cuando realices una compra, aquí aparecerá tu pedido.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {items.map((entry) => {
                const id = entry.id;
                const attrs = entry.attributes || {};

                // Información principal a mostrar (ajusta según tus campos)
                const nombre =
                  attrs.nombre ||
                  `Pedido #${id}`; // nombre del pedido si existe
                const total = attrs.total ?? attrs.monto_total ?? attrs.total ?? 0;
                const moneda = attrs.moneda || "MXN";
                const cantidadItems = Array.isArray(attrs.item?.data) ? attrs.item.data.length : (attrs.cantidad ?? 1);
                const status = attrs.status || "pendiente";
                const fechaCreacion = attrs.timestamp_creacion || attrs.createdAt || attrs.fecha_pagado || null;
                const fechaEntrega = attrs.fecha_entrega || null;
                const guia = attrs.guia || null;

                // tienda (store) si viene en la relación
                let storeName = "";
                if (attrs.store && attrs.store.data && attrs.store.data.attributes) {
                  storeName = attrs.store.data.attributes.nombre || attrs.store.data.attributes.name || "";
                }

                // imagen_predeterminada
                let imgUrl = null;
                if (attrs.imagen_predeterminada && attrs.imagen_predeterminada.data && attrs.imagen_predeterminada.data.attributes?.url) {
                  imgUrl = attrs.imagen_predeterminada.data.attributes.url;
                } else if (attrs.item && attrs.item.data && Array.isArray(attrs.item.data) && attrs.item.data[0]?.attributes?.producto?.data?.attributes?.imagen?.data) {
                  // intentar sacar imagen desde el primer producto del componente item
                  const media = attrs.item.data[0].attributes.producto.data.attributes.imagen;
                  if (media?.data?.attributes?.url) imgUrl = media.data.attributes.url;
                }

                if (imgUrl && imgUrl.indexOf("http") !== 0) {
                  const base = (process.env.REACT_APP_STRAPI_URL || "").replace(/\/$/, "");
                  imgUrl = base + imgUrl;
                }

                return (
                  <Grid key={id} item xs={12}>
                    <Card
                      component={motion.div}
                      whileHover={{ scale: 1.01, y: -4 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      sx={{
                        display: "flex",
                        gap: 2,
                        alignItems: "center",
                        p: 1.5,
                        borderRadius: 2,
                        border: `1px solid #e6e6e6`,
                      }}
                    >
                      <Avatar
                        variant="rounded"
                        src={imgUrl || undefined}
                        sx={{
                          width: 84,
                          height: 84,
                          bgcolor: imgUrl ? "transparent" : "#fff200",
                          border: "2px solid #6d6e71",
                          color: "#111",
                          fontWeight: 700,
                          ml: 1,
                        }}
                      >
                        {!imgUrl ? (nombre?.charAt(0)?.toUpperCase() || "P") : ""}
                      </Avatar>

                      <CardContent sx={{ flex: 1, py: 0, "&:last-child": { pb: 0 } }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                              {nombre}
                            </Typography>

                            <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: 0.5, flexWrap: "wrap" }}>
                              <Chip
                                size="small"
                                icon={<LocalShippingIcon />}
                                label={`Status: ${status}`}
                                sx={{ borderRadius: 1, bgcolor: "#fff200", color: "#000", fontWeight: 600 }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {cantidadItems} ítem(s)
                              </Typography>
                              {storeName && <Typography variant="caption">Tienda: {storeName}</Typography>}
                            </Box>

                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              Total: {Number(total).toLocaleString()} {moneda}
                            </Typography>

                            <Box sx={{ display: "flex", gap: 2, mt: 1, alignItems: "center", flexWrap: "wrap" }}>
                              {fechaCreacion && (
                                <Typography variant="caption">Creado: {new Date(fechaCreacion).toLocaleString()}</Typography>
                              )}
                              {fechaEntrega && (
                                <Typography variant="caption">Entrega: {new Date(fechaEntrega).toLocaleString()}</Typography>
                              )}
                              {guia && <Typography variant="caption">Guía: {guia}</Typography>}
                            </Box>
                          </Box>

                          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, alignItems: "flex-end" }}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<InfoIcon />}
                              onClick={() => {
                                // por ahora dejamos un console.log; sustituye por navegación real
                                console.log("Ver detalle pedido", id);
                                // ejemplo: navigate(`/pedido/${id}`)
                              }}
                            >
                              Ver detalle
                            </Button>

                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => {
                                // acción de contacto/soporte (ejemplo)
                                window.open(`mailto:soporte@marihuanas.club?subject=Pedido%20${id}`, "_blank");
                              }}
                            >
                              Contactar soporte
                            </Button>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      </div>
    </div>
  );
};

export default Compras;
