import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useColors } from '../../src/hooks/useColors';
import type { ColorPalette } from '../../src/theme/colors';
import { useAuthStore } from '../../src/context/authStore';
import { getMisPublicaciones } from '../../src/services/publicacionesService';
import { graphqlRequest } from '../../src/api/api';
import { MARCAR_VENDIDA_MUTATION } from '../../src/api/queries';
import type { Product } from '../../src/interfaces';

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const colors = useColors();
  const styles = makeStyles(colors);

  const [misPublicaciones, setMisPublicaciones] = useState<Product[]>([]);
  const [loadingPubs, setLoadingPubs] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!user?.id) return;
      setLoadingPubs(true);
      getMisPublicaciones(user.id)
        .then(setMisPublicaciones)
        .catch(() => setMisPublicaciones([]))
        .finally(() => setLoadingPubs(false));
    }, [user?.id]),
  );

  const handleMarcarVendida = (product: Product) => {
    Alert.alert(
      'Marcar como vendida',
      `¿Confirmas que "${product.name}" fue vendida?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, marcar vendida',
          style: 'destructive',
          onPress: async () => {
            try {
              await graphqlRequest(MARCAR_VENDIDA_MUTATION, { id: parseInt(product.id) });
              setMisPublicaciones((prev) => prev.filter((p) => p.id !== product.id));
            } catch {
              Alert.alert('Error', 'No se pudo marcar como vendida.');
            }
          },
        },
      ],
    );
  };

  const stats = [
    { label: 'Compras',    value: '-', icon: 'cart',      color: colors.neonCyan },
    { label: 'Donaciones', value: '-', icon: 'heart',     color: colors.neonMagenta },
    { label: 'Ventas',     value: '-', icon: 'pricetag',  color: colors.neonGreen },
  ];

  const menuItems = [
    { icon: 'receipt',       label: 'Mis Compras',     color: colors.neonCyan,      route: '/mis-compras' },
    { icon: 'heart',         label: 'Mis Donaciones',  color: colors.neonMagenta,   route: '/mis-donaciones' },
    { icon: 'pricetag',      label: 'Mis Ventas',      color: colors.neonGreen,     route: '/mis-ventas' },
    { icon: 'notifications', label: 'Notificaciones',  color: colors.primary,       route: '/notificaciones' },
    { icon: 'settings',      label: 'Configuración',   color: colors.textSecondary, route: '/configuracion' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="person" size={28} color={colors.neonMagenta} />
        </View>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            {user?.foto_perfil ? (
              <Image source={{ uri: user.foto_perfil.replace(/^http:\/\//i, 'https://') }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('') || 'U'}
              </Text>
            )}
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Usuario'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            {user?.matricula && (
              <View style={styles.matriculaBadge}>
                <Ionicons name="school" size={12} color={colors.neonCyan} />
                <Text style={styles.matriculaText}>{user.matricula}</Text>
              </View>
            )}
          </View>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role === 'admin' ? 'Admin' : 'Usuario'}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={[styles.statCard, { borderColor: stat.color }]}>
              <Ionicons name={stat.icon as any} size={24} color={stat.color} />
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <Pressable
              key={index}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.menuItemPressed,
              ]}
              onPress={() => router.push(item.route as any)}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>

        {/* Mis Publicaciones */}
        <View style={styles.pubsSection}>
          {/* Header */}
          <View style={styles.pubsHeader}>
            <View style={styles.pubsHeaderLeft}>
              <View style={styles.pubsHeaderIcon}>
                <Ionicons name="storefront" size={18} color={colors.neonCyan} />
              </View>
              <Text style={styles.pubsTitle}>Mis Publicaciones</Text>
            </View>
            {!loadingPubs && misPublicaciones.length > 0 && (
              <View style={styles.pubsCountBadge}>
                <Text style={styles.pubsCountText}>{misPublicaciones.length}</Text>
              </View>
            )}
          </View>

          {loadingPubs ? (
            <View style={styles.pubsLoadingBox}>
              <ActivityIndicator color={colors.neonCyan} size="large" />
              <Text style={styles.pubsLoadingText}>Cargando...</Text>
            </View>
          ) : misPublicaciones.length === 0 ? (
            <View style={styles.pubsEmpty}>
              <View style={styles.pubsEmptyIcon}>
                <Ionicons name="shirt-outline" size={40} color={colors.neonCyan + '60'} />
              </View>
              <Text style={styles.pubsEmptyTitle}>Sin publicaciones</Text>
              <Text style={styles.pubsEmptyText}>Todo lo que publiques aparecerá aquí</Text>
              <Pressable
                style={({ pressed }) => [styles.pubsPublicarBtn, pressed && { opacity: 0.8 }]}
                onPress={() => router.push('/(tabs)/sell')}
              >
                <Ionicons name="add" size={16} color={colors.background} />
                <Text style={styles.pubsPublicarBtnText}>Publicar algo</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.pubsGrid}>
              {misPublicaciones.map((product) => (
                <View key={product.id} style={styles.pubGridCard}>
                  {/* Imagen */}
                  <View style={styles.pubGridImageWrap}>
                    {product.image ? (
                      <Image source={{ uri: product.image }} style={styles.pubGridImage} />
                    ) : (
                      <View style={[styles.pubGridImage, styles.pubGridImageFallback]}>
                        <Ionicons name="shirt" size={36} color={colors.textMuted} />
                      </View>
                    )}
                    {/* precio sobre imagen */}
                    <View style={styles.pubPricePill}>
                      <Text style={styles.pubPricePillText}>${product.price}</Text>
                    </View>
                    {/* botón vendida flotante */}
                    <Pressable
                      style={({ pressed }) => [styles.pubSoldBtn, pressed && { opacity: 0.75 }]}
                      onPress={() => handleMarcarVendida(product)}
                    >
                      <Ionicons name="checkmark-circle" size={18} color="#fff" />
                    </Pressable>
                  </View>

                  {/* Info */}
                  <View style={styles.pubGridInfo}>
                    <Text style={styles.pubGridName} numberOfLines={1}>{product.name}</Text>
                    <View style={styles.pubGridMeta}>
                      {product.size && (
                        <View style={styles.pubMetaChip}>
                          <Text style={styles.pubMetaChipText}>{product.size}</Text>
                        </View>
                      )}
                      {product.condition && (
                        <View style={[styles.pubMetaChip, styles.pubMetaChipCond]}>
                          <Text style={styles.pubMetaChipText}>{product.condition}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>PIOJO</Text>
          <Text style={styles.appVersion}>Versión 1.0.0</Text>
          <Text style={styles.appTagline}>Compra • Dona • Vende</Text>
        </View>
      </ScrollView>
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
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: c.neonMagenta + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: c.neonMagenta,
    fontSize: 22,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: c.neonMagenta + '30',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: c.neonMagenta + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: c.neonMagenta,
  },
  avatarText: {
    color: c.neonMagenta,
    fontSize: 24,
    fontWeight: '700',
  },
  avatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: c.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  userEmail: {
    color: c.textMuted,
    fontSize: 13,
  },
  matriculaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  matriculaText: {
    color: c.neonCyan,
    fontSize: 11,
    fontFamily: 'monospace',
  },
  roleBadge: {
    backgroundColor: c.neonMagenta,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleText: {
    color: c.background,
    fontSize: 11,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: c.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: 'monospace',
    marginTop: 8,
  },
  statLabel: {
    color: c.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  menuSection: {
    backgroundColor: c.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  menuItemPressed: {
    backgroundColor: c.secondary,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuLabel: {
    flex: 1,
    color: c.textPrimary,
    fontSize: 15,
  },
  // ── Mis Publicaciones ─────────────────────────────────────────────────────
  pubsSection: {
    marginBottom: 24,
  },
  pubsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  pubsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pubsHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: c.neonCyan + '18',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: c.neonCyan + '30',
  },
  pubsTitle: {
    color: c.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  pubsCountBadge: {
    backgroundColor: c.neonCyan,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    minWidth: 28,
    alignItems: 'center',
  },
  pubsCountText: {
    color: c.background,
    fontSize: 13,
    fontWeight: '800',
  },
  pubsLoadingBox: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  pubsLoadingText: {
    color: c.textMuted,
    fontSize: 13,
  },
  pubsEmpty: {
    alignItems: 'center',
    backgroundColor: c.card,
    borderRadius: 20,
    paddingVertical: 36,
    paddingHorizontal: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: c.border,
  },
  pubsEmptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: c.neonCyan + '12',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: c.neonCyan + '25',
  },
  pubsEmptyTitle: {
    color: c.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  pubsEmptyText: {
    color: c.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
  pubsPublicarBtn: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: c.neonCyan,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 12,
  },
  pubsPublicarBtnText: {
    color: c.background,
    fontWeight: '700',
    fontSize: 14,
  },
  // Grid
  pubsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  pubGridCard: {
    width: '47.5%',
    backgroundColor: c.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: c.border,
  },
  pubGridImageWrap: {
    position: 'relative',
  },
  pubGridImage: {
    width: '100%',
    height: 130,
  },
  pubGridImageFallback: {
    backgroundColor: c.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pubPricePill: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: c.background + 'dd',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: c.neonGreen + '50',
  },
  pubPricePillText: {
    color: c.neonGreen,
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  pubSoldBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: c.neonGreen,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  pubGridInfo: {
    padding: 10,
  },
  pubGridName: {
    color: c.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  pubGridMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  pubMetaChip: {
    backgroundColor: c.neonCyan + '18',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: c.neonCyan + '30',
  },
  pubMetaChipCond: {
    backgroundColor: c.neonMagenta + '18',
    borderColor: c.neonMagenta + '30',
  },
  pubMetaChipText: {
    color: c.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  appName: {
    color: c.neonMagenta,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 4,
  },
  appVersion: {
    color: c.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  appTagline: {
    color: c.neonCyan,
    fontSize: 11,
    marginTop: 4,
  },
});
