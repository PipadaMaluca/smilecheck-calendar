import { useState } from 'react';
import { ArrowLeft, Star, MapPin, MessageCircle, GraduationCap, Languages, FileText, Stethoscope, Video, TrendingUp, Clock, Lock } from 'lucide-react';
import { LEVEL_GLOW, DENTIST_TRENDS, getTrendDisplay, formatRelativeDate } from '@/lib/profileUtils';
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
import { getViewerRole } from '@/lib/viewerRole';
import { BidirectionalFeedbackModal } from '@/components/feedback/BidirectionalFeedbackModal';
import { AvatarFrame } from '@/components/level/AvatarFrame';
import { LevelSeal } from '@/components/level/LevelSeal';
import { NextLevelBenefits } from '@/components/level/NextLevelBenefits';
import { FullScreenMobileOverlay } from '@/components/layout/FullScreenMobileOverlay';

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
  const [showRateModal, setShowRateModal] = useState(false);
  const [hasPendingRating, setHasPendingRating] = useState(true);
  const viewerRole = getViewerRole();
  const canViewerRate = !isOwnProfile && viewerRole === 'clinic';
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
        <AvatarFrame levelKey={dentist.level} className="w-24 h-24">
          <Avatar className="w-full h-full">
            {photo && <AvatarImage src={photo} alt={dentist.name} />}
            <AvatarFallback className="bg-secondary text-3xl font-bold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
        </AvatarFrame>
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
              <span className="text-xs text-muted-foreground">({dentist.reviewCount} {t('profile.reviews').toLowerCase()})</span>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-2 mt-1.5">
            <span className={cn('text-xs font-semibold px-2 py-0.5 rounded border', levelCfg.bg, levelCfg.color, LEVEL_GLOW[dentist.level] || '')}>
              {t(levelCfg.labelKey)}
            </span>
            <LevelSeal role="dentist" levelKey={dentist.level} />
            <span className={cn('text-xs font-semibold px-2 py-0.5 rounded border', planCfg.bg, planCfg.color)}>
              📋 {planCfg.label}
            </span>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
            <Badge variant={DENTIST_EXTRA.acceptsNewPatients ? 'default' : 'destructive'} className="text-xs">
              {DENTIST_EXTRA.acceptsNewPatients ? `✓ ${t('profile.acceptsNewPatients')}` : `✗ ${t('profile.notAcceptingPatients')}`}
            </Badge>
            {DENTIST_EXTRA.teleconsultaAvailable &&
          <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-400/30 bg-emerald-400/10">
                📱 {t('profile.teleconsultAvailable')}
              </Badge>
          }
          </div>
        </div>
        {isOwnProfile ?
      <div className={cn('flex gap-2', isMobile ? 'w-full flex-col' : 'flex-col')}>
            <Button variant="outline" className="flex-1 min-h-[44px]" onClick={onEditProfile}>
              {t('profile.editProfile')}
            </Button>
          </div> :

      <div className={cn("flex items-center gap-[50px]", isMobile ? 'w-full' : '')}>
            <div className={cn('flex gap-2', isMobile ? 'flex-1 flex-col' : 'flex-col')}>
              {onReferralLetter &&
          <Button variant="outline" className="flex-1 min-h-[44px]" onClick={onReferralLetter}>
                  <FileText className="w-4 h-4 mr-1" /> {t('profile.referralLetter')}
                </Button>
          }
              <Button variant="outline" className="flex-1 min-h-[44px]">
                <MessageCircle className="w-4 h-4 mr-1" /> {t('profile.message')}
              </Button>
              {canViewerRate && (
                <Button
                  variant="outline"
                  className="flex-1 min-h-[44px] relative border-amber-500/40 text-amber-600 hover:bg-amber-500/10"
                  onClick={() => setShowRateModal(true)}
                >
                  <Star className="w-4 h-4 mr-1" /> {t('bidirectionalFeedback.rateAction')}
                  {hasPendingRating && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-background animate-pulse" />
                  )}
                </Button>
              )}
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
      categories={getAchievementCategories('dentist', t)}
      isOwnProfile={isOwnProfile} />
    
      {isOwnProfile && <NextLevelBenefits userRole="dentist" />}

      <Separator />

      {/* Sobre */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">{t('profile.about')}</h4>
        <p className="text-sm text-muted-foreground">{dentist.bio}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{DENTIST_EXTRA.yearsExperience} {t('profile.experience')}</span>
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
        <h4 className="text-sm font-semibold text-foreground">{t('profile.stats')}</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
        { label: t('profile.totalConsultations'), value: DENTIST_EXTRA.stats.totalConsultations, icon: Stethoscope, trendKey: 'totalConsultations' },
        { label: t('profile.teleconsultations'), value: DENTIST_EXTRA.stats.teleconsultations, icon: Video, trendKey: 'teleconsultations' },
        { label: t('profile.confirmationRate'), value: DENTIST_EXTRA.stats.confirmationRate, icon: TrendingUp, trendKey: 'confirmationRate' },
        { label: t('profile.avgDuration'), value: DENTIST_EXTRA.stats.avgDuration, icon: Clock, trendKey: 'avgDuration' }].
        map((stat) => {
        const trend = DENTIST_TRENDS[stat.trendKey];
        const display = trend ? getTrendDisplay(trend) : null;
        return (
        <div key={stat.label} className="bg-secondary/50 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <stat.icon className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] text-muted-foreground">{stat.label}</span>
              </div>
              <span className="text-lg font-bold">{stat.value}</span>
              {display && (
                <p className={cn('text-[11px] mt-0.5', display.color)}>
                  {display.arrow} {display.text}
                </p>
              )}
            </div>
        );
        })}
        </div>
      </section>

      <Separator />

      {/* Locations */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">{t('profile.locations')}</h4>
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
            <Badge key={a} variant="outline" className="text-[11px]">✓ {a}</Badge>
            )}
              </div>
              <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => setShowBooking(true)}>
                {t('profile.bookHere')}
              </Button>
            </div>
        )}
        </div>
      </section>

      <Separator />

      {/* Tariffs */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">{t('profile.tariffs')}</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('profile.teleconsult')}</span>
            <span className="font-medium">€{dentist.teleconsultaPrice}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('profile.inPersonConsult')}</span>
            <span className="font-medium">{DENTIST_EXTRA.presencialPrice}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-muted-foreground">{t('profile.paymentMethods')}</span>
            <div className="flex flex-wrap gap-1 justify-end">
              {DENTIST_EXTRA.paymentMethods.map((m) =>
            <Badge key={m} variant="outline" className="text-[11px]">{m}</Badge>
            )}
            </div>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-muted-foreground">{t('profile.conventions')}</span>
            <div className="flex flex-wrap gap-1 justify-end">
              {DENTIST_EXTRA.insurances.map((s) =>
            <Badge key={s} variant="outline" className="text-[11px]">{s}</Badge>
            )}
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Reviews */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">{t('profile.reviews')}</h4>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold">{dentist.rating}</p>
            <div className="flex justify-center">
              {Array.from({ length: 5 }).map((_, i) =>
            <Star key={i} className={cn('w-4 h-4', i < Math.floor(dentist.rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground')} />
            )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{dentist.reviewCount} {t('profile.reviews').toLowerCase()}</p>
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
          {canViewerRate && hasPendingRating && (
            <div className="bg-muted/40 border border-dashed border-border rounded-lg p-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                🔒 {t('bidirectionalFeedback.lockedHint')}
              </p>
            </div>
          )}
          {reviews.slice(0, 5).map((r) =>
        <div key={r.id} className="bg-secondary/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[11px] font-bold text-primary">
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
              <p className="text-[11px] text-muted-foreground/60 mt-1">{formatRelativeDate(r.date)}</p>
            </div>
        )}
        </div>
      </section>

      {/* Personal Info - own profile only */}
      {isOwnProfile &&
    <>
          <Separator />
          <section className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">{t('profile.personalInfo')}</h4>
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
    return (
      <>
        <div className="p-5">{profileContent}</div>
        <BidirectionalFeedbackModal
          isOpen={showRateModal}
          onClose={() => setShowRateModal(false)}
          targetName={dentist.name}
          targetRole="dentist"
          contextLabel={dentist.specialties.join(' · ')}
          onSubmit={() => setHasPendingRating(false)}
        />
      </>
    );
  }

  return (
    <FullScreenMobileOverlay className="overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={onClose}><ArrowLeft className="w-5 h-5" /></Button>
        <h2 className="text-base font-semibold">{t('profile.dentistProfile')}</h2>
        <div className="w-10" />
      </div>
      <ScrollArea className="flex-1">
        <div className="p-5">{profileContent}</div>
      </ScrollArea>
      <BidirectionalFeedbackModal
        isOpen={showRateModal}
        onClose={() => setShowRateModal(false)}
        targetName={dentist.name}
        targetRole="dentist"
        contextLabel={dentist.specialties.join(' · ')}
        onSubmit={() => setHasPendingRating(false)}
      />
    </FullScreenMobileOverlay>);

}