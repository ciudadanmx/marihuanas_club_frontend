// src/utils/handleSubmitClub.js

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
      ? form.tipo_club.filter(
          t => !["cultivo", "consumo"].includes(t)
        )
      : []),
  ];

  const servicios = serviciosArray
    .map(s => String(s).trim())
    .filter(Boolean)
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .join(", ");

  let tipo = "consumo";

  if (Array.isArray(form.tipo_club)) {
    const tieneCultivo = form.tipo_club.includes("cultivo");
    const tieneConsumo = form.tipo_club.includes("consumo");

    if (tieneCultivo && tieneConsumo) tipo = "ambos";
    else if (tieneCultivo) tipo = "cultivo";
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
    };

    dataToSend.append("data", JSON.stringify(payload));

    if (form.foto_perfil) {
      dataToSend.append("files.foto_perfil", form.foto_perfil);
    }

    form.fotos_club?.forEach(foto => {
      dataToSend.append("files.fotos_club", foto);
    });

    const res = await fetch(`${STRAPI_URL}/api/clubs`, {
      method: "POST",
      body: dataToSend,
    });

    if (res.ok) {
      enqueueSnackbar("🎉 Club creado con éxito", { variant: "success" });
      navigate("/clubs");
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