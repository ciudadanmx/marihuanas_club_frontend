import { createContext, useContext, useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth0();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

    useEffect(() => {
    const fetchCarrito = async () => {
      if (!isAuthenticated || !user) return;

      try {
        const res = await fetch(`${process.env.REACT_APP_STRAPI_URL}/api/carritos?filters[usuario_email][$eq]=${user.email}&filters[estado][$eq]=activo`);
        const json = await res.json();
        const carrito = json?.data?.[0]?.attributes;

        console.log('carrito de strapi ------ ', carrito);

        if (carrito) {
          const productos = carrito.productos || [];
          setItems(productos);
          setTotal(carrito.total || 0);
        }

      } catch (error) {
        console.error("Error al cargar carrito desde Strapi:", error);
      }
    };

    fetchCarrito();
  }, [isAuthenticated, user]);









  const precotizarStripe = (precioProducto) => {
    const tarifa = (precioProducto * 0.036)+3;
    const iva = tarifa * 0.16;
    return parseFloat((tarifa + iva).toFixed(2));
  };

    const precotizarPlataforma = (precioProducto) => {
    const tarifa = precioProducto < 200 ? 5 : 10;
    const iva = tarifa * 0.16;
    return parseFloat((tarifa + iva).toFixed(2));
  };

  const precotizarMienvio = async (cpOrigen, cpDestino, largo, ancho, alto, peso, cantidad) => {
    console.log('precotizando');
    try {
      const largo = 1;
      const ancho = 1;
      const alto = 1;
      const peso = 1.5;
      
      const res = await fetch(`${process.env.REACT_APP_STRAPI_URL}/api/shipping/calcular`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpOrigen, cpDestino, largo, ancho, alto, peso, cantidad }),
      });
      const data = await res.json();
      console.log(`calculando......... ${data.costo} `, data);
      console.log(peso);
      return parseFloat(data.costo || 0);
    } catch (error) {
      console.error("Error en cálculo de envío:", error);
      return 0;
    }
  };

/*   // Cargar del localStorage al inicio
  useEffect(() => {
    const stored = localStorage.getItem("carrito");
    if (stored) {
      const data = JSON.parse(stored);
      setItems(data.items || []);
      setTotal(data.total || 0);
    }
  }, []); */

  // Guardar en localStorage cada que cambia
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem("carrito", JSON.stringify({ items, total }));
    }
  }, [items, total, isAuthenticated]);

  const calcularTotal = (productos) =>
    productos.reduce((acc, item) => acc + (item.total || (item.precio_unitario * item.cantidad)), 0);

  const addToCart = async (producto, cantidad = 1) => {
    const comisionPlataforma = precotizarPlataforma(producto.subtotal);
    const comisionStripe = precotizarStripe(comisionPlataforma);
    const envio = await precotizarMienvio(
      producto.cp,
      producto.cp_destino || "11560", // Ajusta esto según tu lógica
      producto.largo,
      producto.ancho,
      producto.alto,
      producto.peso
    );
    console.log('costo de envio ', producto.envio);
    const subtotal = producto.precio * cantidad;
    const totalItem = parseFloat((subtotal + comisionStripe + comisionPlataforma + envio).toFixed(2));

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
                total: parseFloat(((i.precio_unitario * (i.cantidad + cantidad)) + comisionStripe +comisionPlataforma + envio).toFixed(2)),
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
      const nuevoTotal = calcularTotal(updated);
      setTotal(nuevoTotal);
      return updated;
    });
  };

  const updateQuantity = (productoId, cantidad) => {
    setItems((prev) => {
      const updated = prev
        .map((i) => {
          if (i.producto === productoId) {
            const subtotal = i.precio_unitario * cantidad;
            const total = parseFloat((subtotal + i.comisionStripe + i.envio + i.comisionPlataforma).toFixed(2));
            return { ...i, cantidad, subtotal, total };
          }
          return i;
        })
        .filter((i) => i.cantidad > 0);
      setTotal(calcularTotal(updated));
      return updated;
    });
  };

  const clearCart = () => {
    setItems([]);
    setTotal(0);
  };

  // Guardar en Strapi si autenticado
  useEffect(() => {
    const saveToStrapi = async () => {
      if (isAuthenticated && items.length > 0) {
        console.log(`Buscando al usuario ${user.email}`);
        try {
          const endpoint = `${process.env.REACT_APP_STRAPI_URL}/api/carritos`;
          const query = `?filters[usuario_email][$eq]=${user.email}&filters[estado][$eq]=activo`;
          const res = await fetch(endpoint + query);
          const json = await res.json();
          const carritoExistente = json?.data?.[0];
          console.log("resultado api carritos: ", carritoExistente?.attributes);

          const payload = {
            data: {
              usuario_email: user.email,
              productos: items.map((item) => ({
                producto: item.producto,
                nombre: item.nombre,
                precio_unitario: item.precio_unitario,
                cantidad: item.cantidad,
                subtotal: item.subtotal,
                envio: item.envio,
                comisionStripe: item.comisionStripe,
                comisionPlataforma: item.comisionPlataforma,
                total: item.total,
              })),
              total,
              estado: "activo",
              ultima_actualizacion: new Date().toISOString(),
            },
          };

          if (carritoExistente) {
            const response = await fetch(`${endpoint}/${carritoExistente.id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            });
            const result = await response.json();

            console.log("Status del PUT:", response.status);
            console.log("¿OK?:", response.ok);
            const text = await response.text();
            console.log("Texto plano de la respuesta:", text);
            console.log("Resultado del PUT:", result);
          } else {
            const response = await fetch(endpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            });
            const result = await response.json();
            console.log("Resultado del POST:", result);
          }
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
