import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import type { DentistSearchResult } from '@/data/mockDentistSearch';

export interface ClinicMapItem {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  lat: number;
  lng: number;
}

interface DentistMapViewProps {
  dentists?: DentistSearchResult[];
  onViewProfile?: (dentist: DentistSearchResult) => void;
  focusedId?: string | null;
  /** When provided, renders one marker per clinic instead of dentists. */
  clinics?: ClinicMapItem[];
  onViewClinic?: (clinicId: string) => void;
}

interface MapGroup {
  key: string;
  lat: number;
  lng: number;
  clinicName: string;
  dentists: DentistSearchResult[];
  clinics: ClinicMapItem[];
}

// Marker drawn with theme tokens (avoids Leaflet's default image icons, which break under Vite).
const markerIcon = (count: number) =>
  L.divIcon({
    className: '',
    html: `<div style="width:36px;height:36px;border-radius:9999px;background:hsl(var(--primary));color:hsl(var(--primary-foreground));border:3px solid hsl(var(--background));box-shadow:0 2px 6px hsl(var(--foreground) / 0.3);display:flex;align-items:center;justify-content:center;font:600 13px/1 system-ui">${count}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });

function FitBounds({ groups, focused }: { groups: MapGroup[]; focused?: MapGroup }) {
  const map = useMap();
  useEffect(() => {
    // The container may mount hidden or at 0 size (tab switch) — measure again before fitting.
    const fit = () => {
      map.invalidateSize();
      if (focused) { map.flyTo([focused.lat, focused.lng], 14, { duration: 0.6 }); return; }
      if (groups.length === 0) return;
      if (groups.length === 1) { map.setView([groups[0].lat, groups[0].lng], 13); return; }
      const bounds = L.latLngBounds(groups.map(g => [g.lat, g.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 13 });
    };
    fit();
    const id = window.setTimeout(fit, 250);
    return () => window.clearTimeout(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, groups.map(g => g.key).join('|'), focused?.key]);
  return null;
}

export default function DentistMapView({ dentists = [], onViewProfile, focusedId, clinics, onViewClinic }: DentistMapViewProps) {
  const { t } = useTranslation();

  const groups = useMemo<MapGroup[]>(() => {
    const byKey = new Map<string, MapGroup>();
    if (clinics) {
      // Clinics closer than ~1 km share one marker that shows the real count.
      for (const c of clinics) {
        const key = `${c.lat.toFixed(2)},${c.lng.toFixed(2)}`;
        const g = byKey.get(key) ?? { key, lat: c.lat, lng: c.lng, clinicName: c.name, dentists: [], clinics: [] };
        g.clinics.push(c);
        byKey.set(key, g);
      }
      return [...byKey.values()];
    }
    for (const d of dentists) {
      const key = `${d.lat},${d.lng}`;
      const g = byKey.get(key) ?? { key, lat: d.lat, lng: d.lng, clinicName: d.clinics[0]?.name ?? '', dentists: [], clinics: [] };
      g.dentists.push(d);
      byKey.set(key, g);
    }
    return [...byKey.values()];
  }, [dentists, clinics]);

  const focused = focusedId ? groups.find(g => g.dentists.some(d => d.id === focusedId)) : undefined;

  return (
    <div className="relative isolate z-0 h-full w-full">
      <MapContainer center={[45, 0]} zoom={5} className="h-full w-full" scrollWheelZoom aria-label={t('search.mapAria')}>
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />
        <FitBounds groups={groups} focused={focused} />
        {clinics && groups.map(g => (
          <Marker key={g.key} position={[g.lat, g.lng]} icon={markerIcon(g.clinics.length)} title={g.clinics.map(c => c.name).join(', ')}>
            <Popup minWidth={220} maxWidth={280}>
              <div className="space-y-3 text-foreground">
                {g.clinics.map(c => (
                  <div key={c.id} className="space-y-1">
                    <p className="text-sm font-semibold truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.address}</p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1 text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-warning" />
                        {c.rating} <span className="text-muted-foreground">({c.reviewCount})</span>
                      </span>
                      <Button type="button" size="sm" className="min-h-11" onClick={() => onViewClinic?.(c.id)}>
                        {t('search.viewProfileBtn')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Popup>
          </Marker>
        ))}
        {!clinics && groups.map(g => (
          <Marker key={g.key} position={[g.lat, g.lng]} icon={markerIcon(g.dentists.length)} title={g.clinicName}>
            <Popup minWidth={220} maxWidth={280}>
              <div className="space-y-3 text-foreground">
                <p className="text-xs font-semibold text-muted-foreground">{g.clinicName}</p>
                {g.dentists.map(d => (
                  <div key={d.id} className="space-y-1">
                    <p className="text-sm font-semibold truncate">{d.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{d.specialties.join(', ')}</p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1 text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-warning" />
                        {d.rating} <span className="text-muted-foreground">({d.reviewCount})</span>
                      </span>
                      <Button type="button" size="sm" className="min-h-11" onClick={() => onViewProfile?.(d)}>
                        {t('search.viewProfileBtn')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
