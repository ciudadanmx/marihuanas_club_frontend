// CartLocal.js

export const guardarCarritoLocal = (producto, cantidad) => {
  const raw = JSON.parse(localStorage.getItem("carrito"));
  const carritoLocal = Array.isArray(raw) ? raw : [];
  console.log("guardarCarritoLocal - carritoLocal inicial:", carritoLocal);

  const idxExist = carritoLocal.findIndex((item) => item.producto === producto.id);
  if (idxExist !== -1) {
    carritoLocal[idxExist].cantidad += cantidad;
    console.log(
      `guardarCarritoLocal - ya existe producto ${producto.id}, nueva cantidad:`,
      carritoLocal[idxExist].cantidad
    );
  } else {
    carritoLocal.push({
      producto: producto.id,
      cantidad,
      precio_unitario: producto.precio,
      nombre: producto.nombre,
    });
    console.log(
      `guardarCarritoLocal - agregado nuevo producto ${producto.id}:`,
      carritoLocal[carritoLocal.length - 1]
    );
  }

  localStorage.setItem("carrito", JSON.stringify(carritoLocal));
  console.log("guardarCarritoLocal - carritoLocal final guardado:", carritoLocal);
};

export const sincronizarCarrito = async (
  user,
  precotizarPlataforma,
  precotizarMienvio,
  precotizarStripe
) => {
  const raw = JSON.parse(localStorage.getItem("carrito"));
  const carritoLocal = Array.isArray(raw) ? raw : [];
  console.log("sincronizarCarrito - carritoLocal desde localStorage:", carritoLocal);

  if (carritoLocal.length === 0) {
    console.log("sincronizarCarrito - sin items en local, regresando");
    return;
  }

  try {
    // 1) Definimos calcularItem ANTES de usarla:
    const calcularItem = async (item) => {
      const cpDestino = "11560"; // puedes ajustar si conoces el CP real del usuario
      const subtotal = item.precio_unitario * item.cantidad;
      const comisionPlataforma = precotizarPlataforma(subtotal);
      const envio = await precotizarMienvio(
        "",
        cpDestino,
        item.largo || 1,
        item.ancho || 1,
        item.alto || 1,
        item.peso || 1,
        item.cantidad
      );
      const comisionStripe = precotizarStripe(subtotal, envio, comisionPlataforma);
      const total = parseFloat(
        (subtotal + envio + comisionPlataforma + comisionStripe).toFixed(2)
      );

      console.log(
        `🧮 calcularItem - producto ${item.producto}: subtotal=${subtotal}, envio=${envio}, plataforma=${comisionPlataforma}, stripe=${comisionStripe}, total=${total}`
      );

      return {
        ...item,
        subtotal,
        envio,
        comisionPlataforma,
        comisionStripe,
        total,
      };
    };

    // 2) Ahora sí podemos mapear sobre 'carritoLocal' y obtener todos los totales:
    const carritoLocalConTotales = await Promise.all(
      carritoLocal.map((item) => calcularItem(item))
    );
    console.log("sincronizarCarrito - carritoLocalConTotales:", carritoLocalConTotales);

    // 3) Verificamos si ya existe un carrito activo en Strapi para este usuario:
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
      // 4.a) Si no existe carrito activo, lo creamos con los items ya incluyendo totales:
      console.log(
        "sincronizarCarrito - no existe carrito en Strapi, creando nuevo con items locales"
      );
      const payload = {
        data: {
          usuario_email: user.email,
          estado: "activo",
          total: carritoLocalConTotales.reduce((acc, it) => acc + it.total, 0),
          productos: carritoLocalConTotales.map((item) => ({
            producto: item.producto,
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario,
            nombre: item.nombre,
            envio: item.envio,
            comisionPlataforma: item.comisionPlataforma,
            comisionStripe: item.comisionStripe,
            subtotal: item.subtotal,
            total: item.total,
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
      // 4.b) Si ya hay carrito activo, fusionamos con lo que venga de Strapi:
      console.log("sincronizarCarrito - existe carrito en Strapi, fusionando items");

      const rawProductos = carritoData.attributes.productos;
      const existingItems = Array.isArray(rawProductos?.data)
        ? rawProductos.data
        : Array.isArray(rawProductos)
        ? rawProductos
        : [];

      console.log("sincronizarCarrito - existingItems normalizado:", existingItems);

      // Extraemos los items actuales de Strapi (sin totales; los atributos vienen en `attributes`):
      const nuevosProductos = existingItems.map((p) => {
        const attr = p.attributes;
        return {
          id: p.id,
          producto: attr.producto.data.id,
          cantidad: attr.cantidad,
          precio_unitario: attr.precio_unitario,
          nombre: attr.nombre,
          envio: attr.envio,
          comisionPlataforma: attr.comisionPlataforma,
          comisionStripe: attr.comisionStripe,
          subtotal: attr.subtotal,
          total: attr.total,
        };
      });
      console.log(
        "sincronizarCarrito - nuevosProductos inicial (desde Strapi):",
        nuevosProductos
      );

      // 5) Fusionamos cantidades: si un producto viene también en localStorage, sumamos cantidades.
      carritoLocal.forEach((localItem) => {
        const idx = nuevosProductos.findIndex((p) => p.producto === localItem.producto);
        if (idx !== -1) {
          // Si existe, incrementamos la cantidad (y luego recalculemos sus totales).
          nuevosProductos[idx].cantidad += localItem.cantidad;
          console.log(
            `sincronizarCarrito - sumada cantidad local al producto existente ${localItem.producto}, nueva cantidad:`,
            nuevosProductos[idx].cantidad
          );
        } else {
          // Si no existe en Strapi, lo agregamos totalmente nuevo (luego lo recalculemos).
          nuevosProductos.push({
            producto: localItem.producto,
            cantidad: localItem.cantidad,
            precio_unitario: localItem.precio_unitario,
            nombre: localItem.nombre,
            // Los campos de envío/comisiones/total los rellenamos con 0 por ahora y luego los recalculamos:
            envio: 0,
            comisionPlataforma: 0,
            comisionStripe: 0,
            subtotal: 0,
            total: 0,
          });
          console.log(
            `sincronizarCarrito - agregado nuevo producto local ${localItem.producto}:`,
            localItem
          );
        }
      });

      console.log(
        "sincronizarCarrito - nuevosProductos tras fusionar cantidades:",
        nuevosProductos
      );

      // 6) VOLVEMOS A recalcular envío/comisiones/total sobre la lista fusionada:
      const productosConTotales = await Promise.all(
        nuevosProductos.map((item) => calcularItem(item))
      );
      console.log(
        "sincronizarCarrito - productosConTotales (recalculados):",
        productosConTotales
      );

      // 7) Preparamos el payload de actualización, incluyendo ya los totales recalculados:
      const payloadUpdate = {
        data: {
          productos: productosConTotales.map((item) => ({
            id: item.id, // si viene de Strapi, conservar id; si es nuevo, Strapi lo ignora y crea
            producto: item.producto,
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario,
            nombre: item.nombre,
            envio: item.envio,
            comisionPlataforma: item.comisionPlataforma,
            comisionStripe: item.comisionStripe,
            subtotal: item.subtotal,
            total: item.total,
          })),
          total: productosConTotales.reduce((acc, it) => acc + it.total, 0),
        },
      };
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

    // 8) Finalmente, limpiamos el carrito local
    localStorage.removeItem("carrito");
    console.log("sincronizarCarrito - localStorage eliminado");
  } catch (error) {
    console.error("sincronizarCarrito - error:", error);
  }
};
