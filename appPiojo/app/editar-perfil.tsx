import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TextInput, Pressable, ActivityIndicator, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useColors } from '../src/hooks/useColors';
import type { ColorPalette } from '../src/theme/colors';
import { graphqlRequest, getAuthToken, decodeJwtPayload, uploadImage } from '../src/api/api';

const GET_USUARIO = `
  query GetUsuario($id: Int!) {
    usuario(id: $id) {
      id_usuarios nombre apellido_paterno apellido_materno
      email telefono matricula direccion foto_perfil
    }
  }
`;

const UPDATE_USUARIO = `
  mutation UpdateUsuario($id: Int!, $input: UpdateUsuariosInput!) {
    updateUsuario(id: $id, input: $input) {
      id_usuarios nombre email
    }
  }
`;

interface UsuarioData {
  id_usuarios: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  email: string;
  telefono: string;
  matricula: string;
  direccion: string;
  foto_perfil: string;
}

export default function EditarPerfilScreen() {
  const router = useRouter();
  const colors = useColors();
  const styles = makeStyles(colors);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  const [fotoUri, setFotoUri] = useState<string | null>(null);   // URI local (preview)
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);   // URL remota actual

  const [nombre, setNombre] = useState('');
  const [apellidoP, setApellidoP] = useState('');
  const [apellidoM, setApellidoM] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [matricula, setMatricula] = useState('');
  const [direccion, setDireccion] = useState('');

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      Alert.alert('Error', 'Sesión no iniciada');
      router.back();
      return;
    }
    const payload = decodeJwtPayload(token);
    const id = Number(payload.sub);
    setUserId(id);

    graphqlRequest<{ usuario: UsuarioData }>(GET_USUARIO, { id })
      .then(({ usuario }) => {
        setNombre(usuario.nombre ?? '');
        setApellidoP(usuario.apellido_paterno ?? '');
        setApellidoM(usuario.apellido_materno ?? '');
        setEmail(usuario.email ?? '');
        setTelefono(usuario.telefono ?? '');
        setMatricula(usuario.matricula ?? '');
        setDireccion(usuario.direccion ?? '');
        const raw = usuario.foto_perfil ?? null;
        setFotoUrl(raw ? raw.replace(/^http:\/\//i, 'https://') : null);
      })
      .catch(() => Alert.alert('Error', 'No se pudo cargar el perfil'))
      .finally(() => setLoading(false));
  }, []);

  const pickPhoto = async () => {
    Alert.alert('Foto de perfil', 'Selecciona una opción', [
      {
        text: 'Galería', onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') { Alert.alert('Permiso denegado', 'Se necesita acceso a la galería'); return; }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, aspect: [1, 1], quality: 0.8,
          });
          if (!result.canceled) setFotoUri(result.assets[0].uri);
        },
      },
      {
        text: 'Cámara', onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') { Alert.alert('Permiso denegado', 'Se necesita acceso a la cámara'); return; }
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true, aspect: [1, 1], quality: 0.8,
          });
          if (!result.canceled) setFotoUri(result.assets[0].uri);
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const handleSave = async () => {
    if (!nombre.trim()) {
      Alert.alert('Validación', 'El nombre no puede estar vacío');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Validación', 'El correo no puede estar vacío');
      return;
    }
    if (!userId) return;

    setSaving(true);
    try {
      let foto_perfil = fotoUrl ?? undefined;
      if (fotoUri) {
        const uploaded = await uploadImage(fotoUri);
        if (uploaded) foto_perfil = uploaded;
        else Alert.alert('Aviso', 'No se pudo subir la foto, se conservará la anterior');
      }

      await graphqlRequest(UPDATE_USUARIO, {
        id: userId,
        input: {
          nombre: nombre.trim(),
          apellido_paterno: apellidoP.trim(),
          apellido_materno: apellidoM.trim(),
          email: email.trim(),
          telefono: telefono.trim(),
          matricula: matricula.trim(),
          direccion: direccion.trim(),
          ...(foto_perfil !== undefined && { foto_perfil }),
        },
      });
      Alert.alert('Listo', 'Perfil actualizado correctamente', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo actualizar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Editar perfil</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Avatar ── */}
        <View style={styles.avatarSection}>
          <Pressable onPress={pickPhoto} style={styles.avatarWrapper}>
            {fotoUri || fotoUrl ? (
              <Image source={{ uri: fotoUri ?? fotoUrl! }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatarImage, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={48} color={colors.textMuted} />
              </View>
            )}
            <View style={[styles.cameraBadge, { backgroundColor: colors.primary }]}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </Pressable>
          <Text style={styles.avatarHint}>Toca para cambiar foto</Text>
        </View>

        <Text style={styles.sectionLabel}>INFORMACIÓN PERSONAL</Text>
        <View style={styles.card}>
          <Field label="Nombre" value={nombre} onChangeText={setNombre}
            icon="person" colors={colors} styles={styles} />
          <View style={styles.divider} />
          <Field label="Apellido paterno" value={apellidoP} onChangeText={setApellidoP}
            icon="person" colors={colors} styles={styles} />
          <View style={styles.divider} />
          <Field label="Apellido materno" value={apellidoM} onChangeText={setApellidoM}
            icon="person" colors={colors} styles={styles} />
        </View>

        <Text style={styles.sectionLabel}>CONTACTO</Text>
        <View style={styles.card}>
          <Field label="Correo electrónico" value={email} onChangeText={setEmail}
            icon="mail" keyboardType="email-address" colors={colors} styles={styles} />
          <View style={styles.divider} />
          <Field label="Teléfono" value={telefono} onChangeText={setTelefono}
            icon="call" keyboardType="phone-pad" colors={colors} styles={styles} />
        </View>

        <Text style={styles.sectionLabel}>DATOS ESCOLARES</Text>
        <View style={styles.card}>
          <Field label="Matrícula" value={matricula} onChangeText={setMatricula}
            icon="school" colors={colors} styles={styles} />
          <View style={styles.divider} />
          <Field label="Dirección" value={direccion} onChangeText={setDireccion}
            icon="location" colors={colors} styles={styles} />
        </View>

        <Pressable
          style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.8 }, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={styles.saveBtnText}>Guardar cambios</Text>
          }
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

function Field({
  label, value, onChangeText, icon, keyboardType, colors, styles,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  icon: string;
  keyboardType?: any;
  colors: ColorPalette;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <View style={styles.fieldRow}>
      <View style={[styles.iconBox, { backgroundColor: colors.primary + '18' }]}>
        <Ionicons name={icon as any} size={18} color={colors.primary} />
      </View>
      <View style={styles.fieldContent}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <TextInput
          style={styles.fieldInput}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor={colors.textMuted}
          keyboardType={keyboardType ?? 'default'}
          autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
        />
      </View>
    </View>
  );
}

const makeStyles = (c: ColorPalette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  centered: { justifyContent: 'center', alignItems: 'center' },
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
  fieldRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  fieldContent: { flex: 1 },
  fieldLabel: { fontSize: 11, fontWeight: '600', color: c.textMuted, marginBottom: 2, letterSpacing: 0.5 },
  fieldInput: { fontSize: 15, color: c.textPrimary, paddingVertical: 2 },
  saveBtn: {
    marginTop: 24, marginHorizontal: 4,
    backgroundColor: c.primary, borderRadius: 14,
    paddingVertical: 15, alignItems: 'center',
  },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  avatarSection: { alignItems: 'center', paddingVertical: 20 },
  avatarWrapper: { position: 'relative' },
  avatarImage: { width: 96, height: 96, borderRadius: 48, backgroundColor: c.surface },
  avatarPlaceholder: { justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: c.border },
  cameraBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 30, height: 30, borderRadius: 15,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: c.background,
  },
  avatarHint: { fontSize: 12, color: c.textMuted, marginTop: 8 },
});
