import React, { useState } from 'react';
import {
  Modal, Pressable, StyleSheet, Text, View, ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BG     = '#080d14';
const CARD   = '#0d1520';
const BORDER = '#152230';
const CYAN   = '#22d3ee';
const MUTED  = '#2a4a5e';

// UTVT default center
const DEFAULT_LAT = 19.340536362461087;
const DEFAULT_LNG = -99.47600907454864;

function buildHtml(lat: number, lng: number) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html,body,#map { height:100%; width:100%; background:#080d14; }
    .coords {
      position:absolute; bottom:12px; left:50%; transform:translateX(-50%);
      background:rgba(8,13,20,0.92); color:#22d3ee;
      padding:6px 16px; border-radius:20px; font-size:12px; font-family:monospace;
      border:1px solid #152230; z-index:1000; white-space:nowrap;
    }
    .hint {
      position:absolute; top:10px; left:50%; transform:translateX(-50%);
      background:rgba(8,13,20,0.88); color:#8ab4c8;
      padding:4px 12px; border-radius:12px; font-size:11px;
      border:1px solid #152230; z-index:1000; white-space:nowrap;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div class="hint">Toca o arrastra el marcador</div>
  <div class="coords" id="coords">Cargando...</div>
  <script>
    var initLat = ${lat};
    var initLng = ${lng};
    var map = L.map('map', { zoomControl: true }).setView([initLat, initLng], 16);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors © CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);
    var marker = L.marker([initLat, initLng], { draggable: true }).addTo(map);
    function send(lat, lng) {
      document.getElementById('coords').textContent = lat.toFixed(6) + ', ' + lng.toFixed(6);
      window.ReactNativeWebView.postMessage(JSON.stringify({ lat: lat, lng: lng }));
    }
    marker.on('dragend', function() {
      var p = marker.getLatLng();
      send(p.lat, p.lng);
    });
    map.on('click', function(e) {
      marker.setLatLng(e.latlng);
      send(e.latlng.lat, e.latlng.lng);
    });
    send(initLat, initLng);
  <\/script>
</body>
</html>`;
}

interface Props {
  visible: boolean;
  lat: number;
  lng: number;
  onConfirm: (lat: number, lng: number) => void;
  onClose: () => void;
}

export default function MapPickerModal({ visible, lat, lng, onConfirm, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [pending, setPending] = useState<{ lat: number; lng: number } | null>(null);
  const [webLoaded, setWebLoaded] = useState(false);

  const initLat = lat !== 0 ? lat : DEFAULT_LAT;
  const initLng = lng !== 0 ? lng : DEFAULT_LNG;
  const html = buildHtml(initLat, initLng);

  const handleConfirm = () => {
    if (pending) onConfirm(pending.lat, pending.lng);
    else onConfirm(initLat, initLng);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[s.root, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={s.header}>
          <Pressable style={s.iconBtn} onPress={onClose}>
            <Ionicons name="close" size={20} color={MUTED} />
          </Pressable>
          <Text style={s.title}>SELECCIONAR UBICACIÓN</Text>
          <Pressable style={[s.iconBtn, { borderColor: CYAN }]} onPress={handleConfirm}>
            <Ionicons name="checkmark" size={20} color={CYAN} />
          </Pressable>
        </View>

        {/* Preview coords */}
        <View style={s.coordBar}>
          <Ionicons name="location" size={13} color={CYAN} style={{ marginRight: 6 }} />
          <Text style={s.coordText}>
            {pending
              ? `${pending.lat.toFixed(6)},  ${pending.lng.toFixed(6)}`
              : 'Toca el mapa para seleccionar'
            }
          </Text>
        </View>

        {/* Map */}
        <View style={s.mapWrap}>
          {!webLoaded && (
            <View style={s.loader}>
              <ActivityIndicator color={CYAN} size="large" />
              <Text style={s.loaderText}>Cargando mapa...</Text>
            </View>
          )}
          <WebView
            source={{ html }}
            style={{ flex: 1, opacity: webLoaded ? 1 : 0 }}
            onLoadEnd={() => setWebLoaded(true)}
            onMessage={(e) => {
              try {
                const { lat, lng } = JSON.parse(e.nativeEvent.data);
                setPending({ lat, lng });
              } catch {}
            }}
            javaScriptEnabled
            domStorageEnabled
            originWhitelist={['*']}
          />
        </View>

        {/* Confirm button */}
        <Pressable
          style={[s.confirmBtn, { marginBottom: insets.bottom + 12 }]}
          onPress={handleConfirm}
        >
          <Ionicons name="checkmark-circle" size={18} color="#000" style={{ marginRight: 8 }} />
          <Text style={s.confirmText}>CONFIRMAR UBICACIÓN</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: BORDER, backgroundColor: CARD,
  },
  title: { color: CYAN, fontSize: 12, fontWeight: '700', letterSpacing: 2 },
  iconBtn: {
    width: 36, height: 36, borderRadius: 8,
    borderWidth: 1, borderColor: BORDER,
    justifyContent: 'center', alignItems: 'center',
  },
  coordBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  coordText: { color: '#8ab4c8', fontSize: 12, fontFamily: 'monospace' },
  mapWrap: { flex: 1 },
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center', alignItems: 'center', gap: 12, zIndex: 10,
  },
  loaderText: { color: MUTED, fontSize: 12, letterSpacing: 2 },
  confirmBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: CYAN, margin: 16, borderRadius: 12, paddingVertical: 14,
  },
  confirmText: { color: '#000', fontWeight: '900', fontSize: 14, letterSpacing: 2 },
});
