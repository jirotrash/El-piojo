import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useColors } from '../../src/hooks/useColors';
import type { ColorPalette } from '../../src/theme/colors';
import { useAuthStore } from '../../src/context/authStore';
import { getMisVentas } from '../../src/services/publicacionesService';
import type { Product } from '../../src/interfaces';

export default function VentasTab() {
  const colors = useColors();
  const styles = makeStyles(colors);
  const router = useRouter();
  const { user } = useAuthStore();

  const [ventas, setVentas] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!user?.id) return;
      setLoading(true);
      getMisVentas(user.id)
        .then(setVentas)
        .catch(() => setVentas([]))
        .finally(() => setLoading(false));
    }, [user?.id]),
  );

  const totalRecaudado = ventas.reduce((sum, p) => sum + (p.price ?? 0), 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="pricetag" size={26} color={colors.neonGreen} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Mis Ventas</Text>
          <Text style={styles.headerSubtitle}>Historial de publicaciones vendidas</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.neonGreen} size="large" />
          <Text style={styles.loadingText}>Cargando ventas...</Text>
        </View>
      ) : ventas.length === 0 ? (
        <View style={styles.centered}>
          <View style={styles.emptyIcon}>
            <Ionicons name="pricetag-outline" size={44} color={colors.neonGreen + '60'} />
          </View>
          <Text style={styles.emptyTitle}>Sin ventas aún</Text>
          <Text style={styles.emptySubtitle}>
            Cuando marques una publicación como vendida aparecerá aquí
          </Text>
          <Pressable
            style={({ pressed }) => [styles.emptyBtn, pressed && { opacity: 0.8 }]}
            onPress={() => router.push('/(tabs)/sell')}
          >
            <Ionicons name="add" size={16} color={colors.background} />
            <Text style={styles.emptyBtnText}>Publicar algo</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Resumen */}
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, { borderColor: colors.neonGreen + '40' }]}>
              <Ionicons name="checkmark-circle" size={22} color={colors.neonGreen} />
              <Text style={[styles.summaryValue, { color: colors.neonGreen }]}>{ventas.length}</Text>
              <Text style={styles.summaryLabel}>Vendidas</Text>
            </View>
            <View style={[styles.summaryCard, { borderColor: colors.neonCyan + '40' }]}>
              <Ionicons name="cash" size={22} color={colors.neonCyan} />
              <Text style={[styles.summaryValue, { color: colors.neonCyan }]}>${totalRecaudado.toFixed(0)}</Text>
              <Text style={styles.summaryLabel}>Recaudado</Text>
            </View>
          </View>

          {/* Lista */}
          <Text style={styles.listTitle}>Artículos vendidos</Text>
          {ventas.map((product) => (
            <View key={product.id} style={styles.ventaCard}>
              {/* Imagen */}
              {product.image ? (
                <Image source={{ uri: product.image }} style={styles.ventaImage} />
              ) : (
                <View style={[styles.ventaImage, styles.ventaImageFallback]}>
                  <Ionicons name="shirt" size={28} color={colors.textMuted} />
                </View>
              )}

              {/* Info */}
              <View style={styles.ventaInfo}>
                <Text style={styles.ventaName} numberOfLines={1}>{product.name}</Text>
                <Text style={styles.ventaPrice}>${product.price}</Text>
                <View style={styles.ventaChips}>
                  {product.size && (
                    <View style={styles.chip}>
                      <Text style={styles.chipText}>{product.size}</Text>
                    </View>
                  )}
                  {product.condition && (
                    <View style={[styles.chip, styles.chipCond]}>
                      <Text style={styles.chipText}>{product.condition}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Badge vendida */}
              <View style={styles.ventaBadge}>
                <Ionicons name="checkmark-circle" size={14} color={colors.neonGreen} />
                <Text style={styles.ventaBadgeText}>Vendida</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const makeStyles = (c: ColorPalette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
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
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: c.neonGreen + '18',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: c.neonGreen + '30',
  },
  headerTitle: { color: c.neonGreen, fontSize: 22, fontWeight: '700' },
  headerSubtitle: { color: c.textMuted, fontSize: 13, marginTop: 1 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    padding: 32,
  },
  loadingText: { color: c.textMuted, fontSize: 14 },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: c.neonGreen + '12',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: c.neonGreen + '25',
  },
  emptyTitle: { color: c.textPrimary, fontSize: 18, fontWeight: '700' },
  emptySubtitle: { color: c.textMuted, fontSize: 13, textAlign: 'center' },
  emptyBtn: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: c.neonGreen,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyBtnText: { color: c.background, fontWeight: '700', fontSize: 14 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: c.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
  },
  summaryValue: {
    fontSize: 26,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  summaryLabel: { color: c.textMuted, fontSize: 12 },
  listTitle: {
    color: c.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  ventaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.card,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: c.border,
    gap: 12,
  },
  ventaImage: {
    width: 64,
    height: 64,
    borderRadius: 10,
  },
  ventaImageFallback: {
    backgroundColor: c.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ventaInfo: { flex: 1 },
  ventaName: {
    color: c.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  ventaPrice: {
    color: c.neonGreen,
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  ventaChips: { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
  chip: {
    backgroundColor: c.neonCyan + '18',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: c.neonCyan + '30',
  },
  chipCond: {
    backgroundColor: c.neonMagenta + '18',
    borderColor: c.neonMagenta + '30',
  },
  chipText: { color: c.textSecondary, fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
  ventaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: c.neonGreen + '18',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: c.neonGreen + '35',
  },
  ventaBadgeText: { color: c.neonGreen, fontSize: 11, fontWeight: '700' },
});

