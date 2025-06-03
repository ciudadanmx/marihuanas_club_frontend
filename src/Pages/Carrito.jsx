import React from "react";
import { useCart } from "../Contexts/CartContext"; // asegúrate que esta ruta sea correcta
import { useAuth0 } from "@auth0/auth0-react";

const Carrito = () => {
  const { items, total, updateQuantity, clearCart } = useCart(); // <-- AQUÍ el cambio
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  if (!isAuthenticated) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600">Debes iniciar sesión para ver tu carrito.</p>
        <button
          onClick={() => loginWithRedirect()}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Iniciar sesión
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Carrito de compras</h2>

      {items.length === 0 ? (
        <p className="text-gray-500">Tu carrito está vacío.</p>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-4 p-4 border rounded shadow-sm">
              {item.imagen && (
                <img src={item.imagen} alt={item.nombre} className="w-16 h-16 object-cover rounded" />
              )}
              <div className="flex-1">
                <h3 className="font-semibold">{item.nombre}</h3>
                <p className="text-sm text-gray-600">Marca: {item.marca}</p>
                <p className="text-sm text-gray-600">Precio unitario: ${item.precio_unitario.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Subtotal: ${item.subtotal.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Envío: ${item.envio.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Comisiones: ${(item.comisionPlataforma + item.comisionStripe).toFixed(2)}</p>
                <p className="text-sm font-bold">Total item: ${item.total.toFixed(2)}</p>

                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.producto, item.cantidad - 1)}
                    className="px-2 py-1 bg-gray-200 rounded"
                  >
                    -
                  </button>
                  <span>{item.cantidad}</span>
                  <button
                    onClick={() => updateQuantity(item.producto, item.cantidad + 1)}
                    className="px-2 py-1 bg-gray-200 rounded"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="mt-6 text-right">
            <p className="text-xl font-bold">Total del carrito: ${total.toFixed(2)}</p>
            <button
              onClick={clearCart}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Vaciar carrito
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Carrito;
