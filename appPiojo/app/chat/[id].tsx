import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useColors } from '../../src/hooks/useColors';
import type { ColorPalette } from '../../src/theme/colors';
import { useChatStore, Message } from '../../src/context/chatStore';
import { useAuthStore } from '../../src/context/authStore';
import { graphqlRequest } from '../../src/api/api';
import { MARCAR_VENDIDA_MUTATION } from '../../src/api/queries';

function formatMessageTime(date: Date): string {
  const d = date instanceof Date ? date : new Date(date as any);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isMine }) => {
  const colors = useColors();
  const styles = makeStyles(colors);
  return (
    <View style={[styles.messageRow, isMine && styles.messageRowMine]}>
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
        <Text style={[styles.messageText, isMine && styles.messageTextMine]}>
          {message.text}
        </Text>
        <View style={styles.messageFooter}>
          <Text style={[styles.messageTime, isMine && styles.messageTimeMine]}>
            {formatMessageTime(new Date(message.timestamp))}
          </Text>
          {isMine && (
            <Ionicons
              name="checkmark-done"
              size={14}
              color={message.read ? colors.neonCyan : colors.textMuted}
              style={styles.readIcon}
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const scrollViewRef = useRef<ScrollView>(null);
  const { user } = useAuthStore();
  const { getConversation, sendMessage, markAsRead, loadMensajes } = useChatStore();
  
  const conversation = getConversation(id || '');
  const [messageText, setMessageText] = useState('');
  const [vendido, setVendido] = useState(false);
  const [marcandoVendida, setMarcandoVendida] = useState(false);
  const colors = useColors();
  const styles = makeStyles(colors);

  const isVendedor = !!user?.id && conversation?.vendedorId === user.id;
  const productoVendido = vendido || conversation?.productDisponible === false;

  // Carga mensajes al abrir y poll cada 4 segundos
  useEffect(() => {
    if (!id) return;
    loadMensajes(id);
    const interval = setInterval(() => loadMensajes(id), 4000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    // Scroll to bottom when messages change
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [conversation?.messages.length]);

  const handleSend = () => {
    if (!messageText.trim() || !id) return;
    sendMessage(id, messageText.trim(), user?.id || '1');
    setMessageText('');
  };

  const handleMarcarVendida = () => {
    if (!conversation?.productId) return;
    Alert.alert(
      'Marcar como vendida',
      `¿Confirmas que "${conversation.productName}" fue vendida? Se eliminará del catálogo.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, marcar vendida',
          style: 'destructive',
          onPress: async () => {
            setMarcandoVendida(true);
            try {
              await graphqlRequest(MARCAR_VENDIDA_MUTATION, {
                id: parseInt(conversation.productId!),
              });
              setVendido(true);
            } catch (err) {
              console.error('[chat] marcarVendida error:', err);
              Alert.alert('Error', 'No se pudo marcar como vendida. Intenta de nuevo.');
            } finally {
              setMarcandoVendida(false);
            }
          },
        },
      ],
    );
  };

  if (!conversation) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Conversación no encontrada</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>
            {conversation.participantName.split(' ').map(n => n[0]).slice(0, 2).join('')}
          </Text>
        </View>
        
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{conversation.participantName}</Text>
          {conversation.productName && (
            <View style={styles.productTag}>
              <Ionicons name="shirt" size={10} color={colors.neonCyan} />
              <Text style={styles.productTagText}>
                {conversation.productName} - ${conversation.productPrice}
              </Text>
            </View>
          )}
        </View>

        <Pressable style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={20} color={colors.textMuted} />
        </Pressable>
      </View>

      {/* Product Banner */}
      {conversation.productName && (
        <View style={styles.productBanner}>
          <View style={styles.productIconContainer}>
            <Ionicons name="shirt" size={24} color={productoVendido ? colors.textMuted : colors.neonCyan} />
          </View>
          <View style={styles.productBannerInfo}>
            <Text style={[styles.productBannerName, productoVendido && styles.textStrike]}>
              {conversation.productName}
            </Text>
            {productoVendido ? (
              <View style={styles.vendidaBadge}>
                <Ionicons name="checkmark-circle" size={12} color={colors.neonGreen} />
                <Text style={styles.vendidaBadgeText}>Vendida</Text>
              </View>
            ) : (
              <Text style={styles.productBannerPrice}>${conversation.productPrice}</Text>
            )}
          </View>
          {isVendedor && !productoVendido && (
            <Pressable
              style={({ pressed }) => [styles.vendidaButton, pressed && { opacity: 0.75 }]}
              onPress={handleMarcarVendida}
              disabled={marcandoVendida}
            >
              {marcandoVendida ? (
                <ActivityIndicator size="small" color={colors.background} />
              ) : (
                <Text style={styles.vendidaButtonText}>Marcar vendida</Text>
              )}
            </Pressable>
          )}
          {!isVendedor && !productoVendido && (
            <Pressable style={styles.viewProductButton}>
              <Text style={styles.viewProductText}>Ver</Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.messagesContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Date header */}
          <View style={styles.dateHeader}>
            <Text style={styles.dateHeaderText}>Hoy</Text>
          </View>

          {conversation.messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isMine={message.senderId === (user?.id || '1')}
            />
          ))}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Escribe un mensaje..."
              placeholderTextColor={colors.textMuted}
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={500}
            />
          </View>
          
          <Pressable
            style={({ pressed }) => [
              styles.sendButton,
              !messageText.trim() && styles.sendButtonDisabled,
              pressed && styles.sendButtonPressed,
            ]}
            onPress={handleSend}
            disabled={!messageText.trim()}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={messageText.trim() ? colors.background : colors.textMuted} 
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (c: ColorPalette) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: c.card,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  backButton: {
    padding: 8,
    marginRight: 4,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: c.neonCyan + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: c.neonCyan + '50',
  },
  headerAvatarText: {
    color: c.neonCyan,
    fontSize: 14,
    fontWeight: '700',
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    color: c.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: c.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  productTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  productTagText: {
    color: c.neonCyan,
    fontSize: 11,
  },
  moreButton: {
    padding: 8,
  },
  productBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.card,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  productIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: c.neonCyan + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  productBannerInfo: {
    flex: 1,
  },
  productBannerName: {
    color: c.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  productBannerPrice: {
    color: c.neonGreen,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  viewProductButton: {
    backgroundColor: c.neonCyan,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewProductText: {
    color: c.background,
    fontSize: 13,
    fontWeight: '600',
  },
  vendidaButton: {
    backgroundColor: c.neonGreen,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 110,
    alignItems: 'center',
  },
  vendidaButtonText: {
    color: c.background,
    fontSize: 12,
    fontWeight: '700',
  },
  vendidaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  vendidaBadgeText: {
    color: c.neonGreen,
    fontSize: 12,
    fontWeight: '600',
  },
  textStrike: {
    textDecorationLine: 'line-through',
    color: c.textMuted,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  dateHeader: {
    alignItems: 'center',
    marginVertical: 12,
  },
  dateHeaderText: {
    color: c.textMuted,
    fontSize: 12,
    backgroundColor: c.card,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  messageRow: {
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  messageRowMine: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  bubbleOther: {
    backgroundColor: c.card,
    borderBottomLeftRadius: 4,
  },
  bubbleMine: {
    backgroundColor: c.neonCyan,
    borderBottomRightRadius: 4,
  },
  messageText: {
    color: c.textPrimary,
    fontSize: 15,
    lineHeight: 20,
  },
  messageTextMine: {
    color: c.background,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageTime: {
    color: c.textMuted,
    fontSize: 10,
  },
  messageTimeMine: {
    color: c.background + 'aa',
  },
  readIcon: {
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: c.card,
    borderTopWidth: 1,
    borderTopColor: c.border,
    gap: 10,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: c.secondary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
    maxHeight: 120,
    justifyContent: 'center',
  },
  input: {
    color: c.textPrimary,
    fontSize: 15,
    lineHeight: 20,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: c.neonCyan,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: c.border,
  },
  sendButtonPressed: {
    opacity: 0.8,
  },
});
