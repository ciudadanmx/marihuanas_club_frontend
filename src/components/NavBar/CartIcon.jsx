// CartIcon.jsx
import { MdShoppingCart } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../Contexts/CartContext";
import "../../styles/MessagesIcon.css";

const CartIcon = () => {
  const navigate = useNavigate();
  const { getItemCount } = useCart();
  const totalUnidades = getItemCount();

  const handleClick = () => {
    navigate("/cart");
  };

  return (
    <div className="message-icon-container" onClick={handleClick}>
      <MdShoppingCart className="message-icon" />
      {totalUnidades > 0 && <span className="message-count">{totalUnidades}</span>}
    </div>
  );
};

export default CartIcon;
