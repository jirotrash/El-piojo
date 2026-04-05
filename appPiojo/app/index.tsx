import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/context/authStore';
import { useColors } from '../src/hooks/useColors';
import type { ColorPalette } from '../src/theme/colors';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const colors = useColors();
  const styles = makeStyles(colors);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Animaciones del hero
  const b1Y   = useRef(new Animated.Value(0)).current;
  const b2Y   = useRef(new Animated.Value(0)).current;
  const b3Y   = useRef(new Animated.Value(0)).current;
  const b4Y   = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const float = (val: Animated.Value, dist: number, dur: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, { toValue: -dist, duration: dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(val, { toValue: dist * 0.4, duration: dur * 0.8, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(val, { toValue: 0, duration: dur * 0.6, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      ).start();

    float(b1Y, 18, 3200);
    float(b2Y, 14, 2700);
    float(b3Y, 10, 3800);
    float(b4Y, 16, 2400);

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.06, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,    duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu email y contraseña');
      return;
    }
    const success = await login(email.trim(), password);
    if (success) {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Hero gradient ─────────────────────────── */}
          <LinearGradient
            colors={['#18C5B8', '#1aacde', '#0e7fb5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            {/* Burbujas animadas */}
            <Animated.View style={[styles.heroBubble1, { transform: [{ translateY: b1Y }] }]} />
            <Animated.View style={[styles.heroBubble2, { transform: [{ translateY: b2Y }] }]} />
            <Animated.View style={[styles.heroBubble3, { transform: [{ translateY: b3Y }] }]} />
            <Animated.View style={[styles.heroBubble4, { transform: [{ translateY: b4Y }] }]} />

            {/* Logo con pulso */}
            <Animated.View style={[styles.logoCircle, { transform: [{ scale: pulse }] }]}>
              <Image
                source={require('../assets/images/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </Animated.View>

            <Text style={styles.heroTagline}>Marketplace de Ropa Universitaria</Text>
          </LinearGradient>

          {/* ── Form card (overlap hero) ──────────────── */}
          <View style={styles.card}>
            <Text style={styles.welcomeText}>Bienvenido de vuelta 👋</Text>
            <Text style={styles.instructionText}>Inicia sesión para continuar</Text>

            {/* Email */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Correo institucional</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={colors.primary} />
                <TextInput
                  style={styles.input}
                  placeholder="usuario@utvt.edu.mx"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={(t) => { setEmail(t); clearError(); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Contraseña */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Contraseña</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.primary} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={(t) => { setPassword(t); clearError(); }}
                  secureTextEntry={!showPassword}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textMuted}
                  />
                </Pressable>
              </View>
            </View>

            {/* Error */}
            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={18} color={colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Botón login con gradiente coral */}
            <Pressable
              style={({ pressed }) => [styles.loginButtonWrap, pressed && { opacity: 0.87 }]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <LinearGradient
                colors={[colors.secondary, '#CC5235']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginButton}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="log-in-outline" size={22} color="#fff" />
                    <Text style={styles.loginButtonText}>INICIAR SESIÓN</Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>

            {/* Registro */}
            <View style={styles.registerRow}>
              <Text style={styles.registerText}>¿No tienes cuenta?</Text>
              <Pressable onPress={() => router.push('/register')} hitSlop={8}>
                <Text style={styles.registerLink}> Regístrate</Text>
              </Pressable>
            </View>

          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerDot}>●</Text>
            <Text style={styles.footerText}> Compra · Dona · Vende </Text>
            <Text style={styles.footerDot}>●</Text>
            <Text style={styles.footerVersion}>  v1.0.0</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (c: ColorPalette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.primary },
  flex:      { flex: 1 },
  scroll:    { flexGrow: 1 },

  // ── Hero ──────────────────────────────────────
  hero: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 72,
    overflow: 'hidden',
  },
  heroBubble1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  heroBubble2: {
    position: 'absolute',
    bottom: 20,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroBubble3: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  heroBubble4: {
    position: 'absolute',
    bottom: -10,
    right: 30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  logoCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.6)',
    shadowColor: '#0a6e99',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 14,
  },
  logoImage: {
    width: 148,
    height: 148,
    borderRadius: 74,
  },
  heroTagline: {
    color: 'rgba(255,255,255,0.84)',
    fontSize: 13,
    marginTop: 6,
    letterSpacing: 0.4,
  },

  // ── Card ──────────────────────────────────────
  card: {
    backgroundColor: c.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -26,
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 12,
  },
  welcomeText: {
    color: c.foreground,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  instructionText: {
    color: c.textMuted,
    fontSize: 14,
    marginBottom: 28,
  },

  // ── Inputs ────────────────────────────────────
  inputWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    color: c.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: c.border,
  },
  input: {
    flex: 1,
    color: c.foreground,
    fontSize: 15,
    marginLeft: 10,
  },

  // ── Error ─────────────────────────────────────
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.error + '18',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: c.error + '30',
  },
  errorText: { color: c.error, fontSize: 13 },

  // ── Login button ──────────────────────────────
  loginButtonWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 4,
    shadowColor: c.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  // ── Register row ──────────────────────────────
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  registerText:  { color: c.textMuted, fontSize: 14 },
  registerLink:  { color: c.primary, fontSize: 14, fontWeight: '700' },

  // ── Footer ────────────────────────────────────
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: c.background,
  },
  footerDot:     { color: c.accent, fontSize: 8 },
  footerText:    { color: c.textMuted, fontSize: 12 },
  footerVersion: { color: c.textMuted, fontSize: 11 },
});
