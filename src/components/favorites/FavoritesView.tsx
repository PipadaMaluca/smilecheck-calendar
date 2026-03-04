import { useState, useMemo } from 'react';
import { Star, MapPin, X, Building2, Search, Calendar, MessageCircle, FileText, Phone, Copy, Check, Users, Eye, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MOCK_DENTIST_RESULTS, LEVEL_CONFIG, DentistSearchResult, getAvailabilityForDentist } from '@/data/mockDentistSearch';
import { mockClinics } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { getDentistInitials, getClinicInitials, DENTIST_AVATAR_PHOTOS } from '@/lib/avatarUtils';
import { toast } from 'sonner';
import { UserRole } from '@/types/calendar';

interface FavoritesViewProps {
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onViewProfile: (dentist: DentistSearchResult) => void;
  clinicFavorites?: string[];
  onToggleClinicFavorite?: (id: string) => void;
  onBookDentist?: (dentist: DentistSearchResult) => void;
  onRecommendPatient?: (dentist: DentistSearchResult) => void;
  onSendMessage?: (name: string) => void;
  userRole?: UserRole;
}

const CLINIC_PHONES: Record<string, string> = {
  '1': '+351 213 456 789',
  '2': '+33 1 64 27 33 00',
  '3': '+33 1 43 32 55 00',
};

export function FavoritesView({
  favorites, onToggleFavorite, onViewProfile, clinicFavorites = ['1'],
  onToggleClinicFavorite, onBookDentist, onRecommendPatient, onSendMessage,
  userRole = 'patient'
}: FavoritesViewProps) {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'todos' | 'favoritos'>('todos');
  const [typeFilter, setTypeFilter] = useState<'all' | 'dentists' | 'clinics'>('all');
  const [removeTarget, setRemoveTarget] = useState<{ type: 'dentist' | 'clinic'; id: string; name: string } | null>(null);
  const [callClinic, setCallClinic] = useState<{ id: string; name: string; address: string; phone: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [inviteTarget, setInviteTarget] = useState<DentistSearchResult | null>(null);
  const [inviteMessage, setInviteMessage] = useState('');

  const filteredResults = useMemo(() => {
    let dentists = [...MOCK_DENTIST_RESULTS];
    let clinics = [...mockClinics];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      dentists = dentists.filter(d => d.name.toLowerCase().includes(q) || d.specialties.some(s => s.toLowerCase().includes(q)));
      clinics = clinics.filter(c => c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q));
    }

    // Favorites filter
    if (filterTab === 'favoritos') {
      dentists = dentists.filter(d => favorites.includes(d.id));
      clinics = clinics.filter(c => clinicFavorites.includes(c.id));
    }

    // Type filter
    if (typeFilter === 'dentists') clinics = [];
    if (typeFilter === 'clinics') dentists = [];

    return { dentists, clinics };
  }, [searchQuery, filterTab, typeFilter, favorites, clinicFavorites]);

  const handleConfirmRemove = () => {
    if (!removeTarget) return;
    if (removeTarget.type === 'dentist') onToggleFavorite(removeTarget.id);
    else onToggleClinicFavorite?.(removeTarget.id);
    toast.success(`${removeTarget.name} removido dos favoritos`);
    setRemoveTarget(null);
  };

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopied(true);
    toast.success('Número copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInvite = () => {
    if (!inviteTarget) return;
    toast.success(`Convite enviado a ${inviteTarget.name}!`);
    setInviteTarget(null);
    setInviteMessage('');
  };

  const renderDentistActions = (d: DentistSearchResult) => {
    if (userRole === 'patient') {
      return (
        <div className={cn('gap-2', isMobile ? 'flex flex-col' : 'flex')}>
          <Button size="sm" className="flex-1 text-xs gap-1" onClick={() => onBookDentist?.(d)}>
            <Calendar className="w-3 h-3" /> Marcar Consulta
          </Button>
          <Button size="sm" variant="outline" className="flex-1 text-xs gap-1" onClick={() => { onSendMessage?.(d.name); toast.info('Funcionalidade de mensagens em breve!'); }}>
            <MessageCircle className="w-3 h-3" /> Enviar Mensagem
          </Button>
          <Button size="sm" variant="outline" className="flex-1 text-xs gap-1" onClick={() => toast.info('Link de recomendação copiado!')}>
            <Share2 className="w-3 h-3" /> Recomendar a Amigo
          </Button>
        </div>
      );
    }
    if (userRole === 'dentist') {
      return (
        <div className={cn('gap-2', isMobile ? 'flex flex-col' : 'flex')}>
          <Button size="sm" variant="outline" className="flex-1 text-xs gap-1" onClick={() => { onSendMessage?.(d.name); toast.info('Funcionalidade de mensagens em breve!'); }}>
            <MessageCircle className="w-3 h-3" /> Enviar Mensagem
          </Button>
          <Button size="sm" variant="outline" className="flex-1 text-xs gap-1" onClick={() => onRecommendPatient?.(d)}>
            <FileText className="w-3 h-3" /> Recomendar Paciente
          </Button>
          <Button size="sm" variant="outline" className="flex-1 text-xs gap-1" onClick={() => onViewProfile(d)}>
            <Eye className="w-3 h-3" /> Ver Perfil
          </Button>
        </div>
      );
    }
    // clinic
    return (
      <div className={cn('gap-2', isMobile ? 'flex flex-col' : 'flex')}>
        <Button size="sm" variant="outline" className="flex-1 text-xs gap-1" onClick={() => { onSendMessage?.(d.name); toast.info('Funcionalidade de mensagens em breve!'); }}>
          <MessageCircle className="w-3 h-3" /> Enviar Mensagem
        </Button>
        <Button size="sm" variant="outline" className="flex-1 text-xs gap-1" onClick={() => { setInviteTarget(d); setInviteMessage(`Gostaríamos de convidá-lo a juntar-se à nossa equipa.`); }}>
          <Users className="w-3 h-3" /> Convidar para Equipa
        </Button>
        <Button size="sm" variant="outline" className="flex-1 text-xs gap-1" onClick={() => onViewProfile(d)}>
          <Eye className="w-3 h-3" /> Ver Perfil
        </Button>
      </div>
    );
  };

  const renderClinicActions = (c: typeof mockClinics[0]) => {
    if (userRole === 'patient') {
      return (
        <div className={cn('gap-2', isMobile ? 'flex flex-col' : 'flex')}>
          <Button size="sm" className="flex-1 text-xs gap-1" onClick={() => toast.info('Selecione um dentista desta clínica para marcar consulta.')}>
            <Calendar className="w-3 h-3" /> Marcar Consulta
          </Button>
          <Button size="sm" variant="outline" className="flex-1 text-xs gap-1" onClick={() => toast.info('Funcionalidade de mensagens em breve!')}>
            <MessageCircle className="w-3 h-3" /> Enviar Mensagem
          </Button>
          <Button size="sm" variant="outline" className="flex-1 text-xs gap-1" onClick={() => { const phone = CLINIC_PHONES[c.id] || '+351 210 000 000'; setCallClinic({ id: c.id, name: c.name, address: c.address, phone }); }}>
            <Phone className="w-3 h-3" /> Ligar
          </Button>
        </div>
      );
    }
    // dentist or clinic viewing clinic cards
    return (
      <div className={cn('gap-2', isMobile ? 'flex flex-col' : 'flex')}>
        <Button size="sm" variant="outline" className="flex-1 text-xs gap-1" onClick={() => toast.info('Funcionalidade de mensagens em breve!')}>
          <MessageCircle className="w-3 h-3" /> Enviar Mensagem
        </Button>
        <Button size="sm" variant="outline" className="flex-1 text-xs gap-1" onClick={() => { const phone = CLINIC_PHONES[c.id] || '+351 210 000 000'; setCallClinic({ id: c.id, name: c.name, address: c.address, phone }); }}>
          <Phone className="w-3 h-3" /> Ligar
        </Button>
        <Button size="sm" variant="outline" className="flex-1 text-xs gap-1" onClick={() => toast.info('Perfil da clínica em construção')}>
          <Eye className="w-3 h-3" /> Ver Perfil
        </Button>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Search className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">Pesquisa</h2>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Pesquisar dentistas ou clínicas..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
      </div>

      {/* Filter tabs: Todos | ⭐ Favoritos */}
      <div className="flex gap-2">
        <button onClick={() => setFilterTab('todos')} className={cn('px-4 py-2 text-sm font-medium rounded-lg border transition-colors', filterTab === 'todos' ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground')}>
          Todos
        </button>
        <button onClick={() => setFilterTab('favoritos')} className={cn('px-4 py-2 text-sm font-medium rounded-lg border transition-colors flex items-center gap-1', filterTab === 'favoritos' ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground')}>
          <Star className={cn('w-3.5 h-3.5', filterTab === 'favoritos' ? 'fill-current' : '')} /> Favoritos
        </button>
        {/* Type filter */}
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
          <SelectTrigger className="w-32 h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="dentists">Dentistas</SelectItem>
            <SelectItem value="clinics">Clínicas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground">
        {filteredResults.dentists.length + filteredResults.clinics.length} resultado{filteredResults.dentists.length + filteredResults.clinics.length !== 1 ? 's' : ''}
      </p>

      {/* Results */}
      {filteredResults.dentists.length === 0 && filteredResults.clinics.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhum resultado encontrado.</p>
          <p className="text-xs mt-1">Tente ajustar os filtros ou a pesquisa.</p>
        </div>
      ) : (
        <div className={cn('grid gap-3', isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3')}>
          {/* Dentist cards */}
          {filteredResults.dentists.map(d => {
            const levelCfg = LEVEL_CONFIG[d.level];
            const initials = getDentistInitials(d.name);
            const photo = DENTIST_AVATAR_PHOTOS[d.id];
            const isFav = favorites.includes(d.id);
            const availability = getAvailabilityForDentist(d.id);
            const todaySlots = availability[0]?.slots || [];

            return (
              <div key={d.id} className="bg-card border border-border rounded-xl p-4 space-y-3 relative">
                {/* Star toggle top-right */}
                <button
                  onClick={() => onToggleFavorite(d.id)}
                  className="absolute top-2 right-2 p-1 rounded hover:bg-accent/30 transition-all"
                >
                  <Star className={cn('w-5 h-5 transition-all duration-200', isFav ? 'fill-amber-400 text-amber-400 scale-110' : 'text-muted-foreground hover:text-amber-400')} />
                </button>

                <div className="flex items-start gap-3 pr-10" onClick={() => onViewProfile(d)}>
                  {photo ? (
                    <img src={photo} alt={d.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-lg font-bold text-primary flex-shrink-0">
                      {initials}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate cursor-pointer hover:text-primary">{d.name}</p>
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

                {/* Quick time slots */}
                {todaySlots.length > 0 && (
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-1">{availability[0].dayLabel}:</p>
                    <div className="flex flex-wrap gap-1">
                      {todaySlots.slice(0, 4).map(slot => (
                        <button
                          key={slot}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                          onClick={() => onBookDentist?.(d)}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                {renderDentistActions(d)}
              </div>
            );
          })}

          {/* Clinic cards */}
          {filteredResults.clinics.map(c => {
            const isFav = clinicFavorites.includes(c.id);
            const initials = getClinicInitials(c.name);
            return (
              <div key={`c-${c.id}`} className="bg-card border border-border rounded-xl p-4 space-y-3 relative">
                {/* Star toggle top-right */}
                <button
                  onClick={() => onToggleClinicFavorite?.(c.id)}
                  className="absolute top-2 right-2 p-1 rounded hover:bg-accent/30 transition-all"
                >
                  <Star className={cn('w-5 h-5 transition-all duration-200', isFav ? 'fill-amber-400 text-amber-400 scale-110' : 'text-muted-foreground hover:text-amber-400')} />
                </button>

                <div className="flex items-start gap-3 pr-10">
                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-lg font-bold text-primary flex-shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Clínica Dentária</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{c.address}</span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                {renderClinicActions(c)}
              </div>
            );
          })}
        </div>
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

      {/* Invite to Team Modal (Clinic role) */}
      <Dialog open={!!inviteTarget} onOpenChange={() => { setInviteTarget(null); setInviteMessage(''); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Convidar para Equipa
            </DialogTitle>
            <DialogDescription>
              Convidar <span className="font-semibold text-foreground">{inviteTarget?.name}</span> para a {mockClinics[0]?.name}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Mensagem (opcional)</label>
              <Textarea
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                placeholder="Escreva uma mensagem..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => { setInviteTarget(null); setInviteMessage(''); }}>Cancelar</Button>
            <Button onClick={handleInvite}>Enviar Convite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
