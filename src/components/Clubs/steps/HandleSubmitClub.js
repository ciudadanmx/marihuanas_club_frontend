// src/utils/handleSubmitClub.js
import { appendFiles } from "../../../utils/FileHelpers";
import formaters from "../../../utils/formaters";

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

  const slug = formaters.buildSlug(form.nombre_club);

  //Skills
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
      numero_interior,
      colonia,
      municipio,
      ciudad,
      estado,
      cp
    } = form.direccionGestion;

    // solo si al menos hay algo escrito
    if (calle || numero || colonia || municipio || estado || cp) {
      direccion = {
        calle: formaters.capitalizeWords(calle) || null,
        numero: numero || null,
        numero_interior: numero_interior || null,
        colonia: formaters.capitalizeWords(colonia) || null,
        municipio: formaters.capitalizeWords(municipio) || null,
        ciudad: formaters.capitalizeWords(ciudad) || null,
        estado: formaters.capitalizeWords(estado) || null,
        cp: cp || null
      };
    }
  }

  // 📞 TELÉFONO
  let telefono = null;

  if (form.usarWhatsappExistente && form.whatsapp) {
    telefono = form.whatsapp;
  } else if (form.telefonoGestion) {
    telefono = `+52${form.telefonoGestion}`;
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
        folio: form.cofepris || null,
        anio_tramite: form.anioResolucion || null,
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
      slug: slug || '',
    };

    // 👉 datos
    dataToSend.append("data", JSON.stringify(payload));

    // 👉 archivos (TODOS aquí)
    appendFiles(dataToSend, "foto_de_perfil", form.foto_perfil);
    appendFiles(dataToSend, "fotos", form.fotos_club);
    //appendFiles(dataToSend, "ine_frente", form.ine_frente);
    //appendFiles(dataToSend, "ine_reverso", form.ine_reverso);
    appendFiles(dataToSend, "documentales", form.documentales);
    appendFiles(dataToSend, "certificados", form.certificados_archivos);

    const res = await fetch(`${STRAPI_URL}/api/clubs`, {
      method: "POST",
      body: dataToSend,
    });

    if (res.ok) {
      enqueueSnackbar("🎉 Club creado con éxito", { variant: "success" });
      //navigate("/clubs");

      // ==== NUEVA LÓGICA: buscar usuario por email en Strapi y actualizarlo ====
      try {
        // obtener payload de respuesta para obtener ID del club creado
        const createdClubJson = await res.json();
        // soportar diferentes formas de respuesta (Strapi v4 suele devolver { data: { id, attributes: {...} } })
        const createdClubId =
          (createdClubJson && createdClubJson.data && createdClubJson.data.id) ||
          createdClubJson?.id ||
          (createdClubJson && createdClubJson?.data && createdClubJson.data?.id) ||
          null;

        if (!createdClubId) {
          // si no se pudo obtener el id del club, avisar y salir de la lógica de update de user
          enqueueSnackbar("⚠️ Club creado pero no se pudo obtener su ID para relacionarlo.", { variant: "warning" });
        } else if (!user?.email) {
          enqueueSnackbar("⚠️ Club creado pero no se pudo actualizar el usuario: falta user.email.", { variant: "warning" });
        } else {
          // buscar usuario por email en Strapi (filtro)
          const encodedEmail = encodeURIComponent(user.email);
          const searchUrl = `${STRAPI_URL}/api/users?filters[email][$eq]=${encodedEmail}`;

          const userRes = await fetch(searchUrl);
          if (!userRes.ok) {
            enqueueSnackbar("❌ Error al buscar usuario en Strapi: " + (userRes.statusText || userRes.status), { variant: "error" });
          } else {
            const userJson = await userRes.json();
            // Strapi puede devolver data como array o un objeto único dependiendo de la configuración
            // Strapi /api/users devuelve un ARRAY directo, no { data }
const foundUser =
  Array.isArray(userJson) && userJson.length > 0
    ? userJson[0]
    : null;

const strapiUserId = foundUser?.id || null;

            if (!strapiUserId) {
              enqueueSnackbar("⚠️ Usuario no encontrado en Strapi para el email: " + user.email, { variant: "warning" });
            } else {
              // actualizar el usuario: setear isclub = true y relacionar club con el id creado
              const updateUrl = `${STRAPI_URL}/api/users/${strapiUserId}`;
              const updateBody = {
                
                  isclub: true,
                  // para relaciones en Strapi normalmente basta el id; si tu relación es singular usaremos el id directo
                  club: createdClubId,
                
              };

              const updateRes = await fetch(updateUrl, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(updateBody),
              });

              if (updateRes.ok) {
                enqueueSnackbar("✅ Usuario actualizado en Strapi: isclub = true y club relacionado.", { variant: "success" });
              } else {
                // intentar leer el error para mostrar detalle
                let errText = "";
                try {
                  const errJson = await updateRes.json();
                  errText = errJson?.error?.message || JSON.stringify(errJson);
                } catch (e) {
                  errText = updateRes.statusText || String(updateRes.status);
                }
                enqueueSnackbar("❌ No se pudo actualizar el usuario en Strapi: " + errText, { variant: "error" });
              }
            }
          }
        }
      } catch (innerErr) {
        enqueueSnackbar("❌ Error al intentar relacionar usuario y club: " + (innerErr?.message || "Error desconocido"), { variant: "error" });
      }
      // ==== FIN nueva lógica ====

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
