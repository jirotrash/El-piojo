import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColors } from '../src/hooks/useColors';
import type { ColorPalette } from '../src/theme/colors';

const MOCK_FAVORITOS = [
  { id: '1', nombre: 'Sudadera Oversize Beige', precio: 290, talla: 'M' },
  { id: '2', nombre: 'Chamarra Corta Rosa', precio: 380, talla: 'S' },
  { id: '3', nombre: 'Playera Vintage Blanca', precio: 150, talla: 'L' },
];

export default function FavoritosScreen() {
  const router = useRouter();
  const colors = useColors();
  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Favoritos</Text>
      </View>

      {MOCK_FAVORITOS.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="star-outline" size={64} color={colors.textMuted} />
          <Text style={styles.emptyText}>No tienes favoritos aún</Text>
        </View>
      ) : (
        <FlatList
          data={MOCK_FAVORITOS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={[styles.iconBox, { backgroundColor: colors.accent + '18' }]}>
                <Ionicons name="star" size={24} color={colors.accent} />
              </View>
              <View style={styles.info}>
                <Text style={styles.itemName}>{item.nombre}</Text>
                <Text style={styles.itemSub}>Talla {item.talla}</Text>
              </View>
              <Text style={styles.precio}>${item.precio}</Text>
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
  list: { padding: 16, gap: 12 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: c.card, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: c.border,
  },
  iconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '600', color: c.textPrimary },
  itemSub: { fontSize: 12, color: c.textMuted, marginTop: 3 },
  precio: { fontSize: 16, fontWeight: '700', color: c.accent },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 16, color: c.textMuted },
});
