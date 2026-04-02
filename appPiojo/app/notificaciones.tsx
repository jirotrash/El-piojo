import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColors } from '../src/hooks/useColors';
import type { ColorPalette } from '../src/theme/colors';

const MOCK_NOTIFS = [
  { id: '1', titulo: 'Tu compra fue confirmada', cuerpo: 'La Sudadera Nike ya está en camino', hora: 'Hace 2h', leida: false, icon: 'cart', color: 'primary' },
  { id: '2', titulo: 'Nueva prenda disponible', cuerpo: 'Hay una chamarra de tu talla en el catálogo', hora: 'Ayer', leida: false, icon: 'shirt', color: 'secondary' },
  { id: '3', titulo: 'Donación recibida', cuerpo: 'Gracias por tu donación al banco de ropa', hora: '2 días', leida: true, icon: 'heart', color: 'mint' },
  { id: '4', titulo: 'Perfil actualizado', cuerpo: 'Tu información fue guardada correctamente', hora: '3 días', leida: true, icon: 'person', color: 'lavender' },
];

export default function NotificacionesScreen() {
  const router = useRouter();
  const colors = useColors();
  const styles = makeStyles(colors);
  const [notifs, setNotifs] = useState(MOCK_NOTIFS);

  const marcarLeida = (id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
  };

  const colorMap: Record<string, string> = {
    primary: colors.primary,
    secondary: colors.secondary,
    mint: colors.mint,
    lavender: colors.lavender,
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Notificaciones</Text>
        {notifs.some(n => !n.leida) && (
          <Pressable onPress={() => setNotifs(prev => prev.map(n => ({ ...n, leida: true })))} style={styles.markAll}>
            <Text style={styles.markAllText}>Marcar todas</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={notifs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const accent = colorMap[item.color] ?? colors.primary;
          return (
            <Pressable
              style={[styles.card, !item.leida && styles.cardUnread]}
              onPress={() => marcarLeida(item.id)}
            >
              <View style={[styles.iconBox, { backgroundColor: accent + '20' }]}>
                <Ionicons name={item.icon as any} size={22} color={accent} />
              </View>
              <View style={styles.info}>
                <Text style={[styles.notifTitle, !item.leida && styles.notifTitleUnread]}>
                  {item.titulo}
                </Text>
                <Text style={styles.notifBody}>{item.cuerpo}</Text>
                <Text style={styles.hora}>{item.hora}</Text>
              </View>
              {!item.leida && <View style={[styles.dot, { backgroundColor: accent }]} />}
            </Pressable>
          );
        }}
      />
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
  title: { fontSize: 20, fontWeight: '700', color: c.textPrimary, flex: 1 },
  markAll: { paddingHorizontal: 8 },
  markAllText: { fontSize: 13, color: c.primary, fontWeight: '600' },
  list: { padding: 16, gap: 10 },
  card: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    backgroundColor: c.card, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: c.border,
  },
  cardUnread: { borderColor: c.primary + '40', backgroundColor: c.primary + '08' },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  info: { flex: 1, gap: 3 },
  notifTitle: { fontSize: 14, fontWeight: '500', color: c.textSecondary },
  notifTitleUnread: { fontWeight: '700', color: c.textPrimary },
  notifBody: { fontSize: 13, color: c.textMuted },
  hora: { fontSize: 11, color: c.textMuted, marginTop: 2 },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 4, flexShrink: 0 },
});
