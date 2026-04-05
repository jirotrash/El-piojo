import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Recycle, ShoppingBag, Heart, Share2, MessageCircle, ChevronLeft, ChevronRight, X, ShoppingCart, CreditCard, Banknote, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { Sun, Moon } from "lucide-react";
import usePublicacionesApi from "./Dashboard/hooks/usePublicacionesApi";
import useConversacionesApi from "./Dashboard/hooks/useConversacionesApi";
import useDetalleMensajesApi from "./Dashboard/hooks/useDetalleMensajesApi";
import useUsuarioApi from "./Dashboard/hooks/useUsuarioApi";
import useMensajesMutations from "./Dashboard/hooks/useMensajesMutations";
import usePagosMutations from "./Dashboard/hooks/usePagosMutations";
import usePublicacionesMutations from "./Dashboard/hooks/usePublicacionesMutations";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "@/hooks/use-toast";
import MessageList from "@/components/chat/MessageList";
import normalizeImageUrl from '@/lib/normalizeImageUrl';
import piojoLogo from '@/assets/piojo-logo.png';
import type { ChatMessage as NormalizedChatMessage } from "@/components/chat/MessageList";
import ChatInput from "@/components/chat/ChatInput";

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
  images?: string[];
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
  const { data: publicacionesData = [], loading: publicacionesLoading } = usePublicacionesApi();
  const { data: conversacionesData = [], refetch: refetchConvs } = useConversacionesApi();
  const { data: mensajesData = [], refetch: refetchMensajes } = useDetalleMensajesApi();
  const { data: usuariosData = [], refetch: refetchUsuarios } = useUsuarioApi(1, 10000);
  const { createConversacion, createDetalleMensaje } = useMensajesMutations();
  const { createPago } = usePagosMutations();
  const { updatePublicacion } = usePublicacionesMutations();
  const { token, user: authUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Purchase modal state
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyStep, setBuyStep] = useState<'method' | 'confirm' | 'success'>('method');
  const [metodoPago, setMetodoPago] = useState<'EFECTIVO' | 'TRANSFERENCIA'>('EFECTIVO');
  const [buyLoading, setBuyLoading] = useState(false);

  const idNum = Number(id);

  // Try to find a backend publication first; fall back to static list
  const pub = publicacionesData.find((p: any) => Number(p.id_publicaciones ?? p.id) === idNum);

  const item = (function () {
      if (pub) {
        const priceRaw = pub.precio ?? null;
        const price = priceRaw === null || priceRaw === 0 ? 'Gratis' : String(priceRaw).startsWith('$') ? String(priceRaw) : `$${String(priceRaw)}`;
        const tag = (price === 'Gratis' || !priceRaw) ? 'Donación' : 'Venta';
        const detalles = pub.detallePublicaciones || [];

        const images = Array.isArray(detalles) && detalles.length > 0
          ? detalles.map((d: any) => normalizeImageUrl(d?.url_foto ?? d?.url ?? d)).filter(Boolean) as string[]
          : [];

        return {
          id: idNum,
          name: pub.titulo ?? pub.descripcion ?? 'Sin título',
          price,
          condition: pub.estado_uso ?? '',
          tag: tag as 'Venta' | 'Donación',
          size: pub.talla ?? '',
          gender: pub.genero ?? 'Unisex',
          category: pub.categoria ?? 'Varios',
          description: pub.descripcion ?? '',
          seller: String(pub.id_usuarios ?? 'Vendedor'),
          emoji: '🧺',
          images,
        } as any;
      }
    // no PRODUCTOS fallback anymore; rely on backend `publicaciones` or static `allItems`
    return allItems.find((i) => i.id === idNum);
  })();

  const [messages, setMessages] = useState<NormalizedChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [convId, setConvId] = useState<number | string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // MessageList component handles scrolling to bottom when messages change

  // derive current user id/email from token similar to Navbar
  let tokenEmail: string | null = null;
  let tokenSub: string | null = null;
  if (token) {
    try {
      if ((token.match(/\./g) || []).length === 2) {
        const parts = token.split('.');
        const payload = parts[1];
        const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
        const json = atob(b64 + pad);
        const obj = JSON.parse(json);
        tokenEmail = obj.email || null;
        tokenSub = obj.sub ? String(obj.sub) : null;
      } else {
        const decoded = atob(token);
        const p = decoded.split(":");
        if (p && p[0] && p[0].includes("@")) tokenEmail = p[0];
      }
    } catch (e) {
      tokenEmail = null;
      tokenSub = null;
    }
  }

  const currentUser = (() => {
    if (authUser) return authUser;
    if (!usuariosData || usuariosData.length === 0) return null;
    if (tokenSub) {
      const byId = usuariosData.find((u: any) => String(u.id_usuarios ?? u.id) === String(tokenSub));
      if (byId) return byId;
    }
    if (tokenEmail) {
      const byEmail = usuariosData.find((u: any) => (u.email || '').toLowerCase() === tokenEmail?.toLowerCase());
      if (byEmail) return byEmail;
    }
    return null;
  })();

  // derive seller id and name (use usuariosData when available)
  const sellerId: number | null = (() => {
    try {
      if (pub && (pub.id_usuarios != null)) return Number(pub.id_usuarios);
      const parsed = Number((item as any)?.seller);
      return !isNaN(parsed) ? parsed : null;
    } catch (e) { return null; }
  })();

  const sellerUser = (usuariosData || []).find((u: any) => String(u.id ?? u.id_usuarios) === String(pub?.id_usuarios ?? (item as any)?.seller));
  const sellerName = sellerUser?.nombre ?? ((item as any)?.seller ?? 'Vendedor');

  // When opening chat, try to create a conversation on server with correct seller/buyer ids; fallback to localStorage.
  useEffect(() => {
    if (!showChat) return;
    let mounted = true;
    const normalize = (m: any): NormalizedChatMessage => {
      if (!m) return { text: '', from: 'seller' } as NormalizedChatMessage;
      if (typeof m === 'string') return { text: m, from: 'seller', senderId: sellerId ?? null, senderName: sellerName ?? null, createdAt: null } as NormalizedChatMessage;
      if (typeof m === 'object') {
        const text = m.mensaje ?? m.text ?? m.message ?? m.body ?? '';
        const createdAt = m.fecha_envio ?? m.createdAt ?? m.fecha ?? null;
        const id_emisor = m.id_emisor ?? m.emisor ?? m.senderId ?? null;
        const id_detalle = m.id_detalle_mensajes ?? m.id ?? null;
        const from = id_emisor != null
          ? (String(id_emisor) === String(currentUser?.id ?? currentUser?.id_usuarios) ? 'user' : 'seller')
          : (m.from ?? 'seller');
        const senderId = id_emisor ?? (from === 'user' ? (currentUser?.id ?? currentUser?.id_usuarios ?? null) : (sellerId ?? null));
        const senderName = m.senderName ?? (from === 'user' ? (currentUser?.nombre ?? currentUser?.email ?? 'Tú') : (sellerName ?? null));
        return { id: id_detalle, text, from, senderId, senderName, createdAt: createdAt ? String(createdAt) : null } as NormalizedChatMessage;
      }
      return { text: String(m), from: 'seller', senderId: sellerId ?? null, senderName: sellerName ?? null, createdAt: null } as NormalizedChatMessage;
    };

    (async () => {
      try {
        const sid = sellerId;
        const curId = Number(currentUser?.id ?? currentUser?.id_usuarios);

        // If we can identify both participants, attempt to create (or reuse) a server conversation
        if (sid != null && curId && createConversacion) {
          try {
            const input = { id_publicaciones: Number(idNum), id_vendedor: Number(sid), id_comprador: Number(curId) };
            const created = await createConversacion(input);
            if (mounted && created) {
              const newId = created.id_conversaciones ?? created.id;
              setConvId(newId);
              // Start with a greeting while server-side messages are not queryable per-conversation
              setMessages([{ id: `greeting_${Date.now()}`, text: '¡Hola! Pregúntame lo que quieras sobre esta publicación 😊', from: 'seller', senderId: sellerId ?? null, senderName: sellerName ?? null, createdAt: new Date().toISOString() }]);
              try { refetchConvs && refetchConvs(); refetchMensajes && refetchMensajes(); } catch {}
              return;
            }
          } catch (e) {
            // ignore and fallback to local
          }
        }

        // Local fallback: key contains publication id, current user and seller id/name
        const localKey = `local_conv_pub_${idNum}_u${currentUser?.id ?? currentUser?.id_usuarios ?? 'anon'}_s${sellerId ?? (item as any).seller}`;
        setConvId(localKey);
        const stored = localStorage.getItem(localKey);
        if (stored) {
          try {
            const arr = JSON.parse(stored);
            if (Array.isArray(arr)) setMessages(arr.map((m: any) => normalize(m)));
          } catch {}
        } else {
          setMessages([{ id: `greeting_${Date.now()}`, text: '¡Hola! Pregúntame lo que quieras sobre esta publicación 😊', from: 'seller', senderId: sellerId ?? null, senderName: sellerName ?? null, createdAt: new Date().toISOString() }]);
        }
      } catch (e) {
        // noop
      }
    })();
    return () => { mounted = false; };
  }, [showChat, createConversacion, currentUser, sellerId, (item as any).seller, idNum]);

  if (!item) {
    if (publicacionesLoading) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl mb-4">Cargando producto…</p>
          </div>
        </div>
      );
    }
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

  const sendMessageText = async (textArg?: string) => {
    const raw = (textArg ?? input ?? '').trim();
    if (!raw) return;
    if (!currentUser) {
      toast({ title: 'Inicia sesión', description: 'Necesitas iniciar sesión para enviar mensajes.' });
      navigate('/login', { state: { from: location } });
      return;
    }
    setInput('');

    // If we have a numeric convId, try to send to server (include id_emisor)
    if (convId && typeof convId === 'number') {
      try {
        const payload = { id_conversaciones: Number(convId), id_emisor: Number(currentUser?.id ?? currentUser?.id_usuarios), mensaje: raw };
        const res = await createDetalleMensaje(payload);
        const msgObj: NormalizedChatMessage = {
          id: res?.id_detalle_mensajes ?? undefined,
          text: res?.mensaje ?? raw,
          from: 'user',
          senderId: Number(currentUser?.id ?? currentUser?.id_usuarios),
          senderName: (currentUser as any)?.nombre ?? (currentUser as any)?.email ?? 'Tú',
          createdAt: res?.fecha_envio ?? new Date().toISOString(),
        };
        setMessages((prev) => [...prev, msgObj]);
        try {
          await Promise.all([
            refetchMensajes && refetchMensajes(),
            refetchConvs && refetchConvs(),
            refetchUsuarios && refetchUsuarios(),
          ]);
        } catch (err) {
          // ignore refetch errors
        }
        return;
      } catch (e) {
        // fallback to local storage below
      }
    }

    // Local fallback: store messages in localStorage under convId key
    const key = String(convId ?? `local_conv_pub_${idNum}_u${currentUser?.id ?? currentUser?.id_usuarios ?? 'anon'}_s${sellerId ?? (item as any).seller}`);
    try {
      const stored = JSON.parse(localStorage.getItem(key) || '[]');
      const newMsg: NormalizedChatMessage = {
        id: `local_${Date.now()}`,
        text: raw,
        from: 'user',
        senderId: Number(currentUser?.id ?? currentUser?.id_usuarios),
        senderName: (currentUser as any)?.nombre ?? (currentUser as any)?.email ?? 'Tú',
        createdAt: new Date().toISOString(),
      };
      const newStored = [...(Array.isArray(stored) ? stored : []), newMsg];
      localStorage.setItem(key, JSON.stringify(newStored));
      setMessages((prev) => [...prev, newMsg]);
    } catch (e) {
      // ignore
      setMessages((prev) => [...prev, { text: raw, from: 'user', senderId: Number(currentUser?.id ?? currentUser?.id_usuarios), senderName: (currentUser as any)?.nombre ?? (currentUser as any)?.email ?? 'Tú', createdAt: new Date().toISOString() } as NormalizedChatMessage]);
    }
  };

  const handleBuy = async () => {
    if (!currentUser) {
      toast({ title: 'Inicia sesión', description: 'Necesitas iniciar sesión para comprar.' });
      navigate('/login', { state: { from: location } });
      return;
    }
    const userId = Number(currentUser?.id_usuarios ?? currentUser?.id);
    const sellerId = Number(pub?.id_usuarios ?? (item as any)?.seller);
    if (sellerId && userId && sellerId === userId) {
      toast({ title: 'No puedes comprar tu propio producto', description: 'Eres el vendedor de este artículo.' });
      return;
    }
    setBuyLoading(true);
    try {
      const priceNum = parseFloat(
        String(pub?.precio ?? (item as any)?.price ?? '0').replace(/[^0-9.]/g, '')
      ) || 0;
      const pago = await createPago({
        id_usuarios_pagador: userId,
        total: priceNum,
        total_con_descuento: priceNum,
        metodo_pago: metodoPago,
        estado: 'PENDIENTE',
      });
      if (pago?.id_pagos) {
        // Mark publication as sold/unavailable
        try { await updatePublicacion(idNum, { disponible: false }); } catch (_) { /* non-critical */ }
        // Persist purchase in localStorage for "Mis compras" tab
        try {
          const storageKey = `purchases_${userId}`;
          const prev = JSON.parse(localStorage.getItem(storageKey) || '[]');
          const entry = {
            id_publicaciones: idNum,
            titulo: pub?.titulo || (item as any)?.name || 'Producto',
            precio: priceNum,
            metodo_pago: metodoPago,
            fecha: new Date().toISOString(),
            foto: pub?.detallePublicaciones?.find((d: any) => d.es_portada)?.url_foto
              || pub?.detallePublicaciones?.[0]?.url_foto || null,
          };
          localStorage.setItem(storageKey, JSON.stringify([...prev, entry]));
        } catch (_) { /* ignore */ }
      }
      setBuyStep('success');
    } catch (e: any) {
      toast({ title: 'Error al procesar compra', description: e?.message ?? 'Intenta de nuevo.' });
    } finally {
      setBuyLoading(false);
    }
  };

  function timeAgo(date?: string | null) {
    if (!date) return 'Ahora';
    const d = new Date(date).getTime();
    const now = Date.now();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 10) return 'Ahora';
    if (diff < 60) return `Hace ${diff} seg`;
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `Hace ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Hace ${hours} h`;
    const days = Math.floor(hours / 24);
    return `Hace ${days} d`;
  }

  const gradient = gradientByCategory[item.category] || "from-primary/20 to-accent/20";

  const images: string[] = (item as any).images ?? ((item as any).image ? [(item as any).image] : []);

  useEffect(() => {
    setCurrentIndex(0);
  }, [item?.id]);

  // Auto-advance gallery every 4s when not hovered
  useEffect(() => {
    if (!images || images.length <= 1) return;
    if (isHovered) return;
    const t = setInterval(() => {
      setCurrentIndex((idx) => (idx + 1) % images.length);
    }, 4000);
    return () => clearInterval(t);
  }, [images, isHovered]);

  const lastMsg = messages && messages.length ? messages[messages.length - 1] : null;

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
          {/* Left: Image + thumbnails */}
          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-3xl aspect-square flex items-center justify-center border border-border overflow-hidden relative`}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {images && images.length > 0 ? (
                <>
                  <AnimatePresence initial={false} mode="wait">
                    <motion.img
                      key={images[currentIndex]}
                      src={images[currentIndex]}
                      alt={`${item.name} ${currentIndex + 1}`}
                      className="w-full h-full object-cover"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.6 }}
                    />
                  </AnimatePresence>

                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentIndex((idx) => (idx - 1 + images.length) % images.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full"
                        aria-label="Anterior"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        onClick={() => setCurrentIndex((idx) => (idx + 1) % images.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full"
                        aria-label="Siguiente"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className={`bg-gradient-to-br ${gradient} w-full h-full flex items-center justify-center`}>
                  <span className="text-[120px] md:text-[160px]">{item.emoji}</span>
                </div>
              )}
            </motion.div>

            {/* Thumbnails below image */}
            {images && images.length > 1 && (
              <div className="mt-4 flex gap-3 justify-center">
                {images.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-16 h-12 md:w-20 md:h-16 rounded-md overflow-hidden border transition-transform hover:scale-105 ${idx === currentIndex ? 'ring-2 ring-primary' : 'border-border'}`}
                  >
                    <img src={src} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-0 lg:mt-6">
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
                  {String(sellerName)?.[0] ?? '?'}
                </div>
                <div>
                  <p className="font-display font-bold text-foreground text-sm">Vendedor</p>
                  <p className="font-body text-muted-foreground text-sm">{sellerName}</p>
                </div>
              </div>

              {/* Si el usuario actual es el vendedor, mostrar usuarios que preguntaron por esta publicación */}
              {currentUser && String(currentUser?.id_usuarios ?? currentUser?.id) === String(pub?.id_usuarios ?? sellerId) && (
                (() => {
                  const convsForPub = (conversacionesData || []).filter((c: any) => String(c.publicacion?.id_publicaciones ?? c.publicacion?.id ?? '') === String(idNum));
                  const map = new Map<string, any>();
                  // prefer comprador from conversation, else use mensajes.emisor
                  convsForPub.forEach((c: any) => {
                    const comprador = c.comprador ?? null;
                    if (comprador && (comprador.id_usuarios || comprador.id)) {
                      const key = String(comprador.id_usuarios ?? comprador.id);
                      if (!map.has(key)) map.set(key, comprador);
                    }
                    // also scan mensajes for emisor
                    const msgs = (mensajesData || []).filter((m: any) => String(m.conversacion?.id_conversaciones ?? m.id_conversaciones ?? '') === String(c.id_conversaciones));
                    msgs.forEach((m: any) => {
                      const em = m.emisor ?? null;
                      const emId = em?.id_usuarios ?? m.id_emisor ?? null;
                      if (emId) {
                        const key = String(emId);
                        if (!map.has(key)) map.set(key, em || { id_usuarios: emId, nombre: em?.nombre ?? null, foto_perfil: em?.foto_perfil ?? null });
                      }
                    });
                  });
                  const interested = Array.from(map.values());

                  return (
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold">Personas que preguntaron</h4>
                      <div className="mt-2 flex items-center gap-3">
                        {interested.length === 0 ? (
                          <div className="text-sm text-muted-foreground">Aún no hay preguntas sobre esta publicación</div>
                        ) : (
                          interested.map((u: any) => (
                            <div key={String(u.id_usuarios ?? u.id)} className="flex items-center gap-2 bg-muted/40 px-2 py-1 rounded-md">
                              {u?.foto_perfil ? (
                                <img src={normalizeImageUrl(u?.foto_perfil) ?? piojoLogo} alt={u?.nombre ?? 'U'} className="w-8 h-8 rounded-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).src = piojoLogo; }} />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground font-bold">{String(u?.nombre ?? '')?.[0] ?? '?'}</div>
                              )}
                              <div className="text-sm font-medium">{u?.nombre ?? 'Usuario'}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })()
              )}

              <div className="mt-6 flex items-center gap-4">
                {currentUser && sellerId && Number(currentUser?.id_usuarios ?? currentUser?.id) === sellerId ? (
                  <span className="px-4 py-2 rounded-xl bg-muted text-muted-foreground text-sm font-body font-semibold">Tu publicación</span>
                ) : (
                <Button
                  className="bg-primary text-primary-foreground px-6 py-3 flex items-center gap-2"
                  onClick={() => {
                    if (!token || !currentUser) {
                      toast({ title: 'Inicia sesión', description: 'Necesitas una cuenta para comprar.' });
                      navigate('/login', { state: { from: location } });
                      return;
                    }
                    setBuyStep('method');
                    setMetodoPago('EFECTIVO');
                    setShowBuyModal(true);
                  }}
                >
                  <ShoppingCart size={16} /> Comprar
                </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    if (!token || !currentUser) {
                      toast({ title: 'Inicia sesión', description: 'Necesitas una cuenta para chatear con el vendedor.' });
                      navigate('/login', { state: { from: location } });
                      return;
                    }
                    setShowChat(true);
                  }}
                >
                  Chat con {sellerName}
                </Button>
                <div className="ml-auto flex items-center gap-3">
                  <button className="text-muted-foreground"><Heart size={18} /></button>
                  <button className="text-muted-foreground"><Share2 size={18} /></button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Modal de compra */}
      <AnimatePresence>
        {showBuyModal && (
          <motion.div
            key="buy-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            onClick={() => { if (buyStep !== 'success') setShowBuyModal(false); }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ y: 80, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 80, opacity: 0, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border border-border"
            >
              {buyStep !== 'success' ? (
                <>
                  {/* Header degradado */}
                  <div className="bg-gradient-to-br from-primary via-primary/85 to-accent/60 px-6 pt-6 pb-10 text-primary-foreground">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-display font-bold text-xl flex items-center gap-2"><ShoppingCart size={18} /> Confirmar compra</h2>
                        <p className="text-primary-foreground/70 text-sm mt-0.5 truncate max-w-[240px]">{item?.name}</p>
                      </div>
                      <button onClick={() => setShowBuyModal(false)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition text-sm font-bold">✕</button>
                    </div>
                    <div className="mt-4 text-3xl font-display font-bold">{item?.price}</div>
                  </div>

                  {/* Cuerpo */}
                  <div className="px-6 py-5 -mt-5 bg-card rounded-t-3xl sm:rounded-none relative space-y-5">
                    {/* Resumen */}
                    <div className="bg-muted/40 rounded-2xl p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Producto</span>
                        <span className="font-medium truncate max-w-[200px]">{item?.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Vendedor</span>
                        <span className="font-medium">{sellerName}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Estado</span>
                        <span className="font-medium">{item?.condition}</span>
                      </div>
                      <div className="border-t border-border pt-2 flex justify-between">
                        <span className="font-semibold">Total</span>
                        <span className="font-display font-bold text-primary text-base">{item?.price}</span>
                      </div>
                    </div>

                    {/* Método de pago */}
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Método de pago</p>
                      <div className="grid grid-cols-2 gap-3">
                        {([
                          { id: 'EFECTIVO', label: 'Efectivo', Icon: Banknote, desc: 'Al momento de recibir' },
                          { id: 'TRANSFERENCIA', label: 'Transferencia', Icon: CreditCard, desc: 'Envío previo' },
                        ] as const).map(({ id: mid, label, Icon, desc }) => (
                          <button
                            key={mid}
                            onClick={() => setMetodoPago(mid)}
                            className={`flex flex-col items-center gap-1.5 p-4 rounded-2xl border-2 transition-all ${
                              metodoPago === mid
                                ? 'border-primary bg-primary/10 shadow-sm'
                                : 'border-border bg-muted/30 hover:bg-muted/60'
                            }`}
                          >
                            <Icon size={24} className={metodoPago === mid ? 'text-primary' : 'text-muted-foreground'} />
                            <span className={`text-sm font-bold ${metodoPago === mid ? 'text-primary' : 'text-foreground'}`}>{label}</span>
                            <span className="text-[10px] text-muted-foreground text-center">{desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2 pb-1">
                      <button onClick={() => setShowBuyModal(false)} className="flex-1 py-2.5 rounded-xl bg-muted text-foreground text-sm font-semibold hover:bg-muted/70 transition-colors">
                        Cancelar
                      </button>
                      <button
                        onClick={handleBuy}
                        disabled={buyLoading}
                        className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        {buyLoading ? (
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        ) : (
                          <ShoppingCart size={15} />
                        )}
                        {buyLoading ? 'Procesando…' : 'Confirmar compra'}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                // Estado de éxito
                <div className="px-8 py-12 flex flex-col items-center text-center gap-4">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                    <div className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center">
                      <CheckCircle size={44} className="text-emerald-500" />
                    </div>
                  </motion.div>
                  <h2 className="font-display font-bold text-2xl text-foreground">¡Compra registrada!</h2>
                  <p className="text-muted-foreground text-sm max-w-xs">
                    Tu pedido de <span className="font-semibold text-foreground">{item?.name}</span> fue procesado con éxito.
                    El vendedor te contactará para coordinar la entrega.
                  </p>
                  <div className="mt-2 flex gap-3">
                    <button
                      onClick={() => setShowBuyModal(false)}
                      className="px-5 py-2.5 rounded-xl bg-muted text-foreground text-sm font-semibold"
                    >
                      Cerrar
                    </button>
                    <button
                      onClick={() => { setShowBuyModal(false); navigate('/perfil'); }}
                      className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold"
                    >
                      Ver mis compras
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide-over chat */}
      <AnimatePresence>
        {showChat && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40"
              onClick={() => setShowChat(false)}
            />
            <motion.aside
              key="chat"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-card border-l border-border shadow-lg p-4 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                  <div>
                    <h3 className="font-display font-bold text-lg">Chat con {sellerName}</h3>
                    <div className="text-sm text-muted-foreground">{lastMsg ? timeAgo(lastMsg.createdAt) : 'Disponible'}</div>
                  </div>
                  <button onClick={() => setShowChat(false)} className="ml-auto p-2 rounded-full bg-muted">
                    <X size={16} />
                  </button>
                </div>
              <div className="mt-4 flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 flex flex-col">
                  <MessageList messages={messages} currentUserId={currentUser?.id ?? currentUser?.id_usuarios} sellerName={sellerName} />
                  <div className="mt-3">
                    <ChatInput onSend={sendMessageText} />
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ProductDetail;
