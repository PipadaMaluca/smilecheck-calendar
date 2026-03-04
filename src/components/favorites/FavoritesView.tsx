import { useState, useMemo } from 'react';
import { Star, MapPin, X, Building2, Search, Calendar, MessageCircle, FileText, Phone, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { MOCK_DENTIST_RESULTS, LEVEL_CONFIG, DentistSearchResult } from '@/data/mockDentistSearch';
import { mockClinics } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { ClickableDentistName } from '@/components/search/ClickableDentistName';
import { ClickableClinicName } from '@/components/search/ClickableClinicName';
import { toast } from 'sonner';

interface FavoritesViewProps {
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onViewProfile: (dentist: DentistSearchResult) => void;
  clinicFavorites?: string[];
  onToggleClinicFavorite?: (id: string) => void;
  onBookDentist?: (dentist: DentistSearchResult) => void;
  onRecommendPatient?: (dentist: DentistSearchResult) => void;
  onSendMessage?: (name: string) => void;
}

// Mock phone numbers for clinics
const CLINIC_PHONES: Record<string, string> = {
  '1': '+351 213 456 789',
  '2': '+33 1 64 27 33 00',
  '3': '+33 1 43 32 55 00',
};

export function FavoritesView({
  favorites, onToggleFavorite, onViewProfile, clinicFavorites = ['1'],
  onToggleClinicFavorite, onBookDentist, onRecommendPatient, onSendMessage
}: FavoritesViewProps) {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<'dentists' | 'clinics'>('dentists');
  const [searchQuery, setSearchQuery] = useState('');
  const [removeTarget, setRemoveTarget] = useState<{ type: 'dentist' | 'clinic'; id: string; name: string } | null>(null);
  const [callClinic, setCallClinic] = useState<{ id: string; name: string; address: string; phone: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const favoriteDentists = MOCK_DENTIST_RESULTS.filter(d => favorites.includes(d.id));
  const favoriteClinics = mockClinics.filter(c => clinicFavorites.includes(c.id));

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { dentists: [], clinics: [] };
    const q = searchQuery.toLowerCase();
    return {
      dentists: MOCK_DENTIST_RESULTS.filter(d => d.name.toLowerCase().includes(q)),
      clinics: mockClinics.filter(c => c.name.toLowerCase().includes(q)),
    };
  }, [searchQuery]);

  const hasSearchResults = searchResults.dentists.length > 0 || searchResults.clinics.length > 0;

  const handleConfirmRemove = () => {
    if (!removeTarget) return;
    if (removeTarget.type === 'dentist') {
      onToggleFavorite(removeTarget.id);
    } else {
      onToggleClinicFavorite?.(removeTarget.id);
    }
    toast.success(`${removeTarget.name} removido dos favoritos`);
    setRemoveTarget(null);
  };

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopied(true);
    toast.success('Número copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
        <h2 className="text-lg font-bold text-foreground">Favoritos</h2>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Pesquisar dentistas e clínicas..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
      </div>

      {/* Search Results */}
      {searchQuery.trim() && (
        <div className="border border-border rounded-lg bg-card divide-y divide-border max-h-64 overflow-y-auto">
          {!hasSearchResults && <p className="p-3 text-sm text-muted-foreground text-center">Nenhum resultado encontrado.</p>}
          {searchResults.dentists.map(d => {
            const isFav = favorites.includes(d.id);
            return (
              <div key={`search-d-${d.id}`} className="flex items-center gap-3 p-3 hover:bg-accent/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{d.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">Dentista</span>
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs">{d.rating}</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onToggleFavorite(d.id)}>
                  <Star className={cn('w-4 h-4', isFav ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground')} />
                </Button>
              </div>
            );
          })}
          {searchResults.clinics.map(c => {
            const isFav = clinicFavorites.includes(c.id);
            return (
              <div key={`search-c-${c.id}`} className="flex items-center gap-3 p-3 hover:bg-accent/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                  <span className="text-xs text-muted-foreground">Clínica</span>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onToggleClinicFavorite?.(c.id)}>
                  <Star className={cn('w-4 h-4', isFav ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground')} />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button onClick={() => setActiveTab('dentists')} className={cn('px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px', activeTab === 'dentists' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}>
          Dentistas ({favoriteDentists.length})
        </button>
        <button onClick={() => setActiveTab('clinics')} className={cn('px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px', activeTab === 'clinics' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}>
          Clínicas ({favoriteClinics.length})
        </button>
      </div>

      {/* Dentists Tab */}
      {activeTab === 'dentists' && (
        favoriteDentists.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Star className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhum dentista favorito ainda.</p>
            <p className="text-xs mt-1">Adicione dentistas aos favoritos a partir da pesquisa ou dos perfis.</p>
          </div>
        ) : (
          <div className={cn('grid gap-3', isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3')}>
            {favoriteDentists.map(d => {
              const levelCfg = LEVEL_CONFIG[d.level];
              const initials = d.name.split(' ').filter((_, i, a) => i === 0 || i === a.length - 1).map(n => n[0]).join('');
              return (
                <div key={d.id} className="bg-card border border-border rounded-xl p-4 space-y-3 relative">
                  {/* Remove button top-right */}
                  <button
                    onClick={() => setRemoveTarget({ type: 'dentist', id: d.id, name: d.name })}
                    className="absolute top-2 right-2 flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 transition-colors px-1.5 py-0.5 rounded hover:bg-destructive/10"
                  >
                    <X className="w-3 h-3" />
                    <span>Remover</span>
                  </button>

                  <div className="flex items-start gap-3 pr-16">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-lg font-bold text-primary flex-shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">
                        <ClickableDentistName name={d.name} className="text-sm font-bold text-foreground" />
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-medium">{d.rating}</span>
                        <span className={cn('text-[10px] font-semibold px-1.5 py-0 rounded border', levelCfg.bg, levelCfg.color)}>
                          {levelCfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{d.specialties.join(', ')}</p>
                      {d.clinics[0] && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{d.clinics[0].name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className={cn('gap-2', isMobile ? 'flex flex-col' : 'flex')}>
                    <Button
                      size="sm"
                      className="flex-1 text-xs gap-1"
                      onClick={() => onBookDentist?.(d)}
                    >
                      <Calendar className="w-3 h-3" />
                      Marcar Consulta
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs gap-1"
                      onClick={() => {
                        onSendMessage?.(d.name);
                        toast.info('Funcionalidade de mensagens em breve!');
                      }}
                    >
                      <MessageCircle className="w-3 h-3" />
                      Enviar Mensagem
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs gap-1"
                      onClick={() => onRecommendPatient?.(d)}
                    >
                      <FileText className="w-3 h-3" />
                      Recomendar Paciente
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Clinics Tab */}
      {activeTab === 'clinics' && (
        favoriteClinics.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhuma clínica favorita ainda.</p>
            <p className="text-xs mt-1">Adicione clínicas aos favoritos a partir da pesquisa ou dos perfis.</p>
          </div>
        ) : (
          <div className={cn('grid gap-3', isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3')}>
            {favoriteClinics.map(c => (
              <div key={c.id} className="bg-card border border-border rounded-xl p-4 space-y-3 relative">
                {/* Remove button top-right */}
                <button
                  onClick={() => setRemoveTarget({ type: 'clinic', id: c.id, name: c.name })}
                  className="absolute top-2 right-2 flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 transition-colors px-1.5 py-0.5 rounded hover:bg-destructive/10"
                >
                  <X className="w-3 h-3" />
                  <span>Remover</span>
                </button>

                <div className="flex items-start gap-3 pr-16">
                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">
                      <ClickableClinicName name={c.name} clinicId={c.id} className="text-sm font-bold text-foreground" />
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">Clínica Dentária</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{c.address}</span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className={cn('gap-2', isMobile ? 'flex flex-col' : 'flex')}>
                  <Button
                    size="sm"
                    className="flex-1 text-xs gap-1"
                    onClick={() => toast.info('Selecione um dentista desta clínica para marcar consulta.')}
                  >
                    <Calendar className="w-3 h-3" />
                    Marcar Consulta
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs gap-1"
                    onClick={() => toast.info('Funcionalidade de mensagens em breve!')}
                  >
                    <MessageCircle className="w-3 h-3" />
                    Enviar Mensagem
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs gap-1"
                    onClick={() => {
                      const phone = CLINIC_PHONES[c.id] || '+351 210 000 000';
                      setCallClinic({ id: c.id, name: c.name, address: c.address, phone });
                    }}
                  >
                    <Phone className="w-3 h-3" />
                    Ligar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Remove Confirmation Dialog */}
      <Dialog open={!!removeTarget} onOpenChange={() => setRemoveTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remover dos favoritos?</DialogTitle>
            <DialogDescription>
              Remover <span className="font-semibold text-foreground">{removeTarget?.name}</span> dos favoritos?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setRemoveTarget(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleConfirmRemove}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Call Clinic Modal */}
      <Dialog open={!!callClinic} onOpenChange={() => { setCallClinic(null); setCopied(false); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              Contactar Clínica
            </DialogTitle>
          </DialogHeader>
          {callClinic && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <p className="font-semibold text-foreground">{callClinic.name}</p>
                <p className="text-xs text-muted-foreground">{callClinic.address}</p>
              </div>
              <div className="bg-secondary rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-primary tracking-wider">{callClinic.phone}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 gap-2" onClick={() => handleCopyPhone(callClinic.phone)}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copiado!' : 'Copiar número'}
                </Button>
                <Button className="flex-1 gap-2" asChild>
                  <a href={`tel:${callClinic.phone.replace(/\s/g, '')}`}>
                    <Phone className="w-4 h-4" />
                    Ligar agora
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
