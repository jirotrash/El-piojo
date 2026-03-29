import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Recycle, ShoppingBag, Heart, Share2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/ThemeProvider";
import { Sun, Moon } from "lucide-react";

type Item = {
  id: number;
  name: string;
  price: string;
  condition: string;
  tag: "Venta" | "Donación";
  size: string;
  gender: "Hombre" | "Mujer" | "Unisex";
  category: string;
  description: string;
  seller: string;
  emoji: string;
};

const allItems: Item[] = [
  { id: 1, name: "Chamarra de Mezclilla", price: "$150", condition: "Excelente", tag: "Venta", size: "M", gender: "Unisex", category: "Chamarras", description: "Chamarra de mezclilla clásica en excelente estado. Perfecta para cualquier temporada, combina con todo.", seller: "Ana G.", emoji: "🧥" },
  { id: 2, name: "Hoodie Gris Oversize", price: "$120", condition: "Muy bueno", tag: "Venta", size: "L", gender: "Unisex", category: "Hoodies", description: "Hoodie oversize súper cómodo y calientito. Color gris neutro que va con todo.", seller: "Carlos M.", emoji: "👕" },
  { id: 3, name: "Playera Vintage Band", price: "$80", condition: "Bueno", tag: "Venta", size: "S", gender: "Hombre", category: "Playeras", description: "Playera vintage de banda con un diseño retro increíble. Tela suave de algodón.", seller: "Diego R.", emoji: "👕" },
  { id: 4, name: "Tenis Blancos", price: "$200", condition: "Como nuevos", tag: "Venta", size: "28", gender: "Mujer", category: "Calzado", description: "Tenis blancos en excelente estado, casi sin uso. Ideales para el día a día.", seller: "María L.", emoji: "👟" },
  { id: 5, name: "Falda Plisada", price: "Gratis", condition: "Bueno", tag: "Donación", size: "S", gender: "Mujer", category: "Faldas", description: "Falda plisada en buen estado, perfecta para un look elegante o casual.", seller: "Laura P.", emoji: "👗" },
  { id: 6, name: "Camisa a Cuadros", price: "$90", condition: "Excelente", tag: "Venta", size: "M", gender: "Hombre", category: "Camisas", description: "Camisa de franela a cuadros, ideal para otoño. Tela gruesa y cálida.", seller: "Pedro S.", emoji: "👔" },
  { id: 7, name: "Pantalón Cargo Beige", price: "$110", condition: "Muy bueno", tag: "Venta", size: "L", gender: "Hombre", category: "Pantalones", description: "Pantalón cargo beige con múltiples bolsillos. Muy versátil y cómodo.", seller: "Jorge H.", emoji: "👖" },
  { id: 8, name: "Vestido Floral", price: "$130", condition: "Excelente", tag: "Venta", size: "M", gender: "Mujer", category: "Vestidos", description: "Vestido floral perfecto para primavera. Tela ligera y estampado hermoso.", seller: "Sofía T.", emoji: "👗" },
  { id: 9, name: "Sudadera Nike", price: "Gratis", condition: "Bueno", tag: "Donación", size: "XL", gender: "Unisex", category: "Hoodies", description: "Sudadera Nike en buen estado. Perfecta para hacer ejercicio o uso diario.", seller: "Andrés V.", emoji: "👕" },
  { id: 10, name: "Blusa Bordada", price: "$95", condition: "Como nueva", tag: "Venta", size: "S", gender: "Mujer", category: "Blusas", description: "Blusa con bordado artesanal mexicano. Pieza única y hermosa.", seller: "Elena F.", emoji: "👚" },
  { id: 11, name: "Shorts Deportivos", price: "$60", condition: "Bueno", tag: "Venta", size: "M", gender: "Hombre", category: "Shorts", description: "Shorts deportivos cómodos y ligeros. Perfectos para el gimnasio.", seller: "Raúl C.", emoji: "🩳" },
  { id: 12, name: "Chaqueta de Piel", price: "$250", condition: "Excelente", tag: "Venta", size: "L", gender: "Unisex", category: "Chamarras", description: "Chaqueta de piel genuina en excelente condición. Un clásico atemporal.", seller: "Fernanda D.", emoji: "🧥" },
];

type ChatMessage = { from: "user" | "seller"; text: string };

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

const sellerResponses = [
  "¡Hola! Claro, la prenda está disponible 😊",
  "¡Sí! Te la puedo apartar si gustas",
  "Podemos vernos en campus para que la veas",
  "¡Claro! ¿Tienes alguna otra pregunta?",
  "Te mando fotos extra por DM si quieres 📸",
];

const ProductDetail = () => {
  const { theme, toggleTheme } = useTheme();
  const { id } = useParams<{ id: string }>();
  const item = allItems.find((i) => i.id === Number(id));

  const [messages, setMessages] = useState<ChatMessage[]>([
    { from: "seller", text: "¡Hola! ¿Te interesa esta prenda? Pregúntame lo que quieras 😊" },
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!item) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">😿</p>
          <p className="font-display font-bold text-xl text-foreground">Producto no encontrado</p>
          <Link to="/catalogo" className="mt-4 inline-block font-body text-primary hover:underline">
            ← Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMessages: ChatMessage[] = [...messages, { from: "user", text: input }];
    setMessages(newMessages);
    setInput("");

    setTimeout(() => {
      const response = sellerResponses[Math.floor(Math.random() * sellerResponses.length)];
      setMessages((prev) => [...prev, { from: "seller", text: response }]);
    }, 800 + Math.random() * 1200);
  };

  const gradient = gradientByCategory[item.category] || "from-primary/20 to-accent/20";

  return (
    <div className="min-h-screen bg-background transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/catalogo" className="p-2 rounded-full bg-muted text-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <Link to="/" className="flex items-center gap-2">
            <Recycle className="text-primary" size={24} />
            <span className="font-display font-bold text-lg text-foreground">PIOJO</span>
          </Link>
          <div className="flex-1" />
          <button onClick={toggleTheme} className="p-2 rounded-full bg-muted text-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product info */}
          <div>
            {/* Image placeholder */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`bg-gradient-to-br ${gradient} rounded-3xl aspect-square flex items-center justify-center border border-border`}
            >
              <span className="text-[120px] md:text-[160px]">{item.emoji}</span>
            </motion.div>

            {/* Details */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-6">
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">{item.name}</h1>
                <span className={`text-sm font-display font-bold px-4 py-1.5 rounded-full shrink-0 ${item.tag === "Donación" ? "bg-gradient-donate text-primary-foreground" : "bg-gradient-hero text-primary-foreground"}`}>
                  {item.tag}
                </span>
              </div>

              <p className="text-4xl font-display font-bold text-primary mt-3">{item.price}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-body font-semibold">Talla: {item.size}</span>
                <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-body font-semibold">{item.gender}</span>
                <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-body font-semibold">{item.category}</span>
                <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-body font-semibold">Estado: {item.condition}</span>
              </div>

              <p className="mt-5 font-body text-foreground/80 leading-relaxed">{item.description}</p>

              <div className="mt-5 flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground font-display font-bold">
                  {item.seller[0]}
                </div>
                <div>
                  <p className="font-display font-bold text-foreground text-sm">Vendedor</p>
                  <p className="font-body text-muted-foreground text-sm">{item.seller}</p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button variant="outline" size="icon" className="rounded-full">
                  <Heart size={18} />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Share2 size={18} />
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Chat */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex flex-col">
            <div className="bg-card rounded-3xl border border-border shadow-card flex flex-col h-[500px] lg:h-[600px]">
              {/* Chat header */}
              <div className="p-4 border-b border-border flex items-center gap-3">
                <MessageCircle className="text-primary" size={20} />
                <div>
                  <p className="font-display font-bold text-foreground text-sm">Chat con {item.seller}</p>
                  <p className="font-body text-muted-foreground text-xs">Vendedor • En línea</p>
                </div>
                <div className="ml-auto w-2.5 h-2.5 rounded-full bg-green-500" />
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] px-4 py-2.5 rounded-2xl font-body text-sm ${
                        msg.from === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-border">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                  }}
                  className="flex gap-2"
                >
                  <Input
                    placeholder="Escribe un mensaje..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="rounded-full font-body"
                  />
                  <Button type="submit" size="icon" className="rounded-full shrink-0">
                    <Send size={16} />
                  </Button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
