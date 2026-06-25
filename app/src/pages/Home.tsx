import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CoffeeCard from "../components/CoffeeCard";
import type { Coffee } from "../types";
import {
  Search,
  Coffee as CoffeeIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";

export default function Home() {
  const [firebaseCoffees, setFirebaseCoffees] = useState<Coffee[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("todos");

  const [currentPage, setCurrentPage] = useState(1);

  // 1. Estado inteligente que começa lendo o tamanho da tela do usuário
  const [itemsPerPage, setItemsPerPage] = useState(
    window.innerWidth < 768 ? 3 : 8,
  );

  // 2. Resolvemos o primeiro erro colocando a função dentro do próprio useEffect
  useEffect(() => {
    const loadProductsFromFirebase = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "produtos"));
        const productsList: Coffee[] = [];
        querySnapshot.forEach((doc) => {
          productsList.push({ id: doc.id, ...doc.data() } as Coffee);
        });
        setFirebaseCoffees(productsList);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProductsFromFirebase();
  }, []);

  // 3. Efeito novo: Fica "ouvindo" se o usuário virou o celular ou redimensionou a janela
  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth < 768 ? 3 : 8);
      setCurrentPage(1); // Volta para o início se o layout mudar bruscamente
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // OBS: O useEffect que monitorava a busca foi apagado para resolver o segundo erro!

  const allTags = [
    "todos",
    ...Array.from(new Set(firebaseCoffees.flatMap((coffee) => coffee.tags))),
  ];

  const filteredCoffees = firebaseCoffees.filter((coffee) => {
    const matchesSearch = coffee.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesTag =
      selectedTag === "todos" || coffee.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const totalPages = Math.ceil(filteredCoffees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCoffees = filteredCoffees.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF9]">
      <Header />

      <main className="flex-1 w-full pb-12">
        <section className="bg-amber-100/50 w-full py-12 md:py-20 mb-16 shadow-[inset_0_-10px_20px_rgba(0,0,0,0.02)]">
          <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 space-y-6 text-center md:text-left">
              <span className="bg-amber-200 text-amber-900 text-sm font-bold uppercase px-4 py-1.5 rounded-full inline-block mb-2">
                Autoatendimento
              </span>
              <h1 className="text-5xl md:text-6xl font-extrabold text-stone-900 tracking-tight leading-tight">
                Faça o pedido <br className="hidden md:block" /> direto da sua
                mesa.
              </h1>
              <p className="text-lg text-stone-600 max-w-xl mx-auto md:mx-0">
                Esscolha seus cafés especiais e nós preparamos tudo para você
                com grãos rigorosamente selecionados!
              </p>
            </div>

            <div className="flex-1 flex justify-center w-full mt-8 md:mt-0">
              <img
                src="https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=600&q=80"
                alt="Café Especial"
                className="w-64 h-64 md:w-80 md:h-80 object-cover rounded-full shadow-2xl border-8 border-white transform hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-16">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
            <h2 className="text-3xl font-extrabold text-stone-800">
              Nosso cardápio
            </h2>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative flex-1 sm:w-72">
                <input
                  type="text"
                  placeholder="Buscar café..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // 4. A correção está aqui! (Junto com a digitação)
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100 transition-all shadow-sm"
                />
                <Search
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSelectedTag(tag);
                      setCurrentPage(1); // 5. E a correção também está aqui! (Junto com o clique)
                    }}
                    className={`px-4 py-2 rounded-xl text-sm font-bold uppercase transition-colors whitespace-nowrap border ${
                      selectedTag === tag
                        ? "bg-amber-950 text-amber-50 border-amber-950"
                        : "bg-white text-stone-500 border-stone-200 hover:border-amber-950 hover:text-amber-950"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <p className="text-stone-500 font-medium animate-pulse">
                Carregando cardápio direto da nuvem...
              </p>
            </div>
          ) : (
            <>
              {filteredCoffees.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-stone-100 shadow-sm">
                  <CoffeeIcon size={48} className="text-stone-300 mb-4" />
                  <h3 className="text-xl font-bold text-stone-800">
                    Nenhum café encontrado
                  </h3>
                  <p className="text-stone-500 mt-2">
                    Tente buscar por um nome diferente ou mude a categoria
                    selecionada.
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedTag("todos");
                      setCurrentPage(1);
                    }}
                    className="mt-6 text-amber-600 font-bold hover:text-amber-700 underline"
                  >
                    Limpar filtros
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 gap-y-16">
                    {currentCoffees.map((coffee) => (
                      <CoffeeCard key={coffee.id} coffee={coffee} />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-20 pt-8 border-t border-stone-200">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                        className="p-3 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 hover:border-amber-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft size={20} className="text-stone-600" />
                      </button>

                      <span className="text-stone-600 font-medium">
                        Página{" "}
                        <strong className="text-amber-950">
                          {currentPage}
                        </strong>{" "}
                        de {totalPages}
                      </span>

                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1),
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="p-3 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 hover:border-amber-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight size={20} className="text-stone-600" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
