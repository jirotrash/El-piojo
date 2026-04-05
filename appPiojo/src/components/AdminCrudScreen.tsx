import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator, Alert, FlatList, KeyboardAvoidingView,
  Modal, Platform, Pressable, ScrollView, StyleSheet, Switch,
  Text, TextInput, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { graphqlRequest } from '../api/api';
import MapPickerModal from './MapPickerModal';

// ── palette ───────────────────────────────────────────────────────────────────
const BG     = '#080d14';
const CARD   = '#0d1520';
const BORDER = '#152230';
const CYAN   = '#22d3ee';
const MUTED  = '#2a4a5e';
const TEXT   = '#8ab4c8';
const RED    = '#ef4444';

// ── types ─────────────────────────────────────────────────────────────────────
export interface SelectOption { label: string; value: string | number }

export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'boolean' | 'select' | 'map';
  required?: boolean;
  options?: SelectOption[];
  multiline?: boolean;
  secureText?: boolean;
  /** Only for type=map: names of the lat/lng keys in form state */
  mapKeys?: { lat: string; lng: string };
}

export interface CrudConfig {
  title: string;
  queryKey: string;
  idField: string;
  listGql: string;
  createGql?: string;
  updateGql?: string;
  deleteGql?: string;
  fields: FormField[];
  rowTitle: (item: any) => string;
  rowSubtitle?: (item: any) => string;
}

// ── component ─────────────────────────────────────────────────────────────────
export default function AdminCrudScreen({ config }: { config: CrudConfig }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [items, setItems]       = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<any | null>(null);
  const [saving, setSaving]     = useState(false);
  const [form, setForm]         = useState<Record<string, any>>({});
  const [pickerField, setPickerField] = useState<FormField | null>(null);
  const [mapField, setMapField]       = useState<FormField | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await graphqlRequest<any>(config.listGql);
      setItems(data[config.queryKey] ?? []);
    } catch {
      Alert.alert('Error', 'No se pudo cargar la lista');
    } finally {
      setLoading(false);
    }
  }, [config.listGql, config.queryKey]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(item => {
      const t = config.rowTitle(item).toLowerCase();
      const s = config.rowSubtitle ? config.rowSubtitle(item).toLowerCase() : '';
      return t.includes(q) || s.includes(q);
    });
  }, [items, search, config]);

  const openCreate = () => {
    const initial: Record<string, any> = {};
    config.fields.forEach(f => {
      initial[f.key] = f.type === 'boolean' ? false : '';
    });
    setForm(initial);
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (item: any) => {
    const initial: Record<string, any> = {};
    config.fields.forEach(f => {
      const v = item[f.key];
      initial[f.key] = (v === undefined || v === null)
        ? (f.type === 'boolean' ? false : '')
        : v;
    });
    setForm(initial);
    setEditing(item);
    setShowForm(true);
  };

  const handleSave = async () => {
    for (const f of config.fields) {
      if (f.required && (form[f.key] === '' || form[f.key] === null || form[f.key] === undefined)) {
        Alert.alert('Campo requerido', `"${f.label}" es obligatorio`);
        return;
      }
    }
    setSaving(true);
    try {
      const input: Record<string, any> = {};
      config.fields.forEach(f => {
        // skip virtual map field — its real data is already in mapKeys' form entries
        if (f.type === 'map') return;
        const v = form[f.key];
        if (v === '' || v === null || v === undefined) return;
        input[f.key] = f.type === 'number' ? Number(v) : v;
      });

      if (editing) {
        await graphqlRequest(config.updateGql!, { id: editing[config.idField], input });
      } else {
        await graphqlRequest(config.createGql!, { input });
      }
      setShowForm(false);
      load();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item: any) => {
    Alert.alert(
      'Eliminar',
      `¿Eliminar "${config.rowTitle(item)}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive',
          onPress: async () => {
            try {
              await graphqlRequest(config.deleteGql!, { id: item[config.idField] });
              load();
            } catch (e: any) {
              Alert.alert('Error', e?.message ?? 'No se pudo eliminar');
            }
          },
        },
      ],
    );
  };

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <Pressable style={s.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={CYAN} />
        </Pressable>
        <Text style={s.headerTitle}>{config.title.toUpperCase()}</Text>
        {config.createGql
          ? (
            <Pressable style={[s.iconBtn, { borderColor: CYAN }]} onPress={openCreate}>
              <Ionicons name="add" size={22} color={CYAN} />
            </Pressable>
          )
          : <View style={s.iconBtn} />
        }
      </View>

      {/* Search bar */}
      <View style={s.searchRow}>
        <Ionicons name="search-outline" size={15} color={MUTED} style={{ marginRight: 8 }} />
        <TextInput
          style={s.searchInput}
          placeholder="Buscar..."
          placeholderTextColor={MUTED}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* List */}
      {loading
        ? <ActivityIndicator color={CYAN} style={{ flex: 1, alignSelf: 'center' }} size="large" />
        : (
          <FlatList
            data={filtered}
            keyExtractor={item => String(item[config.idField])}
            contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
            ListEmptyComponent={<Text style={s.empty}>Sin registros</Text>}
            renderItem={({ item }) => (
              <View style={s.row}>
                <View style={s.rowInfo}>
                  <Text style={s.rowTitle} numberOfLines={1}>{config.rowTitle(item)}</Text>
                  {config.rowSubtitle && (
                    <Text style={s.rowSub} numberOfLines={1}>{config.rowSubtitle(item)}</Text>
                  )}
                </View>
                <View style={s.rowActions}>
                  {config.updateGql && (
                    <Pressable style={s.actionBtn} onPress={() => openEdit(item)}>
                      <Ionicons name="pencil-outline" size={15} color={CYAN} />
                    </Pressable>
                  )}
                  {config.deleteGql && (
                    <Pressable style={[s.actionBtn, { borderColor: '#3a1010' }]} onPress={() => handleDelete(item)}>
                      <Ionicons name="trash-outline" size={15} color={RED} />
                    </Pressable>
                  )}
                </View>
              </View>
            )}
          />
        )
      }

      {/* Form Modal */}
      <Modal visible={showForm} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={s.modalOverlay}
        >
          <View style={s.modalSheet}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>
                {editing ? 'Editar' : 'Nuevo'} {config.title}
              </Text>
              <Pressable onPress={() => setShowForm(false)}>
                <Ionicons name="close" size={22} color={MUTED} />
              </Pressable>
            </View>

            <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
              {config.fields.map(field => (
                <View key={field.key} style={s.fieldRow}>
                  <Text style={s.fieldLabel}>
                    {field.label}{field.required ? ' *' : ''}
                  </Text>

                  {field.type === 'boolean' ? (
                    <Switch
                      value={!!form[field.key]}
                      onValueChange={v => setForm(f => ({ ...f, [field.key]: v }))}
                      trackColor={{ true: CYAN, false: BORDER }}
                      thumbColor="#fff"
                    />
                  ) : field.type === 'select' ? (
                    <Pressable style={s.selectBtn} onPress={() => setPickerField(field)}>
                      <Text style={[s.selectText, !form[field.key] && { color: MUTED }]}>
                        {field.options?.find(o => o.value === form[field.key])?.label ?? 'Seleccionar...'}
                      </Text>
                      <Ionicons name="chevron-down" size={15} color={MUTED} />
                    </Pressable>
                  ) : field.type === 'map' ? (
                    <Pressable style={s.mapBtn} onPress={() => setMapField(field)}>
                      <Ionicons name="map" size={16} color={CYAN} style={{ marginRight: 8 }} />
                      <Text style={s.mapBtnText}>
                        {field.mapKeys && (form[field.mapKeys.lat] || form[field.mapKeys.lng])
                          ? `${Number(form[field.mapKeys.lat]).toFixed(5)},  ${Number(form[field.mapKeys.lng]).toFixed(5)}`
                          : 'Abrir mapa'
                        }
                      </Text>
                      <Ionicons name="chevron-forward" size={14} color={MUTED} />
                    </Pressable>
                  ) : (
                    <TextInput
                      style={[s.input, field.multiline && { height: 80, textAlignVertical: 'top' }]}
                      value={String(form[field.key] ?? '')}
                      onChangeText={v => setForm(f => ({ ...f, [field.key]: v }))}
                      keyboardType={field.type === 'number' ? 'numeric' : field.type === 'email' ? 'email-address' : 'default'}
                      secureTextEntry={!!field.secureText}
                      multiline={field.multiline}
                      autoCapitalize="none"
                      placeholderTextColor={MUTED}
                      placeholder={field.label}
                    />
                  )}
                </View>
              ))}
              <View style={{ height: 20 }} />
            </ScrollView>

            <Pressable style={[s.saveBtn, saving && { opacity: 0.5 }]} onPress={handleSave} disabled={saving}>
              {saving
                ? <ActivityIndicator color="#000" />
                : <Text style={s.saveBtnText}>{editing ? 'GUARDAR CAMBIOS' : 'CREAR'}</Text>
              }
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Map picker modal */}
      {mapField && mapField.mapKeys && (
        <MapPickerModal
          visible
          lat={Number(form[mapField.mapKeys.lat]) || 0}
          lng={Number(form[mapField.mapKeys.lng]) || 0}
          onConfirm={(lat, lng) => {
            setForm(f => ({
              ...f,
              [mapField.mapKeys!.lat]: lat,
              [mapField.mapKeys!.lng]: lng,
            }));
          }}
          onClose={() => setMapField(null)}
        />
      )}

      {/* Picker modal */}
      {pickerField && (
        <Modal visible transparent animationType="fade">
          <Pressable style={s.pickerOverlay} onPress={() => setPickerField(null)}>
            <Pressable style={s.pickerSheet} onPress={() => {}}>
              <Text style={s.pickerTitle}>{pickerField.label}</Text>
              <FlatList
                data={pickerField.options}
                keyExtractor={o => String(o.value)}
                renderItem={({ item: opt }) => (
                  <Pressable
                    style={[s.pickerRow, form[pickerField.key] === opt.value && s.pickerRowActive]}
                    onPress={() => {
                      setForm(f => ({ ...f, [pickerField.key]: opt.value }));
                      setPickerField(null);
                    }}
                  >
                    <Text style={[s.pickerRowText, form[pickerField.key] === opt.value && { color: CYAN }]}>
                      {opt.label}
                    </Text>
                    {form[pickerField.key] === opt.value && (
                      <Ionicons name="checkmark" size={16} color={CYAN} />
                    )}
                  </Pressable>
                )}
              />
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

// ── styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  // header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: BORDER, backgroundColor: CARD,
  },
  headerTitle: { color: CYAN, fontSize: 13, fontWeight: '700', letterSpacing: 2 },
  iconBtn: {
    width: 36, height: 36, borderRadius: 8,
    borderWidth: 1, borderColor: BORDER,
    justifyContent: 'center', alignItems: 'center',
  },

  // search
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    margin: 16, paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: CARD, borderRadius: 8, borderWidth: 1, borderColor: BORDER,
  },
  searchInput: { flex: 1, color: TEXT, fontSize: 14 },

  // list
  empty: { color: MUTED, textAlign: 'center', marginTop: 40, letterSpacing: 2 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: CARD, borderRadius: 10,
    borderWidth: 1, borderColor: BORDER,
    padding: 14, marginBottom: 10,
  },
  rowInfo: { flex: 1, marginRight: 8 },
  rowTitle: { color: TEXT, fontSize: 14, fontWeight: '600' },
  rowSub: { color: MUTED, fontSize: 12, marginTop: 2 },
  rowActions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    width: 32, height: 32, borderRadius: 7,
    borderWidth: 1, borderColor: BORDER,
    justifyContent: 'center', alignItems: 'center',
  },

  // form modal
  modalOverlay: {
    flex: 1, justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalSheet: {
    backgroundColor: '#0a1220', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    borderWidth: 1, borderColor: BORDER,
    height: '78%', paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  modalTitle: { color: CYAN, fontSize: 15, fontWeight: '700', letterSpacing: 2 },
  fieldRow: { paddingHorizontal: 20, paddingVertical: 10 },
  fieldLabel: { color: MUTED, fontSize: 11, letterSpacing: 1, marginBottom: 6, fontWeight: '600' },
  input: {
    backgroundColor: CARD, borderRadius: 8, borderWidth: 1, borderColor: BORDER,
    paddingHorizontal: 12, paddingVertical: 10,
    color: TEXT, fontSize: 14,
  },
  selectBtn: {
    backgroundColor: CARD, borderRadius: 8, borderWidth: 1, borderColor: BORDER,
    paddingHorizontal: 12, paddingVertical: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  selectText: { color: TEXT, fontSize: 14, flex: 1 },
  saveBtn: {
    margin: 20, marginTop: 8, backgroundColor: CYAN, borderRadius: 10,
    paddingVertical: 14, alignItems: 'center',
  },
  saveBtnText: { color: '#000', fontWeight: '900', fontSize: 14, letterSpacing: 2 },
  mapBtn: {
    backgroundColor: CARD, borderRadius: 8, borderWidth: 1, borderColor: CYAN + '60',
    paddingHorizontal: 12, paddingVertical: 10,
    flexDirection: 'row', alignItems: 'center',
  },
  mapBtnText: { color: CYAN, fontSize: 13, flex: 1, fontFamily: 'monospace' },

  // picker modal
  pickerOverlay: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  pickerSheet: {
    backgroundColor: '#0a1220', borderRadius: 16,
    borderWidth: 1, borderColor: BORDER,
    width: '80%', maxHeight: '60%', padding: 4,
  },
  pickerTitle: {
    color: CYAN, fontSize: 13, fontWeight: '700', letterSpacing: 2,
    padding: 16, borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  pickerRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  pickerRowActive: { backgroundColor: CYAN + '15' },
  pickerRowText: { color: TEXT, fontSize: 14 },
});
