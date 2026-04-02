import { create } from 'zustand';
import { graphqlRequest } from '../api/api';
import {
  GET_CONVERSACIONES_QUERY,
  GET_MENSAJES_QUERY,
  CREATE_CONVERSACION_MUTATION,
  CREATE_MENSAJE_MUTATION,
} from '../api/queries';

// ── Parser de fecha robusto ────────────────────────────────────────────────────
// TypeORM/MySQL puede devolver "2026-04-01 18:02:30" (sin T) que new Date() no parsea
// en todos los entornos de React Native.
function safeDate(val: any): Date {
  if (!val) return new Date();
  if (val instanceof Date) return isNaN(val.getTime()) ? new Date() : val;
  if (typeof val === 'number') return new Date(val);
  // Reemplaza espacio por T para compatibilidad ISO
  const fixed = String(val).replace(' ', 'T');
  const d = new Date(fixed);
  return isNaN(d.getTime()) ? new Date() : d;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: Date;
  read: boolean;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  vendedorId?: string;
  productId?: string;
  productName?: string;
  productPrice?: number;
  productDisponible?: boolean;
  messages: Message[];
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
}

interface ChatStore {
  conversations: Conversation[];
  activeConversationId: string | null;
  loading: boolean;

  loadConversaciones: (userId: string) => Promise<void>;
  loadMensajes: (convId: string) => Promise<void>;
  setActiveConversation: (id: string | null) => void;
  sendMessage: (conversationId: string, text: string, senderId: string) => Promise<void>;
  markAsRead: (conversationId: string) => void;
  startConversation: (
    participantId: string,
    participantName: string,
    productId?: string,
    productName?: string,
    productPrice?: number,
    currentUserId?: string,
  ) => Promise<string>;
  getConversation: (id: string) => Conversation | undefined;
  getUnreadCount: () => number;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  loading: false,

  // ── Carga conversaciones + mensajes del usuario desde el backend ──────────
  loadConversaciones: async (userId) => {
    set({ loading: true });
    try {
      const uid = parseInt(userId);

      // Cargar conversaciones y mensajes en paralelo
      const [convData, msgData] = await Promise.all([
        graphqlRequest<{ conversaciones: any[] }>(GET_CONVERSACIONES_QUERY),
        graphqlRequest<{ detalleMensajes: any[] }>(GET_MENSAJES_QUERY),
      ]);

      // Agrupar mensajes por id_conversaciones
      const msgsByConv = new Map<number, any[]>();
      for (const m of (msgData.detalleMensajes ?? [])) {
        const cid = m.conversacion?.id_conversaciones;
        if (cid === undefined) continue;
        if (!msgsByConv.has(cid)) msgsByConv.set(cid, []);
        msgsByConv.get(cid)!.push(m);
      }

      const filtered = (convData.conversaciones ?? []).filter(
        (c) => c.vendedor?.id_usuarios === uid || c.comprador?.id_usuarios === uid,
      );

      const mapped: Conversation[] = filtered.map((c) => {
        const isVendedor = c.vendedor?.id_usuarios === uid;
        const participant = isVendedor ? c.comprador : c.vendedor;

        const rawMsgs: Message[] = (msgsByConv.get(c.id_conversaciones) ?? [])
          .map((m: any) => ({
            id: String(m.id_detalle_mensajes),
            text: m.mensaje,
            senderId: String(m.emisor?.id_usuarios ?? 0),
            timestamp: safeDate(m.fecha_envio),
            read: true,
          }))
          .sort((a: Message, b: Message) => a.timestamp.getTime() - b.timestamp.getTime());

        const lastMsg = rawMsgs[rawMsgs.length - 1];
        // Mensajes no enviados por mí = no leídos
        const unread = rawMsgs.filter((m: Message) => m.senderId !== String(uid)).length;

        return {
          id: String(c.id_conversaciones),
          participantId: String(participant?.id_usuarios ?? 0),
          participantName: participant
            ? `${participant.nombre} ${participant.apellido_paterno}`.trim()
            : 'Usuario',
          participantAvatar: participant?.foto_perfil ?? undefined,
          vendedorId: String(c.vendedor?.id_usuarios ?? 0),
          productId: c.publicacion ? String(c.publicacion.id_publicaciones) : undefined,
          productName: c.publicacion?.titulo,
          productPrice: c.publicacion?.precio,
          productDisponible: c.publicacion?.disponible ?? true,
          messages: rawMsgs,
          lastMessage: lastMsg?.text,
          lastMessageTime: lastMsg?.timestamp ?? safeDate(c.fecha_creacion),
          unreadCount: unread,
        };
      });

      set((state) => {
        const backendIds = new Set(mapped.map((c) => c.id));
        // Conversations creadas localmente que no llegaron al backend aún
        const localOnly = state.conversations.filter((c) => !backendIds.has(c.id));
        return { conversations: [...mapped, ...localOnly], loading: false };
      });
    } catch (err) {
      console.error('[chatStore] loadConversaciones error:', err);
      set({ loading: false });
    }
  },

  // ── Carga mensajes de una conversación ────────────────────────────────────
  loadMensajes: async (convId) => {
    try {
      const data = await graphqlRequest<{ detalleMensajes: any[] }>(GET_MENSAJES_QUERY);
      const convInt = parseInt(convId);
      const messages: Message[] = (data.detalleMensajes ?? [])
        .filter((m) => m.conversacion?.id_conversaciones === convInt)
        .map((m) => ({
          id: String(m.id_detalle_mensajes),
          text: m.mensaje,
          senderId: String(m.emisor?.id_usuarios ?? 0),
          timestamp: safeDate(m.fecha_envio),
          read: true,
        }))
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      const lastMsg = messages[messages.length - 1];
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === convId
            ? { ...c, messages, lastMessage: lastMsg?.text ?? c.lastMessage, lastMessageTime: lastMsg?.timestamp ?? c.lastMessageTime }
            : c,
        ),
      }));
    } catch {}
  },

  setActiveConversation: (id) => {
    set({ activeConversationId: id });
    if (id) get().markAsRead(id);
  },

  // ── Envía mensaje con actualización optimista ──────────────────────────────
  sendMessage: async (conversationId, text, senderId) => {
    const tempId = `temp-${Date.now()}`;
    const tempMsg: Message = { id: tempId, text, senderId, timestamp: new Date(), read: false };

    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, tempMsg], lastMessage: text, lastMessageTime: new Date() }
          : c,
      ),
    }));

    try {
      const result = await graphqlRequest<{ createDetalleMensaje: any }>(CREATE_MENSAJE_MUTATION, {
        input: {
          id_conversaciones: parseInt(conversationId),
          id_emisor: parseInt(senderId),
          mensaje: text,
        },
      });
      const real = result.createDetalleMensaje;
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === tempId
                    ? {
                        id: String(real.id_detalle_mensajes),
                        text: real.mensaje,
                        senderId: String(real.emisor?.id_usuarios ?? senderId),
                        timestamp: safeDate(real.fecha_envio),
                        read: true,
                      }
                    : m,
                ),
              }
            : c,
        ),
      }));
    } catch {
      // El mensaje optimista se queda visible aunque falle
    }
  },

  markAsRead: (conversationId) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, unreadCount: 0, messages: c.messages.map((m) => ({ ...m, read: true })) }
          : c,
      ),
    }));
  },

  // ── Crea o reutiliza conversación ─────────────────────────────────────────
  startConversation: async (participantId, participantName, productId, productName, productPrice, currentUserId) => {
    // Solo reutilizar conversaciones que vienen del backend (ID numérico), no locales
    const existing = get().conversations.find(
      (c) =>
        c.participantId === participantId &&
        c.productId === productId &&
        !c.id.startsWith('local-'),
    );
    if (existing) return existing.id;

    try {
      const result = await graphqlRequest<{ createConversacion: any }>(
        CREATE_CONVERSACION_MUTATION,
        {
          input: {
            id_publicaciones: parseInt(productId ?? '0'),
            id_vendedor: parseInt(participantId),
            id_comprador: parseInt(currentUserId ?? '0'),
          },
        },
      );
      const raw = result.createConversacion;
      const newId = String(raw.id_conversaciones);

      // Elimina cualquier conversación local previa con el mismo participante/producto
      set((state) => ({
        conversations: [
          {
            id: newId,
            participantId,
            participantName,
            productId,
            productName,
            productPrice,
            messages: [],
            unreadCount: 0,
          } as Conversation,
          ...state.conversations.filter(
            (c) => !(c.participantId === participantId && c.productId === productId),
          ),
        ],
      }));
      return newId;
    } catch (err) {
      console.error('[chatStore] startConversation error:', err);
      // Fallback local si el backend falla
      const localId = `local-${Date.now()}`;
      const fallback: Conversation = {
        id: localId,
        participantId,
        participantName,
        productId,
        productName,
        productPrice,
        messages: [],
        unreadCount: 0,
      };
      set((state) => ({
        conversations: [
          fallback,
          ...state.conversations.filter(
            (c) => !(c.participantId === participantId && c.productId === productId),
          ),
        ],
      }));
      return localId;
    }
  },

  getConversation: (id) => get().conversations.find((c) => c.id === id),

  getUnreadCount: () => get().conversations.reduce((sum, c) => sum + c.unreadCount, 0),
}));

