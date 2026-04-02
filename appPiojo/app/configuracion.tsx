import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColors } from '../src/hooks/useColors';
import { useThemeStore } from '../src/context/themeStore';
import type { ColorPalette } from '../src/theme/colors';

export default function ConfiguracionScreen() {
  const router = useRouter();
  const colors = useColors();
  const styles = makeStyles(colors);
  const { mode, setMode } = useThemeStore();

  const [pushNotifs, setPushNotifs] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(false);
  const [showMatricula, setShowMatricula] = useState(true);

  type ThemeOption = { key: 'system' | 'light' | 'dark'; label: string; icon: string };
  const themeOptions: ThemeOption[] = [
    { key: 'light',  label: 'Claro',   icon: 'sunny' },
    { key: 'system', label: 'Sistema', icon: 'phone-portrait' },
    { key: 'dark',   label: 'Oscuro',  icon: 'moon' },
  ];

  const Section = ({ title }: { title: string }) => (
    <Text style={styles.sectionLabel}>{title}</Text>
  );

  const Row = ({
    icon, label, color, onPress, right,
  }: {
    icon: string; label: string; color: string;
    onPress?: () => void; right?: React.ReactNode;
  }) => (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={onPress}
    >
      <View style={[styles.iconBox, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      {right ?? <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />}
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Configuración</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <Section title="APARIENCIA" />
        <View style={styles.card}>
          <View style={styles.themeRow}>
            <View style={[styles.iconBox, { backgroundColor: colors.accent + '18' }]}>
              <Ionicons name="color-palette" size={20} color={colors.accent} />
            </View>
            <Text style={styles.rowLabel}>Tema</Text>
          </View>
          <View style={styles.themePicker}>
            {themeOptions.map((opt) => {
              const active = mode === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  style={[styles.themeChip, active && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                  onPress={() => setMode(opt.key)}
                >
                  <Ionicons name={opt.icon as any} size={16} color={active ? colors.background : colors.textSecondary} />
                  <Text style={[styles.themeChipText, { color: active ? colors.background : colors.textSecondary }]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Section title="CUENTA" />
        <View style={styles.card}>
          <Row icon="person-circle" label="Editar perfil" color={colors.primary} />
          <View style={styles.divider} />
          <Row icon="lock-closed" label="Cambiar contraseña" color={colors.secondary} />
          <View style={styles.divider} />
          <Row icon="school" label="Mostrar matrícula" color={colors.mint}
            right={
              <Switch
                value={showMatricula}
                onValueChange={setShowMatricula}
                trackColor={{ false: colors.border, true: colors.mint + '60' }}
                thumbColor={showMatricula ? colors.mint : colors.textMuted}
              />
            }
          />
        </View>

        <Section title="NOTIFICACIONES" />
        <View style={styles.card}>
          <Row icon="notifications" label="Notificaciones push" color={colors.accent}
            right={
              <Switch
                value={pushNotifs}
                onValueChange={setPushNotifs}
                trackColor={{ false: colors.border, true: colors.accent + '60' }}
                thumbColor={pushNotifs ? colors.accent : colors.textMuted}
              />
            }
          />
          <View style={styles.divider} />
          <Row icon="mail" label="Notificaciones por email" color={colors.lavender}
            right={
              <Switch
                value={emailNotifs}
                onValueChange={setEmailNotifs}
                trackColor={{ false: colors.border, true: colors.lavender + '60' }}
                thumbColor={emailNotifs ? colors.lavender : colors.textMuted}
              />
            }
          />
        </View>

        <Section title="INFORMACIÓN" />
        <View style={styles.card}>
          <Row icon="document-text" label="Términos y condiciones" color={colors.textSecondary} />
          <View style={styles.divider} />
          <Row icon="shield-checkmark" label="Política de privacidad" color={colors.textSecondary} />
          <View style={styles.divider} />
          <Row icon="information-circle" label="Versión 1.0.0" color={colors.textMuted}
            right={<Text style={styles.versionText}>1.0.0</Text>}
          />
        </View>

      </ScrollView>
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
  content: { padding: 16, gap: 8, paddingBottom: 40 },
  sectionLabel: {
    fontSize: 12, fontWeight: '700', color: c.textMuted,
    letterSpacing: 1, marginTop: 16, marginBottom: 6, marginLeft: 4,
  },
  card: {
    backgroundColor: c.card, borderRadius: 16,
    borderWidth: 1, borderColor: c.border, overflow: 'hidden',
  },
  divider: { height: 1, backgroundColor: c.border, marginHorizontal: 16 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  rowPressed: { backgroundColor: c.surface },
  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  rowLabel: { flex: 1, fontSize: 15, color: c.textPrimary },
  versionText: { fontSize: 13, color: c.textMuted },
  themeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10,
  },
  themePicker: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 16, paddingBottom: 16,
  },
  themeChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1.5, borderColor: c.border,
    backgroundColor: c.surface,
  },
  themeChipText: { fontSize: 13, fontWeight: '600' },
});
