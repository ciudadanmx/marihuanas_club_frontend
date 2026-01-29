import React, { useCallback, useRef, useEffect, useState } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
// Imagen del marcador personalizada
import userMarkerSVG from "../../../assets/club_ambos.svg";
import userMarkerPNG from "../../../assets/marcador_club_ambos.png";
import userMarkerGIF from "../../../assets/marcador_club_ambos.gif";

import { deffaultLat, deffaultLng } from "../../../utils/constants";
import PreLoader from "../../../components/PreLoader";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import {
  TextField,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
} from "@mui/material";

export default function Direccion({ form, setForm }) {
  const mapRef = useRef(null);

  // 🔹 icono actual del marker
  const [markerIcon, setMarkerIcon] = useState(userMarkerSVG);
  const [pngReady, setPngReady] = useState(false);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const {
    ready,
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: { componentRestrictions: { country: "mx" } },
    debounce: 300,
  });

  /* =========================================================
     🔥 Precarga PNG → cuando está listo reemplaza el SVG
     ========================================================= */
  useEffect(() => {
    const img = new Image();
    img.src = userMarkerPNG;

    img.onload = () => {
      setPngReady(true);
      setMarkerIcon(userMarkerPNG);
    };
  }, []);

  const parseAddress = (result) => {
    const components = result.address_components || [];
    const get = (type) =>
      components.find((c) => c.types.includes(type))?.long_name || "";

    return {
      direccionCompleta: result.formatted_address || "",
      codigo_postal: get("postal_code"),
      colonia: get("sublocality") || get("neighborhood") || "",
      ciudad: get("locality") || "",
      estado: get("administrative_area_level_1") || "",
    };
  };

  const handleMarkerDragEnd = useCallback(
    (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      try {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === "OK" && results[0]) {
            const parsed = parseAddress(results[0]);

            setValue(parsed.direccionCompleta, false);
            setForm((prev) => ({
              ...prev,
              direccion: parsed.direccionCompleta,
              codigo_postal: parsed.codigo_postal,
              lat: Number(lat),
              lng: Number(lng),
            }));

            if (mapRef.current) {
              mapRef.current.panTo({ lat: Number(lat), lng: Number(lng) });
              mapRef.current.setZoom(16);
            }
          }
        });
      } catch (err) {
        console.error("Reverse geocode error:", err);
      }
    },
    [setForm, setValue]
  );

  const handleSelect = async (address) => {
    setValue(address, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address });
      const result = results[0];
      const { lat, lng } = await getLatLng(result);

      const components = result.address_components || [];
      const get = (type) =>
        components.find((c) => c.types.includes(type))?.long_name || "";

      const calle = get("route");
      const numero = get("street_number");
      const colonia = get("sublocality") || get("neighborhood");
      const ciudad = get("locality");
      const estado = get("administrative_area_level_1");
      const cp = get("postal_code");

      const direccionFormateada = [
        calle && `Calle ${calle}`,
        numero && `No. ${numero}`,
        colonia && `Colonia ${colonia}`,
        ciudad && ciudad,
        estado && estado,
        cp && `C.P. ${cp}`,
      ]
        .filter(Boolean)
        .join(", ");

      const latNum = Number(lat);
      const lngNum = Number(lng);

      setForm((prev) => ({
        ...prev,
        direccion: result.formatted_address,
        direccion_formateada: direccionFormateada,
        codigo_postal: cp,
        lat: latNum,
        lng: lngNum,
      }));

      if (mapRef.current) {
        mapRef.current.panTo({ lat: latNum, lng: lngNum });
        mapRef.current.setZoom(16);
      }
    } catch (error) {
      console.error("Error al geocodificar selección:", error);
    }
  };

  useEffect(() => {
    if (form.direccion && !value) {
      setValue(form.direccion, false);
    }
  }, [form.direccion]);

  if (loadError) return <div>Error al cargar el mapa</div>;
  if (!isLoaded) return <PreLoader texto="Cargando Mapa..." />;

  const center = {
    lat: Number(form.lat) || deffaultLat,
    lng: Number(form.lng) || deffaultLng,
  };

  return (
    <Box>
      <Typography variant="h6" mb={2}>
        📍 Buscar dirección
      </Typography>

      <TextField
        label="Dirección"
        value={typeof value === "string" ? value : ""}
        onChange={(e) => setValue(e.target.value)}
        disabled={!ready}
        fullWidth
        margin="normal"
      />

      {status === "OK" && (
        <List sx={{ maxHeight: 200, overflowY: "auto", mb: 2 }}>
          {data.map(({ place_id, description }) => (
            <ListItem key={place_id} disablePadding>
              <ListItemButton onClick={() => handleSelect(description)}>
                <ListItemText primary={description} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}

      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "420px", borderRadius: 8 }}
        zoom={15}
        center={center}
        onLoad={(map) => (mapRef.current = map)}
      >
        {form.lat != null && form.lng != null && (
          <Marker
            key={markerIcon} // 👈 fuerza cambio real del icono
            position={{
              lat: Number(form.lat) || center.lat,
              lng: Number(form.lng) || center.lng,
            }}
            draggable
            onDragEnd={handleMarkerDragEnd}
            onMouseOver={() => setMarkerIcon(userMarkerGIF)}
            onMouseOut={() =>
              setMarkerIcon(pngReady ? userMarkerPNG : userMarkerSVG)
            }
            icon={{
              url: markerIcon,
              scaledSize: new window.google.maps.Size(52, 52),
              anchor: new window.google.maps.Point(20, 40),
            }}
          />
        )}
      </GoogleMap>

      <Box mt={3} display="flex" justifyContent="center">
        <Paper elevation={3} sx={{ width: "60%", p: 2 }}>
          <Typography variant="subtitle2">¿Número interior?</Typography>
          <TextField
            size="small"
            value={form.numero_interior || ""}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, numero_interior: e.target.value }))
            }
            fullWidth
          />
        </Paper>
      </Box>
    </Box>
  );
}
