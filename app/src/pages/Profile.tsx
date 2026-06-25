import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../services/firebase";
import toast from "react-hot-toast";
import type { Coffee } from "../types";
import { Package, Receipt } from "lucide-react";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  userId: string;
  userName: string;
  tableNumber: string;
  total: number;
  status: "pendente" | "a caminho" | "entregue";
  createdAt: string;
  paymentMethod: string;
  items: OrderItem[];
}

// 1. COMPONENTE ISOLADO PARA O ESTOQUE
// Ele cuida de não "ficar salvando" no Firebase enquanto você ainda está digitando.
function StockCard({
  product,
  onUpdate,
}: {
  product: Coffee;
  onUpdate: (id: string, newStock: number) => void;
}) {
  const [inputValue, setInputValue] = useState(product.stock.toString());

  // Se o estoque mudar por outra tela, atualiza o campo
  useEffect(() => {
    const setInput = async () => {
      setInputValue(product.stock.toString());
    };

    setInput();
  }, [product.stock]);

  function handleSave() {
    const numericValue = parseInt(inputValue, 10);
    // Só salva se for um número válido, maior ou igual a zero, e diferente do atual
    if (!isNaN(numericValue) && numericValue >= 0) {
      if (numericValue !== product.stock) {
        onUpdate(product.id, numericValue);
      }
    } else {
      // Se apagar tudo ou colocar letra, volta pro valor que estava
      setInputValue(product.stock.toString());
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.currentTarget.blur(); // Tira o foco do input, o que aciona o onBlur (handleSave)
    }
  }

  return (
    <div className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
      <img
        src={product.image}
        alt={product.name}
        className="w-16 h-16 rounded-xl object-cover border border-stone-100"
      />

      <div className="flex-1">
        <h4 className="font-bold text-stone-800 leading-tight">
          {product.name}
        </h4>
      </div>

      <div className="flex items-center gap-1 bg-stone-50 rounded-lg p-1 border border-stone-200 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-100 transition-all">
        <button
          onClick={() => {
            setInputValue(String(product.stock - 1));
            onUpdate(product.id, product.stock - 1);
          }}
          disabled={product.stock <= 0}
          className="w-8 h-8 flex items-center justify-center font-black text-stone-600 hover:bg-white hover:text-red-600 rounded shadow-sm disabled:opacity-50 transition-colors cursor-pointer"
        >
          -
        </button>

        {/* Input manual de número */}
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          // Essas classes removem as setinhas padrão do navegador no campo type="number"
          className="w-12 h-8 text-center font-bold text-stone-800 bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />

        <button
          onClick={() => {
            setInputValue(String(product.stock + 1));
            onUpdate(product.id, product.stock + 1);
          }}
          className="w-8 h-8 flex items-center justify-center font-black text-stone-600 hover:bg-white hover:text-emerald-600 rounded shadow-sm transition-colors cursor-pointer"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function Profile() {
  const { user, loadingAuth } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [products, setProducts] = useState<Coffee[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [activeTab, setActiveTab] = useState<"pedidos" | "estoque">("pedidos");

  async function loadAllOrders() {
    try {
      setLoadingOrders(true);
      const querySnapshot = await getDocs(collection(db, "pedidos"));
      const ordersList: Order[] = [];
      querySnapshot.forEach((doc) => {
        ordersList.push({ id: doc.id, ...doc.data() } as Order);
      });
      ordersList.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setOrders(ordersList);
    } catch (error) {
      toast.error("Erro ao carregar todos os pedidos.");
      console.log(error);
    } finally {
      setLoadingOrders(false);
    }
  }

  async function loadMyOrders(uid: string) {
    try {
      setLoadingOrders(true);
      const q = query(collection(db, "pedidos"), where("userId", "==", uid));
      const querySnapshot = await getDocs(q);
      const myOrdersList: Order[] = [];
      querySnapshot.forEach((doc) => {
        myOrdersList.push({ id: doc.id, ...doc.data() } as Order);
      });
      myOrdersList.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setOrders(myOrdersList);
    } catch (error) {
      toast.error("Erro ao carregar o seu histórico.");
      console.log(error);
    } finally {
      setLoadingOrders(false);
    }
  }

  async function handleUpdateStatus(
    orderId: string,
    newStatus: "a caminho" | "entregue",
  ) {
    try {
      const orderRef = doc(db, "pedidos", orderId);
      await updateDoc(orderRef, { status: newStatus });
      toast.success("Status atualizado!");
      loadAllOrders();
    } catch (error) {
      toast.error("Erro ao atualizar status.");
      console.log(error);
    }
  }

  async function loadAllProducts() {
    try {
      setLoadingProducts(true);
      const querySnapshot = await getDocs(collection(db, "produtos"));
      const productsList: Coffee[] = [];
      querySnapshot.forEach((doc) => {
        productsList.push(doc.data() as Coffee);
      });
      setProducts(productsList);
    } catch (error) {
      toast.error("Erro ao carregar os produtos.");
      console.log(error);
    } finally {
      setLoadingProducts(false);
    }
  }

  // 2. NOVA FUNÇÃO DE ATUALIZAR ESTOQUE (Aceita o valor absoluto agora)
  async function handleSetStock(productId: string, newStock: number) {
    if (newStock < 0) return;

    try {
      const productRef = doc(db, "produtos", productId);
      await updateDoc(productRef, { stock: newStock });

      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p)),
      );
      toast.success("Estoque atualizado!", { icon: "📦" });
    } catch (error) {
      toast.error("Erro ao atualizar o estoque no banco.");
      console.log(error);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      if (user.role === "admin") {
        await loadAllOrders();
        await loadAllProducts();
      } else {
        await loadMyOrders(user.uid);
      }
    };
    fetchData();
  }, [user]);

  if (loadingAuth)
    return <p className="text-center py-20">Carregando autenticação...</p>;
  if (!user)
    return (
      <p className="text-center py-20">
        Por favor, faça login para ver esta página.
      </p>
    );

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF9]">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-10">
        <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm flex flex-col sm:flex-row items-center gap-4 mb-10">
          <img
            src={user.photoURL}
            alt={user.name}
            referrerPolicy="no-referrer"
            className="w-20 h-20 rounded-full border-4 border-amber-100"
          />
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl font-black text-stone-800">{user.name}</h1>
            <p className="text-sm text-stone-500">{user.email}</p>
            <span
              className={`inline-block mt-2 text-xs font-bold uppercase px-3 py-1 rounded-full ${user.role === "admin" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
            >
              Nível: {user.role}
            </span>
          </div>
        </div>

        {user.role === "admin" && (
          <div className="flex gap-4 mb-8 border-b border-stone-200 pb-px">
            <button
              onClick={() => setActiveTab("pedidos")}
              className={`flex items-center gap-2 px-6 py-3 font-bold text-sm transition-colors border-b-2 ${activeTab === "pedidos" ? "border-amber-950 text-amber-950" : "border-transparent text-stone-400 hover:text-stone-600"}`}
            >
              <Receipt size={18} /> Pedidos
            </button>
            <button
              onClick={() => setActiveTab("estoque")}
              className={`flex items-center gap-2 px-6 py-3 font-bold text-sm transition-colors border-b-2 ${activeTab === "estoque" ? "border-amber-950 text-amber-950" : "border-transparent text-stone-400 hover:text-stone-600"}`}
            >
              <Package size={18} /> Controle de Estoque
            </button>
          </div>
        )}

        {user.role === "admin" && activeTab === "estoque" ? (
          <div>
            <h2 className="text-2xl font-extrabold text-stone-800 mb-6">
              Gerenciar Estoque da Loja
            </h2>

            {loadingProducts ? (
              <p className="text-stone-500 animate-pulse">
                Carregando produtos...
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 3. APLICANDO O COMPONENTE NOVO */}
                {products.map((product) => (
                  <StockCard
                    key={product.id}
                    product={product}
                    onUpdate={handleSetStock}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-extrabold text-stone-800 mb-6">
              {user.role === "admin"
                ? "Pedidos em Andamento"
                : "Meu Histórico de Pedidos"}
            </h2>

            {loadingOrders ? (
              <p className="text-stone-500 animate-pulse">
                Buscando informações na nuvem...
              </p>
            ) : orders.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-stone-100 shadow-sm text-center py-12">
                <p className="text-stone-500 text-lg">
                  Nenhum pedido encontrado.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-mono text-stone-400 bg-stone-100 px-2 py-1 rounded">
                          #{order.id.substring(0, 8)}
                        </span>
                        <span className="text-xs text-stone-500 font-medium">
                          {new Date(order.createdAt).toLocaleDateString(
                            "pt-BR",
                          )}{" "}
                          às{" "}
                          {new Date(order.createdAt).toLocaleTimeString(
                            "pt-BR",
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </span>
                      </div>

                      {user.role === "admin" && (
                        <div className="mb-3">
                          <p className="text-2xl font-black text-amber-600">
                            Mesa {order.tableNumber}
                          </p>
                          <p className="font-medium text-stone-500 text-sm">
                            Cliente: {order.userName}
                          </p>
                        </div>
                      )}

                      <div className="space-y-1">
                        {order.items.map((item, index) => (
                          <p key={index} className="text-sm text-stone-600">
                            <span className="font-bold text-stone-800">
                              {item.quantity}x
                            </span>{" "}
                            {item.name}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="text-left md:text-right flex-1 md:flex-none">
                      <p className="text-xs text-stone-400 uppercase font-bold tracking-wider mb-1">
                        Pagamento
                      </p>
                      <p className="text-sm font-medium text-stone-700 uppercase mb-3">
                        {order.paymentMethod}
                      </p>
                      <p className="text-2xl font-black text-amber-950">
                        R${" "}
                        {order.total.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 w-full md:w-auto min-w-40">
                      <div
                        className={`text-center text-xs font-bold uppercase py-2 px-4 rounded-xl border ${
                          order.status === "pendente"
                            ? "bg-amber-50 text-amber-900 border-amber-200"
                            : order.status === "a caminho"
                              ? "bg-blue-50 text-blue-900 border-blue-200"
                              : "bg-emerald-50 text-emerald-900 border-emerald-200"
                        }`}
                      >
                        {order.status}
                      </div>

                      {user.role === "admin" && order.status === "pendente" && (
                        <button
                          onClick={() =>
                            handleUpdateStatus(order.id, "a caminho")
                          }
                          className="bg-amber-950 text-white text-xs font-bold py-2 rounded-xl hover:bg-amber-900 transition-colors"
                        >
                          Mesa Servida
                        </button>
                      )}
                      {user.role === "admin" &&
                        order.status === "a caminho" && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(order.id, "entregue")
                            }
                            className="bg-emerald-600 text-white text-xs font-bold py-2 rounded-xl hover:bg-emerald-700 transition-colors"
                          >
                            Finalizar Pedido
                          </button>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
