import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '../../src/hooks/useColors';
import type { ColorPalette } from '../../src/theme/colors';
import { useChatStore } from '../../src/context/chatStore';

// ── Tab bar personalizado ──────────────────────────────────────────────────────
function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const styles = makeStyles(colors, insets.bottom);
  const unreadCount = useChatStore((s) => s.getUnreadCount());

  const tabConfig: Record<string, { icon: string; activeIcon: string; label: string }> = {
    index:    { icon: 'storefront-outline',    activeIcon: 'storefront',          label: 'Catálogo'  },
    ventas:   { icon: 'pricetag-outline',      activeIcon: 'pricetag',            label: 'Ventas'    },
    sell:     { icon: 'add-circle-outline',    activeIcon: 'add-circle',          label: 'Publicar'  },
    messages: { icon: 'chatbubble-outline',    activeIcon: 'chatbubble',          label: 'Mensajes'  },
    profile:  { icon: 'person-circle-outline', activeIcon: 'person-circle',       label: 'Perfil'    },
  };

  const currentRouteName = state.routes[state.index]?.name;
  if (currentRouteName === 'sell') return null;

  return (
    <View style={styles.tabBarWrapper}>
      <View style={styles.tabBar}>
        {state.routes.filter(r => r.name !== 'donate').map((route, index) => {
          // recalcular isFocused con el índice original
          const originalIndex = state.routes.findIndex(r => r.key === route.key);
          const isFocused = state.index === originalIndex;
          const cfg = tabConfig[route.name] ?? { icon: 'ellipse-outline', activeIcon: 'ellipse', label: route.name };
          const isCenter = route.name === 'sell';
          const isMessages = route.name === 'messages';

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          if (isCenter) {
            return (
              <Pressable key={route.key} onPress={onPress} style={styles.centerTab}>
                <View style={[styles.centerButton, isFocused && styles.centerButtonActive]}>
                  <Ionicons name={isFocused ? cfg.activeIcon as any : cfg.icon as any} size={28} color="#fff" />
                </View>
                <Text style={[styles.centerLabel, { color: isFocused ? colors.secondary : colors.textMuted }]}>
                  {cfg.label}
                </Text>
              </Pressable>
            );
          }

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.tab}
            >
              <View style={[styles.iconWrap, isFocused && { backgroundColor: colors.primary + '18' }]}>
                <Ionicons
                  name={isFocused ? cfg.activeIcon as any : cfg.icon as any}
                  size={22}
                  color={isFocused ? colors.primary : colors.textMuted}
                />
                {isMessages && unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.label, { color: isFocused ? colors.primary : colors.textMuted }]}>
                {cfg.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ── Layout ─────────────────────────────────────────────────────────────────────
export default function TabLayout() {
  const colors = useColors();

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index"    options={{ title: 'Catálogo'  }} />
      <Tabs.Screen name="ventas"   options={{ title: 'Ventas'    }} />
      <Tabs.Screen name="donate"   options={{ title: 'Donar', href: null }} />
      <Tabs.Screen name="sell"     options={{ title: 'Publicar'  }} />
      <Tabs.Screen name="messages" options={{ title: 'Mensajes'  }} />
      <Tabs.Screen name="profile"  options={{ title: 'Perfil'    }} />
    </Tabs>
  );
}

// ── Estilos ────────────────────────────────────────────────────────────────────
const makeStyles = (c: ColorPalette, bottomInset: number = 0) => StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: bottomInset + 8,
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: c.card,
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  iconWrap: {
    width: 44,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
  },
  // Centro
  centerTab: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    marginTop: -24,
  },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: c.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: c.secondary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 12,
    borderWidth: 4,
    borderColor: c.card,
  },
  centerButtonActive: {
    backgroundColor: c.primary,
    shadowColor: c.primary,
  },
  centerLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  // Badge mensajes
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: c.secondary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
});

