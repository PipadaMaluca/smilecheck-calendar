import { useState } from 'react';
import { ArrowLeft, User, Mail, Phone, Calendar, Star, Building2, MapPin, Heart, Shield, Pill, Droplets, Stethoscope, Video, TrendingUp, Award, Lock, Users } from 'lucide-react';
import { USER_POINTS, getLevelForXP } from '@/data/pointsData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { UserRole } from '@/types/calendar';
import { mockDentists, mockClinics, mockFamilyMembers } from '@/data/mockData';
import { useIsMobile } from '@/hooks/use-mobile';
import { EditProfileView } from './EditProfileView';
import { ClickableClinicName } from '@/components/search/ClickableClinicName';
import { ClickableDentistName } from '@/components/search/ClickableDentistName';
import { DentistSearchResult } from '@/data/mockDentistSearch';
import { BadgeShowcase } from '@/components/achievements/BadgeShowcase';
import { getAchievementCategories } from '@/components/achievements/AchievementsView';
import { LEVEL_CONFIG, PLAN_CONFIG } from '@/data/mockDentistSearch';
import { getPatientInitials } from '@/lib/avatarUtils';
import { cn } from '@/lib/utils';

interface ProfileViewProps {
  userRole: UserRole;
  isOpen: boolean;
  onClose: () => void;
  inline?: boolean;
  onViewClinicProfile?: (clinicId: string) => void;
  onViewDentistProfile?: (dentist: DentistSearchResult) => void;
}

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
    { name: 'Pedro Silva', age: 12, minor: true },
  ],
  health: {
    bloodType: 'O+',
    allergies: ['Penicilina', 'Látex'],
    conditions: ['Hipertensão'],
    medications: ['Ibuprofeno 400mg', 'Omeprazol 20mg'],
  },
  stats: {
    totalConsultations: 23,
    teleconsultations: 4,
    attendanceRate: '96%',
    xp: '450',
    rewardPoints: '320',
  },
  mainDentist: { id: '1', name: 'Dr. Gonçalo Pipo', rating: 4.9, consultations: 12 },
  mainClinic: { id: '1', name: 'Clínica SmileCheck' },
  nextAppointment: '15 Mar 2026, 10:00 — Destartarização — Dr. Gonçalo Pipo',
  reviews: [
    { dentistName: 'Dr. Gonçalo Pipo', rating: 5, comment: 'Paciente exemplar, pontual e colaborativo.', date: '28 Jan 2026' },
    { dentistName: 'Dr. Alexandre Bernardo', rating: 4, comment: 'Boa higiene oral. Pode melhorar na regularidade.', date: '15 Jan 2026' },
  ],
};

const breakdown = [
  { stars: 5, pct: 62 },
  { stars: 4, pct: 25 },
  { stars: 3, pct: 13 },
  { stars: 2, pct: 0 },
  { stars: 1, pct: 0 },
];

export function ProfileView({ userRole, isOpen, onClose, inline, onViewClinicProfile, onViewDentistProfile }: ProfileViewProps) {
  const [showEdit, setShowEdit] = useState(false);
  const isMobile = useIsMobile();

  if (!isOpen) return null;

  if (showEdit) {
    return (
      <EditProfileView
        userRole={userRole}
        isOpen={true}
        onClose={() => setShowEdit(false)}
        onSave={() => setShowEdit(false)}
        inline={inline}
      />
    );
  }

  // Only patient profile is rendered here now; dentist/clinic use their own views
  if (userRole !== 'patient') return null;

  const data = PATIENT_DATA;
  const levelCfg = LEVEL_CONFIG[data.level];
  const planCfg = PLAN_CONFIG[data.plan];
  const initials = getPatientInitials(data.name);

  const profileBody = (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
        <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center text-3xl font-bold text-primary flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-xl font-bold text-foreground">{data.name}</h3>
          <p className="text-sm text-muted-foreground">{data.subtitle}</p>
          <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-bold">{data.rating}</span>
              <span className="text-xs text-muted-foreground">({data.reviewCount} avaliações)</span>
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
        </div>
        <div className={cn('flex gap-2', isMobile ? 'w-full' : 'flex-col')}>
          <Button variant="outline" className="flex-1" onClick={() => setShowEdit(true)}>
            Editar Perfil
          </Button>
        </div>
      </div>

      <Separator />

      {/* Badge Showcase */}
      <BadgeShowcase
        userRole={userRole}
        categories={getAchievementCategories(userRole)}
        isOwnProfile
      />

      <Separator />

      {/* Sobre */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">Sobre</h4>
        <p className="text-sm text-muted-foreground">{data.bio}</p>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Familiares:</span>
          <div className="flex flex-wrap gap-1.5">
            {data.family.map(f => (
              <Badge key={f.name} variant="secondary" className="text-xs">
                {f.name} ({f.age} anos{f.minor ? ' — Menor' : ''})
              </Badge>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* Resumo de Saúde */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">Resumo de Saúde</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-red-400" />
            <span className="text-muted-foreground">Grupo sanguíneo:</span>
            <span className="font-medium">{data.health.bloodType}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Shield className="w-4 h-4 text-red-400" />
            <span className="text-muted-foreground">Alergias:</span>
            {data.health.allergies.map(a => (
              <Badge key={a} variant="destructive" className="text-[10px]">{a}</Badge>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Heart className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Condições:</span>
            {data.health.conditions.map(c => (
              <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Pill className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Medicação:</span>
            {data.health.medications.map(m => (
              <Badge key={m} variant="outline" className="text-[10px]">{m}</Badge>
            ))}
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
          ℹ️ Informação visível apenas para si e os seus dentistas
        </p>
      </section>

      <Separator />

      {/* Estatísticas */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">Estatísticas</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Total consultas', value: data.stats.totalConsultations, icon: Stethoscope },
            { label: 'Teleconsultas', value: data.stats.teleconsultations, icon: Video },
            { label: 'Comparecimento', value: data.stats.attendanceRate, icon: TrendingUp },
            { label: 'XP', value: `${data.stats.xp} XP`, icon: Award },
            { label: 'Pontos', value: `⭐ ${data.stats.rewardPoints} pts`, icon: Star },
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

      {/* Os Meus Profissionais */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">Os Meus Profissionais</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between bg-secondary/50 rounded-lg p-3">
            <div className="flex items-center gap-3">
              <Stethoscope className="w-4 h-4 text-primary" />
              <div>
                <ClickableDentistName name={data.mainDentist.name} className="text-sm font-medium" />
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs">{data.mainDentist.rating}</span>
                  <span className="text-[10px] text-muted-foreground">· {data.mainDentist.consultations} consultas</span>
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="text-[10px]">Principal</Badge>
          </div>
          <div className="flex items-center justify-between bg-secondary/50 rounded-lg p-3">
            <div className="flex items-center gap-3">
              <Building2 className="w-4 h-4 text-primary" />
              <ClickableClinicName clinicId={data.mainClinic.id} name={data.mainClinic.name} className="text-sm font-medium" />
            </div>
            <Badge variant="secondary" className="text-[10px]">Principal</Badge>
          </div>
          <div className="flex items-center gap-3 bg-secondary/30 rounded-lg p-3">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-muted-foreground">Próxima consulta: <span className="font-medium text-foreground">{data.nextAppointment}</span></span>
          </div>
        </div>
      </section>

      <Separator />

      {/* Avaliações */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">Avaliações</h4>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold">{data.rating}</p>
            <div className="flex justify-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={cn('w-4 h-4', i < Math.floor(data.rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground')} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{data.reviewCount} avaliações</p>
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
        <div className="space-y-2 mt-3">
          {data.reviews.map((r, idx) => (
            <div key={idx} className="bg-secondary/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <ClickableDentistName name={r.dentistName} className="text-xs font-semibold" />
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

      {/* Informação Pessoal */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">Informação Pessoal</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          {[
            { icon: Mail, label: 'Email', value: data.email },
            { icon: Phone, label: 'Telefone', value: data.phone },
            { icon: Calendar, label: 'Nascimento', value: `${data.birthDate} (${data.age} anos)` },
            { icon: User, label: 'Género', value: data.gender },
            { icon: MapPin, label: 'Morada', value: `${data.address}, ${data.postalCode} ${data.city}` },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
              <div className="flex items-center gap-2">
                <item.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-right">{item.value}</span>
                <Lock className="w-3 h-3 text-muted-foreground/50" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  if (inline) {
    return <div className="p-5">{profileBody}</div>;
  }

  return (
    <div className="fixed inset-0 bg-background z-[60] flex flex-col pb-[60px]">
      <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={onClose}><ArrowLeft className="w-5 h-5" /></Button>
        <h2 className="text-base font-semibold">Meu Perfil</h2>
        <div className="w-10" />
      </div>
      <ScrollArea className="flex-1">{profileBody}</ScrollArea>
    </div>
  );
}
