import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth0();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  // Evita múltiples fetch iniciales
  const initialized = useRef(false);

  const precotizarStripe = (precioProducto) => {
    const tarifa = precioProducto * 0.036 + 3;
    const iva = tarifa * 0.16;
    return parseFloat((tarifa + iva).toFixed(2));
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
      const res = await fetch(
        `${process.env.REACT_APP_STRAPI_URL}/api/shipping/calcular`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cpOrigen, cpDestino, largo, ancho, alto, peso, cantidad }),
        }
      );
      const data = await res.json();
      return parseFloat(data.costo || 0);
    } catch (error) {
      console.error("Error en cálculo de envío:", error);
      return 0;
    }
  };

  // ─── 1) SOLO AL MONTAR, CARGAR CARRITO DE STRAPI UNA VEZ ───────────────────────────
  useEffect(() => {
    const fetchCarrito = async () => {
      if (!isAuthenticated || !user) return;

      try {
        // LLAMADA A STRAPI: populate profundo para traer imagenes de TODOS los items
        const res = await fetch(
          `${process.env.REACT_APP_STRAPI_URL}/api/carritos?filters[usuario_email][$eq]=${encodeURIComponent(
            user.email
          )}&filters[estado][$eq]=activo&populate[productos][populate][producto][populate]=imagen_predeterminada`
        );
        const json = await res.json();
        const carritoEntry = json?.data?.[0];
        if (carritoEntry) {
          const attrs = carritoEntry.attributes;
          let productos = [];

          // Si attrs.productos es un arreglo plano (caso manual)
          if (Array.isArray(attrs.productos)) {
            productos = attrs.productos.map((item) => {
              const prodRel = item.producto?.data;
              const imgArr = prodRel?.attributes?.imagen_predeterminada?.data;
              let relativeUrl = "";
              if (Array.isArray(imgArr) && imgArr.length > 0) {
                relativeUrl = imgArr[0].attributes.url;
              }
              const imagenUrl = relativeUrl
                ? `${process.env.REACT_APP_STRAPI_URL}${relativeUrl}`
                : "";
              return {
                ...item,
                imagen: imagenUrl,
              };
            });
          }
          // Si attrs.productos viene anidado (populate en data)
          else if (attrs.productos && Array.isArray(attrs.productos.data)) {
            productos = attrs.productos.data.map((p) => {
              const itemAttrs = p.attributes;
              const prodRel = itemAttrs.producto?.data;
              const imgArr = prodRel?.attributes?.imagen_predeterminada?.data;
              let relativeUrl = "";
              if (Array.isArray(imgArr) && imgArr.length > 0) {
                relativeUrl = imgArr[0].attributes.url;
              }
              const imagenUrl = relativeUrl
                ? `${process.env.REACT_APP_STRAPI_URL}${relativeUrl}`
                : "";
              return {
                ...itemAttrs,
                imagen: imagenUrl,
              };
            });
          }

          const totalCarrito = attrs.total || 0;
          setItems(productos);
          setTotal(totalCarrito);
        }
      } catch (error) {
        console.error("Error al cargar carrito desde Strapi:", error);
      }
    };

    if (isAuthenticated && user && !initialized.current) {
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
    if (!isAuthenticated || !user) return;

    // 1) Obtener el ID y URL de la imagen cargando el producto completo
    let imagenId = null;
    let imagenUrl = "";
    try {
      const prodRes = await fetch(
        `${process.env.REACT_APP_STRAPI_URL}/api/productos/${producto.id}?populate=imagen_predeterminada`
      );
      const prodJson = await prodRes.json();
      const imgArr = prodJson.data.attributes.imagen_predeterminada?.data;
      if (Array.isArray(imgArr) && imgArr.length > 0) {
        imagenId = imgArr[0].id;
        const relativeUrl = imgArr[0].attributes.url;
        imagenUrl = relativeUrl
          ? `${process.env.REACT_APP_STRAPI_URL}${relativeUrl}`
          : "";
      }
    } catch (err) {
      console.error("addToCart - error obteniendo imagen del producto:", err);
    }

    // 2) Traer el carrito más reciente de Strapi (populate profundo aquí también)
    let carritoExistente = null;
    try {
      const res = await fetch(
        `${process.env.REACT_APP_STRAPI_URL}/api/carritos?filters[usuario_email][$eq]=${encodeURIComponent(
          user.email
        )}&filters[estado][$eq]=activo&populate[productos][populate][producto][populate]=imagen_predeterminada`
      );
      const json = await res.json();
      carritoExistente = json?.data?.[0] || null;
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

      if (Array.isArray(attrs.productos)) {
        productosDesdeBackend = attrs.productos.map((item) => {
          const prodRel = item.producto?.data;
          const imgArr = prodRel?.attributes?.imagen_predeterminada?.data;
          let relativeUrl = "";
          if (Array.isArray(imgArr) && imgArr.length > 0) {
            relativeUrl = imgArr[0].attributes.url;
          }
          const existingUrl = relativeUrl
            ? `${process.env.REACT_APP_STRAPI_URL}${relativeUrl}`
            : "";
          return {
            ...item,
            imagen: existingUrl,
          };
        });
      } else if (attrs.productos && Array.isArray(attrs.productos.data)) {
        productosDesdeBackend = attrs.productos.data.map((p) => {
          const itemAttrs = p.attributes;
          const prodRel = itemAttrs.producto?.data;
          const imgArr = prodRel?.attributes?.imagen_predeterminada?.data;
          let relativeUrl = "";
          if (Array.isArray(imgArr) && imgArr.length > 0) {
            relativeUrl = imgArr[0].attributes.url;
          }
          const existingUrl = relativeUrl
            ? `${process.env.REACT_APP_STRAPI_URL}${relativeUrl}`
            : "";
          return {
            ...itemAttrs,
            imagen: existingUrl,
          };
        });
      }
    }

    // 4) Calcular comisiones/envío para el nuevo producto
    const comisionPlataforma = precotizarPlataforma(producto.subtotal || producto.precio * cantidad);
    const comisionStripe = precotizarStripe(comisionPlataforma);
    const envio = await precotizarMienvio(
      producto.cp,
      producto.cp_destino || "11560",
      producto.largo,
      producto.ancho,
      producto.alto,
      producto.peso,
      cantidad
    );
    const subtotal = producto.precio * cantidad;
    const totalItem = parseFloat(
      (subtotal + comisionStripe + comisionPlataforma + envio).toFixed(2)
    );

    // 5) Fusionar en memoria
    let mergedItems = [...productosDesdeBackend];
    const existing = mergedItems.find((i) => i.producto === producto.id);
    if (existing) {
      mergedItems = mergedItems.map((i) =>
        i.producto === producto.id
          ? {
              ...i,
              cantidad: i.cantidad + cantidad,
              subtotal: i.precio_unitario * (i.cantidad + cantidad),
              comisionStripe,
              comisionPlataforma,
              envio,
              total: parseFloat(
                (
                  i.precio_unitario * (i.cantidad + cantidad) +
                  comisionStripe +
                  comisionPlataforma +
                  envio
                ).toFixed(2)
              ),
            }
          : i
      );
    } else {
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
      };
      mergedItems.push(newItem);
    }

    const nuevoTotal = calcularTotal(mergedItems);
    setItems(mergedItems);
    setTotal(nuevoTotal);

    // 6) Guardar en Strapi
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
    }));

    const payload = {
      data: {
        usuario_email: user.email,
        productos: productosParaPayload,
        total: nuevoTotal,
        estado: "activo",
        ultima_actualizacion: new Date().toISOString(),
      },
    };

    try {
      const endpoint = `${process.env.REACT_APP_STRAPI_URL}/api/carritos`;
      if (carritoId) {
        await fetch(`${endpoint}/${carritoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
    } catch (error) {
      console.error("Error al guardar el carrito en Strapi:", error);
    }
  };

  const updateQuantity = async (productoId, cantidad) => {
    if (!isAuthenticated || !user) return;

    // 1) Traer el carrito más reciente con populate profundo
    let carritoExistente = null;
    try {
      const res = await fetch(
        `${process.env.REACT_APP_STRAPI_URL}/api/carritos?filters[usuario_email][$eq]=${encodeURIComponent(
          user.email
        )}&filters[estado][$eq]=activo&populate[productos][populate][producto][populate]=imagen_predeterminada`
      );
      const json = await res.json();
      carritoExistente = json?.data?.[0] || null;
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

      if (Array.isArray(attrs.productos)) {
        productosDesdeBackend = attrs.productos.map((item) => {
          const prodRel = item.producto?.data;
          const imgArr = prodRel?.attributes?.imagen_predeterminada?.data;
          let relativeUrl = "";
          if (Array.isArray(imgArr) && imgArr.length > 0) {
            relativeUrl = imgArr[0].attributes.url;
          }
          const existingUrl = relativeUrl
            ? `${process.env.REACT_APP_STRAPI_URL}${relativeUrl}`
            : "";
          return {
            ...item,
            imagen_predeterminada: item.imagen_predeterminada?.id || null,
            imagen: existingUrl,
          };
        });
      } else if (attrs.productos && Array.isArray(attrs.productos.data)) {
        productosDesdeBackend = attrs.productos.data.map((p) => {
          const itemAttrs = p.attributes;
          const prodRel = itemAttrs.producto?.data;
          const imgArr = prodRel?.attributes?.imagen_predeterminada?.data;
          let relativeUrl = "";
          if (Array.isArray(imgArr) && imgArr.length > 0) {
            relativeUrl = imgArr[0].attributes.url;
          }
          const existingUrl = relativeUrl
            ? `${process.env.REACT_APP_STRAPI_URL}${relativeUrl}`
            : "";
          return {
            ...itemAttrs,
            imagen_predeterminada: itemAttrs.imagen_predeterminada?.data?.id || null,
            imagen: existingUrl,
          };
        });
      }
    }

    // 3) Fusionar en memoria cambiando solo la cantidad
    let mergedItems = productosDesdeBackend
      .map((i) => {
        if (i.producto === productoId) {
          const subtotal = i.precio_unitario * cantidad;
          const total = parseFloat(
            (subtotal + i.comisionStripe + i.envio + i.comisionPlataforma).toFixed(2)
          );
          return { ...i, cantidad, subtotal, total };
        }
        return i;
      })
      .filter((i) => i.cantidad > 0);

    const nuevoTotal = calcularTotal(mergedItems);
    setItems(mergedItems);
    setTotal(nuevoTotal);

    // 4) Guardar en Strapi
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
    }));

    const payload = {
      data: {
        usuario_email: user.email,
        productos: productosParaPayload,
        total: nuevoTotal,
        estado: "activo",
        ultima_actualizacion: new Date().toISOString(),
      },
    };

    try {
      const endpoint = `${process.env.REACT_APP_STRAPI_URL}/api/carritos`;
      if (carritoId) {
        await fetch(`${endpoint}/${carritoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
    } catch (error) {
      console.error("Error al guardar el carrito en Strapi:", error);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated || !user) return;

    // 1) Traer carrito más reciente
    let carritoExistente = null;
    try {
      const res = await fetch(
        `${process.env.REACT_APP_STRAPI_URL}/api/carritos?filters[usuario_email][$eq]=${encodeURIComponent(
          user.email
        )}&filters[estado][$eq]=activo`
      );
      const json = await res.json();
      carritoExistente = json?.data?.[0] || null;
    } catch (err) {
      console.error("Error obteniendo carrito de Strapi:", err);
      carritoExistente = null;
    }

    // 2) Vaciar UI
    setItems([]);
    setTotal(0);

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
      try {
        await fetch(`${process.env.REACT_APP_STRAPI_URL}/api/carritos/${carritoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.error("Error marcando carrito inactivo:", err);
      }
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
