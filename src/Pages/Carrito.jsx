import React from "react";
import { useCart } from "../Contexts/CartContext";
import { useAuth0 } from "@auth0/auth0-react";
import "../styles/Carrito.css"; // Asegúrate de importar los estilos

const Carrito = () => {
  const { items, total, updateQuantity, clearCart } = useCart();
  const { isAuthenticated, loginWithRedirect } = useAuth0();

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
                <img src={item.imagen} alt={item.nombre} className="carrito-img" />
              )}
              <div className="carrito-info">
                <h3>{item.nombre}</h3>
                <p>Marca: {item.marca}</p>
                <p>Precio unitario: ${item.precio_unitario.toFixed(2)}</p>
                <p>Subtotal: ${item.subtotal.toFixed(2)}</p>
                <p>Envío: ${item.envio.toFixed(2)}</p>
                <p>Comisiones: ${(item.comisionPlataforma + item.comisionStripe).toFixed(2)}</p>
                <p className="item-total">Total item: ${item.total.toFixed(2)}</p>

                <div className="carrito-cantidad">
                  <button onClick={() => updateQuantity(item.producto, item.cantidad - 1)}>-</button>
                  <span>{item.cantidad}</span>
                  <button onClick={() => updateQuantity(item.producto, item.cantidad + 1)}>+</button>
                </div>
              </div>
            </div>
          ))}

          <div className="carrito-resumen">
            <p>Total del carrito: <strong>${total.toFixed(2)}</strong></p>
            <button onClick={clearCart}>Vaciar carrito</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Carrito;
