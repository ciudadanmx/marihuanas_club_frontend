import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth0();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  // Evita múltiples fetch iniciales
  const initialized = useRef(false);

  const precotizarStripe = (precioProducto, envio, comisionPlataforma) => {
    const subTotal = precioProducto + envio + (comisionPlataforma * 1.16);
    const total = (subTotal * 0.036) + 3;
    return parseFloat((total).toFixed(2));
  };

  const precotizarPlataforma = (precioProducto) => {
    const tarifa = precioProducto < 200 ? 5 : 10;
    const iva = tarifa * 0.16;
    return parseFloat((tarifa + iva).toFixed(2));
  };

  const precotizarMienvio = async (
    cpOrigen,
    cpDestino,
    largo,
    ancho,
    alto,
    peso,
    cantidad
  ) => {
    try {
      console.log(
        "precotizarMienvio - parámetros:",
        cpOrigen,
        cpDestino,
        largo,
        ancho,
        alto,
        peso,
        cantidad
      );
      const res = await fetch(
        `${process.env.REACT_APP_STRAPI_URL}/api/shipping/calcular`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cpOrigen, cpDestino, largo, ancho, alto, peso, cantidad }),
        }
      );
      console.log("precotizarMienvio - status:", res.status);
      const data = await res.json();
      console.log("precotizarMienvio - respuesta:", data);
      return parseFloat(data.costo || 0);
    } catch (error) {
      console.error("Error en cálculo de envío:", error);
      return 0;
    }
  };

  // ─── 1) SOLO AL MONTAR, CARGAR CARRITO DE STRAPI UNA VEZ ───────────────────────────
  useEffect(() => {
    const fetchCarrito = async () => {
      if (!isAuthenticated || !user) {
        console.log("fetchCarrito - no autenticado o sin usuario");
        return;
      }

      try {
        // LLAMADA A STRAPI: populate profundo para traer imagenes y store de TODOS los items
        const urlFetch = `${process.env.REACT_APP_STRAPI_URL}/api/carritos?filters[usuario_email][$eq]=${encodeURIComponent(
          user.email
        )}&filters[estado][$eq]=activo&populate[productos][populate][producto][populate]=imagen_predeterminada,store`;
        console.log("fetchCarrito - URL de fetch:", urlFetch);

        const res = await fetch(urlFetch);
        console.log("fetchCarrito - status:", res.status);
        const json = await res.json();
        console.log("fetchCarrito - json completo:", JSON.stringify(json, null, 2));

        const carritoEntry = json?.data?.[0];
        if (!carritoEntry) {
          console.log("fetchCarrito - no existe carrito activo");
          setItems([]);
          setTotal(0);
          return;
        }

        const attrs = carritoEntry.attributes;
        console.log("fetchCarrito - attrs.productos raw:", attrs.productos);

        let productos = [];

        // Si attrs.productos es un arreglo plano (caso manual)
        if (Array.isArray(attrs.productos)) {
          console.log("fetchCarrito - caso arreglo plano, count:", attrs.productos.length);
          productos = attrs.productos.map((item, idx) => {
            const prodRel = item.producto?.data;
            const prodId = prodRel?.id || item.producto; // en plano, item.producto es ID
            const imgArr = prodRel?.attributes?.imagen_predeterminada?.data;
            let relativeUrl = "";
            if (Array.isArray(imgArr) && imgArr.length > 0) {
              relativeUrl = imgArr[0].attributes.url;
            }
            const imagenUrl = relativeUrl
              ? `${process.env.REACT_APP_STRAPI_URL}${relativeUrl}`
              : "";

            // Extraer store desde producto
            let storeObj = null;
            const storeData = prodRel?.attributes?.store?.data;
            if (storeData) {
              storeObj = {
                id: storeData.id,
                name: storeData.attributes.name,
              };
            }

            console.log(
              `fetchCarrito - plano [${idx}] nombre="${item.nombre}", tienda="${storeObj?.name}", imagenUrl="${imagenUrl}"`
            );
            return {
              ...item,
              producto: prodId,
              imagen: imagenUrl,
              store: storeObj,
            };
          });
        }
        // Si attrs.productos viene anidado (populate en data)
        else if (attrs.productos && Array.isArray(attrs.productos.data)) {
          console.log(
            "fetchCarrito - caso anidado, count:",
            attrs.productos.data.length
          );
          productos = attrs.productos.data.map((p, idx) => {
            const itemAttrs = p.attributes;
            const prodRel = itemAttrs.producto?.data;
            const prodId = prodRel?.id;
            const imgArr = prodRel?.attributes?.imagen_predeterminada?.data;
            let relativeUrl = "";
            if (Array.isArray(imgArr) && imgArr.length > 0) {
              relativeUrl = imgArr[0].attributes.url;
            }
            const imagenUrl = relativeUrl
              ? `${process.env.REACT_APP_STRAPI_URL}${relativeUrl}`
              : "";

            // Extraer store desde producto
            let storeObj = null;
            const storeData = prodRel?.attributes?.store?.data;
            if (storeData) {
              storeObj = {
                id: storeData.id,
                name: storeData.attributes.name,
              };
            }

            console.log(
              `fetchCarrito - anidado [${idx}] nombre="${itemAttrs.nombre}", tienda="${storeObj?.name}", imagenUrl="${imagenUrl}"`
            );
            return {
              ...itemAttrs,
              producto: prodId,
              imagen: imagenUrl,
              store: storeObj,
            };
          });
        } else {
          console.log("fetchCarrito - attrs.productos no reconocido:", attrs.productos);
        }

        // Para cualquier producto que quede sin imagen o sin store, intentar fetch individual
        const productosConExtras = await Promise.all(
          productos.map(async (item, idx) => {
            let updated = { ...item };
            if ((!item.imagen || !item.store) && item.producto) {
              try {
                const urlProd = `${process.env.REACT_APP_STRAPI_URL}/api/productos/${item.producto}?populate=imagen_predeterminada,store`;
                console.log(`fetchCarrito - fetch de fallback para [${idx}] url:`, urlProd);
                const resp = await fetch(urlProd);
                console.log("fetchCarrito - fallback status:", resp.status);
                const js = await resp.json();
                const prodAttrs = js.data.attributes;

                // fallback imagen
                const arr = prodAttrs.imagen_predeterminada?.data;
                if (Array.isArray(arr) && arr.length > 0) {
                  const rel = arr[0].attributes.url;
                  const fullUrl = rel ? `${process.env.REACT_APP_STRAPI_URL}${rel}` : "";
                  console.log(`fetchCarrito - fallback [${idx}] imagenUrl:`, fullUrl);
                  updated.imagen = fullUrl;
                }
                // fallback store
                if (!updated.store && prodAttrs.store?.data) {
                  const storeData2 = prodAttrs.store.data;
                  updated.store = {
                    id: storeData2.id,
                    name: storeData2.attributes.name,
                  };
                  console.log(`fetchCarrito - fallback [${idx}] storeName:`, storeData2.attributes.name);
                }
              } catch (e) {
                console.error("fetchCarrito - error fallback imagen/store:", e);
              }
            }
            return updated;
          })
        );

        const totalCarrito = attrs.total || 0;
        console.log("fetchCarrito - productos finales:", productosConExtras);
        console.log("fetchCarrito - totalCarrito:", totalCarrito);

        setItems(productosConExtras);
        setTotal(totalCarrito);
      } catch (error) {
        console.error("Error al cargar carrito desde Strapi:", error);
      }
    };

    if (isAuthenticated && user && !initialized.current) {
      console.log("useEffect - fetchCarrito disparado");
      initialized.current = true;
      fetchCarrito();
    }
  }, [isAuthenticated, user]);

  // ─── 2) CÁLCULOS Y MANIPULACIÓN DEL CARRITO ──────────────────────────────────────
  const calcularTotal = (productos) =>
    productos.reduce(
      (acc, item) =>
        acc + (item.total || item.precio_unitario * item.cantidad),
      0
    );

  const addToCart = async (producto, cantidad = 1) => {
    if (!isAuthenticated || !user) {
      console.log("addToCart - no autenticado o sin usuario");
      return;
    }

    console.log("addToCart - producto recibido:", producto);
    console.log("addToCart - cantidad deseada:", cantidad);

    // 1) Obtener el ID y URL de la imagen y store cargando el producto completo
    let imagenId = null;
    let imagenUrl = "";
    let storeObjFromProd = null;
    try {
      const urlProd = `${process.env.REACT_APP_STRAPI_URL}/api/productos/${producto.id}?populate=imagen_predeterminada,store`;
      console.log("addToCart - URL fetch producto:", urlProd);

      const prodRes = await fetch(urlProd);
      console.log("addToCart - status fetch producto:", prodRes.status);
      const prodJson = await prodRes.json();
      console.log("addToCart - prodJson completo:", JSON.stringify(prodJson, null, 2));

      const prodAttrs = prodJson.data.attributes;
      const imgArr = prodAttrs.imagen_predeterminada?.data;
      if (Array.isArray(imgArr) && imgArr.length > 0) {
        imagenId = imgArr[0].id;
        const relativeUrl = imgArr[0].attributes.url;
        imagenUrl = relativeUrl
          ? `${process.env.REACT_APP_STRAPI_URL}${relativeUrl}`
          : "";
      }
      // Extraer store desde producto
      const storeData = prodAttrs.store?.data;
      if (storeData) {
        storeObjFromProd = {
          id: storeData.id,
          name: storeData.attributes.name,
        };
      }
      console.log("addToCart - imagenId obtenida:", imagenId);
      console.log("addToCart - imagenUrl obtenida:", imagenUrl);
      console.log("addToCart - store obtenida:", storeObjFromProd);
    } catch (err) {
      console.error("addToCart - error obteniendo imagen/store del producto:", err);
    }

    // 2) Traer el carrito más reciente de Strapi (populate profundo aquí también)
    let carritoExistente = null;
    try {
      const urlCarritoFetch = `${process.env.REACT_APP_STRAPI_URL}/api/carritos?filters[usuario_email][$eq]=${encodeURIComponent(
        user.email
      )}&filters[estado][$eq]=activo&populate[productos][populate][producto][populate]=imagen_predeterminada,store`;
      console.log("addToCart - URL fetch carrito existente:", urlCarritoFetch);

      const res = await fetch(urlCarritoFetch);
      console.log("addToCart - status fetch carrito existente:", res.status);
      const json = await res.json();
      console.log("addToCart - json fetch carrito existente:", JSON.stringify(json, null, 2));

      carritoExistente = json?.data?.[0] || null;
      console.log("addToCart - carritoExistente:", carritoExistente);
    } catch (err) {
      console.error("Error obteniendo carrito de Strapi:", err);
      carritoExistente = null;
    }

    // 3) Extraer el arreglo de productos existentes
    let productosDesdeBackend = [];
    let carritoId = null;
    if (carritoExistente) {
      carritoId = carritoExistente.id;
      const attrs = carritoExistente.attributes;
      console.log("addToCart - attrs.productos raw:", attrs.productos);

      if (Array.isArray(attrs.productos)) {
        console.log("addToCart - caso plano, count:", attrs.productos.length);
        productosDesdeBackend = attrs.productos.map((item, idx) => {
          const prodRel = item.producto?.data;
          const prodId = prodRel?.id || item.producto; // ID bien definido
          const imgArr = prodRel?.attributes?.imagen_predeterminada?.data;
          let relativeUrl = "";
          if (Array.isArray(imgArr) && imgArr.length > 0) {
            relativeUrl = imgArr[0].attributes.url;
          }
          const existingUrl = relativeUrl
            ? `${process.env.REACT_APP_STRAPI_URL}${relativeUrl}`
            : "";

          // Extraer store desde producto
          let storeObj = null;
          const storeData = prodRel?.attributes?.store?.data;
          if (storeData) {
            storeObj = {
              id: storeData.id,
              name: storeData.attributes.name,
            };
          }

          console.log(
            `addToCart - plano [${idx}] nombre="${item.nombre}", tienda="${storeObj?.name}", existingUrl="${existingUrl}"`
          );
          return {
            ...item,
            producto: prodId,
            imagen: existingUrl,
            store: storeObj,
          };
        });
      } else if (attrs.productos && Array.isArray(attrs.productos.data)) {
        console.log("addToCart - caso anidado, count:", attrs.productos.data.length);
        productosDesdeBackend = attrs.productos.data.map((p, idx) => {
          const itemAttrs = p.attributes;
          const prodRel = itemAttrs.producto?.data;
          const prodId = prodRel?.id;
          const imgArr = prodRel?.attributes?.imagen_predeterminada?.data;
          let relativeUrl = "";
          if (Array.isArray(imgArr) && imgArr.length > 0) {
            relativeUrl = imgArr[0].attributes.url;
          }
          const existingUrl = relativeUrl
            ? `${process.env.REACT_APP_STRAPI_URL}${relativeUrl}`
            : "";

          // Extraer store desde producto
          let storeObj = null;
          const storeData = prodRel?.attributes?.store?.data;
          if (storeData) {
            storeObj = {
              id: storeData.id,
              name: storeData.attributes.name,
            };
          }

          console.log(
            `addToCart - anidado [${idx}] nombre="${itemAttrs.nombre}", tienda="${storeObj?.name}", existingUrl="${existingUrl}"`
          );
          return {
            ...itemAttrs,
            producto: prodId,
            imagen: existingUrl,
            store: storeObj,
          };
        });
      } else {
        console.log("addToCart - attrs.productos no reconocido:", attrs.productos);
      }
    } else {
      console.log("addToCart - no existe carrito existente, se va a crear nuevo");
    }
    console.log("addToCart - productosDesdeBackend resultante:", productosDesdeBackend);

    // 4) Calcular comisiones/envío para el nuevo producto
    const comisionPlataforma = precotizarPlataforma(producto.subtotal || producto.precio * cantidad);
    const subtotal          = producto.precio * cantidad;
    const envio             = await precotizarMienvio(
      producto.cp,
      producto.cp_destino || "11560",
      producto.largo,
      producto.ancho,
      producto.alto,
      producto.peso,
      cantidad
    );
    const comisionStripe    = precotizarStripe(subtotal, envio, comisionPlataforma);
    const totalItem = parseFloat(
      (subtotal + comisionStripe + comisionPlataforma + envio).toFixed(2)
    );
    console.log(
      "addToCart - comisiones/envío:",
      comisionPlataforma,
      comisionStripe,
      envio,
      "subtotal:",
      subtotal,
      "totalItem:",
      totalItem
    );

    // 5) Fusionar en memoria, ahora detectando correctamente por item.producto
    let mergedItems = [...productosDesdeBackend];
    const existingIndex = mergedItems.findIndex((i) => i.producto === producto.id);
    if (existingIndex !== -1) {
      // Si existe, solo actualizamos cantidad + montos
      const i = mergedItems[existingIndex];
      const nuevaCantidad = i.cantidad + cantidad;
      const nuevoSubtotal = i.precio_unitario * nuevaCantidad;
      const nuevoTotalItem = parseFloat(
        (nuevoSubtotal + i.comisionStripe + i.envio + i.comisionPlataforma).toFixed(2)
      );
      mergedItems[existingIndex] = {
        ...i,
        cantidad: nuevaCantidad,
        subtotal: nuevoSubtotal,
        total: nuevoTotalItem,
      };
      console.log("addToCart - existing actualizado:", mergedItems[existingIndex]);
    } else {
      // Si no existía, lo agregamos como nuevo, incluyendo store
      const newItem = {
        producto: producto.id,
        nombre: producto.nombre,
        marca: producto.marca,
        precio_unitario: producto.precio,
        cantidad,
        imagen_predeterminada: imagenId,
        imagen: imagenUrl,
        subtotal,
        comisionPlataforma,
        comisionStripe,
        envio,
        total: totalItem,
        store: storeObjFromProd,
      };
      console.log("addToCart - newItem a agregar:", newItem);
      mergedItems.push(newItem);
    }

    console.log("addToCart - mergedItems antes de setItems:", mergedItems);

    const nuevoTotal = calcularTotal(mergedItems);
    console.log("addToCart - nuevoTotal calculado:", nuevoTotal);
    setItems(mergedItems);
    setTotal(nuevoTotal);

    // 6) Guardar en Strapi (enviamos store.id)
    const productosParaPayload = mergedItems.map((item) => ({
      producto: item.producto,
      nombre: item.nombre,
      precio_unitario: item.precio_unitario,
      cantidad: item.cantidad,
      subtotal: item.subtotal,
      envio: item.envio,
      comisionStripe: item.comisionStripe,
      comisionPlataforma: item.comisionPlataforma,
      total: item.total,
      imagen_predeterminada: item.imagen_predeterminada || null,
      store: item.store?.id || null,
    }));
    console.log("addToCart - productosParaPayload:", productosParaPayload);

    const payload = {
      data: {
        usuario_email: user.email,
        productos: productosParaPayload,
        total: nuevoTotal,
        estado: "activo",
        ultima_actualizacion: new Date().toISOString(),
      },
    };
    console.log("addToCart - payload final:", payload);

    try {
      const endpoint = `${process.env.REACT_APP_STRAPI_URL}/api/carritos`;
      if (carritoId) {
        console.log("addToCart - haciendo PUT en Strapi carritoId:", carritoId);
        const response = await fetch(`${endpoint}/${carritoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        console.log("addToCart - PUT response status:", response.status);
      } else {
        console.log("addToCart - haciendo POST en Strapi para crear carrito");
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        console.log("addToCart - POST response status:", response.status);
      }
    } catch (error) {
      console.error("Error al guardar el carrito en Strapi:", error);
    }
  };

  const updateQuantity = async (productoId, cantidad) => {
    if (!isAuthenticated || !user) {
      console.log("updateQuantity - no autenticado o sin usuario");
      return;
    }

    console.log("updateQuantity - productoId:", productoId, "nueva cantidad:", cantidad);

    // 1) Traer el carrito más reciente con populate profundo
    let carritoExistente = null;
    try {
      const urlFetch = `${process.env.REACT_APP_STRAPI_URL}/api/carritos?filters[usuario_email][$eq]=${encodeURIComponent(
        user.email
      )}&filters[estado][$eq]=activo&populate[productos][populate][producto][populate]=imagen_predeterminada,store`;
      console.log("updateQuantity - URL fetch carrito:", urlFetch);

      const res = await fetch(urlFetch);
      console.log("updateQuantity - status fetch carrito:", res.status);
      const json = await res.json();
      console.log("updateQuantity - json fetch carrito:", JSON.stringify(json, null, 2));

      carritoExistente = json?.data?.[0] || null;
      console.log("updateQuantity - carritoExistente:", carritoExistente);
    } catch (err) {
      console.error("Error obteniendo carrito de Strapi:", err);
      carritoExistente = null;
    }

    // 2) Extraer productosDesdeBackend
    let productosDesdeBackend = [];
    let carritoId = null;
    if (carritoExistente) {
      carritoId = carritoExistente.id;
      const attrs = carritoExistente.attributes;
      console.log("updateQuantity - attrs.productos raw:", attrs.productos);

      if (Array.isArray(attrs.productos)) {
        console.log("updateQuantity - caso plano, count:", attrs.productos.length);
        productosDesdeBackend = attrs.productos.map((item, idx) => {
          const prodRel = item.producto?.data;
          const prodId = prodRel?.id || item.producto; // ID siempre
          const imgArr = prodRel?.attributes?.imagen_predeterminada?.data;
          let relativeUrl = "";
          if (Array.isArray(imgArr) && imgArr.length > 0) {
            relativeUrl = imgArr[0].attributes.url;
          }
          const existingUrl = relativeUrl
            ? `${process.env.REACT_APP_STRAPI_URL}${relativeUrl}`
            : "";

          // Extraer store desde producto
          let storeObj = null;
          const storeData = prodRel?.attributes?.store?.data;
          if (storeData) {
            storeObj = {
              id: storeData.id,
              name: storeData.attributes.name,
            };
          }

          console.log(
            `updateQuantity - plano [${idx}] nombre="${item.nombre}", tienda="${storeObj?.name}", existingUrl="${existingUrl}"`
          );
          return {
            ...item,
            producto: prodId,
            imagen_predeterminada: item.imagen_predeterminada?.id || null,
            imagen: existingUrl,
            store: storeObj,
          };
        });
      } else if (attrs.productos && Array.isArray(attrs.productos.data)) {
        console.log("updateQuantity - caso anidado, count:", attrs.productos.data.length);
        productosDesdeBackend = attrs.productos.data.map((p, idx) => {
          const itemAttrs = p.attributes;
          const prodRel = itemAttrs.producto?.data;
          const prodId = prodRel?.id;
          const imgArr = prodRel?.attributes?.imagen_predeterminada?.data;
          let relativeUrl = "";
          if (Array.isArray(imgArr) && imgArr.length > 0) {
            relativeUrl = imgArr[0].attributes.url;
          }
          const existingUrl = relativeUrl
            ? `${process.env.REACT_APP_STRAPI_URL}${relativeUrl}`
            : "";

          // Extraer store desde producto
          let storeObj = null;
          const storeData = prodRel?.attributes?.store?.data;
          if (storeData) {
            storeObj = {
              id: storeData.id,
              name: storeData.attributes.name,
            };
          }

          console.log(
            `updateQuantity - anidado [${idx}] nombre="${itemAttrs.nombre}", tienda="${storeObj?.name}", existingUrl="${existingUrl}"`
          );
          return {
            ...itemAttrs,
            producto: prodId,
            imagen_predeterminada: itemAttrs.imagen_predeterminada?.data?.id || null,
            imagen: existingUrl,
            store: storeObj,
          };
        });
      } else {
        console.log("updateQuantity - attrs.productos no reconocido:", attrs.productos);
      }
    } else {
      console.log("updateQuantity - no existe carrito existente");
    }
    console.log("updateQuantity - productosDesdeBackend resultante:", productosDesdeBackend);

    // 3) Fusionar en memoria cambiando solo la cantidad
    const tempItems = productosDesdeBackend
      .map((i) => {
        if (i.producto === productoId) {
          const nuevaCantidad = cantidad;
          const nuevoSubtotal = i.precio_unitario * nuevaCantidad;
          console.log(
            `updateQuantity - item "${i.nombre}" cantidad a ${nuevaCantidad}, subtotal provisional ${nuevoSubtotal}`
          );
          return { ...i, cantidad: nuevaCantidad, subtotal: nuevoSubtotal };
        }
        return i;
      })
      .filter((i) => i.cantidad > 0);

    // Recalcular plataforma, stripe, envío y total de cada uno
    let mergedItems = await Promise.all(
      tempItems.map(async (item, idx) => {
        // ----------------- Logs para depurar -----------------
        console.log(
          `updateQuantity [${idx}] - Parámetros antes de recálculo:`,
          {
            nombre: item.nombre,
            precio_unitario: item.precio_unitario,
            cantidad: item.cantidad,
            cpOrigen: item.cp,
            cpDestino: item.cp_destino || "11560",
            largo: item.largo,
            ancho: item.ancho,
            alto: item.alto,
            peso: item.peso,
          }
        );
        // ------------------------------------------------------

        // 1) Recalcular subtotal (ya hecho en tempItems), ahora recalcular comisiones:
        const nuevoSubtotal = item.subtotal; // ya actualizado en tempItems

        const comisionPlataformaNueva = precotizarPlataforma(nuevoSubtotal);
        const envioRecalculado        = await precotizarMienvio(
          item.cp,
          item.cp_destino || "11560",
          item.largo,
          item.ancho,
          item.alto,
          item.peso,
          item.cantidad
        );
        const comisionStripeNueva     = precotizarStripe(nuevoSubtotal, envioRecalculado, comisionPlataformaNueva);

        console.log(
          `updateQuantity [${idx}] - comisionPlataforma recalculada: ${comisionPlataformaNueva}, comisionStripe recalculada: ${comisionStripeNueva}`
        );

        // 2) Recalcular envío según la nueva cantidad
        let nuevaEnvio = item.envio;
        if (item.producto) {
          try {
            nuevaEnvio = await precotizarMienvio(
              item.cp,
              item.cp_destino || "11560",
              item.largo,
              item.ancho,
              item.alto,
              item.peso,
              item.cantidad
            );
            console.log(
              `updateQuantity [${idx}] - precotizarMienvio devolvió:`,
              nuevaEnvio
            );
          } catch (e) {
            console.error("updateQuantity - error recalc envío:", e);
          }
        }

        // 3) Recalcular total: subtotal + comisionStripeNueva + comisionPlataformaNueva + nuevaEnvio
        const nuevoTotal = parseFloat(
          (nuevoSubtotal + comisionStripeNueva + comisionPlataformaNueva + nuevaEnvio).toFixed(2)
        );
        console.log(
          `updateQuantity [${idx}] - item "${item.nombre}" recalculado: subtotal ${nuevoSubtotal}, comisionPlataforma ${comisionPlataformaNueva}, comisionStripe ${comisionStripeNueva}, envío ${nuevaEnvio}, total ${nuevoTotal}`
        );

        return {
          ...item,
          comisionPlataforma: comisionPlataformaNueva,
          comisionStripe: comisionStripeNueva,
          envio: nuevaEnvio,
          total: nuevoTotal,
        };
      })
    );

    console.log("updateQuantity - mergedItems antes de setItems:", mergedItems);

    const nuevoTotal = calcularTotal(mergedItems);
    console.log("updateQuantity - nuevoTotal:", nuevoTotal);
    setItems(mergedItems);
    setTotal(nuevoTotal);

    // 4) Guardar en Strapi (enviamos store.id)
    const productosParaPayload = mergedItems.map((item) => ({
      producto: item.producto,
      nombre: item.nombre,
      precio_unitario: item.precio_unitario,
      cantidad: item.cantidad,
      subtotal: item.subtotal,
      envio: item.envio,
      comisionStripe: item.comisionStripe,
      comisionPlataforma: item.comisionPlataforma,
      total: item.total,
      imagen_predeterminada: item.imagen_predeterminada || null,
      store: item.store?.id || null,
    }));
    console.log("updateQuantity - productosParaPayload:", productosParaPayload);

    const payload = {
      data: {
        usuario_email: user.email,
        productos: productosParaPayload,
        total: nuevoTotal,
        estado: "activo",
        ultima_actualizacion: new Date().toISOString(),
      },
    };
    console.log("updateQuantity - payload final:", payload);

    try {
      const endpoint = `${process.env.REACT_APP_STRAPI_URL}/api/carritos`;
      if (carritoId) {
        console.log("updateQuantity - haciendo PUT en Strapi carritoId:", carritoId);
        const response = await fetch(`${endpoint}/${carritoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        console.log("updateQuantity - PUT response status:", response.status);
      } else {
        console.log("updateQuantity - haciendo POST en Strapi para crear carrito");
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        console.log("updateQuantity - POST response status:", response.status);
      }
    } catch (error) {
      console.error("Error al guardar el carrito en Strapi:", error);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated || !user) {
      console.log("clearCart - no autenticado o sin usuario");
      return;
    }

    console.log("clearCart - comenzando limpieza de carrito");

    // 1) Traer carrito más reciente
    let carritoExistente = null;
    try {
      const urlFetch = `${process.env.REACT_APP_STRAPI_URL}/api/carritos?filters[usuario_email][$eq]=${encodeURIComponent(
        user.email
      )}&filters[estado][$eq]=activo`;
      console.log("clearCart - URL fetch carrito:", urlFetch);

      const res = await fetch(urlFetch, { credentials: "include" });
      console.log("clearCart - status fetch carrito:", res.status);
      const json = await res.json();
      console.log("clearCart - json fetch carrito:", JSON.stringify(json, null, 2));

      carritoExistente = json?.data?.[0] || null;
      console.log("clearCart - carritoExistente:", carritoExistente);
    } catch (err) {
      console.error("Error obteniendo carrito de Strapi:", err);
      carritoExistente = null;
    }

    // 2) Vaciar UI
    setItems([]);
    setTotal(0);
    console.log("clearCart - contexto local vaciado");

    // 3) Marcar inactivo en Strapi
    if (carritoExistente) {
      const carritoId = carritoExistente.id;
      const payload = {
        data: {
          usuario_email: user.email,
          productos: [],
          total: 0,
          estado: "inactivo",
          ultima_actualizacion: new Date().toISOString(),
        },
      };
      console.log("clearCart - payload a enviar:", payload);
      try {
        const response = await fetch(`${process.env.REACT_APP_STRAPI_URL}/api/carritos/${carritoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        console.log("clearCart - PUT response status:", response.status);
      } catch (err) {
        console.error("Error marcando carrito inactivo:", err);
      }
    } else {
      console.log("clearCart - no había carrito activo para marcar inactivo");
    }
  };

  const getItemCount = () => {
    return items.reduce((acc, item) => acc + item.cantidad, 0);
  };

  return (
    <CartContext.Provider
      value={{ items, total, addToCart, updateQuantity, clearCart, getItemCount }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
