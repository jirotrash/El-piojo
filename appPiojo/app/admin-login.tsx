import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { graphqlRequest, decodeJwtPayload, setAuthToken } from '../src/api/api';
import { LOGIN_MUTATION } from '../src/api/queries';

const ADMIN_ROLE = 1; // id_roles del administrador

export default function AdminLoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Ingresa correo y contraseña');
      return;
    }
    setLoading(true);
    try {
      const data = await graphqlRequest<{ login: string }>(LOGIN_MUTATION, {
        email: email.trim(),
        password,
      });
      const token = data.login;
      // El JWT solo contiene sub + email, necesitamos consultar el rol
      setAuthToken(token);
      const payload = decodeJwtPayload(token);
      const userId = payload.sub as number;
      const userData = await graphqlRequest<{ usuario: { id_roles: number } }>(
        `query U($id: Int!) { usuario(id: $id) { id_roles } }`,
        { id: userId },
      );
      if (userData.usuario?.id_roles !== ADMIN_ROLE) {
        setAuthToken(null);
        Alert.alert('Acceso denegado', 'No tienes permisos de administrador.');
        setLoading(false);
        return;
      }
      router.replace('/admin-dashboard');
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          {/* Back */}
          <Pressable style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="#22d3ee" />
          </Pressable>

          {/* Logo */}
          <View style={s.logoWrap}>
            <View style={s.logoBox}>
              <Ionicons name="flash" size={36} color="#22d3ee" />
            </View>
          </View>

          {/* Title */}
          <Text style={s.title}>ADMIN PANEL</Text>
          <Text style={s.subtitle}>{'// MARKETPLACE UNIVERSITARIO'}</Text>

          {/* Hint card */}
          <View style={s.hintCard}>
            <Text style={s.hintLine}>{`> USER: admin@admin.com`}</Text>
            <Text style={s.hintLine}>{`> PASS: admin123`}</Text>
          </View>

          {/* Form */}
          <View style={s.form}>
            <Text style={s.fieldLabel}>CORREO ELECTRÓNICO</Text>
            <View style={s.inputWrap}>
              <Ionicons name="person-outline" size={18} color="#22d3ee" style={s.inputIcon} />
              <TextInput
                style={s.input}
                placeholder="admin@admin.com"
                placeholderTextColor="#4a6275"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <Text style={s.fieldLabel}>CONTRASEÑA</Text>
            <View style={s.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color="#22d3ee" style={s.inputIcon} />
              <TextInput
                style={[s.input, { flex: 1 }]}
                placeholder="••••••••"
                placeholderTextColor="#4a6275"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
              />
              <Pressable onPress={() => setShowPass(!showPass)} style={s.eyeBtn}>
                <Ionicons
                  name={showPass ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#4a6275"
                />
              </Pressable>
            </View>

            <Pressable
              style={[s.submitBtn, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#0a0f1a" size="small" />
                : <Text style={s.submitText}>INICIAR SESIÓN</Text>
              }
            </Pressable>
          </View>

          <Text style={s.footer}>SYS v2.0 // SECURE_ACCESS</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const CYAN = '#22d3ee';
const BG = '#0a0f1a';
const CARD = '#0f1826';
const BORDER = '#1a3a4a';

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 16, paddingBottom: 40 },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoWrap: { alignItems: 'center', marginTop: 12, marginBottom: 16 },
  logoBox: {
    width: 76,
    height: 76,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: CYAN,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: CARD,
    shadowColor: CYAN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    color: CYAN,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 6,
    textAlign: 'center',
    textShadowColor: CYAN,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  subtitle: {
    color: '#4a6275',
    fontSize: 12,
    letterSpacing: 3,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  hintCard: {
    backgroundColor: CARD,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    marginBottom: 28,
  },
  hintLine: { color: CYAN, fontSize: 13, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', marginBottom: 2 },
  form: { gap: 4 },
  fieldLabel: {
    color: '#4a6275',
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 6,
    marginTop: 10,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1,
    color: '#e0f2fe',
    fontSize: 15,
    paddingVertical: 12,
  },
  eyeBtn: { padding: 6 },
  submitBtn: {
    marginTop: 28,
    backgroundColor: CYAN,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: CYAN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  submitText: {
    color: '#0a0f1a',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 3,
  },
  footer: {
    color: '#243040',
    fontSize: 11,
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 36,
  },
});
