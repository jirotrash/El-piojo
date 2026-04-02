import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useColors } from '../src/hooks/useColors';
import type { ColorPalette } from '../src/theme/colors';
import { useAuthStore } from '../src/context/authStore';
import { getMisCompras, type Compra } from '../src/services/conversacionesService';

export default function MisComprasScreen() {
  const router = useRouter();
  const colors = useColors();
  const styles = makeStyles(colors);
  const { user } = useAuthStore();

  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!user?.id) return;
      setLoading(true);
      getMisCompras(user.id)
        .then(setCompras)
        .catch(() => setCompras([]))
        .finally(() => setLoading(false));
    }, [user?.id]),
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Mis Compras</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.neonCyan} size="large" />
        </View>
      ) : compras.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="receipt-outline" size={64} color={colors.textMuted} />
          <Text style={styles.emptyText}>Aún no tienes compras</Text>
        </View>
      ) : (
        <FlatList
          data={compras}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={[styles.iconBox, { backgroundColor: colors.neonCyan + '18' }]}>
                <Ionicons name="receipt" size={24} color={colors.neonCyan} />
              </View>
              <View style={styles.info}>
                <Text style={styles.itemName}>{item.nombre}</Text>
                <Text style={styles.itemDate}>{item.fecha}</Text>
              </View>
              <View style={styles.right}>
                <Text style={styles.precio}>${item.precio}</Text>
                <View style={[styles.badge, {
                  backgroundColor: item.estado === 'Entregado'
                    ? colors.neonGreen + '20'
                    : colors.warning + '20',
                }]}>
                  <Text style={[styles.badgeText, {
                    color: item.estado === 'Entregado' ? colors.neonGreen : colors.warning,
                  }]}>
                    {item.estado}
                  </Text>
                </View>
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
  right: { alignItems: 'flex-end', gap: 6 },
  precio: { fontSize: 16, fontWeight: '700', color: c.neonCyan, fontFamily: 'monospace' },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '600' },
});
