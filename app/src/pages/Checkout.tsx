import { useState } from "react";
import { MapPin, CreditCard, DollarSign, CheckCircle2 } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import toast from "react-hot-toast";

export default function Checkout() {
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  // 1. Trocamos o endereço por um simples número de mesa
  const [tableNumber, setTableNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "cartao" | "pix" | "dinheiro"
  >("cartao");

  // 2. Não temos mais taxa de entrega (deliveryFee)
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  async function handleConfirmOrder() {
    if (cartItems.length === 0) return;

    if (!tableNumber) {
      toast.error("Por favor, informe o número da sua mesa.", {
        style: {
          background: "#fef2f2",
          color: "#991b1b",
          border: "1px solid #fecaca",
        },
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const newOrder = {
        userId: user?.uid || "anonimo",
        userName: user?.name || "Cliente da Loja",
        tableNumber: tableNumber, // 3. Salvamos a mesa no Firebase
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        paymentMethod: paymentMethod,
        total: cartTotal, // Usamos o total sem frete
        status: "pendente",
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "pedidos"), newOrder);

      for (const item of cartItems) {
        const productRef = doc(db, "produtos", item.id);
        const novoEstoque = item.stock - item.quantity;
        await updateDoc(productRef, { stock: novoEstoque });
      }

      clearCart();
      setOrderComplete(true);
    } catch (error) {
      console.error("Erro ao salvar o pedido: ", error);
      toast.error("Houve um erro ao processar seu pedido. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFAF9] items-center justify-center p-4 text-center">
        <CheckCircle2 size={80} className="text-emerald-500 mb-6" />
        <h1 className="text-4xl font-black text-stone-800 mb-4">
          Pedido na Cozinha!
        </h1>
        <p className="text-stone-600 mb-8 max-w-md">
          Tudo certo! Estamos preparando o seu pedido e logo o garçom levará até
          a <strong>Mesa {tableNumber}</strong>.
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-amber-950 text-amber-50 font-bold py-3 px-8 rounded-xl hover:bg-amber-900 transition-colors"
        >
          Voltar para o Cardápio
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF9]">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-8 py-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-6">
          <h2 className="text-2xl font-bold text-stone-800 mb-4">
            Finalizar Pedido
          </h2>

          {/* Box de Localização na Loja */}
          <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex gap-3 mb-6">
              <MapPin className="text-amber-600 mt-1" size={24} />
              <div>
                <h3 className="text-stone-800 font-bold text-lg">
                  Onde você está sentado?
                </h3>
                <p className="text-sm text-stone-500">
                  O garçom levará o pedido até você.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">
                Número da Mesa
              </label>
              <input
                type="number"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="Ex: 05"
                className="p-4 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100 w-full text-xl font-bold text-stone-800 placeholder:font-normal placeholder:text-stone-400"
              />
            </div>
          </div>

          {/* Box de Pagamento */}
          <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex gap-3 mb-6">
              <DollarSign className="text-amber-600 mt-1" size={24} />
              <div>
                <h3 className="text-stone-800 font-bold text-lg">Pagamento</h3>
                <p className="text-sm text-stone-500">
                  O pagamento será feito direto na mesa.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => setPaymentMethod("cartao")}
                className={`flex items-center justify-center gap-2 p-4 border rounded-xl text-sm font-bold uppercase transition-colors ${paymentMethod === "cartao" ? "border-amber-600 bg-amber-50 text-amber-900" : "border-stone-200 text-stone-600 hover:bg-stone-50"}`}
              >
                <CreditCard size={18} /> Cartão
              </button>
              <button
                onClick={() => setPaymentMethod("pix")}
                className={`p-4 border rounded-xl text-sm font-bold uppercase transition-colors ${paymentMethod === "pix" ? "border-amber-600 bg-amber-50 text-amber-900" : "border-stone-200 text-stone-600 hover:bg-stone-50"}`}
              >
                PIX
              </button>
              <button
                onClick={() => setPaymentMethod("dinheiro")}
                className={`p-4 border rounded-xl text-sm font-bold uppercase transition-colors ${paymentMethod === "dinheiro" ? "border-amber-600 bg-amber-50 text-amber-900" : "border-stone-200 text-stone-600 hover:bg-stone-50"}`}
              >
                Dinheiro
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm sticky top-32">
            <h3 className="text-xl font-bold text-stone-800 mb-6">
              Resumo do Pedido
            </h3>

            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center pb-4 border-b border-stone-100"
                >
                  <div className="flex gap-4 items-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <div>
                      <p className="text-stone-800 font-bold text-sm">
                        {item.name}
                      </p>
                      <p className="text-xs text-stone-500">
                        Qtd: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-stone-900">
                    R${" "}
                    {(item.price * item.quantity).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between text-2xl font-black text-amber-950 pt-4 border-t border-stone-100 mb-8">
              <span>Total</span>
              <span>
                R${" "}
                {cartTotal.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>

            <button
              onClick={handleConfirmOrder}
              disabled={isSubmitting || cartItems.length === 0}
              className="w-full bg-amber-950 text-amber-50 font-bold text-lg py-4 rounded-xl hover:bg-amber-900 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center shadow-lg shadow-amber-900/20"
            >
              {isSubmitting ? "Enviando para a cozinha..." : "Confirmar Pedido"}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
