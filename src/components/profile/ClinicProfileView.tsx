import { useState } from 'react';
import { ArrowLeft, Star, MapPin, Calendar, MessageCircle, Phone, Building2, Clock, User, Globe, Camera, Video, TrendingUp, Users, Stethoscope, GraduationCap, Languages, Accessibility } from 'lucide-react';
import { LEVEL_GLOW, CLINIC_TRENDS, getTrendDisplay, formatRelativeDate } from '@/lib/profileUtils';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { mockDentists, mockClinics, getDentistsForClinic } from '@/data/mockData';
import { LEVEL_CONFIG, PLAN_CONFIG, getReviewsForDentist, MOCK_DENTIST_RESULTS } from '@/data/mockDentistSearch';
import { ClickableDentistName } from '@/components/search/ClickableDentistName';
import { BadgeShowcase } from '@/components/achievements/BadgeShowcase';
import { getAchievementCategories } from '@/components/achievements/AchievementsView';
import { getDentistInitials, DENTIST_AVATAR_PHOTOS } from '@/lib/avatarUtils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface ClinicProfileViewProps {
  clinicId: string;
  isOpen: boolean;
  onClose: () => void;
  onViewDentistProfile?: (dentistId: string) => void;
  inline?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  isOwnProfile?: boolean;
  onEditProfile?: () => void;
}

const CLINIC_DATA: Record<string, {
  description: string;
  founded: number;
  rating: number;
  reviewCount: number;
  acceptsNewPatients: boolean;
  phone: string;
  email: string;
  nif: string;
  website: string;
  level: string;
  plan: string;
  certification: string;
  languages: { code: string; name: string }[];
  locations: {
    name: string;
    address: string;
    distance: number;
    hours: { day: string; hours: string }[];
    accessibility: string[];
  }[];
  specialties: string[];
  teleconsultaPrice: number;
  presencialPrice: string;
  paymentMethods: string[];
  insurances: string[];
}> = {
  '1': {
    description: 'Clínica dentária de referência com mais de 10 anos de experiência em Lisboa. Especializada em ortodontia, implantologia e estética dentária. Equipamento de última geração.',
    founded: 2016,
    rating: 4.9,
    reviewCount: 312,
    acceptsNewPatients: true,
    phone: '+351 211 000 000',
    email: 'info@smilecheck.pt',
    nif: '509 123 456',
    website: 'www.smilecheck.pt',
    level: 'ouro',
    plan: 'pro',
    certification: 'ISO 9001',
    languages: [
      { code: '🇵🇹', name: 'Português' },
      { code: '🇫🇷', name: 'Français' },
      { code: '🇬🇧', name: 'English' },
    ],
    locations: [
      {
        name: 'Clínica SmileCheck',
        address: 'Av. da Liberdade 123, Lisboa',
        distance: 2.5,
        hours: [
          { day: 'Segunda a Sexta', hours: '09:00 - 19:00' },
          { day: 'Sábado', hours: '09:00 - 13:00' },
          { day: 'Domingo', hours: 'Fechado' },
        ],
        accessibility: ['Cadeira de rodas', 'Elevador', 'WC adaptado', 'Estacionamento gratuito'],
      },
    ],
    specialties: ['Implantologia', 'Ortodontia', 'Endodontia', 'Cirurgia Oral', 'Estética Dentária', 'Odontopediatria'],
    teleconsultaPrice: 20,
    presencialPrice: 'Variável conforme tratamento',
    paymentMethods: ['Cartão', 'MB WAY', 'Multibanco'],
    insurances: ['Médis', 'Multicare', 'AdvanceCare', 'ADSE'],
  },
  '2': {
    description: 'Clínica familiar em Mitry-Mory com foco em atendimento personalizado e preços acessíveis. Ambiente acolhedor e equipa dedicada.',
    founded: 2021,
    rating: 4.6,
    reviewCount: 89,
    acceptsNewPatients: true,
    phone: '+33 1 60 000 000',
    email: 'contact@mitry-dental.fr',
    nif: '—',
    website: 'www.mitry-dental.fr',
    level: 'prata',
    plan: 'free',
    certification: '',
    languages: [
      { code: '🇫🇷', name: 'Français' },
      { code: '🇵🇹', name: 'Português' },
    ],
    locations: [
      {
        name: 'Clínica Mitry-Mory',
        address: 'Rue de Paris 45, Mitry-Mory',
        distance: 4.2,
        hours: [
          { day: 'Quarta', hours: '14:00 - 19:00' },
          { day: 'Sábado', hours: '09:00 - 13:00' },
        ],
        accessibility: ['Cadeira de rodas', 'Estacionamento gratuito'],
      },
    ],
    specialties: ['Cirurgia', 'Prótese', 'Endodontia', 'Restauração'],
    teleconsultaPrice: 20,
    presencialPrice: 'Desde €25',
    paymentMethods: ['Cartão', 'Espèces'],
    insurances: ['Mutuelle générale'],
  },
  '3': {
    description: 'Centro dentário moderno em Montfermeil. Especializado em implantologia e cirurgia avançada. Tecnologia 3D e scanner intraoral de última geração.',
    founded: 2018,
    rating: 4.8,
    reviewCount: 156,
    acceptsNewPatients: true,
    phone: '+33 1 43 000 000',
    email: 'contact@montfermeil-dental.fr',
    nif: '—',
    website: 'www.montfermeil-dental.fr',
    level: 'ouro',
    plan: 'premium',
    certification: 'Acreditação HAS',
    languages: [
      { code: '🇫🇷', name: 'Français' },
      { code: '🇵🇹', name: 'Português' },
      { code: '🇬🇧', name: 'English' },
      { code: '🇪🇸', name: 'Español' },
    ],
    locations: [
      {
        name: 'Clínica Montfermeil',
        address: 'Avenue Jean Moulin 12, Montfermeil',
        distance: 6.0,
        hours: [
          { day: 'Segunda a Sexta', hours: '08:00 - 20:00' },
          { day: 'Sábado', hours: '09:00 - 14:00' },
          { day: 'Domingo', hours: 'Fechado' },
        ],
        accessibility: ['Cadeira de rodas', 'Elevador', 'WC adaptado', 'Estacionamento', 'Transporte público (Bus 601)'],
      },
    ],
    specialties: ['Implantologia', 'Cirurgia Avançada', 'Prótese', 'Ortodontia', 'Estética'],
    teleconsultaPrice: 20,
    presencialPrice: 'Desde €30',
    paymentMethods: ['Cartão', 'CB', 'Chèque'],
    insurances: ['Mutuelle', 'MGEN', 'Harmonie'],
  },
};

const CLINIC_REVIEWS: Record<string, { id: string; patientName: string; rating: number; date: string; comment: string }[]> = {
  '1': [
    { id: 'cr1-1', patientName: 'Ana M.', rating: 5, date: '28 Jan 2026', comment: 'Clínica excelente, muito moderna e limpa. Recomendo a todos!' },
    { id: 'cr1-2', patientName: 'Pedro S.', rating: 5, date: '25 Jan 2026', comment: 'Equipa fantástica, recomendo a todos!' },
    { id: 'cr1-3', patientName: 'Maria L.', rating: 4, date: '20 Jan 2026', comment: 'Bom atendimento, boas instalações. Voltarei certamente.' },
    { id: 'cr1-4', patientName: 'João P.', rating: 5, date: '15 Jan 2026', comment: 'Nunca tive uma experiência tão boa num dentista.' },
    { id: 'cr1-5', patientName: 'Sofia R.', rating: 5, date: '10 Jan 2026', comment: 'Profissionais de excelência. Muito confiável.' },
  ],
  '2': [
    { id: 'cr2-1', patientName: 'Pierre D.', rating: 5, date: '26 Jan 2026', comment: 'Très bon cabinet, personnel accueillant et professionnel.' },
    { id: 'cr2-2', patientName: 'Luísa F.', rating: 4, date: '22 Jan 2026', comment: 'Bom atendimento, preços acessíveis.' },
    { id: 'cr2-3', patientName: 'Marc L.', rating: 5, date: '18 Jan 2026', comment: 'Excellent rapport qualité-prix.' },
    { id: 'cr2-4', patientName: 'Helena A.', rating: 4, date: '12 Jan 2026', comment: 'Ambiente acolhedor, equipa simpática.' },
  ],
  '3': [
    { id: 'cr3-1', patientName: 'Sophie M.', rating: 5, date: '27 Jan 2026', comment: 'Technologie de pointe, scanner 3D impressionnant. Très satisfaite.' },
    { id: 'cr3-2', patientName: 'Carlos N.', rating: 5, date: '24 Jan 2026', comment: 'Centro muito moderno, profissionais de alto nível.' },
    { id: 'cr3-3', patientName: 'Marie C.', rating: 5, date: '20 Jan 2026', comment: 'Mon implant a été posé parfaitement. Merci!' },
    { id: 'cr3-4', patientName: 'Antoine B.', rating: 4, date: '16 Jan 2026', comment: 'Bon centre médical, horaires flexibles.' },
    { id: 'cr3-5', patientName: 'Teresa R.', rating: 5, date: '10 Jan 2026', comment: 'Excelente clínica, recomendo vivamente!' },
  ],
};

const CLINIC_BREAKDOWNS: Record<string, { stars: number; pct: number }[]> = {
  '1': [
    { stars: 5, pct: 78 }, { stars: 4, pct: 15 }, { stars: 3, pct: 4 }, { stars: 2, pct: 2 }, { stars: 1, pct: 1 },
  ],
  '2': [
    { stars: 5, pct: 65 }, { stars: 4, pct: 22 }, { stars: 3, pct: 8 }, { stars: 2, pct: 3 }, { stars: 1, pct: 2 },
  ],
  '3': [
    { stars: 5, pct: 75 }, { stars: 4, pct: 18 }, { stars: 3, pct: 5 }, { stars: 2, pct: 1 }, { stars: 1, pct: 1 },
  ],
};

const DENTIST_SPECIALTIES: Record<string, string[]> = {
  '1': ['Generalista', 'Estética Dentária'],
  '2': ['Ortodontia', 'Multidisciplinar'],
  '3': ['Generalista'],
  '4': ['Cirurgia', 'Prótese'],
  '5': ['Endodontia'],
  '6': ['Cirurgia', 'Prótese', 'Implantologia'],
  '7': ['Ortodontia', 'Odontopediatria'],
};

const DENTIST_RATINGS: Record<string, number> = {
  '1': 4.9, '2': 4.8, '3': 4.7, '4': 4.6, '5': 4.5, '6': 4.8, '7': 4.7,
};

const CLINIC_STATS: Record<string, { totalConsultations: string; activePatients: string; confirmationRate: string; activeDentists: number }> = {
  '1': { totalConsultations: '3 200+', activePatients: '850+', confirmationRate: '92%', activeDentists: 7 },
  '2': { totalConsultations: '1 100+', activePatients: '320+', confirmationRate: '88%', activeDentists: 3 },
  '3': { totalConsultations: '2 400+', activePatients: '620+', confirmationRate: '95%', activeDentists: 3 },
};

export function ClinicProfileView({ clinicId, isOpen, onClose, onViewDentistProfile, inline, isFavorite, onToggleFavorite, isOwnProfile, onEditProfile }: ClinicProfileViewProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const clinic = mockClinics.find(c => c.id === clinicId);
  const data = CLINIC_DATA[clinicId] || CLINIC_DATA['1'];
  const stats = CLINIC_STATS[clinicId] || CLINIC_STATS['1'];
  const reviews = CLINIC_REVIEWS[clinicId] || CLINIC_REVIEWS['1'];
  const breakdown = CLINIC_BREAKDOWNS[clinicId] || CLINIC_BREAKDOWNS['1'];
  const dentists = getDentistsForClinic(clinicId)
    .sort((a, b) => (DENTIST_RATINGS[b.id] || 4.0) - (DENTIST_RATINGS[a.id] || 4.0));
  const levelCfg = LEVEL_CONFIG[data.level] || LEVEL_CONFIG['ouro'];
  const planCfg = PLAN_CONFIG[data.plan] || PLAN_CONFIG['free'];

  if (!isOpen || !clinic) return null;

  const profileContent = (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
        <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="text-3xl font-bold text-primary">
            {clinic.name.split(/[\s-]+/).filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2)}
          </span>
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-xl font-bold">{clinic.name}</h3>
          <p className="text-sm text-muted-foreground">{t('profile.dentalClinic')}</p>
          <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-bold">{data.rating}</span>
            <span className="text-xs text-muted-foreground">({data.reviewCount} {t('profile.reviews').toLowerCase()})</span>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-2 mt-1.5">
            <span className={cn('text-xs font-semibold px-2 py-0.5 rounded border', levelCfg.bg, levelCfg.color)}>
              {t(levelCfg.labelKey)}
            </span>
            <span className={cn('text-xs font-semibold px-2 py-0.5 rounded border', planCfg.bg, planCfg.color)}>
              📋 {planCfg.label}
            </span>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
            {data.acceptsNewPatients && (
              <Badge variant="default" className="text-xs">✓ {t('profile.acceptsNewPatients')}</Badge>
            )}
          </div>
        </div>
        {isOwnProfile ? (
          <div className={cn('flex gap-2', isMobile ? 'w-full flex-col' : 'flex-col')}>
            <Button variant="outline" className="flex-1 min-h-[44px]" onClick={onEditProfile}>{t('profile.editProfile')}</Button>
          </div>
        ) : (
          <div className={cn('flex items-center gap-4', isMobile ? 'w-full' : '')}>
            <div className={cn('flex gap-2', isMobile ? 'flex-1 flex-col' : 'flex-col')}>
              <Button className="flex-1 min-h-[44px]"><Calendar className="w-4 h-4 mr-1" /> {t('profile.bookAppointment')}</Button>
              <Button variant="outline" className="flex-1 min-h-[44px]"><MessageCircle className="w-4 h-4 mr-1" /> {t('profile.message')}</Button>
              <Button variant="outline" className="flex-1 min-h-[44px]" onClick={() => window.open(`tel:${data.phone}`)}>
                <Phone className="w-4 h-4 mr-1" /> {t('profile.call')}
              </Button>
            </div>
            {onToggleFavorite && (
              <button
                onClick={onToggleFavorite}
                className="p-1 transition-transform hover:scale-110 flex-shrink-0"
                title={isFavorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
              >
                <Star className={cn('w-6 h-6 transition-colors', isFavorite ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground hover:text-amber-400')} />
              </button>
            )}
          </div>
        )}
      </div>

      <Separator />

      {/* Badge Showcase */}
      <BadgeShowcase
        userRole="clinic"
        categories={getAchievementCategories('clinic', t)}
        isOwnProfile={isOwnProfile}
      />

      <Separator />

      {/* Sobre */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold">{t('profile.about')}</h4>
        <p className="text-sm text-muted-foreground">{data.description}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{new Date().getFullYear() - data.founded} {t('profile.experience')}</span>
          </div>
          {data.certification && (
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{t('profile.certification')} {data.certification}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-muted-foreground" />
          <div className="flex gap-1.5 flex-wrap">
            {data.languages.map(l => (
              <span key={l.name} className="text-sm">{l.code} {l.name}</span>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* Locais de Atendimento */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold">{t('profile.locations')}</h4>
        <div className={cn('grid gap-3', isMobile ? 'grid-cols-1' : 'grid-cols-2')}>
          {data.locations.map((loc, i) => (
            <div key={i} className="bg-secondary/50 rounded-xl p-4 space-y-3 border border-border">
              <div>
                <p className="text-sm font-semibold">{loc.name}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <MapPin className="w-3 h-3" />
                  <span>{loc.address} · {loc.distance} km</span>
                </div>
              </div>
              <div className="space-y-1">
                {loc.hours.map(h => (
                  <div key={h.day} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{h.day}</span>
                    <span className={h.hours === 'Fechado' ? 'text-destructive' : 'font-medium'}>{h.hours}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {loc.accessibility.map(a => (
                  <Badge key={a} variant="outline" className="text-[10px]">♿ {a}</Badge>
                ))}
              </div>
              <Button size="sm" variant="outline" className="w-full text-xs">
                {t('profile.bookHere')}
              </Button>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Equipa */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold">{t('profile.team')}</h4>
        <div className="space-y-2">
          {dentists.map(d => {
            const dInitials = getDentistInitials(d.name);
            const photo = DENTIST_AVATAR_PHOTOS[d.id];
            const rating = DENTIST_RATINGS[d.id];
            const specs = DENTIST_SPECIALTIES[d.id]?.join(', ') || d.specialty;
            return (
              <div key={d.id} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                <Avatar className="w-10 h-10">
                  {photo && <AvatarImage src={photo} alt={d.name} />}
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{dInitials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <ClickableDentistName name={d.name} className="text-sm font-medium" />
                  <p className="text-xs text-muted-foreground">{specs}</p>
                  {rating && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-medium">{rating}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Separator />

      {/* Serviços */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold">{t('profile.services')}</h4>
        <div className="flex flex-wrap gap-1.5">
          {data.specialties.map(s => (
            <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Video className="w-4 h-4 text-emerald-400" />
          <span>{t('profile.teleconsultationsAvailable')} ✅</span>
        </div>
      </section>

      <Separator />

      {/* Estatísticas */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold">{t('profile.stats')}</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: t('profile.totalConsultations'), value: stats.totalConsultations, icon: Stethoscope },
            { label: t('profile.activePatients'), value: stats.activePatients, icon: Users },
            { label: t('profile.confirmationRate'), value: stats.confirmationRate, icon: TrendingUp },
            { label: t('profile.activeDentists'), value: String(stats.activeDentists), icon: User },
          ].map(stat => (
            <div key={stat.label} className="bg-secondary/50 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <stat.icon className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] text-muted-foreground">{stat.label}</span>
              </div>
              <span className="text-lg font-bold">{stat.value}</span>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Tarifas e Pagamentos */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold">{t('profile.tariffs')}</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('profile.teleconsult')}</span>
            <span className="font-medium">€{data.teleconsultaPrice}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('profile.inPersonConsult')}</span>
            <span className="font-medium">{data.presencialPrice}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-muted-foreground">{t('profile.paymentMethods')}</span>
            <div className="flex flex-wrap gap-1 justify-end">
              {data.paymentMethods.map(m => (
                <Badge key={m} variant="outline" className="text-[10px]">{m}</Badge>
              ))}
            </div>
          </div>
          {data.insurances.length > 0 && (
            <div className="flex justify-between items-start">
              <span className="text-muted-foreground">{t('profile.conventions')}</span>
              <div className="flex flex-wrap gap-1 justify-end">
                {data.insurances.map(s => (
                  <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <Separator />

      {/* Avaliações */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold">{t('profile.reviews')}</h4>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold">{data.rating}</p>
            <div className="flex justify-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={cn('w-4 h-4', i < Math.floor(data.rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground')} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{data.reviewCount} {t('profile.reviews').toLowerCase()}</p>
          </div>
          <div className="flex-1 space-y-1">
            {breakdown.map(b => (
              <div key={b.stars} className="flex items-center gap-2 text-xs">
                <span className="w-3">{b.stars}★</span>
                <Progress value={b.pct} className="h-2 flex-1" />
                <span className="w-8 text-right text-muted-foreground">{b.pct}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {reviews.map(r => (
            <div key={r.id} className="bg-secondary/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                    {r.patientName[0]}
                  </div>
                  <span className="text-xs font-semibold">{r.patientName}</span>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{r.comment}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">{r.date}</p>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Informação */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold">{t('profile.information')}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between py-1.5 border-b border-border/30"><span className="text-muted-foreground">Email</span><span>{data.email}</span></div>
          <div className="flex justify-between py-1.5 border-b border-border/30"><span className="text-muted-foreground">Telefone</span><a href={`tel:${data.phone}`} className="text-primary hover:underline">{data.phone}</a></div>
          <div className="flex justify-between py-1.5 border-b border-border/30"><span className="text-muted-foreground">NIF</span><span>{data.nif}</span></div>
          <div className="flex justify-between py-1.5 border-b border-border/30"><span className="text-muted-foreground">Website</span><span>{data.website}</span></div>
          <div className="flex justify-between py-1.5 border-b border-border/30 md:col-span-2"><span className="text-muted-foreground">Morada</span><span>{clinic.address}</span></div>
        </div>
      </section>
    </div>
  );

  if (inline) {
    return <div className="p-5">{profileContent}</div>;
  }

  return (
    <div className="fixed inset-0 bg-background z-[60] flex flex-col overflow-hidden pb-[60px]">
      <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={onClose}><ArrowLeft className="w-5 h-5" /></Button>
        <h2 className="text-base font-semibold">{isOwnProfile ? t('profile.ownProfile') : t('profile.clinicProfile')}</h2>
        <div className="w-10" />
      </div>
      <ScrollArea className="flex-1">
        <div className="p-5">{profileContent}</div>
      </ScrollArea>
    </div>
  );
}
