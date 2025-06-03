import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth0();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  // 🔒 BANDERA: ¿Ya cargamos el carrito inicial desde Strapi?
  const initialLoadComplete = useRef(false);
  // 🔒 ID del carrito activo en Strapi (o null si no existe aún)
  const carritoIdRef = useRef(null);

  // ────────────────────────────────────────────────────────────────────────────────
  // 1) CALCULOS AUXILIARES: comisiones y envío
  // ────────────────────────────────────────────────────────────────────────────────
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
      console.log(
        "[precotizarMienvio] Llamando a API con:",
        { cpOrigen, cpDestino, largo, ancho, alto, peso, cantidad }
      );
      const res = await fetch(
        `${process.env.REACT_APP_STRAPI_URL}/api/shipping/calcular`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cpOrigen, cpDestino, largo, ancho, alto, peso, cantidad }),
        }
      );
      const data = await res.json();
      console.log("[precotizarMienvio] Respuesta:", data);
      return parseFloat(data.costo || 0);
    } catch (error) {
      console.error("[precotizarMienvio] Error en cálculo de envío:", error);
      return 0;
    }
  };

  // ────────────────────────────────────────────────────────────────────────────────
  // 2) CÁLCULO DE TOTAL
  // ────────────────────────────────────────────────────────────────────────────────
  const calcularTotal = (productos) =>
    productos.reduce(
      (acc, item) =>
        acc + (item.total || item.precio_unitario * item.cantidad),
      0
    );

  // ────────────────────────────────────────────────────────────────────────────────
  // 3) FUNCIÓN: Traer carrito inicial de Strapi (solo al montar, una vez)
  // ────────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchCarritoInicial = async () => {
      if (!isAuthenticated || !user) {
        // No autenticado → nada que hacer en Strapi
        initialLoadComplete.current = true;
        return;
      }

      try {
        const endpoint = `${process.env.REACT_APP_STRAPI_URL}/api/carritos`;
        const query = `?filters[usuario_email][$eq]=${encodeURIComponent(
          user.email
        )}&filters[estado][$eq]=activo`;
        const urlQuery = endpoint + query;
        console.log("[fetchCarritoInicial] GET Strapi en:", urlQuery);

        const res = await fetch(urlQuery);
        const data = await res.json();
        console.log("[fetchCarritoInicial] Respuesta Strapi:", data);

        const carritoExistente = data?.data?.[0] || null;
        if (carritoExistente) {
          // 1) Guardamos el ID para futuros PUT
          carritoIdRef.current = carritoExistente.id;

          // 2) Tomamos el arreglo de productos que esté en Strapi
          const productosDesdeBackend = carritoExistente.attributes.productos || [];
          console.log(
            "[fetchCarritoInicial] Productos desde Strapi:",
            productosDesdeBackend
          );

          // 3) Actualizamos estado local
          setItems(productosDesdeBackend);
          const totalBackend = carritoExistente.attributes.total || 0;
          setTotal(totalBackend);
        } else {
          // No hay carrito activo → carritoIdRef.current queda en null
          console.log("[fetchCarritoInicial] No hay carrito activo en Strapi.");
        }
      } catch (err) {
        console.error("[fetchCarritoInicial] Error al obtener carrito de Strapi:", err);
      } finally {
        // 🔒 Marcamos que ya terminamos la carga inicial (aunque sea vacío)
        initialLoadComplete.current = true;
        console.log("[fetchCarritoInicial] initialLoadComplete = true");
      }
    };

    fetchCarritoInicial();
  }, [isAuthenticated, user]);

  // ────────────────────────────────────────────────────────────────────────────────
  // 4) Helper: Guardar carrito completo en Strapi (mergeItems ya preparado)
  //    - Si carritoIdRef.current NO es null → hacemos PUT a `/api/carritos/{id}`
  //    - Si es null → hacemos POST a `/api/carritos`
  // ────────────────────────────────────────────────────────────────────────────────
  const guardarCarritoEnStrapi = async (mergedItems) => {
    if (!isAuthenticated || !user) {
      console.warn("[guardarCarritoEnStrapi] Usuario no autenticado: no guardo.");
      return;
    }

    // 1) Armar payload
    const nuevoTotal = calcularTotal(mergedItems);
    const payload = {
      data: {
        usuario_email: user.email,
        productos: mergedItems,
        total: nuevoTotal,
        estado: "activo",
        ultima_actualizacion: new Date().toISOString(),
      },
    };

    try {
      const endpoint = `${process.env.REACT_APP_STRAPI_URL}/api/carritos`;
      if (carritoIdRef.current) {
        // → Ya existía carrito → PUT
        const putURL = `${endpoint}/${carritoIdRef.current}`;
        console.log("[guardarCarritoEnStrapi] Haciendo PUT a:", putURL, "Payload:", payload);
        await fetch(putURL, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        console.log("[guardarCarritoEnStrapi] Carrito actualizado (PUT).");
      } else {
        // → No existía carrito → POST
        console.log("[guardarCarritoEnStrapi] Haciendo POST a:", endpoint, "Payload:", payload);
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        console.log("[guardarCarritoEnStrapi] Carrito creado (POST):", data);
        // ⭐Guardamos el nuevo ID para futuras operaciones
        carritoIdRef.current = data?.data?.id || null;
      }
    } catch (err) {
      console.error("[guardarCarritoEnStrapi] Error al guardar carrito:", err);
    }
  };

  // ────────────────────────────────────────────────────────────────────────────────
  // 5) addToCart: reúne todo el flujo “esperar carga inicial → merge → estado → Strapi”
  // ────────────────────────────────────────────────────────────────────────────────
  const addToCart = async (producto, cantidad = 1) => {
    console.log("[addToCart] Inicio. Producto:", producto, "Cantidad:", cantidad);

    // 1) Esperar a que termine la carga inicial del carrito (solo si estamos auth)
    if (isAuthenticated && !initialLoadComplete.current) {
      console.log("[addToCart] Esperando a que fetch inicial termine...");
      await new Promise((resolve) => {
        const check = setInterval(() => {
          if (initialLoadComplete.current) {
            clearInterval(check);
            console.log("[addToCart] Fetch inicial terminado. Continuamos.");
            resolve();
          }
        }, 100);
      });
    }

    // ──────────── Caso NO autenticado: guardamos SOLO local en localStorage ───────────
    if (!isAuthenticated || !user) {
      console.warn("[addToCart] Usuario no autenticado: guardo solo local.");
      // 1a) Calcular comisiones/envío ANTES de setItems
      const comisionPlataforma = precotizarPlataforma(producto.subtotal);
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

      // 1b) Actualizamos items localmente
      setItems((prev) => {
        const existing = prev.find((i) => i.producto === producto.id);
        let updated;
        if (existing) {
          updated = prev.map((i) =>
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
          updated = [
            ...prev,
            {
              producto: producto.id,
              nombre: producto.nombre,
              marca: producto.marca,
              precio_unitario: producto.precio,
              cantidad: cantidad,
              imagen: producto.imagen_predeterminada?.url || "",
              subtotal,
              comisionPlataforma,
              comisionStripe,
              envio,
              total: totalItem,
            },
          ];
        }

        // 1c) Actualizamos total
        const nuevoTotal = calcularTotal(updated);
        setTotal(nuevoTotal);

        // 1d) Guardamos en localStorage
        localStorage.setItem("carrito", JSON.stringify({ items: updated, total: nuevoTotal }));
        console.log("[addToCart] Carrito local (no auth):", { updated, nuevoTotal });

        return updated;
      });

      return;
    }

    // ──────────── Caso autenticado: “Merge” con lo que ya hay en estado local ──────────
    // 2a) Tomamos snapshot de items actuales en estado. (Ya están cargados porque 
    //     `initialLoadComplete.current === true`.)
    const snapshotPrevio = [...items];
    console.log("[addToCart] snapshotPrevio (estado actual):", snapshotPrevio);

    // 2b) Calcular comisiones/envío del “nuevo producto”
    const comisionPlataforma = precotizarPlataforma(producto.subtotal);
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
    const totalItemNuevo = parseFloat(
      (subtotal + comisionStripe + comisionPlataforma + envio).toFixed(2)
    );

    // 2c) Hacemos “merge” en memoria, no modificamos el estado aún:
    let mergedItems = [...snapshotPrevio];
    const existeEnMerged = mergedItems.find((i) => i.producto === producto.id);
    if (existeEnMerged) {
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
      mergedItems.push({
        producto: producto.id,
        nombre: producto.nombre,
        marca: producto.marca,
        precio_unitario: producto.precio,
        cantidad: cantidad,
        imagen: producto.imagen_predeterminada?.url || "",
        subtotal,
        comisionPlataforma,
        comisionStripe,
        envio,
        total: totalItemNuevo,
      });
    }
    console.log("[addToCart] mergedItems (antes de setState):", mergedItems);

    // 2d) Actualizamos estado React
    setItems(mergedItems);
    const nuevoTotal = calcularTotal(mergedItems);
    setTotal(nuevoTotal);
    console.log("[addToCart] Estado local actualizado:", { mergedItems, nuevoTotal });

    // 2e) Guardamos TODO el carrito en Strapi (PUT o POST según corresponda)
    await guardarCarritoEnStrapi(mergedItems);
  };

  // ────────────────────────────────────────────────────────────────────────────────
  // 6) updateQuantity: muy parecido a addToCart, pero solo cambia “cantidad”
  // ────────────────────────────────────────────────────────────────────────────────
  const updateQuantity = async (productoId, nuevaCantidad) => {
    console.log("[updateQuantity] ProductoID:", productoId, "NuevaCantidad:", nuevaCantidad);

    // 6.1) Caso NO autenticado → guardamos solo localmente
    if (!isAuthenticated || !user) {
      console.warn("[updateQuantity] No auth: actualizo solo local.");
      setItems((prev) => {
        const updated = prev
          .map((i) => {
            if (i.producto === productoId) {
              const subtotal = i.precio_unitario * nuevaCantidad;
              const total = parseFloat(
                (subtotal + i.comisionStripe + i.envio + i.comisionPlataforma).toFixed(2)
              );
              return { ...i, cantidad: nuevaCantidad, subtotal, total };
            }
            return i;
          })
          .filter((i) => i.cantidad > 0);

        const nuevoTotal = calcularTotal(updated);
        setTotal(nuevoTotal);
        localStorage.setItem("carrito", JSON.stringify({ items: updated, total: nuevoTotal }));
        console.log("[updateQuantity] Carrito local actualizado (no auth):", {
          updated,
          nuevoTotal,
        });
        return updated;
      });
      return;
    }

    // 6.2) Esperamos cargue inicial (si fuera necesario)
    if (isAuthenticated && !initialLoadComplete.current) {
      console.log("[updateQuantity] Esperando fetch inicial...");
      await new Promise((resolve) => {
        const check = setInterval(() => {
          if (initialLoadComplete.current) {
            clearInterval(check);
            console.log("[updateQuantity] Fetch inicial terminado.");
            resolve();
          }
        }, 100);
      });
    }

    // 6.3) Tomamos snapshot de items locales
    const snapshotPrevio = [...items];
    console.log("[updateQuantity] snapshotPrevio:", snapshotPrevio);

    // 6.4) “Merge” en memoria
    let mergedItems = snapshotPrevio.map((i) => {
      if (i.producto === productoId) {
        const subtotal = i.precio_unitario * nuevaCantidad;
        const total = parseFloat(
          (subtotal + i.comisionStripe + i.envio + i.comisionPlataforma).toFixed(2)
        );
        return { ...i, cantidad: nuevaCantidad, subtotal, total };
      }
      return i;
    });
    // Filtramos ceros
    mergedItems = mergedItems.filter((i) => i.cantidad > 0);
    console.log("[updateQuantity] mergedItems:", mergedItems);

    // 6.5) Actualizamos estado local
    const nuevoTotal = calcularTotal(mergedItems);
    setItems(mergedItems);
    setTotal(nuevoTotal);
    console.log("[updateQuantity] Estado local:", { mergedItems, nuevoTotal });

    // 6.6) Guardamos TODO el carrito en Strapi
    await guardarCarritoEnStrapi(mergedItems);
  };

  // ────────────────────────────────────────────────────────────────────────────────
  // 7) clearCart: vacía carrito (local + Strapi)
  // ────────────────────────────────────────────────────────────────────────────────
  const clearCart = async () => {
    console.log("[clearCart] Inicio");

    // 7.1) Caso NO autenticado → solo borramos local
    if (!isAuthenticated || !user) {
      console.warn("[clearCart] No auth: borro solo local.");
      setItems([]);
      setTotal(0);
      localStorage.removeItem("carrito");
      return;
    }

    // 7.2) Esperamos cargue inicial (si fuera necesario)
    if (isAuthenticated && !initialLoadComplete.current) {
      console.log("[clearCart] Esperando fetch inicial...");
      await new Promise((resolve) => {
        const check = setInterval(() => {
          if (initialLoadComplete.current) {
            clearInterval(check);
            console.log("[clearCart] Fetch inicial terminado.");
            resolve();
          }
        }, 100);
      });
    }

    // 7.3) Borramos estado local
    setItems([]);
    setTotal(0);
    console.log("[clearCart] Estado local vaciado.");

    // 7.4) Si hay carritoId en Strapi, lo marcamos “inactivo” haciendo PUT con productos:[] y total:0
    if (carritoIdRef.current) {
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
        const putURL = `${process.env.REACT_APP_STRAPI_URL}/api/carritos/${carritoIdRef.current}`;
        console.log("[clearCart] Haciendo PUT a:", putURL, "Payload:", payload);
        await fetch(putURL, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        console.log("[clearCart] Carrito marcado como inactivo en Strapi.");
        // Opcional: borrar carritoIdRef.current si no lo vas a reutilizar
        carritoIdRef.current = null;
      } catch (err) {
        console.error("[clearCart] Error marcando carrito inactivo:", err);
      }
    } else {
      console.log("[clearCart] No había carrito activo en Strapi.");
    }
  };

  // ────────────────────────────────────────────────────────────────────────────────
  // 8) Si no estamos autenticados: al montar cargamos de localStorage (opcional)
  // ────────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      const str = localStorage.getItem("carrito");
      if (str) {
        try {
          const parsed = JSON.parse(str);
          setItems(parsed.items || []);
          setTotal(parsed.total || 0);
          console.log("[CartProvider] Cargando carrito desde localStorage:", parsed);
        } catch {
          localStorage.removeItem("carrito");
        }
      }
      // Y marcamos que “carga inicial” terminó, para que addToCart no se quede esperando
      initialLoadComplete.current = true;
    }
  }, [isAuthenticated]);

  return (
    <CartContext.Provider
      value={{
        items,
        total,
        addToCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
