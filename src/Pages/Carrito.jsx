import React from "react";
import { useCart } from "../Contexts/CartContext";
import { useAuth0 } from "@auth0/auth0-react";
import "../styles/Carrito.css";

const Carrito = () => {
  const { items, total, updateQuantity, clearCart } = useCart();
  const { isAuthenticated, loginWithRedirect, user } = useAuth0();

  const handleVaciarCarrito = async () => {
    if (!user?.email) {
      console.warn("No hay email de usuario. No puedo vaciar.");
      return;
    }

    try {
      // 1) Obtener carrito activo de Strapi
      console.log(">> Fetch carrito activo para:", user.email);
      const resFetch = await fetch(
        `${process.env.REACT_APP_STRAPI_URL}/api/carritos?filters[usuario_email][$eq]=${encodeURIComponent(
          user.email
        )}&filters[estado][$eq]=activo`,
        {
          credentials: "include",
        }
      );
      console.log(">> Respuesta GET carrito:", resFetch.status);
      const json = await resFetch.json();
      console.log(">> Datos GET carrito:", json);

      const carritoEntry = json?.data?.[0];
      if (!carritoEntry) {
        console.warn("No existe un carrito activo en Strapi para este email.");
        clearCart();
        return;
      }

      const carritoIdStrapi = carritoEntry.id;
      console.log(">> ID de carrito activo en Strapi:", carritoIdStrapi);

      // 2) Hacer PUT para vaciar productos, totales a 0, etc.
      const payload = {
        data: {
          productos: [],
          total: 0,
          total_envios: 0,
          estado: "activo",
          ultima_actualizacion: new Date().toISOString(),
        },
      };
      console.log(">> Payload para PUT vaciar:", payload);

      const resPut = await fetch(
        `${process.env.REACT_APP_STRAPI_URL}/api/carritos/${carritoIdStrapi}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );
      console.log(">> Respuesta PUT vaciar carrito:", resPut.status);

      if (!resPut.ok) {
        console.error("No se vació el carrito en Strapi. Status:", resPut.status);
        const errText = await resPut.text();
        console.error("Error de Strapi:", errText);
        return;
      }

      const jsonPut = await resPut.json();
      console.log(">> Respuesta JSON PUT:", jsonPut);

      // 3) Si todo OK, limpiamos el contexto local
      clearCart();
      console.log(">> Carrito limpiado localmente.");
    } catch (err) {
      console.error("Error en handleVaciarCarrito:", err);
    }
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

      {items.length === 0 ? (
        <p className="carrito-vacio">Tu carrito está vacío.</p>
      ) : (
        <div className="carrito-items">
          {items.map((item, index) => (
            <div key={index} className="carrito-item">
              {item.imagen && (
                <img
                  src={item.imagen}
                  alt={item.nombre}
                  className="carrito-img"
                />
              )}
              <div className="carrito-info">
                <h3>{item.nombre}</h3>
                <p>Marca: {item.marca}</p>
                <p>
                  Precio unitario: ${item.precio_unitario.toFixed(2)}
                </p>
                <p>Subtotal: ${item.subtotal.toFixed(2)}</p>
                <p>Envío: ${item.envio.toFixed(2)}</p>
                <p>
                  Comisiones: $
                  {(item.comisionPlataforma + item.comisionStripe).toFixed(
                    2
                  )}
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
