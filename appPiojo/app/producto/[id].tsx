import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Pressable,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useColors } from '../../src/hooks/useColors';
import type { ColorPalette } from '../../src/theme/colors';
import { useProductStore } from '../../src/context/productStore';
import { useChatStore } from '../../src/context/chatStore';
import { useAuthStore } from '../../src/context/authStore';
import { categoryLabels, conditionColors } from '../../src/interfaces';

const { width } = Dimensions.get('window');

export default function ProductoDetailScreen() {
  useLocalSearchParams(); // needed for dynamic route
  const router = useRouter();
  const colors = useColors();
  const styles = makeStyles(colors);
  const product = useProductStore((s) => s.selected);
  const clearSelected = useProductStore((s) => s.clear);
  const startConversation = useChatStore((s) => s.startConversation);
  const { user } = useAuthStore();
  const [activePhoto, setActivePhoto] = useState(0);

  const openChat = async () => {
    if (!product) return;
    const sellerId = product.sellerId ?? 'unknown';
    const sellerName = product.donatedBy ?? `Vendedor #${sellerId}`;
    const convId = await startConversation(
      sellerId,
      sellerName,
      product.id,
      product.name,
      product.price,
      user?.id,
    );
    clearSelected();
    router.push(`/chat/${convId}`);
  };

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: colors.textPrimary, padding: 24 }}>Producto no encontrado</Text>
      </SafeAreaView>
    );
  }

  const fotos: string[] = product.fotos?.length ? product.fotos : product.image ? [product.image] : [];
  const isDonacion = product.price === 0;
  const conditionColor = conditionColors[product.condition ?? 'bueno'] ?? colors.primary;
  const conditionLabel = product.condition
    ? product.condition.charAt(0).toUpperCase() + product.condition.slice(1)
    : '—';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{product.name}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Galería de fotos */}
        {fotos.length > 0 ? (
          <View>
            <Image
              source={{ uri: fotos[activePhoto] }}
              style={styles.mainImage}
              resizeMode="cover"
            />
            {fotos.length > 1 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.thumbRow}
              >
                {fotos.map((uri, i) => (
                  <Pressable key={i} onPress={() => setActivePhoto(i)}>
                    <Image
                      source={{ uri }}
                      style={[styles.thumb, i === activePhoto && styles.thumbActive]}
                    />
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="shirt-outline" size={80} color={colors.textMuted} />
          </View>
        )}

        {/* Info principal */}
        <View style={styles.infoSection}>
          {/* Precio */}
          <View style={styles.priceRow}>
            {isDonacion ? (
              <View style={styles.donationTag}>
                <Ionicons name="heart" size={18} color={colors.neonMagenta} />
                <Text style={[styles.donationTagText, { color: colors.neonMagenta }]}>Donación gratuita</Text>
              </View>
            ) : (
              <Text style={styles.price}>${product.price.toFixed(2)}</Text>
            )}
            <View style={[styles.conditionBadge, { borderColor: conditionColor + '50', backgroundColor: conditionColor + '18' }]}>
              <View style={[styles.conditionDot, { backgroundColor: conditionColor }]} />
              <Text style={[styles.conditionText, { color: conditionColor }]}>{conditionLabel}</Text>
            </View>
          </View>

          {/* Nombre */}
          <Text style={styles.name}>{product.name}</Text>

          {/* Chips de info */}
          <View style={styles.chipsRow}>
            {product.brand && (
              <View style={styles.chip}>
                <Ionicons name="bookmark-outline" size={13} color={colors.primary} />
                <Text style={styles.chipText}>{product.brand}</Text>
              </View>
            )}
            {product.size && (
              <View style={styles.chip}>
                <Ionicons name="resize-outline" size={13} color={colors.primary} />
                <Text style={styles.chipText}>Talla {product.size}</Text>
              </View>
            )}
            {product.color && (
              <View style={styles.chip}>
                <Ionicons name="color-palette-outline" size={13} color={colors.primary} />
                <Text style={styles.chipText}>{product.color}</Text>
              </View>
            )}
            {product.category && (
              <View style={styles.chip}>
                <Ionicons name="shirt-outline" size={13} color={colors.primary} />
                <Text style={styles.chipText}>{categoryLabels[product.category as keyof typeof categoryLabels] ?? product.category}</Text>
              </View>
            )}
          </View>

          {/* Descripción */}
          {product.description ? (
            <View style={styles.descSection}>
              <Text style={styles.descLabel}>Descripción</Text>
              <Text style={styles.descText}>{product.description}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Barra de acción */}
      <View style={styles.actionBar}>
        <Pressable
          style={({ pressed }) => [
            styles.actionBtn,
            { backgroundColor: isDonacion ? colors.neonMagenta : colors.primary },
            pressed && { opacity: 0.85 },
          ]}
          onPress={openChat}
        >
          <Ionicons name={isDonacion ? 'heart' : 'chatbubble-ellipses'} size={22} color="#fff" />
          <Text style={styles.actionBtnText}>
            {isDonacion ? 'Solicitar donación' : 'Comprar — Contactar vendedor'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (c: ColorPalette) => StyleSheet.create({
  container:   { flex: 1, backgroundColor: c.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: c.card,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  backBtn:      { width: 40, height: 40, justifyContent: 'center' },
  headerTitle:  { flex: 1, color: c.textPrimary, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  scroll:       { paddingBottom: 100 },

  // Galería
  mainImage: {
    width,
    height: width * 0.85,
    backgroundColor: c.surface,
  },
  thumbRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    marginRight: 8,
  },
  thumbActive: {
    borderColor: c.primary,
  },
  imagePlaceholder: {
    width,
    height: width * 0.7,
    backgroundColor: c.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Info
  infoSection:  { padding: 20, gap: 12 },
  priceRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price:        { fontSize: 32, fontWeight: '800', color: c.mint },
  donationTag:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  donationTagText: { fontSize: 18, fontWeight: '700' },
  conditionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  conditionDot: { width: 8, height: 8, borderRadius: 4 },
  conditionText:{ fontSize: 13, fontWeight: '600' },
  name:         { fontSize: 22, fontWeight: '700', color: c.textPrimary },
  chipsRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: c.primary + '15',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText:     { color: c.primary, fontSize: 13, fontWeight: '600' },
  descSection:  { gap: 6 },
  descLabel:    { color: c.textSecondary, fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  descText:     { color: c.textPrimary, fontSize: 15, lineHeight: 22 },

  // Acción
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: c.card,
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
  },
  actionBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
