import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TextInput, Pressable, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColors } from '../src/hooks/useColors';
import type { ColorPalette } from '../src/theme/colors';
import { graphqlRequest, getAuthToken, decodeJwtPayload } from '../src/api/api';

const UPDATE_USUARIO = `
  mutation UpdateUsuario($id: Int!, $input: UpdateUsuariosInput!) {
    updateUsuario(id: $id, input: $input) {
      id_usuarios
    }
  }
`;

export default function CambiarContrasenaScreen() {
  const router = useRouter();
  const colors = useColors();
  const styles = makeStyles(colors);

  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (newPass.length < 6) {
      Alert.alert('Validación', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (newPass !== confirmPass) {
      Alert.alert('Validación', 'Las contraseñas no coinciden');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      Alert.alert('Error', 'Sesión no iniciada');
      router.back();
      return;
    }
    const userId = Number(decodeJwtPayload(token).sub);

    setSaving(true);
    try {
      await graphqlRequest(UPDATE_USUARIO, {
        id: userId,
        input: { password: newPass },
      });
      Alert.alert('Listo', 'Contraseña actualizada correctamente', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo actualizar la contraseña');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Cambiar contraseña</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <View style={styles.hintCard}>
          <Ionicons name="information-circle" size={20} color={colors.accent} />
          <Text style={styles.hintText}>La nueva contraseña debe tener al menos 6 caracteres.</Text>
        </View>

        <Text style={styles.sectionLabel}>NUEVA CONTRASEÑA</Text>
        <View style={styles.card}>
          <PasswordField
            label="Nueva contraseña"
            value={newPass}
            onChangeText={setNewPass}
            show={showNew}
            onToggleShow={() => setShowNew(v => !v)}
            colors={colors}
            styles={styles}
          />
          <View style={styles.divider} />
          <PasswordField
            label="Confirmar contraseña"
            value={confirmPass}
            onChangeText={setConfirmPass}
            show={showConfirm}
            onToggleShow={() => setShowConfirm(v => !v)}
            colors={colors}
            styles={styles}
          />
        </View>

        {newPass.length > 0 && confirmPass.length > 0 && (
          <View style={[styles.matchBadge, { backgroundColor: newPass === confirmPass ? colors.mint + '20' : colors.error + '20' }]}>
            <Ionicons
              name={newPass === confirmPass ? 'checkmark-circle' : 'close-circle'}
              size={16}
              color={newPass === confirmPass ? colors.mint : colors.error}
            />
            <Text style={[styles.matchText, { color: newPass === confirmPass ? colors.mint : colors.error }]}>
              {newPass === confirmPass ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
            </Text>
          </View>
        )}

        <Pressable
          style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.8 }, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={styles.saveBtnText}>Cambiar contraseña</Text>
          }
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

function PasswordField({
  label, value, onChangeText, show, onToggleShow, colors, styles,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  show: boolean;
  onToggleShow: () => void;
  colors: ColorPalette;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <View style={styles.fieldRow}>
      <View style={[styles.iconBox, { backgroundColor: colors.secondary + '18' }]}>
        <Ionicons name="lock-closed" size={18} color={colors.secondary} />
      </View>
      <View style={styles.fieldContent}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <TextInput
          style={styles.fieldInput}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!show}
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor={colors.textMuted}
          placeholder="••••••••"
        />
      </View>
      <Pressable onPress={onToggleShow} style={styles.eyeBtn}>
        <Ionicons name={show ? 'eye-off' : 'eye'} size={20} color={colors.textMuted} />
      </Pressable>
    </View>
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
  hintCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: c.accent + '12', borderRadius: 12,
    borderWidth: 1, borderColor: c.accent + '30',
    padding: 14, marginBottom: 8,
  },
  hintText: { flex: 1, fontSize: 13, color: c.textSecondary, lineHeight: 18 },
  sectionLabel: {
    fontSize: 12, fontWeight: '700', color: c.textMuted,
    letterSpacing: 1, marginTop: 12, marginBottom: 6, marginLeft: 4,
  },
  card: {
    backgroundColor: c.card, borderRadius: 16,
    borderWidth: 1, borderColor: c.border, overflow: 'hidden',
  },
  divider: { height: 1, backgroundColor: c.border, marginHorizontal: 16 },
  fieldRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  fieldContent: { flex: 1 },
  fieldLabel: { fontSize: 11, fontWeight: '600', color: c.textMuted, marginBottom: 2, letterSpacing: 0.5 },
  fieldInput: { fontSize: 15, color: c.textPrimary, paddingVertical: 2 },
  eyeBtn: { padding: 4 },
  matchBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: 10, padding: 10, marginTop: 4,
  },
  matchText: { fontSize: 13, fontWeight: '600' },
  saveBtn: {
    marginTop: 24, marginHorizontal: 4,
    backgroundColor: c.secondary, borderRadius: 14,
    paddingVertical: 15, alignItems: 'center',
  },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
