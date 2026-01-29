import React, { useCallback, useRef, useEffect } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
// Imagen del marcador personalizada (asegúrate que la ruta sea correcta)
import userMarker from "../../../assets/club_ambos.png";
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

/**
 * Componente Direccion
 * - Busca direcciones con Autocomplete de Google
 * - Permite arrastrar un marker para hacer reverse-geocoding
 * - Guarda dirección normal y una versión formateada para documentos oficiales
 *
 * Cambios mínimos aplicados:
 *  - Asegurar que lat/lng sean Numbers
 *  - Icon con scaledSize + anchor para que la imagen se vea
 *  - useEffect para hidratar el input si ya hay form.direccion (cuando vuelves al step)
 */
export default function Direccion({ form, setForm }) {
  // Ref para guardar la instancia del mapa (usada para panTo / setZoom)
  const mapRef = useRef(null);

  // Carga de librería Google Maps (hooks siempre arriba)
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  // Hook de autocomplete
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

  /**
   * parseAddress: extrae componentes de address_components
   * (se usa en reverse geocode)
   */
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

  /**
   * handleMarkerDragEnd:
   * - Reverse geocoding cuando sueltas el marker
   * - Actualiza form (direccion, codigo_postal, lat, lng)
   * - Hace panTo + setZoom para centrar la vista estilo Uber
   */
  const handleMarkerDragEnd = useCallback(
    (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      try {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === "OK" && results[0]) {
            const parsed = parseAddress(results[0]);

            // Actualiza el input del autocomplete y el form
            setValue(parsed.direccionCompleta, false);
            setForm((prev) => ({
              ...prev,
              direccion: parsed.direccionCompleta,
              codigo_postal: parsed.codigo_postal,
              // guardamos números (seguro)
              lat: Number(lat),
              lng: Number(lng),
            }));

            // Centrar mapa si ya está la instancia
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

  /**
   * handleSelect:
   * - Cuando eliges una sugerencia del autocomplete
   * - Geocodifica, extrae componentes y construye direccion_formateada
   * - Guarda lat/lng como Number y hace panTo+setZoom en el mapa
   */
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
      const colonia =
        get("sublocality") ||
        get("neighborhood");
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

      // Guardamos en form (lat/lng como números)
      setForm((prev) => ({
        ...prev,
        direccion: result.formatted_address,
        direccion_formateada: direccionFormateada,
        codigo_postal: cp,
        lat: latNum,
        lng: lngNum,
      }));

      // panTo + setZoom si el mapa ya está inicializado
      if (mapRef.current) {
        mapRef.current.panTo({ lat: latNum, lng: lngNum });
        mapRef.current.setZoom(16);
      }
    } catch (error) {
      console.error("Error al geocodificar selección:", error);
    }
  };

  /**
   * Al volver al step: si ya existe form.direccion y el input está vacío,
   * lo rellenamos para que el usuario vea la dirección y el autocomplete muestre el texto.
   * Esto ayuda a "hidratar" la UI cuando regresas al paso.
   */
  useEffect(() => {
    if (form.direccion && !value) {
      setValue(form.direccion, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.direccion]);



  // Returns condicionales: si hay error o aún no carga la librería
  if (loadError) return <div>Error al cargar el mapa</div>;
  if (!isLoaded) return <PreLoader texto="Cargando Mapa..." />;

  // Centro del mapa (siempre como número)
  const center = {
    lat: Number(form.lat) || deffaultLat,
    lng: Number(form.lng) || deffaultLng,
  };

  return (
    <Box>
      {/* Título */}
      <Typography variant="h6" mb={2}>
        📍 Buscar dirección
      </Typography>

      {/* Input controlado por usePlacesAutocomplete */}
      <TextField
        label="Dirección"
        value={typeof value === "string" ? value : ""}
        onChange={(e) => setValue(e.target.value)}
        disabled={!ready}
        fullWidth
        margin="normal"
        placeholder="Escribe calle, colonia, ciudad..."
      />

      {/* Lista de sugerencias del Autocomplete */}
      {status === "OK" && (
        <List
          sx={{
            maxHeight: 200,
            overflowY: "auto",
            bgcolor: "background.paper",
            mb: 2,
            borderRadius: 1,
            boxShadow: 1,
          }}
        >
          {data.map(({ place_id, description }) => (
            <ListItem key={place_id} disablePadding>
              <ListItemButton onClick={() => handleSelect(description)}>
                <ListItemText primary={description} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}

      {/* Mapa */}
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "420px", borderRadius: 8 }}
        zoom={15}
        center={center}
        onLoad={(map) => (mapRef.current = map)}
      >
        {/*
          Render del Marker:
          - Solo si hay lat/lng en form (manteniendo tu chequeo original)
          - position usa Number(...) para evitar strings
          - icon con url + scaledSize + anchor para que la imagen personalizada se muestre correctamente
        */}
        {form.lat != null && form.lng != null && (
          <Marker
            position={{
              lat: Number(form.lat) || center.lat,
              lng: Number(form.lng) || center.lng,
            }}
            draggable
            onDragEnd={handleMarkerDragEnd}
            icon={
              // Usamos la API de Google para scaledSize y anchor (estamos dentro de isLoaded)
              window.google && window.google.maps
                ? {
                    url: userMarker,
                    // tamaño visible del icono
                    scaledSize: new window.google.maps.Size(40, 40),
                    // ancla: centrar horizontal y situar la punta abajo
                    anchor: new window.google.maps.Point(20, 40),
                  }
                : {
                    url: userMarker,
                  }
            }
          />
        )}
      </GoogleMap>

      {/* Número interior abajo, centrado y con estilo bonito */}
      <Box mt={3} display="flex" justifyContent="center">
        <Paper
          elevation={3}
          sx={{
            width: { xs: "100%", sm: "60%", md: "45%" },
            p: 2,
            borderRadius: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            alignItems: "center",
          }}
        >
          <Typography variant="subtitle2" color="text.secondary">
            ¿Número interior?
          </Typography>

          <TextField
            size="small"
            placeholder="Ej. 3B"
            value={form.numero_interior || ""}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, numero_interior: e.target.value }))
            }
            sx={{ width: "100%" }}
          />
        </Paper>
      </Box>
    </Box>
  );
}
