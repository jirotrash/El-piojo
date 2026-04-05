import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, Pressable, ScrollView, StyleSheet,
  Text, View, ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { graphqlRequest, setAuthToken } from '../src/api/api';

// ── palette ───────────────────────────────────────────────────────────────────
const BG      = '#080d14';
const CARD    = '#0d1520';
const BORDER  = '#152230';
const CYAN    = '#22d3ee';
const MAG     = '#d946ef';
const YEL     = '#eab308';
const GRN     = '#22c55e';
const MUTED   = '#2a4a5e';
const TEXTCOL = '#8ab4c8';
const SIDEBAR_W = 240;

// ── stats query ───────────────────────────────────────────────────────────────
const STATS_QUERY = `
  query AdminStats {
    usuarios       { id_usuarios fecha_registro }
    publicaciones  { id_publicaciones disponible fecha_publicacion precio }
    conversaciones { id_conversaciones fecha_creacion }
    pagos          { id_pagos total total_con_descuento fecha_pago }
    detalleVenta   { id_detalle_venta cantidad subtotal }
    historialTratos { id_historial_tratos fecha_cierre calificacion }
    detalleMensajes { id_detalle_mensajes fecha_envio }
  }
`;

// ── Laplace transform predictor ───────────────────────────────────────────────
function laplacePredict(serie: number[], s: number) {
  const alpha = Math.exp(-s);
  let F = 0, W = 0;
  serie.forEach((val, k) => {
    const peso = Math.pow(alpha, k);
    F += val * peso;
    W += peso;
  });
  const prediccion = W > 0 ? F / W : 0;
  const tendencia  = serie.length >= 2
    ? (serie[0] - serie[serie.length - 1]) / (serie.length - 1)
    : 0;
  const media    = serie.reduce((a, v) => a + v, 0) / (serie.length || 1);
  const varianza = serie.reduce((a, v) => a + (v - media) ** 2, 0) / (serie.length || 1);
  const cv       = media > 0 ? (Math.sqrt(varianza) / media) * 100 : 100;
  return {
    prediccion:          parseFloat(prediccion.toFixed(2)),
    tendencia:           parseFloat(tendencia.toFixed(4)),
    confianza_pct:       parseFloat(Math.max(0, Math.min(100, 100 - cv)).toFixed(1)),
    promedio_ponderado:  parseFloat(prediccion.toFixed(2)),
    alpha:               parseFloat(alpha.toFixed(4)),
  };
}

/** Agrupa timestamps en buckets de N días y devuelve conteos del más reciente al más antiguo */
function bucketsByDays(dates: string[], days = 7): number[] {
  if (!dates.length) return [0];
  const now = Date.now();
  const bucket = (ts: string) => Math.floor((now - new Date(ts).getTime()) / (days * 86_400_000));
  const map: Record<number, number> = {};
  dates.forEach(d => { const b = bucket(d); map[b] = (map[b] ?? 0) + 1; });
  const maxB = Math.max(...Object.keys(map).map(Number));
  return Array.from({ length: maxB + 1 }, (_, i) => map[i] ?? 0);
}

/** Agrupa valores numéricos por período y suma */
function bucketSumByDays(pairs: { date: string; value: number }[], days = 7): number[] {
  if (!pairs.length) return [0];
  const now = Date.now();
  const bucket = (ts: string) => Math.floor((now - new Date(ts).getTime()) / (days * 86_400_000));
  const map: Record<number, number> = {};
  pairs.forEach(({ date, value }) => { const b = bucket(date); map[b] = (map[b] ?? 0) + value; });
  const maxB = Math.max(...Object.keys(map).map(Number));
  return Array.from({ length: maxB + 1 }, (_, i) => map[i] ?? 0);
}

interface LaplaceResult {
  label: string;
  descripcion: string;
  unidad: string;
  color: string;
  icon: string;
  prediccion: number;
  tendencia: number;
  confianza_pct: number;
}

// ── sidebar navigation config ─────────────────────────────────────────────────
const NAV = [
  {
    section: 'GENERAL',
    items: [{ label: 'Dashboard',         icon: 'grid-outline',         route: null              }],
  },
  {
    section: 'USUARIOS',
    items: [
      { label: 'Usuarios',  icon: 'people-outline',      route: '/admin/usuarios'  },
      { label: 'Roles',     icon: 'shield-outline',      route: '/admin/roles'     },
    ],
  },
  {
    section: 'CATÁLOGO',
    items: [
      { label: 'Publicaciones',       icon: 'pricetag-outline', route: '/admin/publicaciones' },
      { label: 'Fotos Publicaciones', icon: 'images-outline',   route: '/admin/fotos'         },
    ],
  },
  {
    section: 'UBICACIONES',
    items: [
      { label: 'Estados',           icon: 'map-outline',       route: '/admin/estados'    },
      { label: 'Municipios',        icon: 'location-outline',  route: '/admin/municipios' },
      { label: 'Puntos de Entrega', icon: 'pin-outline',       route: '/admin/puntos'     },
      { label: 'Carreras',          icon: 'school-outline',    route: '/admin/carreras'   },
    ],
  },
  {
    section: 'MENSAJERÍA',
    items: [
      { label: 'Conversaciones', icon: 'chatbubbles-outline', route: '/admin/conversaciones' },
      { label: 'Mensajes',       icon: 'chatbox-outline',     route: '/admin/mensajes'       },
    ],
  },
  {
    section: 'FINANZAS',
    items: [
      { label: 'Pagos',            icon: 'card-outline',    route: '/admin/pagos'    },
      { label: 'Historial Tratos', icon: 'star-outline',    route: '/admin/tratos'   },
      { label: 'Detalle Ventas',   icon: 'receipt-outline', route: '/admin/ventas'   },
    ],
  },
];

// ── stat card styling ─────────────────────────────────────────────────────────
const STAT_COLORS = [CYAN, MAG, YEL, '#a855f7', GRN];
const STAT_ICONS: string[] = [
  'people-outline', 'pricetag-outline', 'card-outline',
  'chatbubbles-outline', 'cube-outline',
];

export default function AdminDashboardScreen() {
  const router   = useRouter();
  const insets   = useSafeAreaInsets();
  const sideAnim = useRef(new Animated.Value(-SIDEBAR_W)).current;

  const [sideOpen, setSideOpen]       = useState(false);
  const [loading, setLoading]         = useState(true);
  const [predLoading, setPredLoading] = useState(true);
  const [stats, setStats]             = useState({
    usuarios: 0, publicaciones: 0, pagos: 0,
    conversaciones: 0, disponibles: 0,
  });
  const [predictions, setPredictions] = useState<LaplaceResult[]>([]);

  useEffect(() => {
    graphqlRequest<any>(STATS_QUERY)
      .then(d => {
        setStats({
          usuarios:       d.usuarios?.length       ?? 0,
          publicaciones:  d.publicaciones?.length  ?? 0,
          pagos:          d.detalleVenta?.length    ?? 0,
          conversaciones: d.conversaciones?.length ?? 0,
          disponibles:    (d.publicaciones ?? []).filter((p: any) => p.disponible).length,
        });

        // ── 1. Nuevos usuarios por semana ────────────────────────────────────
        const serieUsuarios = bucketsByDays(
          (d.usuarios ?? []).map((u: any) => u.fecha_registro),
          7,
        );
        const predUsr = laplacePredict(serieUsuarios, 0.3);

        // ── 2. Nuevas publicaciones por semana ───────────────────────────────
        const seriePubs = bucketsByDays(
          (d.publicaciones ?? []).map((p: any) => p.fecha_publicacion),
          7,
        );
        const predPub = laplacePredict(seriePubs, 0.3);

        // ── 3. Conversaciones por semana ─────────────────────────────────────
        const serieConv = bucketsByDays(
          (d.conversaciones ?? []).map((c: any) => c.fecha_creacion),
          7,
        );
        const predConv = laplacePredict(serieConv, 0.3);

        // ── 4. Ingresos por semana (suma total de pagos) ──────────────────────
        const serieIngresos = bucketSumByDays(
          (d.pagos ?? []).map((p: any) => ({ date: p.fecha_pago, value: p.total })),
          7,
        );
        const predIngr = laplacePredict(serieIngresos, 0.4);

        // ── 5. Subtotal promedio por venta ─────────────────────────────────
        const subtotales = (d.detalleVenta ?? []).map((v: any) => v.subtotal as number);
        const serieVentas = subtotales.length ? subtotales.slice().reverse() : [0];
        const predVentas = laplacePredict(serieVentas, 0.5);

        // ── 6. Tratos cerrados por semana ────────────────────────────────────
        const serieTratos = bucketsByDays(
          (d.historialTratos ?? []).map((t: any) => t.fecha_cierre),
          7,
        );
        const predTratos = laplacePredict(serieTratos, 0.3);

        // ── 7. Calificacion promedio esperada ────────────────────────────────
        const calificaciones = (d.historialTratos ?? [])
          .map((t: any) => t.calificacion)
          .filter((c: any) => c !== null && c !== undefined) as number[];
        const serieCalif = calificaciones.length ? calificaciones.slice().reverse() : [0];
        const predCalif = laplacePredict(serieCalif, 0.2);

        // ── 8. Mensajes enviados por semana ──────────────────────────────────
        const serieMensajes = bucketsByDays(
          (d.detalleMensajes ?? []).map((m: any) => m.fecha_envio),
          7,
        );
        const predMsg = laplacePredict(serieMensajes, 0.3);

        // ── 9. Descuento promedio aplicado por pago ──────────────────────────
        const descuentos = (d.pagos ?? []).map(
          (p: any) => p.total > 0 ? ((p.total - p.total_con_descuento) / p.total) * 100 : 0
        ) as number[];
        const serieDesc = descuentos.length ? descuentos.slice().reverse() : [0];
        const predDesc = laplacePredict(serieDesc, 0.4);

        // ── 10. Precio promedio de prendas publicadas ────────────────────────
        const precios = (d.publicaciones ?? []).map((p: any) => p.precio as number).filter(Boolean);
        const seriePrecios = precios.length ? precios.slice().reverse() : [0];
        const predPrecio = laplacePredict(seriePrecios, 0.25);

        // ── 11. Cantidad promedio por venta ──────────────────────────────────
        const cantidades = (d.detalleVenta ?? []).map((v: any) => v.cantidad as number);
        const serieCant = cantidades.length ? cantidades.slice().reverse() : [0];
        const predCant = laplacePredict(serieCant, 0.35);

        setPredictions([
          {
            label: 'Usuarios nuevos',
            descripcion: 'Registro esperado la próxima semana',
            unidad: 'usuarios',
            color: CYAN,
            icon: 'person-add-outline',
            prediccion:    predUsr.prediccion,
            tendencia:     predUsr.tendencia,
            confianza_pct: predUsr.confianza_pct,
          },
          {
            label: 'Publicaciones',
            descripcion: 'Prendas a publicar la próxima semana',
            unidad: 'prendas',
            color: MAG,
            icon: 'shirt-outline',
            prediccion:    predPub.prediccion,
            tendencia:     predPub.tendencia,
            confianza_pct: predPub.confianza_pct,
          },
          {
            label: 'Conversaciones',
            descripcion: 'Chats nuevos esperados la próxima semana',
            unidad: 'chats',
            color: '#a855f7',
            icon: 'chatbubbles-outline',
            prediccion:    predConv.prediccion,
            tendencia:     predConv.tendencia,
            confianza_pct: predConv.confianza_pct,
          },
          {
            label: 'Ingresos',
            descripcion: 'Flujo monetario estimado próxima semana',
            unidad: 'MXN',
            color: YEL,
            icon: 'trending-up-outline',
            prediccion:    predIngr.prediccion,
            tendencia:     predIngr.tendencia,
            confianza_pct: predIngr.confianza_pct,
          },
          {
            label: 'Ventas',
            descripcion: 'Subtotal promedio esperado por venta',
            unidad: 'MXN / venta',
            color: GRN,
            icon: 'cash-outline',
            prediccion:    predVentas.prediccion,
            tendencia:     predVentas.tendencia,
            confianza_pct: predVentas.confianza_pct,
          },
          {
            label: 'Tratos cerrados',
            descripcion: 'Tratos que se cerrarán la próxima semana',
            unidad: 'tratos',
            color: '#f97316',
            icon: 'handshake-outline',
            prediccion:    predTratos.prediccion,
            tendencia:     predTratos.tendencia,
            confianza_pct: predTratos.confianza_pct,
          },
          {
            label: 'Calificación',
            descripcion: 'Puntuación media esperada en tratos',
            unidad: '/ 5',
            color: YEL,
            icon: 'star-outline',
            prediccion:    predCalif.prediccion,
            tendencia:     predCalif.tendencia,
            confianza_pct: predCalif.confianza_pct,
          },
          {
            label: 'Mensajes',
            descripcion: 'Mensajes esperados la próxima semana',
            unidad: 'mensajes',
            color: '#06b6d4',
            icon: 'chatbox-outline',
            prediccion:    predMsg.prediccion,
            tendencia:     predMsg.tendencia,
            confianza_pct: predMsg.confianza_pct,
          },
          {
            label: 'Descuento',
            descripcion: 'Porcentaje de descuento promedio aplicado',
            unidad: '%',
            color: '#ec4899',
            icon: 'pricetag-outline',
            prediccion:    predDesc.prediccion,
            tendencia:     predDesc.tendencia,
            confianza_pct: predDesc.confianza_pct,
          },
          {
            label: 'Precio prenda',
            descripcion: 'Precio promedio esperado por prenda',
            unidad: 'MXN',
            color: '#84cc16',
            icon: 'shirt-outline',
            prediccion:    predPrecio.prediccion,
            tendencia:     predPrecio.tendencia,
            confianza_pct: predPrecio.confianza_pct,
          },
          {
            label: 'Uds. por venta',
            descripcion: 'Cantidad promedio de artículos por orden',
            unidad: 'piezas',
            color: '#a78bfa',
            icon: 'cube-outline',
            prediccion:    predCant.prediccion,
            tendencia:     predCant.tendencia,
            confianza_pct: predCant.confianza_pct,
          },
        ]);
      })
      .catch(() => {})
      .finally(() => { setLoading(false); setPredLoading(false); });
  }, []);

  const toggleSidebar = (open: boolean) => {
    Animated.timing(sideAnim, {
      toValue: open ? 0 : -SIDEBAR_W,
      duration: 240,
      useNativeDriver: true,
    }).start();
    setSideOpen(open);
  };

  const logout = () => { setAuthToken(null); router.replace('/'); };

  const statCards = [
    { label: 'USUARIOS',       value: stats.usuarios       },
    { label: 'PUBLICACIONES',  value: stats.publicaciones  },
    { label: 'PAGOS',          value: stats.pagos          },
    { label: 'CONVERSACIONES', value: stats.conversaciones },
    { label: 'DISPONIBLES',    value: stats.disponibles    },
  ];

  return (
    <View style={s.root}>
      {/* ── Header ─────────────────────────────────────────── */}
      <SafeAreaView edges={['top']} style={s.header}>
        <Pressable style={s.iconBtn} onPress={() => toggleSidebar(!sideOpen)}>
          <Ionicons name={sideOpen ? 'close' : 'menu'} size={20} color={CYAN} />
        </Pressable>
        <Text style={s.headerTitle}>{'>_ ADMIN_SYS v2.0'}</Text>
        <Pressable style={s.iconBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color={MUTED} />
        </Pressable>
      </SafeAreaView>

      {/* ── Main content ────────────────────────────────────── */}
      <ScrollView style={s.main} contentContainerStyle={s.mainContent}>
        <Text style={s.dashTitle}>DASHBOARD</Text>
        <Text style={s.dashSub}>{`// RESUMEN GENERAL DEL MARKETPLACE`}</Text>

        {loading
          ? <ActivityIndicator color={CYAN} style={{ marginTop: 40 }} size="large" />
          : statCards.map((card, i) => (
            <View key={card.label} style={s.statCard}>
              <View style={s.statTop}>
                <Text style={s.statLabel}>{card.label}</Text>
                <View style={[s.statIconWrap, { backgroundColor: STAT_COLORS[i] + '1a' }]}>
                  <Ionicons name={STAT_ICONS[i] as any} size={18} color={STAT_COLORS[i]} />
                </View>
              </View>
              <Text style={[s.statValue, { color: STAT_COLORS[i] }]}>
                {`${card.value}`}
              </Text>
              <View style={[s.statBar, { backgroundColor: STAT_COLORS[i] + '30' }]}>
                <View style={[s.statBarFill, { backgroundColor: STAT_COLORS[i], width: '100%' }]} />
              </View>
            </View>
          ))
        }
        {/* ── Predicciones Laplace ─────────────────────────── */}
        <Text style={[s.dashTitle, { fontSize: 20, marginTop: 32 }]}>PREDICCIONES</Text>
        <Text style={s.dashSub}>{'// TRANSFORMADA DE LAPLACE - PROXIMA SEMANA'}</Text>

        {predLoading
          ? <ActivityIndicator color={CYAN} style={{ marginTop: 20 }} />
          : predictions.map((pred) => {
            const tendDir = pred.tendencia > 0 ? 'up' : pred.tendencia < 0 ? 'down' : 'remove';
            const tendColor = pred.tendencia > 0 ? GRN : pred.tendencia < 0 ? '#ef4444' : MUTED;
            const barW = `${Math.min(100, pred.confianza_pct)}%` as any;
            return (
              <View key={pred.label} style={[s.predCard, { borderLeftColor: pred.color }]}>
                <View style={s.predHeader}>
                  <View style={[s.predIconWrap, { backgroundColor: pred.color + '18' }]}>
                    <Ionicons name={pred.icon as any} size={16} color={pred.color} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[s.predLabel, { color: pred.color }]}>{pred.label.toUpperCase()}</Text>
                    <Text style={s.predDesc}>{pred.descripcion}</Text>
                  </View>
                  <Ionicons name={(tendDir === 'up' ? 'trending-up-outline' : tendDir === 'down' ? 'trending-down-outline' : 'remove-outline') as any} size={18} color={tendColor} />
                </View>

                <View style={s.predBody}>
                  <View>
                    <Text style={s.predValLabel}>PREDICCIÓN</Text>
                    <Text style={[s.predVal, { color: pred.color }]}>
                      {`${pred.prediccion} `}<Text style={s.predUnit}>{pred.unidad}</Text>
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={s.predValLabel}>CONFIANZA</Text>
                    <Text style={[s.predVal, { color: pred.confianza_pct >= 60 ? GRN : YEL }]}>
                      {`${pred.confianza_pct}%`}
                    </Text>
                  </View>
                </View>

                <View style={[s.predBarBg, { backgroundColor: pred.color + '25' }]}>
                  <View style={[s.predBarFill, { backgroundColor: pred.color, width: barW }]} />
                </View>
              </View>
            );
          })
        }      </ScrollView>

      {/* ── Sidebar overlay ─────────────────────────────────── */}
      {sideOpen && (
        <Pressable style={s.overlay} onPress={() => toggleSidebar(false)} />
      )}

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <Animated.View
        style={[s.sidebar, { transform: [{ translateX: sideAnim }], paddingTop: insets.top }]}
      >
        <View style={s.sideHeader}>
          <Text style={s.sideLogo}>MKTPLACE</Text>
          <Pressable style={s.iconBtn} onPress={() => toggleSidebar(false)}>
            <Ionicons name="close" size={18} color={MUTED} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          {NAV.map(group => (
            <View key={group.section} style={s.navGroup}>
              <Text style={s.navSection}>{group.section}</Text>
              {group.items.map(item => {
                const active = item.route === null;
                return (
                  <Pressable
                    key={item.label}
                    style={[s.navItem, active && s.navItemActive]}
                    onPress={() => {
                      toggleSidebar(false);
                      if (item.route) router.push(item.route as any);
                    }}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={15}
                      color={active ? CYAN : MUTED}
                    />
                    <Text style={[s.navLabel, active && s.navLabelActive]}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}   
          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>
    </View>
  );
}

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

  // main
  main: { flex: 1 },
  mainContent: { padding: 20, paddingBottom: 48 },
  dashTitle: {
    color: CYAN, fontSize: 28, fontWeight: '900', letterSpacing: 5,
    textShadowColor: CYAN, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 12,
  },
  dashSub: { color: MUTED, fontSize: 11, letterSpacing: 2, marginTop: 4, marginBottom: 24 },

  // stat cards
  statCard: {
    backgroundColor: CARD, borderRadius: 12,
    borderWidth: 1, borderColor: BORDER,
    padding: 18, marginBottom: 14,
  },
  statTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  statLabel: { color: MUTED, fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  statIconWrap: {
    width: 34, height: 34, borderRadius: 9,
    justifyContent: 'center', alignItems: 'center',
  },
  statValue: { fontSize: 40, fontWeight: '900', letterSpacing: 2, marginBottom: 12 },
  statBar: { height: 3, borderRadius: 2 },
  statBarFill: { height: 3, borderRadius: 2 },

  // prediction cards
  predCard: {
    backgroundColor: CARD, borderRadius: 12,
    borderWidth: 1, borderColor: BORDER,
    borderLeftWidth: 3,
    padding: 16, marginBottom: 14,
  },
  predHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  predIconWrap: { width: 34, height: 34, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  predLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  predDesc: { color: MUTED, fontSize: 11, marginTop: 2 },
  predBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 },
  predValLabel: { color: MUTED, fontSize: 10, letterSpacing: 2, fontWeight: '700', marginBottom: 2 },
  predVal: { fontSize: 26, fontWeight: '900', letterSpacing: 1 },
  predUnit: { fontSize: 12, fontWeight: '400', color: TEXTCOL },
  predBarBg: { height: 4, borderRadius: 2 },
  predBarFill: { height: 4, borderRadius: 2 },

  // overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    zIndex: 10,
  },

  // sidebar
  sidebar: {
    position: 'absolute', top: 0, left: 0, bottom: 0,
    width: SIDEBAR_W, backgroundColor: '#090f1c',
    borderRightWidth: 1, borderRightColor: BORDER,
    zIndex: 20,
  },
  sideHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  sideLogo: { color: CYAN, fontSize: 15, fontWeight: '900', letterSpacing: 3 },
  navGroup: { paddingTop: 18, paddingHorizontal: 8 },
  navSection: {
    color: MUTED, fontSize: 10, letterSpacing: 2,
    fontWeight: '700', marginBottom: 6, paddingLeft: 10,
  },
  navItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 10, paddingVertical: 10,
    borderRadius: 8, marginBottom: 2,
  },
  navItemActive: { backgroundColor: CYAN + '15' },
  navLabel: { color: TEXTCOL, fontSize: 13 },
  navLabelActive: { color: CYAN, fontWeight: '700' },
});
