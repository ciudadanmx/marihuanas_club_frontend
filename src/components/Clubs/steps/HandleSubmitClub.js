// src/utils/handleSubmitClub.js
import { appendFiles } from "../../../utils/FileHelpers";

export async function handleSubmitClub({
  form,
  isAuthenticated,
  userId,
  user,
  setLoading,
  enqueueSnackbar,
  navigate,
}) {
  const STRAPI_URL = process.env.REACT_APP_STRAPI_URL;

  let skills, lugares, status_legal, datos_legales;


  if (!isAuthenticated || !userId) {
    console.warn("❗ Usuario no autenticado o sin userId");
    return;
  }

  setLoading(true);

  // ================== LIMPIEZA DE DATOS ==================

  const productos = Array.isArray(form.productos)
    ? form.productos.map(p => String(p).trim()).filter(Boolean).join(", ")
    : form.productos
    ? String(form.productos)
    : "";

  const serviciosArray = [
    ...(Array.isArray(form.servicios) ? form.servicios : []),
    ...(Array.isArray(form.tipo_club)
      ? form.tipo_club.filter(t => !["cultivo", "consumo"].includes(t))
      : []),
  ];

  const servicios = [...new Set(
    serviciosArray.map(s => String(s).trim()).filter(Boolean)
  )].join(", ");

  let tipo = "consumo";
  if (Array.isArray(form.tipo_club)) {
    if (form.tipo_club.includes("cultivo") && form.tipo_club.includes("consumo"))
      tipo = "ambos";
    else if (form.tipo_club.includes("cultivo"))
      tipo = "cultivo";
  }

      // Soportar array o string; usar trim() correctamente (con paréntesis)
  if (form.skills) {
    if (Array.isArray(form.skills)) {
      skills = form.skills.map(s => String(s).trim()).filter(Boolean).join(", ");
    } else {
      skills = String(form.skills).trim();
    }
  } else {
    skills = "";
  }

// --- armarios => lugares + miembros_activos = 0 (solo si existe armarios)
    if (form.armarios || form.armarios === 0) {
      // aceptar 0 u otros valores; si null/undefined, no se setea
      lugares = form.armarios;
    }
    

        // ================== COFEPRIS / LEGAL ==================
    // Si modo folio -> guardar folio y status_legal = tipoResolucion, además extraer año y guardarlo en datos_legales
    // Si modo gestion -> guardar datos_legales JSON con direcciónGestion/telefonoGestion/emailGestion y status_legal = "gestión"
    const modo = form.cofeprismode;

    const buildDatosLegales = ({ form, user }) => {
  // 📍 DIRECCIÓN
  let direccion = null;

  if (form.usarDireccionExistente && form.direccion) {
    // usar domicilio ya registrado
    direccion = form.direccion;
  } else if (form.direccionGestion) {
    const {
      calle,
      numero,
      colonia,
      municipio,
      estado,
      cp
    } = form.direccionGestion;

    // solo si al menos hay algo escrito
    if (calle || numero || colonia || municipio || estado || cp) {
      direccion = {
        calle: calle || null,
        numero: numero || null,
        colonia: colonia || null,
        municipio: municipio || null,
        estado: estado || null,
        cp: cp || null
      };
    }
  }

  // 📞 TELÉFONO
  let telefono = null;

  if (form.usarWhatsappExistente && form.whatsapp) {
    telefono = form.whatsapp;
  } else if (form.telefonoGestion) {
    telefono = form.telefonoGestion;
  }

  // 📧 EMAIL
  let email = null;

  if (form.usarEmailExistente && user?.email) {
    email = user.email;
  } else if (form.emailGestion) {
    email = form.emailGestion;
  }

  // 🧾 JSON FINAL
  return {
    direccion,
    telefono,
    email
  };
};

    if (modo === "folio") {
      const folioRaw = (form.cofepris || "").trim();
      status_legal = form.tipoResolucion || "folio";

      // extraer año de folio si existe (ej: 2023, 2022)
      //const yearMatch = folioRaw.match(/(19|20)\d{2}/);
      //const anio = yearMatch ? yearMatch[0] : null;

      datos_legales = {
        tipo_resolucion: form.tipoResolucion || null,
        anio_tramite: form.anio || null,
      };
    } else if (modo === "gestion") {
      datos_legales = buildDatosLegales({ form, user });
  status_legal = "gestión";
    }




  // ================== ENVÍO ==================

  try {
    const dataToSend = new FormData();

    const payload = {
      nombre_club: form.nombre_club,
      direccion: form.direccion,
      nombre_titular: form.nombre_titular,
      descripcion: form.descripcion,
      lat: form.lat,
      lng: form.lng,
      productos,
      servicios,
      tipo,
      users_permissions_user: userId,
      auth_name: user?.name || "desconocido",
      horarios: form.horarios,
      whatsapp: form.whatsapp,
      reservacion: form.reservacion || false,
      activo: false,
      fecha_alta: new Date().toISOString(),
      en_revision: true,
      skills: skills || '',
      lugares: lugares ? lugares : null,
      miembrosactivos: lugares ? 0 : null,
      status_legal: status_legal || null,
      datos_legales: datos_legales || null,
    };

    // 👉 datos
    dataToSend.append("data", JSON.stringify(payload));

    // 👉 archivos (TODOS aquí)
    appendFiles(dataToSend, "foto_de_perfil", form.foto_perfil);
    appendFiles(dataToSend, "fotos", form.fotos_club);
    //appendFiles(dataToSend, "ine_frente", form.ine_frente);
    //appendFiles(dataToSend, "ine_reverso", form.ine_reverso);
    appendFiles(dataToSend, "documentales", form.documentales);

    const res = await fetch(`${STRAPI_URL}/api/clubs`, {
      method: "POST",
      body: dataToSend,
    });

    if (res.ok) {
      enqueueSnackbar("🎉 Club creado con éxito", { variant: "success" });
      //navigate("/clubs");
    } else {
      const error = await res.json();
      enqueueSnackbar(
        "❌ Error al crear el club: " +
          (error?.error?.message || "Error desconocido"),
        { variant: "error" }
      );
    }
  } catch (err) {
    enqueueSnackbar(
      "❌ Error de red: " + (err?.message || "Error desconocido"),
      { variant: "error" }
    );
  } finally {
    setLoading(false);
  }
}
