import { useState } from 'react';
import { ArrowLeft, Star, MapPin, Calendar, MessageCircle, User, GraduationCap, Languages, FileText, Stethoscope, Video, TrendingUp, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { DentistSearchResult, LEVEL_CONFIG, PLAN_CONFIG, getReviewsForDentist } from '@/data/mockDentistSearch';
import { BookingFlow } from '@/components/booking/BookingFlow';
import { ClickableClinicName } from '@/components/search/ClickableClinicName';
import { BadgeShowcase } from '@/components/achievements/BadgeShowcase';
import { getAchievementCategories } from '@/components/achievements/AchievementsView';
import { getDentistInitials, DENTIST_AVATAR_PHOTOS } from '@/lib/avatarUtils';

interface DentistProfileViewProps {
  dentist: DentistSearchResult;
  isOpen: boolean;
  onClose: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onGoHome?: () => void;
  inline?: boolean;
  isOwnProfile?: boolean;
  onEditProfile?: () => void;
  onReferralLetter?: () => void;
}

const DENTIST_EXTRA = {
  yearsExperience: 15,
  education: 'Universidade de Lisboa - Faculdade de Medicina Dentária',
  languages: [
  { code: '🇵🇹', name: 'Português' },
  { code: '🇫🇷', name: 'Français' },
  { code: '🇬🇧', name: 'English' }],

  acceptsNewPatients: true,
  teleconsultaAvailable: true,
  presencialPrice: 'Variável conforme tratamento',
  paymentMethods: ['Cartão', 'MB WAY', 'Multibanco'],
  insurances: ['Médis', 'Multicare', 'AdvanceCare', 'ADSE'],
  personalInfo: {
    email: 'goncalo.pipo@smilecheck.pt',
    phone: '+351 910 000 000',
    birthDate: '22/07/1985',
    orderNumber: 'OMD-12345',
    orderCountry: 'Portugal'
  },
  stats: {
    totalConsultations: '1 247',
    teleconsultations: '312',
    confirmationRate: '94%',
    avgDuration: '28 min'
  },
  clinicSchedules: [
  {
    clinicId: '1',
    clinicName: 'Clínica SmileCheck',
    address: 'Av. da Liberdade 123, Lisboa',
    distance: 2.5,
    days: [
    { day: 'Segunda', hours: '09:00 - 19:00' },
    { day: 'Terça', hours: '09:00 - 19:00' },
    { day: 'Quarta', hours: '09:00 - 13:00' },
    { day: 'Quinta', hours: '09:00 - 19:00' },
    { day: 'Sexta', hours: '09:00 - 19:00' }],

    accessibility: ['Cadeira de rodas', 'Elevador', 'WC adaptado']
  },
  {
    clinicId: '2',
    clinicName: 'Clínica Mitry-Mory',
    address: 'Rue de Paris 45, Mitry-Mory',
    distance: 4.2,
    days: [
    { day: 'Quarta', hours: '14:00 - 19:00' },
    { day: 'Sábado', hours: '09:00 - 13:00' }],

    accessibility: ['Cadeira de rodas', 'Estacionamento gratuito']
  },
  {
    clinicId: '3',
    clinicName: 'Clínica Montfermeil',
    address: 'Avenue Jean Jaurès 78, Montfermeil',
    distance: 6.0,
    days: [
    { day: 'Sábado', hours: '14:00 - 18:00' }],

    accessibility: ['Cadeira de rodas', 'WC adaptado']
  }]

};

export function DentistProfileView({ dentist, isOpen, onClose, isFavorite, onToggleFavorite, onGoHome, inline, isOwnProfile, onEditProfile, onReferralLetter }: DentistProfileViewProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [showBooking, setShowBooking] = useState(false);
  const levelCfg = LEVEL_CONFIG[dentist.level];
  const planCfg = PLAN_CONFIG[dentist.plan || 'free'];
  const reviews = getReviewsForDentist(dentist.id);
  const initials = getDentistInitials(dentist.name);
  const photo = DENTIST_AVATAR_PHOTOS[dentist.id];

  const breakdown = [
  { stars: 5, pct: 78 },
  { stars: 4, pct: 15 },
  { stars: 3, pct: 4 },
  { stars: 2, pct: 2 },
  { stars: 1, pct: 1 }];


  if (!isOpen) return null;

  if (showBooking) {
    return (
      <BookingFlow
        dentist={dentist}
        onClose={() => setShowBooking(false)}
        onComplete={() => {setShowBooking(false);onClose();}}
        onGoHome={onGoHome} />);


  }

  const profileContent =
  <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
        <Avatar className="w-24 h-24 flex-shrink-0">
          {photo && <AvatarImage src={photo} alt={dentist.name} />}
          <AvatarFallback className="bg-secondary text-3xl font-bold text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-xl font-bold text-foreground">{dentist.name}</h3>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 mt-1">
            {dentist.specialties.map((s) =>
          <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
          )}
          </div>
          <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className={cn('text-sm font-bold', levelCfg.color)}>{dentist.rating}</span>
              <span className="text-xs text-muted-foreground">({dentist.reviewCount} avaliações)</span>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-2 mt-1.5">
            <span className={cn('text-xs font-semibold px-2 py-0.5 rounded border', levelCfg.bg, levelCfg.color)}>
              {levelCfg.label}
            </span>
            <span className={cn('text-xs font-semibold px-2 py-0.5 rounded border', planCfg.bg, planCfg.color)}>
              📋 {planCfg.label}
            </span>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
            <Badge variant={DENTIST_EXTRA.acceptsNewPatients ? 'default' : 'destructive'} className="text-xs">
              {DENTIST_EXTRA.acceptsNewPatients ? '✓ Aceita novos pacientes' : '✗ Não aceita novos pacientes'}
            </Badge>
            {DENTIST_EXTRA.teleconsultaAvailable &&
          <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-400/30 bg-emerald-400/10">
                📱 Teleconsultas
              </Badge>
          }
          </div>
        </div>
        {isOwnProfile ?
      <div className={cn('flex gap-2', isMobile ? 'w-full flex-col' : 'flex-col')}>
            <Button variant="outline" className="flex-1 min-h-[44px]" onClick={onEditProfile}>
              Editar Perfil
            </Button>
          </div> :

      <div className={cn("flex items-center gap-[50px]", isMobile ? 'w-full' : '')}>
            <div className={cn('flex gap-2', isMobile ? 'flex-1 flex-col' : 'flex-col')}>
              {onReferralLetter &&
          <Button variant="outline" className="flex-1 min-h-[44px]" onClick={onReferralLetter}>
                  <FileText className="w-4 h-4 mr-1" /> Carta de Referência
                </Button>
          }
              <Button variant="outline" className="flex-1 min-h-[44px]">
                <MessageCircle className="w-4 h-4 mr-1" /> Mensagem
              </Button>
            </div>
            {onToggleFavorite &&
        <button
          onClick={onToggleFavorite}
          className="p-1 transition-transform hover:scale-110 flex-shrink-0 text-left px-[10px] py-[5px] pr-[30px] pl-[5px]"
          title={isFavorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}>
          
                <Star className={cn("transition-colors h-[25px] w-[25px] text-left", isFavorite ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground hover:text-amber-400')} />
              </button>
        }
          </div>
      }
      </div>

      <Separator />

      {/* Badge Showcase */}
      <BadgeShowcase
      userRole="dentist"
      categories={getAchievementCategories('dentist')}
      isOwnProfile={isOwnProfile} />
    

      <Separator />

      {/* Sobre */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">Sobre</h4>
        <p className="text-sm text-muted-foreground">{dentist.bio}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{DENTIST_EXTRA.yearsExperience} anos de experiência</span>
          </div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground text-xs">{DENTIST_EXTRA.education}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-muted-foreground" />
          <div className="flex gap-1.5">
            {DENTIST_EXTRA.languages.map((l) =>
          <span key={l.name} className="text-sm">{l.code} {l.name}</span>
          )}
          </div>
        </div>
      </section>

      <Separator />

      {/* Estatísticas */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">Estatísticas</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
        { label: 'Total consultas', value: DENTIST_EXTRA.stats.totalConsultations, icon: Stethoscope },
        { label: 'Teleconsultas', value: DENTIST_EXTRA.stats.teleconsultations, icon: Video },
        { label: 'Taxa confirmação', value: DENTIST_EXTRA.stats.confirmationRate, icon: TrendingUp },
        { label: 'Tempo médio', value: DENTIST_EXTRA.stats.avgDuration, icon: Clock }].
        map((stat) =>
        <div key={stat.label} className="bg-secondary/50 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <stat.icon className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] text-muted-foreground">{stat.label}</span>
              </div>
              <span className="text-lg font-bold">{stat.value}</span>
            </div>
        )}
        </div>
      </section>

      <Separator />

      {/* Locations */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">Locais de Atendimento</h4>
        <div className={cn('grid gap-3', isMobile ? 'grid-cols-1' : 'grid-cols-2')}>
          {DENTIST_EXTRA.clinicSchedules.map((cs, i) =>
        <div key={i} className="bg-secondary/50 rounded-xl p-4 space-y-3 border border-border">
              <div>
                <ClickableClinicName clinicId={cs.clinicId} name={cs.clinicName} className="text-sm font-semibold" />
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <MapPin className="w-3 h-3" />
                  <span>{cs.address} · {cs.distance} km</span>
                </div>
              </div>
              <div className="space-y-1">
                {cs.days.map((d) =>
            <div key={d.day} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{d.day}</span>
                    <span className="font-medium">{d.hours}</span>
                  </div>
            )}
              </div>
              <div className="flex flex-wrap gap-1">
                {cs.accessibility.map((a) =>
            <Badge key={a} variant="outline" className="text-[10px]">✓ {a}</Badge>
            )}
              </div>
              <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => setShowBooking(true)}>
                Marcar nesta clínica
              </Button>
            </div>
        )}
        </div>
      </section>

      <Separator />

      {/* Tariffs */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">Tarifas e Pagamentos</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Teleconsulta</span>
            <span className="font-medium">€{dentist.teleconsultaPrice}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Consulta presencial</span>
            <span className="font-medium">{DENTIST_EXTRA.presencialPrice}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-muted-foreground">Métodos aceites</span>
            <div className="flex flex-wrap gap-1 justify-end">
              {DENTIST_EXTRA.paymentMethods.map((m) =>
            <Badge key={m} variant="outline" className="text-[10px]">{m}</Badge>
            )}
            </div>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-muted-foreground">Convenções</span>
            <div className="flex flex-wrap gap-1 justify-end">
              {DENTIST_EXTRA.insurances.map((s) =>
            <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
            )}
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Reviews */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">Avaliações</h4>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold">{dentist.rating}</p>
            <div className="flex justify-center">
              {Array.from({ length: 5 }).map((_, i) =>
            <Star key={i} className={cn('w-4 h-4', i < Math.floor(dentist.rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground')} />
            )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{dentist.reviewCount} avaliações</p>
          </div>
          <div className="flex-1 space-y-1">
            {breakdown.map((b) =>
          <div key={b.stars} className="flex items-center gap-2 text-xs">
                <span className="w-3">{b.stars}★</span>
                <Progress value={b.pct} className="h-2 flex-1" />
                <span className="w-8 text-right text-muted-foreground">{b.pct}%</span>
              </div>
          )}
          </div>
        </div>
        <div className="space-y-2 mt-3">
          {reviews.slice(0, 5).map((r) =>
        <div key={r.id} className="bg-secondary/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                    {r.patientName[0]}
                  </div>
                  <span className="text-xs font-semibold">{r.patientName}</span>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: r.rating }).map((_, i) =>
              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
              )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{r.comment}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">{r.date}</p>
            </div>
        )}
        </div>
      </section>

      {/* Personal Info - own profile only */}
      {isOwnProfile &&
    <>
          <Separator />
          <section className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Informação Pessoal</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between py-1.5 border-b border-border/30"><span className="text-muted-foreground">Email</span><span>{DENTIST_EXTRA.personalInfo.email}</span></div>
              <div className="flex justify-between py-1.5 border-b border-border/30"><span className="text-muted-foreground">Telefone</span><span>{DENTIST_EXTRA.personalInfo.phone}</span></div>
              <div className="flex justify-between py-1.5 border-b border-border/30"><span className="text-muted-foreground">Nascimento</span><span>{DENTIST_EXTRA.personalInfo.birthDate}</span></div>
              <div className="flex justify-between py-1.5 border-b border-border/30"><span className="text-muted-foreground">Nº Ordem</span><span>{DENTIST_EXTRA.personalInfo.orderNumber}</span></div>
              <div className="flex justify-between py-1.5 border-b border-border/30"><span className="text-muted-foreground">País Ordem</span><span>{DENTIST_EXTRA.personalInfo.orderCountry}</span></div>
            </div>
          </section>
        </>
    }
    </div>;


  if (inline) {
    return <div className="p-5">{profileContent}</div>;
  }

  return (
    <div className="fixed inset-0 bg-background z-[60] flex flex-col overflow-hidden pb-[60px]">
      <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={onClose}><ArrowLeft className="w-5 h-5" /></Button>
        <h2 className="text-base font-semibold">Perfil do Dentista</h2>
        <div className="w-10" />
      </div>
      <ScrollArea className="flex-1">
        <div className="p-5">{profileContent}</div>
      </ScrollArea>
    </div>);

}