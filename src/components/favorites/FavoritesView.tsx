import { useState, useMemo } from 'react';
import { Star, MapPin, Search, Calendar, MessageCircle, FileText, Phone, Copy, Check, Users, Share2, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { MOCK_DENTIST_RESULTS, LEVEL_CONFIG, DentistSearchResult } from '@/data/mockDentistSearch';
import { mockClinics } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { getDentistInitials, getClinicInitials, DENTIST_AVATAR_PHOTOS } from '@/lib/avatarUtils';
import { toast } from 'sonner';
import { UserRole } from '@/types/calendar';
import { JobMarketView } from '@/components/jobs/JobMarketView';
import { MiniBadges, getShowcasedAchievements } from '@/components/achievements/MiniBadges';
import { dentistAchievements, clinicAchievements } from '@/components/achievements/AchievementsView';

interface FavoritesViewProps {
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onViewProfile: (dentist: DentistSearchResult) => void;
  clinicFavorites?: string[];
  onToggleClinicFavorite?: (id: string) => void;
  onBookDentist?: (dentist: DentistSearchResult) => void;
  onBookClinic?: (clinicId: string) => void;
  onRecommendPatient?: (dentist: DentistSearchResult) => void;
  onSendMessage?: (name: string) => void;
  onViewClinicProfile?: (clinicId: string) => void;
  userRole?: UserRole;
}

const CLINIC_PHONES: Record<string, string> = {
  '1': '+351 213 456 789',
  '2': '+33 1 64 27 33 00',
  '3': '+33 1 43 32 55 00',
};

export function FavoritesView({
  favorites, onToggleFavorite, onViewProfile, clinicFavorites = ['1'],
  onToggleClinicFavorite, onBookDentist, onBookClinic, onRecommendPatient, onSendMessage,
  onViewClinicProfile, userRole = 'patient'
}: FavoritesViewProps) {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'todos' | 'favoritos'>('todos');
  const [typeFilter, setTypeFilter] = useState<'dentists' | 'clinics'>('dentists');
  const [callClinic, setCallClinic] = useState<{ id: string; name: string; address: string; phone: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [inviteTarget, setInviteTarget] = useState<DentistSearchResult | null>(null);
  const [inviteMessage, setInviteMessage] = useState('');
  const [showJobs, setShowJobs] = useState(false);

  const filteredResults = useMemo(() => {
    let dentists = [...MOCK_DENTIST_RESULTS];
    let clinics = [...mockClinics];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      dentists = dentists.filter(d => d.name.toLowerCase().includes(q) || d.specialties.some(s => s.toLowerCase().includes(q)));
      clinics = clinics.filter(c => c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q));
    }
    if (filterTab === 'favoritos') {
      dentists = dentists.filter(d => favorites.includes(d.id));
      clinics = clinics.filter(c => clinicFavorites.includes(c.id));
    }
    if (typeFilter === 'dentists') clinics = [];
    if (typeFilter === 'clinics') dentists = [];
    return { dentists, clinics };
  }, [searchQuery, filterTab, typeFilter, favorites, clinicFavorites]);

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

  // Show job market view
  if (showJobs) {
    return <JobMarketView userRole={userRole} onBack={() => setShowJobs(false)} onSendMessage={onSendMessage} />;
  }

  const renderDentistActions = (d: DentistSearchResult) => {
    if (userRole === 'patient') {
      return (
        <div className={cn('gap-2 mt-2', isMobile ? 'flex flex-col' : 'flex')}>
          <Button size="sm" className="flex-1 text-xs gap-1" onClick={(e) => { e.stopPropagation(); onBookDentist?.(d); }}>
            <Calendar className="w-3 h-3" /> Marcar Consulta
          </Button>
          <Button size="sm" variant="outline" className="flex-1 text-xs gap-1" onClick={(e) => { e.stopPropagation(); onSendMessage?.(d.name); toast.info('Funcionalidade de mensagens em breve!'); }}>
            <MessageCircle className="w-3 h-3" /> Enviar Mensagem
          </Button>
        </div>
      );
    }
    if (userRole === 'dentist') {
      return (
        <div className={cn('gap-2 mt-2', isMobile ? 'flex flex-col' : 'flex')}>
          <Button size="sm" variant="outline" className="flex-1 text-xs gap-1" onClick={(e) => { e.stopPropagation(); onSendMessage?.(d.name); toast.info('Funcionalidade de mensagens em breve!'); }}>
            <MessageCircle className="w-3 h-3" /> Enviar Mensagem
          </Button>
          <Button size="sm" variant="outline" className="flex-1 text-xs gap-1" onClick={(e) => { e.stopPropagation(); onRecommendPatient?.(d); }}>
            <FileText className="w-3 h-3" /> Recomendar Paciente
          </Button>
        </div>
      );
    }
    // clinic
    return (
      <div className={cn('gap-2 mt-2', isMobile ? 'flex flex-col' : 'flex')}>
        <Button size="sm" variant="outline" className="flex-1 text-xs gap-1" onClick={(e) => { e.stopPropagation(); onSendMessage?.(d.name); toast.info('Funcionalidade de mensagens em breve!'); }}>
          <MessageCircle className="w-3 h-3" /> Enviar Mensagem
        </Button>
        <Button size="sm" variant="outline" className="flex-1 text-xs gap-1" onClick={(e) => { e.stopPropagation(); setInviteTarget(d); setInviteMessage(`Gostaríamos de convidá-lo a juntar-se à nossa equipa.`); }}>
          <Users className="w-3 h-3" /> Convidar para Equipa
        </Button>
      </div>
    );
  };

  const renderClinicActions = (c: typeof mockClinics[0]) => {
    if (userRole === 'patient') {
      return (
        <div className={cn('gap-2 mt-2', isMobile ? 'flex flex-col' : 'flex')}>
          <Button size="sm" className="flex-1 text-xs gap-1" onClick={(e) => { e.stopPropagation(); onBookClinic?.(c.id); toast.info('Selecione um dentista desta clínica para marcar consulta.'); }}>
            <Calendar className="w-3 h-3" /> Marcar Consulta
          </Button>
          <Button size="sm" variant="outline" className="flex-1 text-xs gap-1" onClick={(e) => { e.stopPropagation(); toast.info('Funcionalidade de mensagens em breve!'); }}>
            <MessageCircle className="w-3 h-3" /> Enviar Mensagem
          </Button>
        </div>
      );
    }
    if (userRole === 'dentist') {
      return (
        <div className={cn('gap-2 mt-2', isMobile ? 'flex flex-col' : 'flex')}>
          <Button size="sm" variant="outline" className="flex-1 text-xs gap-1" onClick={(e) => { e.stopPropagation(); onSendMessage?.(c.name); toast.info('Funcionalidade de mensagens em breve!'); }}>
            <MessageCircle className="w-3 h-3" /> Enviar Mensagem
          </Button>
          <Button size="sm" className="flex-1 text-xs gap-1" onClick={(e) => { e.stopPropagation(); onBookClinic?.(c.id); toast.info('Booking flow com clínica pré-selecionada.'); }}>
            <Calendar className="w-3 h-3" /> Marcar nesta Clínica
          </Button>
        </div>
      );
    }
    // clinic viewing clinic
    return (
      <div className={cn('gap-2 mt-2', isMobile ? 'flex flex-col' : 'flex')}>
        <Button size="sm" variant="outline" className="flex-1 text-xs gap-1" onClick={(e) => { e.stopPropagation(); toast.info('Funcionalidade de mensagens em breve!'); }}>
          <MessageCircle className="w-3 h-3" /> Enviar Mensagem
        </Button>
        <Button size="sm" variant="outline" className="flex-1 text-xs gap-1" onClick={(e) => { e.stopPropagation(); const phone = CLINIC_PHONES[c.id] || '+351 210 000 000'; setCallClinic({ id: c.id, name: c.name, address: c.address, phone }); }}>
          <Phone className="w-3 h-3" /> Ligar
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

      {/* Tabs: Dentistas | Clínicas + Propostas button + Favoritos toggle */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          <button onClick={() => setTypeFilter('dentists')} className={cn('px-4 py-2 text-sm font-medium rounded-md transition-colors', typeFilter === 'dentists' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
            Dentistas
          </button>
          <button onClick={() => setTypeFilter('clinics')} className={cn('px-4 py-2 text-sm font-medium rounded-md transition-colors', typeFilter === 'clinics' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
            Clínicas
          </button>
        </div>
        <div className="flex gap-2">
          {userRole !== 'patient' && (
            <Button size="sm" className="gap-1.5 text-xs" onClick={() => setShowJobs(true)}>
              <Briefcase className="w-3.5 h-3.5" /> Propostas de Trabalho
            </Button>
          )}
          <button onClick={() => setFilterTab(prev => prev === 'favoritos' ? 'todos' : 'favoritos')} className={cn('px-3 py-2 text-sm font-medium rounded-lg border transition-colors flex items-center gap-1', filterTab === 'favoritos' ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground')}>
            <Star className={cn('w-3.5 h-3.5', filterTab === 'favoritos' ? 'fill-current' : '')} /> Favoritos
          </button>
        </div>
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

            return (
              <div key={d.id}
                className="bg-card border border-border rounded-xl p-4 space-y-2 relative cursor-pointer hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
                onClick={() => onViewProfile(d)}
              >
                {/* Star toggle top-right */}
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleFavorite(d.id); }}
                  className="absolute top-2 right-2 p-1 rounded hover:bg-accent/30 transition-all z-10"
                >
                  <Star className={cn('w-5 h-5 transition-all duration-200', isFav ? 'fill-amber-400 text-amber-400 scale-110' : 'text-muted-foreground hover:text-amber-400')} />
                </button>

                <div className="flex items-start gap-3 pr-10">
                  {photo ? (
                    <img src={photo} alt={d.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-lg font-bold text-primary flex-shrink-0">
                      {initials}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{d.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-medium">{d.rating}</span>
                      <span className={cn('text-[10px] font-semibold px-1.5 py-0 rounded border', levelCfg.bg, levelCfg.color)}>
                        {levelCfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{d.specialties.join(', ')}</p>
                    <MiniBadges
                      achievements={getShowcasedAchievements(
                        dentistAchievements.flatMap(c => c.achievements),
                        'dentist',
                        3
                      )}
                      maxVisible={3}
                      className="mt-1"
                    />
                    {d.clinics[0] && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{d.clinics[0].name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action buttons — no time slots */}
                {renderDentistActions(d)}
              </div>
            );
          })}

          {/* Clinic cards */}
          {filteredResults.clinics.map(c => {
            const isFav = clinicFavorites.includes(c.id);
            const initials = getClinicInitials(c.name);
            return (
              <div key={`c-${c.id}`}
                className="bg-card border border-border rounded-xl p-4 space-y-2 relative cursor-pointer hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
                onClick={() => onViewClinicProfile?.(c.id)}
              >
                {/* Star toggle top-right */}
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleClinicFavorite?.(c.id); }}
                  className="absolute top-2 right-2 p-1 rounded hover:bg-accent/30 transition-all z-10"
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
                    <Phone className="w-4 h-4" /> Ligar agora
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
              <Textarea value={inviteMessage} onChange={(e) => setInviteMessage(e.target.value)} placeholder="Escreva uma mensagem..." rows={3} />
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
