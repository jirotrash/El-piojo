import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  Image,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useColors } from '../../src/hooks/useColors';
import type { ColorPalette } from '../../src/theme/colors';
import { ProductCategory, categoryLabels, categoryIcons } from '../../src/interfaces';
import { useAuthStore } from '../../src/context/authStore';
import { uploadImage } from '../../src/api/api';
import { createPublicacion, getPuntosEntrega, PuntoEntrega } from '../../src/services/publicacionesService';
import DonateScreen from './donate';

interface SellItem {
  name: string;
  category: ProductCategory;
  size: string;
  condition: 'excelente' | 'bueno' | 'regular';
  brand: string;
  price: string;
  color: string;
  descripcion: string;
  images: string[];
  idPuntoEntrega?: number;
}

export default function SellScreen() {
  const { user } = useAuthStore();
  const [mode, setMode] = useState<'vender' | 'donar'>('vender');
  const [items, setItems] = useState<SellItem[]>([]);
  const [currentItem, setCurrentItem] = useState<Partial<SellItem>>({
    category: 'playeras',
    condition: 'bueno',
    images: [],
    color: '',
    descripcion: '',
  });
  const [selectedSlot, setSelectedSlot] = useState(0);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [puntosEntrega, setPuntosEntrega] = useState<PuntoEntrega[]>([]);

  useEffect(() => {
    getPuntosEntrega().then(setPuntosEntrega).catch(() => {});
  }, []);
  const colors = useColors();
  const styles = makeStyles(colors);

  const categories: ProductCategory[] = ['sudaderas', 'playeras', 'pantalones', 'chamarras', 'zapatos', 'accesorios'];
  const conditions = [
    { id: 'excelente', label: 'Excelente', color: colors.neonGreen },
    { id: 'bueno', label: 'Bueno', color: colors.neonCyan },
    { id: 'regular', label: 'Regular', color: colors.warning },
  ];

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert(
        'Permisos necesarios',
        'Necesitamos acceso a tu cámara y galería para subir fotos de las prendas.'
      );
      return false;
    }
    return true;
  };

  const pickImageFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0].uri) {
      const imgs = [...(currentItem.images ?? [])];
      imgs[selectedSlot] = result.assets[0].uri;
      setCurrentItem({ ...currentItem, images: imgs });
    }
    setShowImagePicker(false);
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0].uri) {
      const imgs = [...(currentItem.images ?? [])];
      imgs[selectedSlot] = result.assets[0].uri;
      setCurrentItem({ ...currentItem, images: imgs });
    }
    setShowImagePicker(false);
  };

  const removeImage = (slot: number) => {
    const imgs = [...(currentItem.images ?? [])];
    imgs.splice(slot, 1);
    setCurrentItem({ ...currentItem, images: imgs });
  };

  const addItem = () => {
    if (!currentItem.name || !currentItem.size || !currentItem.brand || !currentItem.price) {
      Alert.alert('Error', 'Por favor completa todos los campos incluyendo el precio');
      return;
    }
    if (!currentItem.images || currentItem.images.length === 0) {
      Alert.alert('Foto requerida', 'Agrega al menos una foto de la prenda');
      return;
    }
    setItems([...items, currentItem as SellItem]);
    setCurrentItem({ category: 'playeras', condition: 'bueno', images: [], color: '', descripcion: '' });
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const getTotalPrice = () => {
    return items.reduce((sum, item) => sum + parseFloat(item.price || '0'), 0);
  };

  const submitSale = async () => {
    if (items.length === 0) {
      Alert.alert('Error', 'Agrega al menos una prenda para vender');
      return;
    }
    if (!user?.id) {
      Alert.alert('Error', 'Debes iniciar sesión');
      return;
    }
    setSubmitting(true);
    try {
      for (const item of items) {
        const fotoUrls: string[] = [];
        for (const img of item.images) {
          const url = await uploadImage(img);
          if (url) fotoUrls.push(url);
        }
        await createPublicacion({
          userId:         user.id,
          titulo:         item.name,
          categoria:      item.category,
          talla:          item.size,
          marca:          item.brand,
          color:          item.color,
          descripcion:    item.descripcion,
          condition:      item.condition,
          precio:         parseFloat(item.price),
          fotoUrls,
          idPuntoEntrega: item.idPuntoEntrega,
        });
      }
      Alert.alert(
        '¡Publicación Exitosa!',
        `Has publicado ${items.length} prenda(s) por un total de $${getTotalPrice().toFixed(2)}.`,
        [{ text: 'OK', onPress: () => setItems([]) }],
      );
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudo publicar');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Selector Vender / Donar */}
      <View style={styles.modeSelector}>
        <Pressable
          style={[styles.modeBtn, mode === 'vender' && styles.modeBtnActive]}
          onPress={() => setMode('vender')}
        >
          <Ionicons name="pricetag" size={16} color={mode === 'vender' ? colors.background : colors.textMuted} />
          <Text style={[styles.modeBtnText, mode === 'vender' && styles.modeBtnTextActive]}>Vender</Text>
        </Pressable>
        <Pressable
          style={[styles.modeBtn, mode === 'donar' && { backgroundColor: colors.neonMagenta }]}
          onPress={() => setMode('donar')}
        >
          <Ionicons name="heart" size={16} color={mode === 'donar' ? colors.background : colors.textMuted} />
          <Text style={[styles.modeBtnText, mode === 'donar' && styles.modeBtnTextActive]}>Donar</Text>
        </Pressable>
      </View>

      {mode === 'donar' ? <DonateScreen embedded /> : (<>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="pricetag" size={28} color={colors.neonGreen} />
        </View>
        <View>
          <Text style={styles.headerTitle}>Vender Ropa</Text>
          <Text style={styles.headerSubtitle}>Publica tus prendas para vender</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="cash" size={24} color={colors.neonGreen} />
          <Text style={styles.infoText}>
            Vende tu ropa usada y gana dinero. Agrega fotos para atraer más compradores.
          </Text>
        </View>

        {/* Add Item Form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Nueva Publicación</Text>

          {/* Image Upload - 4 slots */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Fotos de la prenda * (máx. 4 · la primera es portada)</Text>
            <View style={styles.imageGrid}>
              {[0, 1, 2, 3].map((slot) => {
                const img = currentItem.images?.[slot];
                const isPortada = slot === 0;
                return (
                  <View key={slot} style={styles.imageSlotWrapper}>
                    {img ? (
                      <View style={styles.imageSlotFilled}>
                        <Image source={{ uri: img }} style={styles.imageSlotImg} />
                        <Pressable
                          style={styles.removeImageButton}
                          onPress={() => removeImage(slot)}
                        >
                          <Ionicons name="close-circle" size={22} color={colors.error} />
                        </Pressable>
                        {isPortada && (
                          <View style={styles.portadaBadge}>
                            <Ionicons name="star" size={10} color="#fff" />
                          </View>
                        )}
                      </View>
                    ) : (
                      <Pressable
                        style={[styles.imageSlotEmpty, isPortada && styles.imageSlotPortada]}
                        onPress={() => { setSelectedSlot(slot); setShowImagePicker(true); }}
                      >
                        <Ionicons
                          name="camera-outline"
                          size={24}
                          color={isPortada ? colors.neonGreen : colors.textMuted}
                        />
                        <Text style={[styles.imageSlotLabel, isPortada && { color: colors.neonGreen }]}>
                          {isPortada ? 'Portada' : '+'}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                );
              })}
            </View>
          </View>

          {/* Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nombre de la prenda</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Sudadera Nike"
              placeholderTextColor={colors.textMuted}
              value={currentItem.name || ''}
              onChangeText={(text) => setCurrentItem({ ...currentItem, name: text })}
            />
          </View>

          {/* Descripcion */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Descripción</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Describe el estado, detalles o historia de la prenda..."
              placeholderTextColor={colors.textMuted}
              value={currentItem.descripcion || ''}
              onChangeText={(text) => setCurrentItem({ ...currentItem, descripcion: text })}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Brand & Price Row */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>Marca</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Nike"
                placeholderTextColor={colors.textMuted}
                value={currentItem.brand || ''}
                onChangeText={(text) => setCurrentItem({ ...currentItem, brand: text })}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>Precio $</Text>
              <TextInput
                style={[styles.input, styles.priceInput]}
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                value={currentItem.price || ''}
                onChangeText={(text) => setCurrentItem({ ...currentItem, price: text })}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Size & Color Row */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>Talla</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: M, L, 32"
                placeholderTextColor={colors.textMuted}
                value={currentItem.size || ''}
                onChangeText={(text) => setCurrentItem({ ...currentItem, size: text })}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>Color</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Azul, Rojo"
                placeholderTextColor={colors.textMuted}
                value={currentItem.color || ''}
                onChangeText={(text) => setCurrentItem({ ...currentItem, color: text })}
              />
            </View>
          </View>

          {/* Category */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Categoría</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.optionsRow}>
                {categories.map((cat) => (
                  <Pressable
                    key={cat}
                    style={[
                      styles.optionChip,
                      currentItem.category === cat && styles.optionChipSelectedGreen,
                    ]}
                    onPress={() => setCurrentItem({ ...currentItem, category: cat })}
                  >
                    <Ionicons
                      name={categoryIcons[cat] as any}
                      size={16}
                      color={currentItem.category === cat ? colors.background : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.optionChipText,
                        currentItem.category === cat && styles.optionChipTextSelected,
                      ]}
                    >
                      {categoryLabels[cat]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Condition */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Condición</Text>
            <View style={styles.conditionRow}>
              {conditions.map((cond) => (
                <Pressable
                  key={cond.id}
                  style={[
                    styles.conditionChip,
                    currentItem.condition === cond.id && {
                      backgroundColor: cond.color,
                      borderColor: cond.color,
                    },
                  ]}
                  onPress={() => setCurrentItem({ ...currentItem, condition: cond.id as any })}
                >
                  <Text
                    style={[
                      styles.conditionText,
                      currentItem.condition === cond.id && { color: colors.background },
                    ]}
                  >
                    {cond.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Punto de Entrega */}
          {puntosEntrega.length > 0 && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Punto de entrega</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.optionsRow}>
                  {puntosEntrega.map((p) => (
                    <Pressable
                      key={p.id_puntos_entrega}
                      style={[
                        styles.optionChip,
                        currentItem.idPuntoEntrega === p.id_puntos_entrega && styles.optionChipSelectedGreen,
                      ]}
                      onPress={() => setCurrentItem({ ...currentItem, idPuntoEntrega: p.id_puntos_entrega })}
                    >
                      <Ionicons
                        name="location-outline"
                        size={14}
                        color={currentItem.idPuntoEntrega === p.id_puntos_entrega ? colors.background : colors.textSecondary}
                      />
                      <Text style={[
                        styles.optionChipText,
                        currentItem.idPuntoEntrega === p.id_puntos_entrega && styles.optionChipTextSelected,
                      ]}>
                        {p.nombre}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Add Button */}
          <Pressable style={styles.addButton} onPress={addItem}>
            <Ionicons name="add-circle" size={24} color={colors.background} />
            <Text style={styles.addButtonText}>Agregar Prenda</Text>
          </Pressable>
        </View>

        {/* Items List */}
        {items.length > 0 && (
          <View style={styles.itemsSection}>
            <Text style={styles.sectionTitle}>Prendas a Vender ({items.length})</Text>
            {items.map((item, index) => (
              <View key={index} style={styles.itemCard}>
                {item.images[0] && (
                  <Image source={{ uri: item.images[0] }} style={styles.itemImage} />
                )}
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemMeta}>
                    {item.brand} • Talla {item.size} • {item.condition}
                  </Text>
                </View>
                <Text style={styles.itemPrice}>${parseFloat(item.price).toFixed(2)}</Text>
                <Pressable onPress={() => removeItem(index)} style={styles.removeButton}>
                  <Ionicons name="trash" size={18} color={colors.error} />
                </Pressable>
              </View>
            ))}
            
            {/* Total */}
            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>Total a Recibir</Text>
              <Text style={styles.totalValue}>${getTotalPrice().toFixed(2)}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Submit Button */}
      {items.length > 0 && (
        <View style={styles.footer}>
          <Pressable
            style={[styles.submitButton, submitting && { opacity: 0.7 }]}
            onPress={submitSale}
            disabled={submitting}
          >
            {submitting
              ? <ActivityIndicator color={colors.background} size="small" />
              : <Ionicons name="rocket" size={24} color={colors.background} />
            }
            <Text style={styles.submitButtonText}>
              {submitting ? 'Publicando...' : `PUBLICAR ${items.length} PRENDA(S)`}
            </Text>
          </Pressable>
        </View>
      )}

      {/* Image Picker Modal */}
      <Modal
        visible={showImagePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowImagePicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowImagePicker(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agregar Foto</Text>
            
            <Pressable style={styles.modalOption} onPress={takePhoto}>
              <View style={[styles.modalOptionIcon, { backgroundColor: colors.neonCyan + '20' }]}>
                <Ionicons name="camera" size={28} color={colors.neonCyan} />
              </View>
              <View>
                <Text style={styles.modalOptionText}>Tomar Foto</Text>
                <Text style={styles.modalOptionHint}>Usa la cámara de tu dispositivo</Text>
              </View>
            </Pressable>

            <Pressable style={styles.modalOption} onPress={pickImageFromGallery}>
              <View style={[styles.modalOptionIcon, { backgroundColor: colors.neonGreen + '20' }]}>
                <Ionicons name="images" size={28} color={colors.neonGreen} />
              </View>
              <View>
                <Text style={styles.modalOptionText}>Elegir de Galería</Text>
                <Text style={styles.modalOptionHint}>Selecciona una foto existente</Text>
              </View>
            </Pressable>

            <Pressable
              style={styles.modalCancel}
              onPress={() => setShowImagePicker(false)}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
      </>)}
    </SafeAreaView>
  );
}

const makeStyles = (c: ColorPalette) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.background,
  },
  modeSelector: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: c.surface,
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modeBtnActive: {
    backgroundColor: c.neonGreen,
  },
  modeBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: c.textMuted,
  },
  modeBtnTextActive: {
    color: c.background,
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
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: c.neonGreen + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: c.neonGreen,
    fontSize: 22,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: c.textMuted,
    fontSize: 12,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.neonGreen + '15',
    borderRadius: 12,
    padding: 14,
    gap: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: c.neonGreen + '30',
  },
  infoText: {
    flex: 1,
    color: c.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  formSection: {
    backgroundColor: c.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    color: c.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: c.textSecondary,
    fontSize: 12,
    marginBottom: 8,
  },
  input: {
    backgroundColor: c.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: c.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: c.border,
  },
  priceInput: {
    color: c.neonGreen,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imageSlotWrapper: {
    width: '47%',
  },
  imageSlotEmpty: {
    height: 110,
    borderRadius: 12,
    backgroundColor: c.surface,
    borderWidth: 2,
    borderColor: c.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  imageSlotPortada: {
    borderColor: c.neonGreen + '60',
  },
  imageSlotLabel: {
    color: c.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  imageSlotFilled: {
    height: 110,
    borderRadius: 12,
    overflow: 'visible',
    position: 'relative',
  },
  imageSlotImg: {
    width: '100%',
    height: 110,
    borderRadius: 12,
    backgroundColor: c.surface,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: c.background,
    borderRadius: 14,
    zIndex: 10,
  },
  portadaBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: c.neonGreen,
    borderRadius: 8,
    padding: 3,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
  },
  optionChipSelectedGreen: {
    backgroundColor: c.neonGreen,
    borderColor: c.neonGreen,
  },
  optionChipText: {
    color: c.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  optionChipTextSelected: {
    color: c.background,
  },
  conditionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  conditionChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
    alignItems: 'center',
  },
  conditionText: {
    color: c.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.neonGreen,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    marginTop: 8,
  },
  addButtonText: {
    color: c.background,
    fontSize: 15,
    fontWeight: '700',
  },
  itemsSection: {
    marginBottom: 100,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: c.border,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: c.surface,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    color: c.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  itemMeta: {
    color: c.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  itemPrice: {
    color: c.neonGreen,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'monospace',
    marginRight: 12,
  },
  removeButton: {
    padding: 8,
  },
  totalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: c.neonGreen + '15',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: c.neonGreen + '30',
  },
  totalLabel: {
    color: c.textSecondary,
    fontSize: 14,
  },
  totalValue: {
    color: c.neonGreen,
    fontSize: 24,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: c.background,
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.neonGreen,
    borderRadius: 14,
    paddingVertical: 16,
    gap: 10,
  },
  submitButtonText: {
    color: c.background,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: c.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalTitle: {
    color: c.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: c.surface,
    borderRadius: 14,
    marginBottom: 12,
    gap: 16,
  },
  modalOptionIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOptionText: {
    color: c.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOptionHint: {
    color: c.textMuted,
    fontSize: 12,
    marginTop: 2,
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
});
