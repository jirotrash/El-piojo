import React, { useState, useEffect } from 'react';
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
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore, RegisterData } from '../src/context/authStore';
import { useColors } from '../src/hooks/useColors';
import type { ColorPalette } from '../src/theme/colors';
import { graphqlRequest } from '../src/api/api';
import { GET_CARRERAS_QUERY, GET_MUNICIPIOS_QUERY } from '../src/api/queries';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState<Partial<RegisterData>>({
    id_roles: 2,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1: datos básicos, 2: datos adicionales
  const [showPicker, setShowPicker] = useState<'carrera' | 'municipio' | null>(null);
  const [carrerasList, setCarrerasList] = useState<{ id: number; nombre: string }[]>([]);
  const [municipiosList, setMunicipiosList] = useState<{ id: number; nombre: string }[]>([]);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const colors = useColors();
  const styles = makeStyles(colors);

  useEffect(() => {
    graphqlRequest<{ carreras: { id_carreras: number; nombre: string }[] }>(GET_CARRERAS_QUERY)
      .then((res) => setCarrerasList(res.carreras.map((c) => ({ id: c.id_carreras, nombre: c.nombre }))))
      .catch(() => {});
    graphqlRequest<{ municipios: { id_municipios: number; nombre: string }[] }>(GET_MUNICIPIOS_QUERY)
      .then((res) => setMunicipiosList(res.municipios.map((m) => ({ id: m.id_municipios, nombre: m.nombre }))))
      .catch(() => {});
  }, []);

  const updateField = (field: keyof RegisterData, value: any) => {
    setFormData({ ...formData, [field]: value });
    clearError();
  };

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return cameraStatus === 'granted' && libraryStatus === 'granted';
  };

  const pickImageFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert('Permisos necesarios', 'Necesitamos acceso a tu galería');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
      base64: true,
      allowsMultipleSelection: false,
    });

    if (!result.canceled && result.assets[0].base64) {
      updateField('foto_perfil', `data:image/jpeg;base64,${result.assets[0].base64}`);
    }
    setShowImagePicker(false);
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert('Permisos necesarios', 'Necesitamos acceso a tu cámara');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      updateField('foto_perfil', `data:image/jpeg;base64,${result.assets[0].base64}`);
    }
    setShowImagePicker(false);
  };

  const validateStep1 = () => {
    if (!formData.nombre?.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return false;
    }
    if (!formData.apellido_paterno?.trim()) {
      Alert.alert('Error', 'El apellido paterno es requerido');
      return false;
    }
    if (!formData.email?.trim()) {
      Alert.alert('Error', 'El email es requerido');
      return false;
    }
    if (!formData.email.includes('@')) {
      Alert.alert('Error', 'Ingresa un email válido');
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (formData.password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleRegister = async () => {
    const success = await register(formData as RegisterData);
    
    if (success) {
      Alert.alert(
        '¡Registro Exitoso!',
        'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
  };

  const getSelectedName = (type: 'carrera' | 'municipio') => {
    if (type === 'carrera') {
      const item = carrerasList.find(c => c.id === formData.id_carreras);
      return item?.nombre || 'Seleccionar carrera';
    }
    if (type === 'municipio') {
      const item = municipiosList.find(m => m.id === formData.id_municipios);
      return item?.nombre || 'Seleccionar municipio';
    }
    return '';
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => step === 1 ? router.back() : setStep(1)} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>
            {step === 1 ? 'Crear Cuenta' : 'Datos Adicionales'}
          </Text>
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
            <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {step === 1 ? (
            /* STEP 1: Datos Básicos */
            <View style={styles.formSection}>
              {/* Foto de Perfil */}
              <View style={styles.avatarSection}>
                <Pressable
                  style={styles.avatarContainer}
                  onPress={() => setShowImagePicker(true)}
                >
                  {formData.foto_perfil ? (
                    <Image source={{ uri: formData.foto_perfil }} style={styles.avatarImage} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Ionicons name="camera" size={32} color={colors.neonMagenta} />
                    </View>
                  )}
                  <View style={styles.avatarBadge}>
                    <Ionicons name="add" size={16} color={colors.background} />
                  </View>
                </Pressable>
                <Text style={styles.avatarText}>Foto de perfil</Text>
              </View>

              {/* Nombre */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nombre *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person" size={20} color={colors.textMuted} />
                  <TextInput
                    style={styles.input}
                    placeholder="Tu nombre"
                    placeholderTextColor={colors.textMuted}
                    value={formData.nombre || ''}
                    onChangeText={(text) => updateField('nombre', text)}
                  />
                </View>
              </View>

              {/* Apellido Paterno */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Apellido Paterno *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color={colors.textMuted} />
                  <TextInput
                    style={styles.input}
                    placeholder="Tu apellido paterno"
                    placeholderTextColor={colors.textMuted}
                    value={formData.apellido_paterno || ''}
                    onChangeText={(text) => updateField('apellido_paterno', text)}
                  />
                </View>
              </View>

              {/* Apellido Materno */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Apellido Materno</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color={colors.textMuted} />
                  <TextInput
                    style={styles.input}
                    placeholder="Tu apellido materno (opcional)"
                    placeholderTextColor={colors.textMuted}
                    value={formData.apellido_materno || ''}
                    onChangeText={(text) => updateField('apellido_materno', text)}
                  />
                </View>
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail" size={20} color={colors.textMuted} />
                  <TextInput
                    style={styles.input}
                    placeholder="tu@email.com"
                    placeholderTextColor={colors.textMuted}
                    value={formData.email || ''}
                    onChangeText={(text) => updateField('email', text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contraseña *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed" size={20} color={colors.textMuted} />
                  <TextInput
                    style={styles.input}
                    placeholder="Mínimo 6 caracteres"
                    placeholderTextColor={colors.textMuted}
                    value={formData.password || ''}
                    onChangeText={(text) => updateField('password', text)}
                    secureTextEntry={!showPassword}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.textMuted} />
                  </Pressable>
                </View>
              </View>

              {/* Confirm Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirmar Contraseña *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed" size={20} color={colors.textMuted} />
                  <TextInput
                    style={styles.input}
                    placeholder="Repite tu contraseña"
                    placeholderTextColor={colors.textMuted}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                  />
                </View>
              </View>

              {error && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={18} color={colors.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Next Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleNextStep}
              >
                <Text style={styles.primaryButtonText}>SIGUIENTE</Text>
                <Ionicons name="arrow-forward" size={20} color={colors.background} />
              </Pressable>
            </View>
          ) : (
            /* STEP 2: Datos Adicionales */
            <View style={styles.formSection}>
              {/* Teléfono */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Teléfono</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="call" size={20} color={colors.textMuted} />
                  <TextInput
                    style={styles.input}
                    placeholder="10 dígitos"
                    placeholderTextColor={colors.textMuted}
                    value={formData.telefono || ''}
                    onChangeText={(text) => updateField('telefono', text)}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>
              </View>

              {/* Matrícula */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Matrícula (si eres estudiante)</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="card" size={20} color={colors.textMuted} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: 2024-ING-0001"
                    placeholderTextColor={colors.textMuted}
                    value={formData.matricula || ''}
                    onChangeText={(text) => updateField('matricula', text)}
                    autoCapitalize="characters"
                  />
                </View>
              </View>

              {/* Carrera */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Carrera</Text>
                <Pressable
                  style={styles.selectContainer}
                  onPress={() => setShowPicker('carrera')}
                >
                  <Ionicons name="school" size={20} color={colors.textMuted} />
                  <Text style={styles.selectText}>{getSelectedName('carrera')}</Text>
                  <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
                </Pressable>
              </View>

              {/* Municipio */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Municipio</Text>
                <Pressable
                  style={styles.selectContainer}
                  onPress={() => setShowPicker('municipio')}
                >
                  <Ionicons name="location" size={20} color={colors.textMuted} />
                  <Text style={styles.selectText}>{getSelectedName('municipio')}</Text>
                  <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
                </Pressable>
              </View>

              {/* Dirección */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Dirección</Text>
                <View style={[styles.inputContainer, { height: 80, alignItems: 'flex-start', paddingTop: 12 }]}>
                  <Ionicons name="home" size={20} color={colors.textMuted} />
                  <TextInput
                    style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
                    placeholder="Calle, número, colonia..."
                    placeholderTextColor={colors.textMuted}
                    value={formData.direccion || ''}
                    onChangeText={(text) => updateField('direccion', text)}
                    multiline
                  />
                </View>
              </View>

              {error && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={18} color={colors.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Register Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  isLoading && styles.buttonDisabled,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={24} color={colors.background} />
                    <Text style={styles.primaryButtonText}>CREAR CUENTA</Text>
                  </>
                )}
              </Pressable>
            </View>
          )}
        </ScrollView>

        {/* Picker Modal */}
        <Modal
          visible={showPicker !== null}
          transparent
          animationType="slide"
          onRequestClose={() => setShowPicker(null)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShowPicker(null)}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {showPicker === 'carrera' ? 'Selecciona tu Carrera' : 'Selecciona tu Municipio'}
              </Text>
              <ScrollView style={styles.modalList}>
                {(showPicker === 'carrera' ? carrerasList : municipiosList).map((item) => (
                  <Pressable
                    key={item.id}
                    style={({ pressed }) => [
                      styles.modalOption,
                      pressed && { backgroundColor: colors.secondary },
                    ]}
                    onPress={() => {
                      if (showPicker === 'carrera') updateField('id_carreras', item.id);
                      else updateField('id_municipios', item.id);
                      setShowPicker(null);
                    }}
                  >
                    <Text style={styles.modalOptionText}>{item.nombre}</Text>
                    {((showPicker === 'carrera' && formData.id_carreras === item.id) ||
                      (showPicker === 'municipio' && formData.id_municipios === item.id)) && (
                      <Ionicons name="checkmark" size={20} color={colors.neonCyan} />
                    )}
                  </Pressable>
                ))}
              </ScrollView>
              <Pressable style={styles.modalCancel} onPress={() => setShowPicker(null)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>

        {/* Image Picker Modal */}
        <Modal
          visible={showImagePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowImagePicker(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShowImagePicker(false)}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Foto de Perfil</Text>
              
              <Pressable style={styles.imageOption} onPress={takePhoto}>
                <View style={[styles.imageOptionIcon, { backgroundColor: colors.neonCyan + '20' }]}>
                  <Ionicons name="camera" size={28} color={colors.neonCyan} />
                </View>
                <View>
                  <Text style={styles.imageOptionText}>Tomar Foto</Text>
                  <Text style={styles.imageOptionHint}>Usa la cámara</Text>
                </View>
              </Pressable>

              <Pressable style={styles.imageOption} onPress={pickImageFromGallery}>
                <View style={[styles.imageOptionIcon, { backgroundColor: colors.neonMagenta + '20' }]}>
                  <Ionicons name="images" size={28} color={colors.neonMagenta} />
                </View>
                <View>
                  <Text style={styles.imageOptionText}>Elegir de Galería</Text>
                  <Text style={styles.imageOptionHint}>Selecciona una foto</Text>
                </View>
              </Pressable>

              <Pressable style={styles.modalCancel} onPress={() => setShowImagePicker(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (c: ColorPalette) => {
  const { width } = Dimensions.get('window');
  const isSmall = width < 360;
  const isMedium = width >= 360 && width < 414;
  const hp = (pct: number) => (Dimensions.get('window').height * pct) / 100;
  const sp = (base: number) => Math.round(base * (width / 390)); // scale relative to iPhone 14

  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: isSmall ? 12 : 16,
    paddingVertical: isSmall ? 10 : 14,
    backgroundColor: c.card,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    color: c.textPrimary,
    fontSize: sp(isSmall ? 17 : 20),
    fontWeight: '700',
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: 6,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: c.border,
  },
  stepDotActive: {
    backgroundColor: c.neonMagenta,
  },
  content: {
    flex: 1,
    padding: isSmall ? 12 : isMedium ? 14 : 16,
  },
  formSection: {
    backgroundColor: c.card,
    borderRadius: 20,
    padding: isSmall ? 14 : isMedium ? 16 : 20,
    marginBottom: isSmall ? 14 : 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: isSmall ? 16 : 24,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarPlaceholder: {
    width: isSmall ? 80 : 100,
    height: isSmall ? 80 : 100,
    borderRadius: isSmall ? 40 : 50,
    backgroundColor: c.neonMagenta + '15',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: c.neonMagenta + '40',
    borderStyle: 'dashed',
  },
  avatarImage: {
    width: isSmall ? 80 : 100,
    height: isSmall ? 80 : 100,
    borderRadius: isSmall ? 40 : 50,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: c.neonMagenta,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: c.card,
  },
  avatarText: {
    color: c.textMuted,
    fontSize: sp(12),
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: isSmall ? 12 : 16,
  },
  inputLabel: {
    color: c.textSecondary,
    fontSize: sp(isSmall ? 11 : 12),
    marginBottom: 6,
    marginLeft: 4,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.surface,
    borderRadius: 12,
    paddingHorizontal: isSmall ? 10 : 14,
    paddingVertical: isSmall ? 10 : 13,
    borderWidth: 1,
    borderColor: c.border,
  },
  input: {
    flex: 1,
    color: c.textPrimary,
    fontSize: sp(isSmall ? 14 : 15),
    marginLeft: 8,
  },
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.surface,
    borderRadius: 12,
    paddingHorizontal: isSmall ? 10 : 14,
    paddingVertical: isSmall ? 12 : 14,
    borderWidth: 1,
    borderColor: c.border,
  },
  selectText: {
    flex: 1,
    color: c.textPrimary,
    fontSize: sp(isSmall ? 14 : 15),
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.error + '15',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: c.error,
    fontSize: 14,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.neonMagenta,
    borderRadius: 14,
    paddingVertical: isSmall ? 13 : 16,
    gap: 10,
    marginTop: 8,
  },
  buttonPressed: {
    opacity: 0.88,
  },
  buttonDisabled: {
    backgroundColor: c.border,
  },
  primaryButtonText: {
    color: c.background,
    fontSize: sp(isSmall ? 14 : 16),
    fontWeight: '700',
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: c.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    color: c.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalList: {
    maxHeight: 300,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  modalOptionText: {
    color: c.textPrimary,
    fontSize: 15,
  },
  modalCancel: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  modalCancelText: {
    color: c.error,
    fontSize: 16,
    fontWeight: '600',
  },
  imageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: c.surface,
    borderRadius: 14,
    marginBottom: 12,
    gap: 16,
  },
  imageOptionIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOptionText: {
    color: c.textPrimary,
    fontSize: sp(16),
    fontWeight: '600',
  },
  imageOptionHint: {
    color: c.textMuted,
    fontSize: sp(12),
    marginTop: 2,
  },
  });
};
