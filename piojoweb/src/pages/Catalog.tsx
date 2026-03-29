import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, ArrowLeft, Recycle } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { Sun, Moon } from "lucide-react";
import usePublicacionesApi from "./Dashboard/hooks/usePublicacionesApi";

type Item = {
  id: number;
  name: string;
  price: string;
  condition: string;
  tag: "Venta" | "Donación";
  size: string;
  gender: "Hombre" | "Mujer" | "Unisex";
  category: string;
  emoji: string;
};

// We'll map publicaciones from backend into Item shape below

const sizes = ["XS", "S", "M", "L", "XL", "28", "30"];
const genders = ["Hombre", "Mujer", "Unisex"];

const gradientByCategory: Record<string, string> = {
  Chamarras: "from-amber-800/20 to-orange-600/20",
  Hoodies: "from-gray-500/20 to-slate-400/20",
  Playeras: "from-indigo-500/20 to-purple-400/20",
  Calzado: "from-sky-400/20 to-cyan-300/20",
  Faldas: "from-pink-400/20 to-rose-300/20",
  Camisas: "from-red-500/20 to-orange-400/20",
  Pantalones: "from-yellow-700/20 to-amber-500/20",
  Vestidos: "from-fuchsia-400/20 to-pink-300/20",
  Blusas: "from-emerald-400/20 to-teal-300/20",
  Shorts: "from-blue-400/20 to-indigo-300/20",
};

const Catalog = () => {
  const { theme, toggleTheme } = useTheme();
  const { data: publicacionesData = [], loading: publicacionesLoading } = usePublicacionesApi();
  const [search, setSearch] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const toggleFilter = (value: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  // Map backend publicaciones into the UI item shape
  const mappedItems: Item[] = publicacionesData.map((p: any) => {
    const priceRaw = p.precio ?? null;
    const price = priceRaw === null || priceRaw === 0 || priceRaw === '0' ? 'Gratis' : String(priceRaw).startsWith('$') ? String(priceRaw) : `$${String(priceRaw)}`;
    const tag = (price === 'Gratis' || !priceRaw) ? 'Donación' : 'Venta';
    const emojiByCat: Record<string,string> = {
      Chamarras: '🧥', Hoodies: '👕', Playeras: '👕', Calzado: '👟', Faldas: '👗', Camisas: '👔', Pantalones: '👖', Vestidos: '👗', Blusas: '👚', Shorts: '🩳'
    };
    return {
      id: Number(p.id_publicaciones ?? p.id),
      name: p.titulo ?? p.descripcion ?? 'Sin título',
      price,
      condition: p.estado_uso ?? '',
      tag: tag as 'Venta' | 'Donación',
      size: p.talla ?? '',
      gender: p.genero ?? 'Unisex',
      category: p.categoria ?? 'Varios',
      emoji: emojiByCat[p.categoria] ?? '🧺',
    } as Item;
  });

  const filtered = useMemo(() => {
    return mappedItems.filter((item) => {
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.category.toLowerCase().includes(search.toLowerCase());
      const matchSize = selectedSizes.length === 0 || selectedSizes.includes(item.size);
      const matchGender = selectedGenders.length === 0 || selectedGenders.includes(item.gender);
      return matchSearch && matchSize && matchGender;
    });
  }, [search, selectedSizes, selectedGenders, mappedItems]);

  const activeFilters = selectedSizes.length + selectedGenders.length;

  return (
    <div className="min-h-screen bg-background transition-colors">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/" className="p-2 rounded-full bg-muted text-foreground hover:bg-primary hover:text-primary-foreground transition-colors shrink-0">
            <ArrowLeft size={18} />
          </Link>
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <Recycle className="text-primary" size={24} />
            <span className="font-display font-bold text-lg text-foreground">PIOJO</span>
          </Link>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Buscar prendas, categorías..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-full border-border bg-muted/50 font-body"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="rounded-full font-display relative shrink-0">
            <SlidersHorizontal size={16} />
            <span className="hidden sm:inline ml-1">Filtros</span>
            {activeFilters > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                {activeFilters}
              </span>
            )}
          </Button>
          <button onClick={toggleTheme} className="p-2 rounded-full bg-muted text-foreground hover:bg-primary hover:text-primary-foreground transition-colors shrink-0">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* Filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-border">
              <div className="container mx-auto px-4 py-4 space-y-4">
                <div>
                  <h3 className="font-display font-bold text-sm text-foreground mb-2">Talla</h3>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button key={size} onClick={() => toggleFilter(size, selectedSizes, setSelectedSizes)} className={`px-3 py-1.5 rounded-full text-sm font-body font-semibold transition-colors ${selectedSizes.includes(size) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-foreground mb-2">Sexo</h3>
                  <div className="flex flex-wrap gap-2">
                    {genders.map((g) => (
                      <button key={g} onClick={() => toggleFilter(g, selectedGenders, setSelectedGenders)} className={`px-3 py-1.5 rounded-full text-sm font-body font-semibold transition-colors ${selectedGenders.includes(g) ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                {activeFilters > 0 && (
                  <button onClick={() => { setSelectedSizes([]); setSelectedGenders([]); }} className="text-sm font-body text-destructive hover:underline">
                    Limpiar filtros
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Results */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-4xl font-display font-bold text-foreground">
            Catálogo <span className="text-gradient-hero">Completo</span>
          </h1>
          <span className="text-sm font-body text-muted-foreground">
            {filtered.length} prenda{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <p className="text-5xl mb-4">😿</p>
            <p className="font-display font-bold text-xl text-foreground">No encontramos prendas</p>
            <p className="font-body text-muted-foreground mt-2">Intenta con otros filtros o busca algo diferente</p>
          </motion.div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((item, i) => {
              const gradient = gradientByCategory[item.category] || "from-primary/20 to-accent/20";
              return (
                <motion.div
                  key={item.id}
                  className="bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-all hover:-translate-y-1 cursor-pointer overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  {/* Image preview */}
                  <div className={`bg-gradient-to-br ${gradient} h-40 flex items-center justify-center`}>
                    <span className="text-6xl">{item.emoji}</span>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-display font-bold text-foreground truncate">{item.name}</h3>
                        <p className="text-muted-foreground text-sm font-body mt-1">Estado: {item.condition}</p>
                      </div>
                      <span className={`text-xs font-display font-bold px-3 py-1 rounded-full shrink-0 ${item.tag === "Donación" ? "bg-gradient-donate text-primary-foreground" : "bg-gradient-hero text-primary-foreground"}`}>
                        {item.tag}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs font-body font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{item.size}</span>
                      <span className="text-xs font-body font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{item.gender}</span>
                      <span className="text-xs font-body font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{item.category}</span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-display font-bold text-xl text-primary">{item.price}</span>
                      <Link to={`/producto/${item.id}`} className="font-body font-semibold text-sm text-primary hover:underline">
                        Me interesa →
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Catalog;
