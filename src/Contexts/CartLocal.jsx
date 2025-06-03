export const guardarCarritoLocal = (producto, cantidad) => {
  const raw = JSON.parse(localStorage.getItem("carrito"));
  const carritoLocal = Array.isArray(raw) ? raw : [];
  console.log("guardarCarritoLocal - carritoLocal inicial:", carritoLocal);
  const idxExist = carritoLocal.findIndex((item) => item.producto === producto.id);
  if (idxExist !== -1) {
    carritoLocal[idxExist].cantidad += cantidad;
    console.log(`guardarCarritoLocal - ya existe producto ${producto.id}, nueva cantidad:`, carritoLocal[idxExist].cantidad);
  } else {
    carritoLocal.push({
      producto: producto.id,
      cantidad,
      precio_unitario: producto.precio,
      nombre: producto.nombre,
    });
    console.log(`guardarCarritoLocal - agregado nuevo producto ${producto.id}:`, carritoLocal[carritoLocal.length - 1]);
  }
  localStorage.setItem("carrito", JSON.stringify(carritoLocal));
  console.log("guardarCarritoLocal - carritoLocal final guardado:", carritoLocal);
};

export const sincronizarCarrito = async (user) => {
  const raw = JSON.parse(localStorage.getItem("carrito"));
  const carritoLocal = Array.isArray(raw) ? raw : [];
  console.log("sincronizarCarrito - carritoLocal desde localStorage:", carritoLocal);
  if (carritoLocal.length === 0) {
    console.log("sincronizarCarrito - sin items en local, regresando");
    return;
  }

  try {
    const urlCheck = `${process.env.REACT_APP_STRAPI_URL}/api/carritos?filters[usuario_email][$eq]=${encodeURIComponent(
      user.email
    )}&filters[estado][$eq]=activo`;
    console.log("sincronizarCarrito - URL para verificar carrito en Strapi:", urlCheck);
    const checkRes = await fetch(urlCheck);
    console.log("sincronizarCarrito - respuesta fetchStrapi status:", checkRes.status);
    const checkJson = await checkRes.json();
    console.log("sincronizarCarrito - checkJson:", checkJson);
    const carritoData = checkJson?.data?.[0];
    console.log("sincronizarCarrito - carritoData existente:", carritoData);

    if (!carritoData) {
      console.log("sincronizarCarrito - no existe carrito en Strapi, creando nuevo con items locales");
      const payload = {
        data: {
          usuario_email: user.email,
          estado: "activo",
          total: 0,
          productos: carritoLocal.map((item) => ({
            producto: item.producto,
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario,
            nombre: item.nombre,
          })),
        },
      };
      console.log("sincronizarCarrito - payload POST:", payload);
      const postRes = await fetch(`${process.env.REACT_APP_STRAPI_URL}/api/carritos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.log("sincronizarCarrito - POST status:", postRes.status);
    } else {
      console.log("sincronizarCarrito - existe carrito en Strapi, fusionando items");
const rawProductos = carritoData.attributes.productos;
const existingItems = Array.isArray(rawProductos?.data)
  ? rawProductos.data
  : Array.isArray(rawProductos)
    ? rawProductos
    : [];

console.log("sincronizarCarrito - existingItems normalizado:", existingItems);      console.log("sincronizarCarrito - existingItems:", existingItems);
      const nuevosProductos = [];

      existingItems.forEach((p) => {
        const attr = p.attributes;
        nuevosProductos.push({
          id: p.id,
          producto: attr.producto.data.id,
          cantidad: attr.cantidad,
          precio_unitario: attr.precio_unitario,
          nombre: attr.nombre,
        });
      });
      console.log("sincronizarCarrito - nuevosProductos inicial (desde Strapi):", nuevosProductos);

      carritoLocal.forEach((localItem) => {
        const idx = nuevosProductos.findIndex((p) => p.producto === localItem.producto);
        if (idx !== -1) {
          nuevosProductos[idx].cantidad += localItem.cantidad;
          console.log(`sincronizarCarrito - sumada cantidad local al producto existente ${localItem.producto}, nueva cantidad:`, nuevosProductos[idx].cantidad);
        } else {
          const nuevo = {
            producto: localItem.producto,
            cantidad: localItem.cantidad,
            precio_unitario: localItem.precio_unitario,
            nombre: localItem.nombre,
          };
          nuevosProductos.push(nuevo);
          console.log(`sincronizarCarrito - agregado nuevo producto local ${localItem.producto}:`, nuevo);
        }
      });
      console.log("sincronizarCarrito - nuevosProductos final fusionado:", nuevosProductos);

      const payloadUpdate = { data: { productos: nuevosProductos } };
      console.log("sincronizarCarrito - payload PUT:", payloadUpdate);
      const putRes = await fetch(
        `${process.env.REACT_APP_STRAPI_URL}/api/carritos/${carritoData.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadUpdate),
        }
      );
      console.log("sincronizarCarrito - PUT status:", putRes.status);
    }

    localStorage.removeItem("carrito");
    console.log("sincronizarCarrito - localStorage eliminado");
  } catch (error) {
    console.error("sincronizarCarrito - error:", error);
  }
};
