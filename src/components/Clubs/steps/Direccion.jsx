import React from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
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
} from "@mui/material";

export default function Direccion({ form, setForm }) {
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
    requestOptions: {
      componentRestrictions: { country: "mx" },
    },
    debounce: 300,
  });

  if (loadError) return <div>Error al cargar el mapa</div>;
  if (!isLoaded) return <div>Cargando mapa...</div>;

  const center = {
    lat: form.lat || 19.4326,
    lng: form.lng || -99.1332,
  };

  const handleSelect = async (address) => {
    setValue(address, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);

      setForm({
        ...form,
        direccion: address,
        lat,
        lng,
      });
    } catch (error) {
      console.error("Error al obtener coordenadas:", error);
    }
  };

  return (
    <Box>
      <Typography variant="h6" mb={2}>
        Buscar dirección
      </Typography>

      <TextField
        label="Dirección"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={!ready}
        fullWidth
        margin="normal"
      />

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

      <Typography variant="h6" mt={3} mb={2}>
        Ubicación del Club
      </Typography>

      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "400px" }}
        zoom={14}
        center={center}
      >
        {form.lat && form.lng && (
          <Marker position={{ lat: form.lat, lng: form.lng }} />
        )}
      </GoogleMap>
    </Box>
  );
}
