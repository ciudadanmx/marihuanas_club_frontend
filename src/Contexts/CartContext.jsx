import { createContext, useContext, useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth0();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  // Cargar del localStorage al inicio (para no autenticados)
  useEffect(() => {
    const stored = localStorage.getItem("carrito");
    if (stored) {
      const data = JSON.parse(stored);
      setItems(data.items || []);
      setTotal(data.total || 0);
    }
  }, []);

  // Guardar en localStorage solo si NO está autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem("carrito", JSON.stringify({ items, total }));
    }
  }, [items, total, isAuthenticated]);

  const calcularTotal = (productos) =>
    productos.reduce(
      (acc, item) => acc + item.precio_unitario * item.cantidad,
      0
    );

  // Agregar al carrito (solo en frontend, ids externos)
  const addToCart = (producto) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.producto === producto.id);
      let updated;
      if (existing) {
        updated = prev.map((i) =>
          i.producto === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i
        );
      } else {
        updated = [
          ...prev,
          {
            producto: producto.id, // ID externo por ahora
            nombre: producto.nombre,
            marca: producto.marca,
            precio_unitario: producto.precio,
            cantidad: 1,
            imagen: producto.imagen_predeterminada?.url || "",
          },
        ];
      }
      const nuevoTotal = calcularTotal(updated);
      setTotal(nuevoTotal);
      return updated;
    });
  };

  const updateQuantity = (productoId, cantidad) => {
    setItems((prev) => {
      const updated = prev
        .map((i) => (i.producto === productoId ? { ...i, cantidad } : i))
        .filter((i) => i.cantidad > 0);
      setTotal(calcularTotal(updated));
      return updated;
    });
  };

  const clearCart = () => {
    setItems([]);
    setTotal(0);
  };

  // Obtener IDs internos Strapi para los productos en carrito (mapea items con id Strapi)
  const fetchProductIdsFromStrapi = async () => {
    const endpointProductos = `${process.env.REACT_APP_STRAPI_URL}/api/productos`;
    const productosConIdStrapi = [];

    for (const item of items) {
      try {
        const query = `?filters[store_id][$eq]=${item.producto}`;
        const res = await fetch(endpointProductos + query);
        const json = await res.json();
        const productoStrapi = json?.data?.[0];
        if (productoStrapi) {
          productosConIdStrapi.push({
            producto: productoStrapi.id,
            nombre: item.nombre,
            precio_unitario: item.precio_unitario,
            cantidad: item.cantidad,
            subtotal: item.precio_unitario * item.cantidad,
          });
          console.log(`Producto encontrado en Strapi: ${item.nombre} - ID interno: ${productoStrapi.id}`);
        } else {
          console.warn(`No se encontró producto en Strapi para id externo: ${item.producto}`);
        }
      } catch (error) {
        console.error("Error al buscar producto en Strapi:", error);
      }
    }

    return productosConIdStrapi;
  };

  // Fusionar carrito local con carrito de Strapi
  const mergeLocalCartWithStrapiCart = (localItems, strapiItems) => {
    const merged = [...strapiItems];
    for (const localItem of localItems) {
      const index = merged.findIndex((item) => item.producto === localItem.producto);
      if (index !== -1) {
        merged[index].cantidad += localItem.cantidad;
        merged[index].subtotal = merged[index].cantidad * merged[index].precio_unitario;
      } else {
        merged.push({ ...localItem });
      }
    }
    return merged;
  };

  // Guardar carrito en Strapi cuando está autenticado y items cambian
  useEffect(() => {
    const saveToStrapi = async () => {
      if (isAuthenticated && items.length > 0) {
        console.log(`Buscando al usuario ${user.email}`);

        try {
          const productosStrapi = await fetchProductIdsFromStrapi();
          const endpoint = `${process.env.REACT_APP_STRAPI_URL}/api/carritos`;
          const query = `?filters[usuario_email][$eq]=${user.email}&filters[estado][$eq]=activo`;
          const res = await fetch(endpoint + query);
          const json = await res.json();
          const carritoExistente = json?.data?.[0];
          console.log("Resultado API carritos: ", carritoExistente?.attributes);

          let productosFinales = productosStrapi;

          // Si ya hay un carrito en Strapi, mergear
          if (carritoExistente) {
            const existentes = carritoExistente.attributes.productos || [];
            productosFinales = mergeLocalCartWithStrapiCart(productosStrapi, existentes);
          }

          const nuevoTotal = calcularTotal(productosFinales);

          const payload = {
            data: {
              usuario_email: user.email,
              productos: productosFinales,
              total: nuevoTotal,
              estado: "activo",
              ultima_actualizacion: new Date().toISOString(),
            },
          };

          let response;
          if (carritoExistente) {
            response = await fetch(`${endpoint}/${carritoExistente.id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            });
          } else {
            response = await fetch(endpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            });
          }

          console.log("Status de la petición a Strapi:", response.status);
          console.log("¿OK?:", response.ok);

          const resultJson = await response.json();
          console.log("Respuesta de Strapi:", resultJson);
        } catch (error) {
          console.error("Error al guardar en Strapi:", error);
        }
      }
    };
    saveToStrapi();
  }, [isAuthenticated, user, items, total]);

  return (
    <CartContext.Provider
      value={{ items, total, addToCart, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
