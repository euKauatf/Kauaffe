import { useState } from "react";
import { ShoppingCart, Coffee, LogIn, LogOut } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Cart from "./Cart";

export default function Header() {
  const { cartQuantity } = useCart();
  const { user, signInWithGoogle, logout } = useAuth(); // Puxe o usuário e as funções
  const [isCartOpen, setIsCartOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <header className="w-full bg-amber-950 text-amber-50 sticky top-0 z-50 shadow-lg">
        <div className="flex justify-between items-center py-4 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 cursor-pointer transition-transform hover:scale-105">
            <Coffee size={32} className="text-amber-400" strokeWidth={2.5} />
            <span className="text-2xl font-black tracking-tighter">
              <a href="/">Kauaffè</a>
            </span>
          </div>

          {/* Área Direita: Login e Carrinho */}
          <div className="flex items-center gap-4">
            {/* Lógica de Autenticação */}
            {user ? (
              <div className="flex items-center gap-3">
                <div
                  onClick={() => navigate("/perfil")}
                  className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <img
                    src={user.photoURL}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full border border-amber-800"
                  />
                  <span className="text-sm font-medium hidden md:block max-w-25 truncate">
                    {user.name.split(" ")[0]}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-amber-400 hover:bg-amber-900 rounded-lg transition-colors"
                  title="Sair"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="flex items-center gap-2 px-4 py-2 bg-amber-900/50 hover:bg-amber-900 rounded-xl text-sm font-bold transition-colors border border-amber-800"
              >
                <LogIn size={18} />
                <span className="hidden md:block">Entrar</span>
              </button>
            )}

            {/* Divisor Visual */}
            <div className="w-px h-6 bg-amber-800/50 hidden sm:block"></div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 bg-amber-900 rounded-xl hover:bg-amber-800 transition-colors flex items-center gap-2 border border-amber-800"
            >
              <ShoppingCart size={22} className="text-amber-100" />
              {cartQuantity > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-amber-950 text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md">
                  {cartQuantity}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
