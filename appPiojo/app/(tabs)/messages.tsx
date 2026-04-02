import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useColors } from '../../src/hooks/useColors';
import type { ColorPalette } from '../../src/theme/colors';
import { useChatStore, Conversation } from '../../src/context/chatStore';
import { useAuthStore } from '../../src/context/authStore';

function formatTime(date: Date | undefined | null): string {
  const d = date instanceof Date ? date : (date ? new Date(date as any) : null);
  if (!d || isNaN(d.getTime())) return '—';
  const now = Date.now();
  const diff = now - d.getTime();
  const hours = diff / (1000 * 60 * 60);
  if (hours < 1) {
    const mins = Math.floor(diff / (1000 * 60));
    return mins < 1 ? 'Ahora' : `${mins}m`;
  } else if (hours < 24) {
    return `${Math.floor(hours)}h`;
  } else {
    const days = Math.floor(hours / 24);
    return days === 1 ? 'Ayer' : `${days}d`;
  }
}

interface ConversationItemProps {
  conversation: Conversation;
  onPress: () => void;
  currentUserId: string;
}

const ConversationItem: React.FC<ConversationItemProps> = ({ 
  conversation, 
  onPress,
  currentUserId 
}) => {
  const colors = useColors();
  const styles = makeStyles(colors);
  const hasUnread = conversation.unreadCount > 0;
  const lastMsg = conversation.messages[conversation.messages.length - 1];
  const isLastMsgMine = lastMsg?.senderId === currentUserId;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.conversationItem,
        hasUnread && styles.conversationUnread,
        pressed && styles.conversationPressed,
      ]}
      onPress={onPress}
    >
      {/* Avatar */}
      <View style={[styles.avatar, hasUnread && styles.avatarUnread]}>
        <Text style={styles.avatarText}>
          {conversation.participantName.split(' ').map(n => n[0]).slice(0, 2).join('')}
        </Text>
      </View>

      {/* Content */}
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={[styles.participantName, hasUnread && styles.textUnread]}>
            {conversation.participantName}
          </Text>
          {conversation.lastMessageTime && (
            <Text style={[styles.timeText, hasUnread && styles.timeUnread]}>
              {formatTime(new Date(conversation.lastMessageTime))}
            </Text>
          )}
        </View>

        {/* Product info */}
        {conversation.productName && (
          <View style={styles.productBadge}>
            <Ionicons name="shirt" size={10} color={colors.neonCyan} />
            <Text style={styles.productText} numberOfLines={1}>
              {conversation.productName} - ${conversation.productPrice}
            </Text>
          </View>
        )}

        {/* Last message */}
        <View style={styles.lastMessageRow}>
          {isLastMsgMine && (
            <Ionicons 
              name="checkmark-done" 
              size={14} 
              color={lastMsg?.read ? colors.neonCyan : colors.textMuted} 
              style={styles.checkIcon}
            />
          )}
          <Text 
            style={[styles.lastMessage, hasUnread && styles.textUnread]} 
            numberOfLines={1}
          >
            {conversation.lastMessage || 'Sin mensajes'}
          </Text>
        </View>
      </View>

      {/* Unread badge */}
      {hasUnread && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{conversation.unreadCount}</Text>
        </View>
      )}
    </Pressable>
  );
};

export default function MessagesScreen() {
  const router = useRouter();
  const { conversations, loadConversaciones } = useChatStore();
  const { user } = useAuthStore();
  const colors = useColors();
  const styles = makeStyles(colors);

  useFocusEffect(
    useCallback(() => {
      if (user?.id) loadConversaciones(user.id);
    }, [user?.id]),
  );

  const sortedConversations = [...conversations].sort((a, b) => {
    const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
    const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
    return timeB - timeA;
  });

  const handleConversationPress = (conversationId: string) => {
    router.push(`/chat/${conversationId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="chatbubbles" size={28} color={colors.neonCyan} />
        </View>
        <View>
          <Text style={styles.headerTitle}>Mensajes</Text>
          <Text style={styles.headerSubtitle}>Chatea con compradores y vendedores</Text>
        </View>
      </View>

      {sortedConversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubble-ellipses-outline" size={64} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Sin conversaciones</Text>
          <Text style={styles.emptyText}>
            Cuando contactes a un vendedor o alguien te escriba, aparecerá aquí
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {sortedConversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              currentUserId={user?.id || '1'}
              onPress={() => handleConversationPress(conversation.id)}
            />
          ))}
        </ScrollView>
      )}
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
    gap: 12,
    padding: 16,
    backgroundColor: c.card,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: c.neonCyan + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: c.neonCyan,
    fontSize: 22,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: c.textMuted,
    fontSize: 12,
  },
  list: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  conversationUnread: {
    backgroundColor: c.neonCyan + '08',
  },
  conversationPressed: {
    backgroundColor: c.card,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: c.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 2,
    borderColor: c.border,
  },
  avatarUnread: {
    borderColor: c.neonCyan,
    backgroundColor: c.neonCyan + '15',
  },
  avatarText: {
    color: c.textSecondary,
    fontSize: 16,
    fontWeight: '700',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  participantName: {
    color: c.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
  textUnread: {
    fontWeight: '700',
  },
  timeText: {
    color: c.textMuted,
    fontSize: 12,
  },
  timeUnread: {
    color: c.neonCyan,
    fontWeight: '600',
  },
  productBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  productText: {
    color: c.neonCyan,
    fontSize: 11,
  },
  lastMessageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIcon: {
    marginRight: 4,
  },
  lastMessage: {
    color: c.textMuted,
    fontSize: 14,
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: c.neonMagenta,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadText: {
    color: c.background,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    color: c.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyText: {
    color: c.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
