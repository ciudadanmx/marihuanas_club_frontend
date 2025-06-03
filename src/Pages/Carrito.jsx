import React, { useEffect, useState } from "react";
import { useCart } from "../Contexts/CartContext";
import { useAuth0 } from "@auth0/auth0-react";
import "../styles/Carrito.css";

const Carrito = () => {
  const { items, total, updateQuantity, clearCart } = useCart();
  const { isAuthenticated, loginWithRedirect, user } = useAuth0();
  const [displayItems, setDisplayItems] = useState([]);

  useEffect(() => {
    const fetchImages = async () => {
      if (!items || items.length === 0) {
        setDisplayItems([]);
        return;
      }

      console.log('imageeeeeen ------', items);
      const withImages = await Promise.all(
        items.map(async (item, idx) => {
          console.group(`Item ${idx} raw data`);
          console.log(item);
          console.groupEnd();

          // 1) Detectar ID de producto
          let productId = null;

          if (typeof item.producto === "number") {
            productId = item.producto;
          } else if (
            item.producto &&
            item.producto.data &&
            typeof item.producto.data.id === "number"
          ) {
            productId = item.producto.data.id;
          } else if (item.producto && typeof item.producto.id === "number") {
            productId = item.producto.id;
          }

          // Si ya viene con URL en item.imagen, la usamos
          if (item.imagen_predeterminada) {
            console.log("Usando item.imagen directamente:", item.imagen_predeterminada);
            return { ...item, imagenUrl: item.imagen_predeterminada };
          }

          // Si dentro de item.producto ya está populado
          if (
            item.producto &&
            item.producto.data &&
            item.producto.data.attributes &&
            item.producto.data.attributes.imagen_predeterminada
          ) {
            // Caso A: imagen_predeterminada es un objeto con `data`
            const mediaObj = item.producto.data.attributes.imagen_predeterminada.data;
            if (mediaObj && mediaObj.attributes && mediaObj.attributes.url) {
              const rel = mediaObj.attributes.url;
              const full = `${process.env.REACT_APP_STRAPI_URL}${rel}`;
              console.log("Usando imagen de producto.populado (con data):", full);
              return { ...item, imagenUrl: full };
            }
            // Caso B: imagen_predeterminada es directamente un objeto con `url`
            const directMedia = item.producto.data.attributes.imagen_predeterminada;
            if (directMedia && directMedia.url) {
              const full = `${process.env.REACT_APP_STRAPI_URL}${directMedia.url}`;
              console.log("Usando imagen de producto.populado (directa):", full);
              return { ...item, imagenUrl: full };
            }
          }

          // 2) Si no encontramos la URL, hacemos fetch a Strapi por ID
          if (productId == null) {
            console.warn(
              `No se pudo determinar ID de producto para el item ${idx}, mostrando sin imagen.`
            );
            return { ...item, imagenUrl: null };
          }

          try {
            console.log("Fetch a Strapi para producto ID:", productId);
            const res = await fetch(
              `${process.env.REACT_APP_STRAPI_URL}/api/productos/${productId}?populate=imagen_predeterminada`,
              {
                credentials: "include",
              }
            );
            console.log("Status fetch producto:", res.status);
            const data = await res.json();
            console.log("Data producto:", data);

            // Caso A: imagen_predeterminada es un objeto con `data`
            const nested =
              data?.data?.attributes?.imagen_predeterminada?.data?.attributes?.url;
            if (nested) {
              const full = `${process.env.REACT_APP_STRAPI_URL}${nested}`;
              console.log("URL final de imagen (nested):", full);
              return { ...item, imagenUrl: full };
            }

            // Caso B: imagen_predeterminada es un objeto directo con `url`
            const direct =
              data?.data?.attributes?.imagen_predeterminada?.url;
            if (direct) {
              const full = `${process.env.REACT_APP_STRAPI_URL}${direct}`;
              console.log("URL final de imagen (direct):", full);
              return { ...item, imagenUrl: full };
            }

            console.warn(
              `Producto ${productId} no tiene imagen_predeterminada.`
            );
            return { ...item, imagenUrl: null };
          } catch (err) {
            console.error(
              `Error cargando imagen para producto ${productId}:`,
              err
            );
            return { ...item, imagenUrl: null };
          }
        })
      );

      setDisplayItems(withImages);
    };

    fetchImages();
  }, [items]);

  const handleVaciarCarrito = async () => {
    if (!user?.email) return;

    try {
      console.log(">> Fetch carrito activo para vaciar:", user.email);
      const resFetch = await fetch(
        `${process.env.REACT_APP_STRAPI_URL}/api/carritos?filters[usuario_email][$eq]=${encodeURIComponent(
          user.email
        )}&filters[estado][$eq]=activo`,
        { credentials: "include" }
      );
      console.log(">> GET carrito status:", resFetch.status);
      const json = await resFetch.json();
      console.log(">> GET carrito data:", json);

      const carritoEntry = json?.data?.[0];
      if (carritoEntry) {
        const carritoId = carritoEntry.id;
        console.log(">> ID de carrito a vaciar:", carritoId);

        const payload = {
          data: {
            productos: [],
            total: 0,
            total_envios: 0,
            estado: "activo",
            ultima_actualizacion: new Date().toISOString(),
          },
        };
        console.log(">> Payload PUT vaciar:", payload);

        const resPut = await fetch(
          `${process.env.REACT_APP_STRAPI_URL}/api/carritos/${carritoId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),
          }
        );
        console.log(">> PUT vaciar status:", resPut.status);
        const jsonPut = await resPut.json();
        console.log(">> PUT vaciar response:", jsonPut);
      } else {
        console.warn("No se encontró carrito activo para vaciar en Strapi.");
      }
    } catch (err) {
      console.error("Error al vaciar carrito en Strapi:", err);
    }

    clearCart();
  };

  if (!isAuthenticated) {
    return (
      <div className="carrito-login">
        <p>Debes iniciar sesión para ver tu carrito.</p>
        <button onClick={() => loginWithRedirect()}>Iniciar sesión</button>
      </div>
    );
  }

  return (
    <div className="carrito-container">
      <h2>Carrito de compras</h2>

      {displayItems.length === 0 ? (
        <p className="carrito-vacio">Tu carrito está vacío.</p>
      ) : (
        <div className="carrito-items">
          {displayItems.map((item, index) => (
            <div key={index} className="carrito-item">
              {item.imagenUrl ? (
                <img
                  src={item.imagenUrl}
                  alt={item.nombre}
                  className="carrito-img"
                />
              ) : (
                <div className="carrito-img-placeholder">Sin imagen</div>
              )}

              <div className="carrito-info">
                <h3>{item.nombre}</h3>
                <p>Marca: {item.marca}</p>
                <p>Precio unitario: ${item.precio_unitario.toFixed(2)}</p>
                <p>Subtotal: ${item.subtotal.toFixed(2)}</p>
                <p>Envío: ${item.envio.toFixed(2)}</p>
                <p>
                  Comisiones: $
                  {(item.comisionPlataforma + item.comisionStripe).toFixed(2)}
                </p>
                <p className="item-total">
                  Total item: ${item.total.toFixed(2)}
                </p>

                <div className="carrito-cantidad">
                  <button
                    onClick={() =>
                      updateQuantity(item.producto, item.cantidad - 1)
                    }
                  >
                    -
                  </button>
                  <span>{item.cantidad}</span>
                  <button
                    onClick={() =>
                      updateQuantity(item.producto, item.cantidad + 1)
                    }
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="carrito-resumen">
            <p>
              Total del carrito: <strong>${total.toFixed(2)}</strong>
            </p>
            <button onClick={handleVaciarCarrito}>Vaciar carrito</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Carrito;
