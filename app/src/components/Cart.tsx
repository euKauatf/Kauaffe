import { X, Trash2, Plus, Minus } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Cart({ isOpen, onClose }: CartProps) {
  const {
    cartItems,
    addCoffeeToCart,
    removeCoffeeFromCart,
    deleteCoffeeFromCart,
  } = useCart();
  const navigate = useNavigate();

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const formattedTotal = cartTotal.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  });

  function handleCheckout() {
    onClose();
    navigate("/checkout");
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-stone-950/50 backdrop-blur-sm z-60"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-100 bg-white z-70 shadow-2xl flex flex-col transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header Fixo */}
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <h2 className="text-xl font-black text-stone-900">Seu Pedido</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Lista com Scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-stone-400 gap-2">
              <p>Carrinho vazio</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 items-start">
                <img
                  src={item.image}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-stone-800 text-sm">
                    {item.name}
                  </h4>

                  {/* Controles de Quantidade */}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center bg-stone-100 rounded-lg">
                      {/* Botão Diminuir */}
                      <button
                        onClick={() => removeCoffeeFromCart(item.id)}
                        className="p-1 hover:text-amber-900 transition-colors"
                      >
                        <Minus size={14} />
                      </button>

                      <span className="text-xs font-bold w-6 text-center">
                        {item.quantity}
                      </span>

                      {/* Botão Aumentar */}
                      <button
                        onClick={() => addCoffeeToCart(item)}
                        className="p-1 hover:text-amber-900 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Botão Lixeira */}
                    <button
                      onClick={() => deleteCoffeeFromCart(item.id)}
                      className="text-stone-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <span className="font-bold text-stone-900">
                  R$ {(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Footer do Carrinho (Sempre Visível) */}
        <div className="p-6 border-t border-stone-100 bg-stone-50">
          <div className="flex justify-between items-center mb-6">
            <span className="text-stone-600">Total</span>
            <span className="text-2xl font-black text-amber-950">
              R$ {formattedTotal}
            </span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={cartItems.length === 0}
            className="w-full bg-amber-950 text-white font-bold py-4 rounded-xl hover:bg-amber-900 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            Finalizar Pedido
          </button>
        </div>
      </div>
    </>
  );
}
