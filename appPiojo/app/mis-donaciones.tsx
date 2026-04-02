import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useColors } from '../src/hooks/useColors';
import type { ColorPalette } from '../src/theme/colors';
import { useAuthStore } from '../src/context/authStore';
import { getMisDonaciones } from '../src/services/publicacionesService';
import type { Product } from '../src/interfaces';

function formatFecha(raw?: string): string {
  if (!raw) return '';
  const d = new Date(raw.replace(' ', 'T'));
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function MisDonacionesScreen() {
  const router = useRouter();
  const colors = useColors();
  const styles = makeStyles(colors);
  const { user } = useAuthStore();

  const [donaciones, setDonaciones] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!user?.id) return;
      setLoading(true);
      getMisDonaciones(user.id)
        .then(setDonaciones)
        .catch(() => setDonaciones([]))
        .finally(() => setLoading(false));
    }, [user?.id]),
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Mis Donaciones</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.neonMagenta} size="large" />
        </View>
      ) : donaciones.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="heart-outline" size={64} color={colors.textMuted} />
          <Text style={styles.emptyText}>Aún no tienes donaciones</Text>
        </View>
      ) : (
        <FlatList
          data={donaciones}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={[styles.iconBox, { backgroundColor: colors.neonMagenta + '18' }]}>
                <Ionicons name="heart" size={24} color={colors.neonMagenta} />
              </View>
              <View style={styles.info}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDate}>
                  {item.size ? `Talla ${item.size}` : ''}
                  {item.size && item.createdAt ? ' · ' : ''}
                  {item.createdAt ? formatFecha(item.createdAt) : ''}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: colors.neonGreen + '20' }]}>
                <Text style={[styles.badgeText, { color: colors.neonGreen }]}>Donado</Text>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const makeStyles = (c: ColorPalette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: c.card, borderBottomWidth: 1, borderBottomColor: c.border,
  },
  back: { padding: 4 },
  title: { fontSize: 20, fontWeight: '700', color: c.textPrimary },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 16, color: c.textMuted },
  list: { padding: 16, gap: 12 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: c.card, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: c.border,
  },
  iconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '600', color: c.textPrimary },
  itemDate: { fontSize: 12, color: c.textMuted, marginTop: 3 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '600' },
});
