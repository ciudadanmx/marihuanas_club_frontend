import React, { useState, useEffect } from "react";
import { useCart } from "../Contexts/CartContext";
import { useAuth0 } from "@auth0/auth0-react";
import "../styles/Carrito.css";

const Carrito = () => {
  const { items, total, updateQuantity, clearCart } = useCart();
  const { isAuthenticated, loginWithRedirect, user } = useAuth0();
  const [localItems, setLocalItems] = useState([]);
  const [localTotal, setLocalTotal] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      const raw = JSON.parse(localStorage.getItem("carrito"));
      const carritoLocal = Array.isArray(raw) ? raw : [];
      setLocalItems(carritoLocal);
      console.log('no autenticado nooooooooo ------- **** ');
      const suma = carritoLocal.reduce(
        (acc, item) => acc + (item.precio_unitario || 0) * (item.cantidad || 0),
        0
      );
      setLocalTotal(suma);
    }
  }, [isAuthenticated]);

  const handleVaciarCarrito = async () => {
    if (!user?.email) {
      console.warn("No hay email de usuario. No puedo vaciar.");
      return;
    }

    try {
      const resFetch = await fetch(
        `${process.env.REACT_APP_STRAPI_URL}/api/carritos?filters[usuario_email][$eq]=${encodeURIComponent(
          user.email
        )}&filters[estado][$eq]=activo`,
        {
          credentials: "include",
        }
      );
      const json = await resFetch.json();
      const carritoEntry = json?.data?.[0];
      if (!carritoEntry) {
        clearCart();
        return;
      }
      const carritoIdStrapi = carritoEntry.id;
      const payload = {
        data: {
          productos: [],
          total: 0,
          total_envios: 0,
          estado: "activo",
          ultima_actualizacion: new Date().toISOString(),
        },
      };
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
      if (!resPut.ok) {
        const errText = await resPut.text();
        console.error("Error de Strapi:", errText);
        return;
      }
      clearCart();
    } catch (err) {
      console.error("Error en handleVaciarCarrito:", err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="carrito-container">
        <h2>Carrito de compras</h2>
        {localItems.length === 0 ? (
          <p className="carrito-vacio">Tu carrito está vacío.</p>
        ) : (
          <div className="carrito-items">
            {localItems.map((item, index) => (
              <div key={index} className="carrito-item">
                <div className="carrito-info">
                  <h4>{item.nombre}</h4>
                  <p>Precio unitario: ${(item.precio_unitario || 0).toFixed(2)}</p>
                  <p>
                    Subtotal: $
                    {(
                      (item.precio_unitario || 0) *
                      (item.cantidad || 0)
                    ).toFixed(2)}
                  </p>
                  <div className="carrito-cantidad">
                    <span>{item.cantidad || 0}</span>
                  </div>
                </div>
              </div>
            ))}
            <div className="carrito-resumen">
              <p>
                Total del carrito: <strong>${(localTotal || 0).toFixed(2)}</strong>
              </p>
            </div>
          </div>
        )}
        <div className="carrito-login">
          <p>Si quieres modificar o finalizar tu compra, inicia sesión:</p>
          <button onClick={() => loginWithRedirect()}>Iniciar sesión</button>
        </div>
      </div>
    );
  }

  const itemsPorTienda = items.reduce((acc, item) => {
    const nombreTienda = item.store?.name || "Sin tienda";
    if (!acc[nombreTienda]) {
      acc[nombreTienda] = [];
    }
    acc[nombreTienda].push(item);
    return acc;
  }, {});

  return (
    <div className="carrito-container">
      <h2>Carrito de compras</h2>

      {items.length === 0 ? (
        <p className="carrito-vacio">Tu carrito está vacío.</p>
      ) : (
        <div className="carrito-items">
          {Object.entries(itemsPorTienda).map(
            ([nombreTienda, itemsDeTienda], tiendaIndex) => {
              const subtotalTienda = itemsDeTienda.reduce(
                (acc, item) => acc + (item.subtotal || 0),
                0
              );
              const envioTienda = itemsDeTienda.reduce(
                (acc, item) => acc + (item.envio || 0),
                0
              );
              const comisionesTienda = itemsDeTienda.reduce(
                (acc, item) =>
                  acc +
                  ((item.comisionPlataforma || 0) + (item.comisionStripe || 0)),
                0
              );

              return (
                <div key={tiendaIndex} className="carrito-tienda">
                  <h3 className="carrito-tienda-nombre">
                    Tienda: {nombreTienda}
                  </h3>

                  {itemsDeTienda.map((item, index) => (
                    <div key={index} className="carrito-item">
                      {item.imagen && (
                        <img
                          src={item.imagen}
                          alt={item.nombre}
                          className="carrito-img"
                        />
                      )}
                      <div className="carrito-info">
                        <h4>{item.nombre}</h4>
                        <p>Marca: {item.marca}</p>
                        <p>
                          Precio unitario: $
                          {(item.precio_unitario || 0).toFixed(2)}
                        </p>
                        <p>
                          Subtotal: $
                          {(item.subtotal || 0).toFixed(2)}
                        </p>
                        <div className="carrito-cantidad">
                          <button
                            onClick={() =>
                              updateQuantity(item.producto, item.cantidad - 1)
                            }
                          >
                            -
                          </button>
                          <span>{item.cantidad || 0}</span>
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

                  <div className="carrito-tienda-resumen">
                    <p>
                      Subtotal tienda:{" "}
                      <strong>${subtotalTienda.toFixed(2)}</strong>
                    </p>
                    <p>
                      Envío tienda:{" "}
                      <strong>${envioTienda.toFixed(2)}</strong>
                    </p>
                    <p>
                      Comisiones tienda:{" "}
                      <strong>${comisionesTienda.toFixed(2)}</strong>
                    </p>
                    <p>
                      Total tienda:{" "}
                      <strong>
                        ${(subtotalTienda + envioTienda + comisionesTienda).toFixed(2)}
                      </strong>
                    </p>
                  </div>
                </div>
              );
            }
          )}

          <div className="carrito-resumen">
            <p>
              Total del carrito:{" "}
              <strong>${(total || 0).toFixed(2)}</strong>
            </p>
            <button onClick={handleVaciarCarrito}>Vaciar carrito</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Carrito;
