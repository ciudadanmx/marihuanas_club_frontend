// components/AgregarClubWrapper.jsx
import React from "react";
import { useLoadScript } from "@react-google-maps/api";
import AgregarClub from "./AgregarClub";

const libraries = ["places"];

export default function AgregarClubWrapper() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  if (loadError) return <div>Error cargando el mapa</div>;
  if (!isLoaded) return <div>Cargando mapa...</div>;

  return <AgregarClub />;
}
