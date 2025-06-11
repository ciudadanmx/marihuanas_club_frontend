// AgregarClub.jsx
import React, { useState, useEffect } from "react";
import { useAuth0 } from '@auth0/auth0-react';
import StepperForm from "./StepperForm";

export default function AgregarClub() {
  const { user, isAuthenticated, loginWithRedirect } = useAuth0();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      if (user && user.email) {
        try {
          const res = await fetch(`http://localhost:1337/api/users?email=${user.email}`);
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0 && data[0].id) {
            setUserId(data[0].id);
          }
        } catch (err) {
          console.error("Error al buscar usuario:", err);
        }
      }
    };
    fetchUserId();
  }, [user]);

  const [form, setForm] = useState({
    nombre_club: "",
    direccion: { calle: "", colonia: "", ciudad: "", cp: "" },
    nombre_titular: "",
    descripcion: "",
    status_legal: 0,
    lat: null,
    lng: null,
    productos: [],
    servicios: [],
    foto_perfil: null,
    fotos_club: [],
    horario: {
      domingo: { abierto: false, desde: "", hasta: "" },
      lunes: { abierto: false, desde: "", hasta: "" },
      martes: { abierto: false, desde: "", hasta: "" },
      miercoles: { abierto: false, desde: "", hasta: "" },
      jueves: { abierto: false, desde: "", hasta: "" },
      viernes: { abierto: false, desde: "", hasta: "" },
      sabado: { abierto: false, desde: "", hasta: "" },
    },
    whatsapp: "",
    tipo_club: [], // cultivo, tienda, cursos, comida, eventos
  });

  return (
    <StepperForm
      form={form}
      setForm={setForm}
      user={user}
      isAuthenticated={isAuthenticated}
      userId={userId}
      loginWithRedirect={loginWithRedirect}
    />
  );
}
