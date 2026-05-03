import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LEVEL_GLOW, PATIENT_TRENDS, getTrendDisplay, formatRelativeDate } from '@/lib/profileUtils';
import {
  Building2,
  Calendar,
  Droplets,
  Heart,

  Mail,
  MapPin,
  Phone,
  Pill,
  Shield,
  Star,
  Stethoscope,
  TrendingUp,
  User,
  Users,
  Video,
  MessageCircle,
  FileText,
  Ban,
  Unlock } from
'lucide-react';
import { BadgeShowcase } from '@/components/achievements/BadgeShowcase';
import { getAchievementCategories } from '@/components/achievements/AchievementsView';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ClickableClinicName } from '@/components/search/ClickableClinicName';
import { ClickableDentistName } from '@/components/search/ClickableDentistName';
import { LEVEL_CONFIG, PLAN_CONFIG } from '@/data/mockDentistSearch';
import { getPatientInitials } from '@/lib/avatarUtils';
import { AvatarFrame } from '@/components/level/AvatarFrame';
import { LevelSeal } from '@/components/level/LevelSeal';
import { NextLevelBenefits } from '@/components/level/NextLevelBenefits';
import { USER_POINTS, getLevelForXP } from '@/data/pointsData';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types/calendar';
import { toast } from 'sonner';

const PATIENT_DATA = {
  name: 'João Silva',
  subtitle: 'Paciente',
  email: 'joao.silva@email.com',
  phone: '+351 912 000 001',
  birthDate: '15/03/1981',
  age: 45,
  gender: 'Masculino',
  address: 'Rua das Flores 42, 3º Esq.',
  postalCode: '1200-123',
  city: 'Lisboa',
  country: 'Portugal',
  rating: 4.7,
  reviewCount: 8,
  level: 'ouro' as const,
  plan: 'pro' as const,
  bio: 'Paciente regular com foco em prevenção. Acompanhamento desde 2023.',
  family: [
  { name: 'Maria Silva', age: 42 },
  { name: 'Pedro Silva', age: 12, minor: true }],

  health: {
    bloodType: 'O+',
    allergies: ['Penicilina', 'Látex'],
    conditions: ['Hipertensão'],
    medications: ['Ibuprofeno 400mg', 'Omeprazol 20mg']
  },
  stats: {
    totalConsultations: 23,
    teleconsultations: 4,
    attendanceRate: '96%',
    xp: '450',
    rewardPoints: '320'
  },
  mainDentist: { id: '1', name: 'Dr. Gonçalo Pipo', rating: 4.9, consultations: 12 },
  mainClinic: { id: '1', name: 'Clínica SmileCheck' },
  nextAppointment: '15 Mar 2026, 10:00 — Destartarização — Dr. Gonçalo Pipo',
  lastConsultation: { date: '28 Jan 2026', procedure: 'Destartarização', dentist: 'Dr. Gonçalo Pipo' },
  reviews: [
  { dentistName: 'Dr. Gonçalo Pipo', rating: 5, comment: 'Paciente exemplar, pontual e colaborativo. Higiene oral excelente.', date: '28 Jan 2026' },
  { dentistName: 'Dr. Alexandre Bernardo', rating: 4, comment: 'Boa higiene oral. Pode melhorar na regularidade das visitas.', date: '15 Jan 2026' },
  { dentistName: 'Dr. Gil Santos', rating: 5, comment: 'Sempre pontual e segue as recomendações sem falhar.', date: '20 Dez 2025' },
  { dentistName: 'Dr. Gonçalo Pipo', rating: 5, comment: 'Cooperativo durante o tratamento, dispensa anestesia adicional.', date: '02 Dez 2025' },
  { dentistName: 'Dra. Catarina Fernandes', rating: 4, comment: 'Boa adesão ao plano, apenas faltou uma consulta com aviso prévio.', date: '14 Nov 2025' },
  { dentistName: 'Dr. Alexandre Bernardo', rating: 5, comment: 'Excelente comunicação. Explica os sintomas com clareza.', date: '28 Out 2025' },
  { dentistName: 'Dr. Gonçalo Pipo', rating: 5, comment: 'Paciente regular, comparece sempre confirmado.', date: '10 Set 2025' },
  { dentistName: 'Dr. Gil Santos', rating: 4, comment: 'Tudo bem, podia chegar 5 minutos mais cedo para o check-in.', date: '21 Jul 2025' }]

};

const breakdown = [
{ stars: 5, pct: 62 },
{ stars: 4, pct: 25 },
{ stars: 3, pct: 13 },
{ stars: 2, pct: 0 },
{ stars: 1, pct: 0 }];


function SectionCard({
  title,
  children,
  className




}: {title?: React.ReactNode;children: React.ReactNode;className?: string;}) {
  return (
    <section className={cn('bg-card/40 border border-border rounded-xl p-5 md:p-6', className)}>
      {title ? <h4 className="text-sm font-semibold text-foreground mb-4">{title}</h4> : null}
      {children}
    </section>);

}

export function PatientProfileBody({
  userRole,
  isMobile,
  onEditProfile,
  viewerRole,
  onNavigate






}: {userRole: UserRole;isMobile: boolean;onEditProfile: () => void;viewerRole?: UserRole;onNavigate?: (tab: string) => void;}) {
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const { t } = useTranslation();

  const data = PATIENT_DATA;
  const derivedLevelKey = getLevelForXP(USER_POINTS.patient.xp).key;
  const effectiveLevel = derivedLevelKey;
  const levelCfg = LEVEL_CONFIG[effectiveLevel] || LEVEL_CONFIG[data.level];
  const planCfg = PLAN_CONFIG[data.plan];
  const initials = getPatientInitials(data.name);

  // Determine effective viewer: if viewerRole is provided use it, otherwise it's the patient viewing own profile
  const viewer = viewerRole || userRole;
  const isOwnProfile = viewer === 'patient';
  const isDentistViewing = viewer === 'dentist';
  const isClinicViewing = viewer === 'clinic';

  const handleBlock = () => {
    setIsBlocked(true);
    setShowBlockModal(false);
    setBlockReason('');
    toast.success(t('profile.blockedSuccess'));
  };

  const handleUnblock = () => {
    setIsBlocked(false);
    toast.success(t('profile.unblockedSuccess'));
  };

  // Render action buttons based on viewer
  const renderActionButtons = () => {
    if (isOwnProfile) {
      return (
        <div className={cn('flex gap-2', isMobile ? 'w-full flex-col mt-3' : 'flex-col')}>
          <Button variant="outline" className="flex-1 min-h-[44px]" onClick={onEditProfile}>
            {t('profile.editProfile')}
          </Button>
        </div>);

    }

    if (isDentistViewing) {
      return (
        <div className="mt-4 space-y-2">
          <div className={cn('grid gap-2', isMobile ? 'grid-cols-1' : 'grid-cols-2')}>
            <Button variant="secondary" className="gap-2 text-xs justify-start" onClick={() => toast.info('Teleconsulta em breve...')}>
              <Video className="w-4 h-4" /> {t('profile.startTeleconsult')}
            </Button>
            <Button variant="secondary" className="gap-2 text-xs justify-start" onClick={() => onNavigate?.('conversas')}>
              <MessageCircle className="w-4 h-4" /> {t('profile.sendMessage')}
            </Button>
            <Button variant="secondary" className="gap-2 text-xs justify-start" onClick={() => onNavigate?.('prescrever')}>
              <Pill className="w-4 h-4" /> {t('profile.prescribe')}
            </Button>
            <Button variant="secondary" className="gap-2 text-xs justify-start" onClick={() => onNavigate?.('referencia')}>
              <FileText className="w-4 h-4" /> {t('profile.recommendPatient')}
            </Button>
          </div>
          {isBlocked ?
            <Button variant="outline" className="w-full gap-2 text-xs text-emerald-400 border-emerald-500/30" onClick={handleUnblock}>
              <Unlock className="w-4 h-4" /> {t('profile.unblockPatient')}
            </Button> :

          <Button variant="outline" className="w-full gap-2 text-xs text-destructive border-destructive/30" onClick={() => setShowBlockModal(true)}>
              <Ban className="w-4 h-4" /> {t('profile.blockPatient')}
            </Button>
          }
        </div>);

    }

    if (isClinicViewing) {
      return (
        <div className={cn('mt-4', isMobile ? 'space-y-2' : 'flex gap-2')}>
          <Button variant="secondary" className="gap-2 text-xs flex-1" onClick={() => onNavigate?.('conversas')}>
            <MessageCircle className="w-4 h-4" /> {t('profile.sendMessage')}
          </Button>
          {isBlocked ?
          <Button variant="outline" className="gap-2 text-xs flex-1 text-emerald-400 border-emerald-500/30" onClick={handleUnblock}>
              <Unlock className="w-4 h-4" /> {t('profile.unblockPatient')}
            </Button> :

          <Button variant="outline" className="gap-2 text-xs flex-1 text-destructive border-destructive/30" onClick={() => setShowBlockModal(true)}>
              <Ban className="w-4 h-4" /> {t('profile.blockPatient')}
            </Button>
          }
        </div>);

    }

    return null;
  };

  return (
    <>
      <div className="mx-auto w-full max-w-3xl px-6 md:px-10 py-6 space-y-6">
        {/* Header */}
        <SectionCard className="p-5 md:p-6 relative">
          {/* Edit button top-right (own profile only) */}
          {isOwnProfile && (
            <Button
              variant="outline"
              size="sm"
              className="absolute top-4 right-4 md:top-5 md:right-5 text-xs h-8 px-3"
              onClick={onEditProfile}
            >
              {t('profile.editProfile')}
            </Button>
          )}

          <div className="flex flex-col md:flex-row items-center md:items-start gap-5">
            <AvatarFrame levelKey={effectiveLevel} className="w-24 h-24">
              <div className="w-full h-full rounded-full bg-secondary flex items-center justify-center text-3xl font-bold text-primary">
                {initials}
              </div>
            </AvatarFrame>

            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold text-foreground">{data.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{data.subtitle}</p>

              <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-bold">{data.rating}</span>
                  <span className="text-xs text-muted-foreground">({data.reviewCount} {t('profile.reviews').toLowerCase()})</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
                <span className={cn('text-xs font-semibold px-2 py-0.5 rounded border', levelCfg.bg, levelCfg.color, LEVEL_GLOW[effectiveLevel] || '')}>
                  {t(levelCfg.labelKey)}
                </span>
                <LevelSeal role="patient" levelKey={effectiveLevel} />
                <span className={cn('text-xs font-semibold px-2 py-0.5 rounded border', planCfg.bg, planCfg.color)}>
                  📋 {planCfg.label}
                </span>
              </div>
            </div>
          </div>
          {/* Action buttons for non-own profile */}
          {!isOwnProfile && renderActionButtons()}
        </SectionCard>

        {/* Conquistas */}
        <BadgeShowcase
          userRole={userRole}
          categories={getAchievementCategories(userRole, t)}
          isOwnProfile={isOwnProfile}
          className="p-5 md:p-6" />
        
        {isOwnProfile && <NextLevelBenefits userRole="patient" />}

        {/* Sobre */}
        <SectionCard title={t('profile.about')}>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{data.bio}</p>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{t('profile.families')}:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.family.map((f) =>
                <Badge key={f.name} variant="secondary" className="text-xs py-1">
                    {f.name} ({f.age} {t('profile.years')}{f.minor ? ` — ${t('profile.minor')}` : ''})
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Resumo de Saúde */}
        <SectionCard title={t('profile.healthSummary')}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-destructive" />
                <span className="text-muted-foreground">{t('profile.bloodType')}:</span>
                <span className="font-medium text-foreground">{data.health.bloodType}</span>
              </div>

              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-destructive mt-0.5" />
                <div className="flex-1">
                  <div className="text-muted-foreground">{t('profile.allergies')}:</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {data.health.allergies.map((a) =>
                    <Badge key={a} variant="destructive" className="text-[10px]">
                        {a}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <Heart className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="text-muted-foreground">{t('profile.conditions')}:</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {data.health.conditions.map((c) =>
                    <Badge key={c} variant="secondary" className="text-[10px]">
                        {c}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Pill className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="text-muted-foreground">{t('profile.medication')}:</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {data.health.medications.map((m) =>
                    <Badge key={m} variant="outline" className="text-[10px]">
                        {m}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-4 text-[10px] text-muted-foreground bg-secondary/40 border border-border rounded-lg p-3">
            ℹ️ {t('profile.healthInfoNote')}
          </p>
        </SectionCard>

        {/* Estatísticas */}
        <SectionCard title={t('profile.stats')}>
          <div className="grid grid-cols-3 gap-3">
            {[
            { label: t('profile.totalConsultations'), value: data.stats.totalConsultations, icon: Stethoscope, trendKey: 'totalConsultations' },
            { label: t('profile.teleconsultations'), value: data.stats.teleconsultations, icon: Video, trendKey: 'teleconsultations' },
            { label: t('profile.attendance'), value: data.stats.attendanceRate, icon: TrendingUp, trendKey: 'attendance' }].
            map((stat) => {
            const trend = PATIENT_TRENDS[stat.trendKey];
            const display = trend ? getTrendDisplay(trend) : null;
            return (
            <div
              key={stat.label}
              className="bg-secondary/40 border border-border/60 rounded-lg p-3 md:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className="w-4 h-4 text-primary" />
                  <span className="text-[11px] text-muted-foreground">{stat.label}</span>
                </div>
                <span className="text-lg font-bold text-foreground">{stat.value}</span>
                {display && (
                  <p className={cn('text-[11px] mt-0.5', display.color)}>
                    {display.arrow} {display.text}
                  </p>
                )}
              </div>
            );
            })}
          </div>
        </SectionCard>

        {/* Última Consulta */}
        <div className="bg-secondary/30 border border-border/40 rounded-lg px-4 py-3 flex items-start gap-3">
          <Calendar className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            {t('profile.lastConsultation')}:{' '}
            <span className="text-foreground font-medium">
              {data.lastConsultation.date} — {data.lastConsultation.procedure} — {data.lastConsultation.dentist}
            </span>
          </p>
        </div>

        {/* Os Meus Profissionais */}
        <SectionCard title={t('profile.myProfessionals')}>
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-secondary/40 border border-border/60 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Stethoscope className="w-4 h-4 text-primary" />
                <div>
                  <ClickableDentistName name={data.mainDentist.name} className="text-sm font-medium" />
                  <div className="flex items-center gap-1.5 mt-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs text-foreground">{data.mainDentist.rating}</span>
                    <span className="text-[10px] text-muted-foreground">· {data.mainDentist.consultations} {t('profile.consultations')}</span>
                  </div>
                </div>
              </div>
              <Badge variant="secondary" className="text-[10px]">{t('profile.main')}</Badge>
            </div>

            <div className="flex items-center justify-between bg-secondary/40 border border-border/60 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-primary" />
                <ClickableClinicName clinicId={data.mainClinic.id} name={data.mainClinic.name} className="text-sm font-medium" />
              </div>
              <Badge variant="secondary" className="text-[10px]">{t('profile.main')}</Badge>
            </div>

            <div className="flex items-start gap-3 bg-secondary/30 border border-border/60 rounded-lg p-4">
              <Calendar className="w-4 h-4 text-primary mt-0.5" />
              <span className="text-xs text-muted-foreground">
                {t('profile.nextAppointment')}:{' '}
                <span className="font-medium text-foreground">{data.nextAppointment}</span>
              </span>
            </div>
          </div>
        </SectionCard>

        {/* Avaliações */}
        <SectionCard title={t('profile.reviews')}>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="text-center md:text-left">
              <p className="text-4xl font-bold text-foreground">{data.rating}</p>
              <div className="flex justify-center md:justify-start mt-2">
                {Array.from({ length: 5 }).map((_, i) =>
                <Star
                  key={i}
                  className={cn(
                    'w-4 h-4',
                    i < Math.floor(data.rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'
                  )} />

                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">{data.reviewCount} {t('profile.reviews').toLowerCase()}</p>
            </div>

            <div className="flex-1 space-y-2">
              {breakdown.map((b) =>
              <div key={b.stars} className="flex items-center gap-3 text-xs">
                  <span className="w-10 text-muted-foreground">{b.stars}★</span>
                  <Progress value={b.pct} className="h-2 flex-1" />
                  <span className="w-10 text-right text-muted-foreground">{b.pct}%</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 mt-6">
            {data.reviews.map((r, idx) =>
            <div key={idx} className="bg-secondary/40 border border-border/60 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <ClickableDentistName name={r.dentistName} className="text-xs font-semibold" />
                  <div className="flex gap-0.5">
                    {Array.from({ length: r.rating }).map((_, i) =>
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{r.comment}</p>
                <p className="text-[10px] text-muted-foreground/70 mt-2">{formatRelativeDate(r.date)}</p>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Informação Pessoal */}
        <SectionCard title={t('profile.personalInfo')}>
          <div className="space-y-3 text-sm">
            {[
            { icon: Mail, label: 'Email', value: data.email },
            { icon: Phone, label: 'Telefone', value: data.phone },
            { icon: Calendar, label: 'Nascimento', value: `${data.birthDate} (${data.age} anos)` },
            { icon: User, label: 'Género', value: data.gender },
            {
              icon: MapPin,
              label: 'Morada',
              value: `${data.address}, ${data.postalCode} ${data.city}`
            }].
            map((item) =>
            <div key={item.label} className="flex items-start justify-between gap-4 py-3 border-b border-border/40 last:border-0">
                <div className="flex items-center gap-2 min-w-0">
                  <item.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">{item.label}</span>
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-right text-foreground break-words">{item.value}</span>
                  
                </div>
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      {/* Block Patient Modal */}
      <Dialog open={showBlockModal} onOpenChange={setShowBlockModal}>
        <DialogContent className="sm:max-w-md z-[70]">
          <DialogHeader>
            <DialogTitle>⚠️ {t('profile.blockTitle', { name: data.name })}</DialogTitle>
            <DialogDescription>
              {t('profile.blockDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">{t('profile.blockReasonLabel')}</label>
              <Textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder={t('profile.blockReasonPlaceholder')}
                className="mt-1 min-h-[80px] bg-secondary/50 border-border text-sm" />
              
            </div>
            <p className="text-xs text-muted-foreground">{t('profile.blockNotify')}</p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowBlockModal(false)}>{t('common.cancel')}</Button>
              <Button variant="destructive" className="flex-1" disabled={!blockReason.trim()} onClick={handleBlock}>{t('profile.blockPatient').split(' ')[0]}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>);

}