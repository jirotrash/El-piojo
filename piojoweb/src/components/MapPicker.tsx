import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Fix default icon issue in Leaflet when used with bundlers
delete (L.Icon.Default as any).prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

export default function MapPicker({ lat, lng, onChange }: { lat?: number; lng?: number; onChange: (lat: number, lng: number) => void }) {
  const hasPosition = typeof lat === 'number' && typeof lng === 'number' && !(lat === 0 && lng === 0);
  // Centro por defecto: UTVT (Universidad Tecnológica del Valle de Toluca) — coordenadas exactas
  const utvtCenter: [number, number] = [19.340536362461087, -99.47600907454864];
  const defaultZoom = 17;
  const center: [number, number] = hasPosition ? [lat as number, lng as number] : utvtCenter;
  const zoom = hasPosition ? 13 : defaultZoom;

  const markerPosition: [number, number] = hasPosition ? [lat as number, lng as number] : utvtCenter;

  function Recenter({ position }: { position?: [number, number] }) {
    const map = useMap();
    React.useEffect(() => {
      if (position) {
        map.setView(position as any, Math.max(map.getZoom(), 13));
      } else {
        map.setView(utvtCenter as any, defaultZoom);
      }
    }, [position?.[0], position?.[1]]);
    return null;
  }

  function LocationMarker() {
    useMapEvents({
      click(e) {
        onChange(e.latlng.lat, e.latlng.lng);
      },
    });
    return (
      <Marker
        position={markerPosition as any}
        draggable={true}
        eventHandlers={{
          dragend: (ev: any) => {
            const p = ev.target.getLatLng();
            onChange(p.lat, p.lng);
          },
        }}
      >
        {!hasPosition && (
          <Tooltip permanent direction="top">
            Universidad Tecnológica del Valle de Toluca (UTVT)
          </Tooltip>
        )}
      </Marker>
    );
  }

  return (
    <div className="h-64 rounded-md overflow-hidden mb-4">
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Recenter position={hasPosition ? markerPosition : undefined} />
        <LocationMarker />
      </MapContainer>
    </div>
  );
}
