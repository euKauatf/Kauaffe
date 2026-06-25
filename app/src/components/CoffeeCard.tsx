import { ShoppingCart } from "lucide-react";
import type { Coffee } from "../types";
import { useCart } from "../contexts/CartContext";

interface CoffeeCardProps {
  coffee: Coffee;
}

export default function CoffeeCard({ coffee }: CoffeeCardProps) {
  const { addCoffeeToCart } = useCart();

  const formattedPrice = coffee.price.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  });
  const isOutOfStock = coffee.stock <= 0;

  return (
    <div
      className={`bg-white rounded-3xl p-6 pt-16 shadow-lg border border-stone-100 flex flex-col items-center text-center relative mt-12 transition-all hover:-translate-y-2 hover:shadow-xl ${isOutOfStock ? "opacity-70" : ""}`}
    >
      {/* Imagem usando Absolute para não quebrar o layout */}
      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
        <img
          src={coffee.image}
          alt={coffee.name}
          referrerPolicy="no-referrer"
          className={`w-32 h-32 rounded-full object-cover shadow-xl border-4 border-white ${isOutOfStock ? "grayscale" : ""}`}
        />
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-stone-900 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full rotate-12 shadow-lg border-2 border-stone-800">
              Esgotado
            </span>
          </div>
        )}
      </div>

      {/* Tags Modernizadas */}
      <div className="flex flex-wrap justify-center gap-2 mt-2">
        {coffee.tags.map((tag) => (
          <span
            key={tag}
            className="bg-amber-50 text-amber-900 text-[10px] font-bold uppercase px-3 py-1 rounded-full border border-amber-200"
          >
            {tag}
          </span>
        ))}
      </div>

      <h3 className="text-xl font-bold text-stone-800 mt-4">{coffee.name}</h3>
      <p className="text-sm text-stone-500 mt-2 flex-1 leading-relaxed">
        {coffee.description}
      </p>

      {/* Alerta de Estoque Mais Bonito */}
      {!isOutOfStock && coffee.stock <= 3 && (
        <div className="w-full mt-4">
          <p className="text-xs font-bold text-red-600 bg-red-50 py-2 rounded-lg border border-red-100 animate-pulse">
            Corra! Restam apenas {coffee.stock} unid.
          </p>
        </div>
      )}

      {/* Rodapé do Card com Linha Divisória */}
      <div className="flex items-center justify-between w-full mt-6 pt-5 border-t border-stone-100">
        <p className="text-stone-700 flex items-baseline gap-1">
          <span className="text-sm font-medium">R$</span>
          <span className="text-3xl font-black text-amber-950">
            {formattedPrice}
          </span>
        </p>

        <button
          onClick={() => addCoffeeToCart(coffee)}
          disabled={isOutOfStock}
          className={`p-3 rounded-xl transition-all transform flex items-center justify-center ${
            isOutOfStock
              ? "bg-stone-100 text-stone-400 cursor-not-allowed"
              : "bg-amber-950 text-white hover:bg-amber-800 hover:scale-110 active:scale-95 shadow-md"
          }`}
        >
          {/* Se esgotado, mostramos um ícone vazado, senão preenchido */}
          <ShoppingCart
            size={22}
            fill={isOutOfStock ? "none" : "currentColor"}
            stroke={isOutOfStock ? "currentColor" : "none"}
          />
        </button>
      </div>
    </div>
  );
}
