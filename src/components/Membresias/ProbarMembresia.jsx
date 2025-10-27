// src/pages/ProbarMembresia.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardContent,
} from "@mui/material";

// IMPORTA el componente que recibirá las props
import MembershipCheckout from "./MembershipCheckout";

const COLLECTION_ENDPOINT = "membresias-tipos";

const ProbarMembresia = () => {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [plan, setPlan] = useState(null);
  const [plane, setPlane] = useState(null);
  const [planidx, setPlanidx] = useState(null);
  const [subtypeToShow, setSubtypeToShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const strapiUrl = (process.env.REACT_APP_STRAPI_URL || "http://localhost:1337").replace(/\/$/, "");
  const apiToken = process.env.REACT_APP_STRAPI_TOKEN || null;

  const resolveOrderFromRequest = () => {
    const p1 = params?.order;
    if (p1) return { value: String(p1), from: "params" };

    const p2 = location?.state?.order;
    if (p2 !== undefined && p2 !== null) return { value: String(p2), from: "location.state" };

    try {
      const q = new URLSearchParams(location.search).get("order");
      if (q) return { value: String(q), from: "query" };
    } catch (e) {}

    try {
      const parts = (location.pathname || "").split("/").filter(Boolean);
      if (parts.length) {
        const last = parts[parts.length - 1];
        if (last !== "pagar") return { value: String(last), from: "pathname-last-segment" };
      }
    } catch (e) {}

    return { value: null, from: "none" };
  };

  useEffect(() => {
    let mounted = true;

    const fetchPlanes = async () => {
      setLoading(true);
      setError(null);

      const resolved = resolveOrderFromRequest();
      console.log("[ProbarMembresia] resolveOrderFromRequest:", resolved, { params, location });

      if (!resolved.value) {
        setError(
          "No se recibió parámetro 'order' en la ruta. Navega así:\n" +
          "1) ruta con param: /membresias/probar/1\n" +
          "2) navigate('/membresias/probar', { state: { order: 1 } })\n" +
          "3) query: /membresias/probar?order=1\n\n" +
          `Debug: params=${JSON.stringify(params)}, location.search='${location.search}', location.pathname='${location.pathname}'`
        );
        setLoading(false);
        return;
      }

      const orderParam = String(resolved.value);

      try {
        const headers = apiToken ? { Authorization: `Bearer ${apiToken}` } : {};
        const fullUrl = `${strapiUrl}/api/${COLLECTION_ENDPOINT}?pagination[pageSize]=100&sort=order:asc&populate=*`;

        console.log("[ProbarMembresia] Fetching:", fullUrl);
        const res = await fetch(fullUrl, { headers });
        const text = await res.text().catch(() => "");
        let json;
        try {
          json = JSON.parse(text);
        } catch (e) {
          console.error("[ProbarMembresia] Error parseando JSON:", text);
          throw new Error("Respuesta no JSON desde Strapi");
        }
        if (!res.ok) {
          console.error("[ProbarMembresia] Error HTTP:", res.status, json);
          throw new Error(`Error ${res.status}: ${JSON.stringify(json)}`);
        }

        const items = json?.data ?? [];
        console.log("[ProbarMembresia] planes crudos:", items);

        const mapped = items.map((r) => {
          const attrs = r.attributes || {};
          let parsedJson = null;
          if (attrs.json) {
            try { parsedJson = typeof attrs.json === "string" ? JSON.parse(attrs.json) : attrs.json; } catch {}
          }
          const pick = (keys) => {
            for (const k of keys) {
              if (attrs[k] !== undefined && attrs[k] !== null && attrs[k] !== "") return attrs[k];
              if (parsedJson && parsedJson[k] !== undefined && parsedJson[k] !== null && parsedJson[k] !== "") return parsedJson[k];
            }
            return undefined;
          };
          const nombre = pick(["nombre", "title", "name"]) || "";
          const precio = pick(["precio", "price", "amount"]) || "";
          const precioId = pick(["priceId"]) || "";
          //const openpayid = pick(["openpayid"]) || "";

          let subtypes_data = [];
          if (parsedJson && Array.isArray(parsedJson.subtypes)) subtypes_data = parsedJson.subtypes;
          if (!subtypes_data.length && attrs.subtypes_data) {
            if (Array.isArray(attrs.subtypes_data)) subtypes_data = attrs.subtypes_data;
            else if (attrs.subtypes_data.data && Array.isArray(attrs.subtypes_data.data)) {
              subtypes_data = attrs.subtypes_data.data.map(s => s.attributes ?? s);
            } else if (typeof attrs.subtypes_data === "string") {
              try { const parsed = JSON.parse(attrs.subtypes_data); if (Array.isArray(parsed)) subtypes_data = parsed; } catch {}
            }
          }

          const subtypesFlag = Boolean(attrs.subtypes) || (Array.isArray(subtypes_data) && subtypes_data.length > 0);

          return {
            id: r.id,
            order: attrs.order ?? 0,
            nombre,
            precio,
            subtypes: subtypesFlag,
            subtypes_data,
            precioId,
          };
        });

        if (!mounted) return;

        console.log("[ProbarMembresia] mapped planes:", mapped);
        console.log("[ProbarMembresiacccc] mapped planes:", mapped[1].subtypes_data[1].openpayid);
        setPlane(mapped);

        // Lógica de selección:
        if (["10","11","12"].includes(orderParam)) {
          const baseOrder = 1;
          const subtypeIndex = parseInt(orderParam, 10) - 10;
          const found = mapped.find(p => Number(p.order) === Number(baseOrder));
          if (!found) {
            setError(`No se encontró la membresía con order ${baseOrder}`);
            setLoading(false);
            return;
          }
          if (!Array.isArray(found.subtypes_data) || found.subtypes_data.length === 0) {
            setError(`La membresía order ${baseOrder} no tiene subtypes.`);
            setLoading(false);
            return;
          }
          const selectedSubtype = found.subtypes_data[subtypeIndex];
          if (!selectedSubtype) {
            setError(`No existe el subtype índice ${subtypeIndex} para la membresía order ${baseOrder}.`);
            setLoading(false);
            return;
          }
          console.log('⭐⭐⭐',selectedSubtype.openpayid);
          console.log('⭐⭐⭐',orderParam);
          setPlanidx(selectedSubtype.openpayid);
          setPlan(found);
          setSubtypeToShow(selectedSubtype);
          setLoading(false);
          return;
        }

        const numericOrder = Number(orderParam);
        if (Number.isNaN(numericOrder)) {
          setError(`Parámetro 'order' inválido: ${orderParam}`);
          setLoading(false);
          return;
        }

        const foundPlan = mapped.find(p => Number(p.order) === numericOrder);
        if (!foundPlan) {
          setError(`No se encontró ninguna membresía con order ${numericOrder}`);
          setLoading(false);
          return;
        }
        setPlanidx(foundPlan.precioId);
        console.log('⭐⭐⭐',foundPlan.precioId);

        setPlan(foundPlan);
        setSubtypeToShow(null);
        setLoading(false);

      } catch (err) {
        console.error("[ProbarMembresia] Error fetch:", err);
        if (mounted) {
          setError(err.message || String(err));
          setLoading(false);
        }
      }
    };

    fetchPlanes();
    
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, location]);

  


  const goBack = () => navigate(-1);

  // RENDER: cuando hay plan (y loading=false), en lugar de mostrar, pasamos props al MembershipCheckout
  return (
    <Box sx={{ px: 2, py: 4 }}>
      <Button onClick={goBack} sx={{ mb: 2 }}>← Volver</Button>

      {loading ? (
        <Box display="flex" justifyContent="center" my={6}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error" sx={{ whiteSpace: "pre-wrap" }}>{error}</Alert>
      ) : !plan ? (
        <Alert severity="warning">No se cargó ninguna información de membresía.</Alert>
      ) : (
        // Aquí pasamos las props al componente de checkout:
        <>
        
         {console.log("⁉️📣🍁✌️🔎🔎🔎🔎🔎", { order: resolveOrderFromRequest().value })}
         {console.log("⁉️📣🍁✌️🔎🔎🔎🔎🔎", plane[1].subtypes_data[2].openpayid )}
        <MembershipCheckout
          plan={plan}                    // objeto con: id, order, nombre, precio, subtypes, subtypes_data
          subtype={subtypeToShow}        // null o el objeto subtype seleccionado (ambiente,numplantas,precio,...)
          order={String(resolveOrderFromRequest().value)} // el order tal como vino (string)
          goBack={goBack}   // helper para volver (opcional) 
          planidx={planidx}            
        />
        </>
      )}
    </Box>
  );
};

export default ProbarMembresia;
