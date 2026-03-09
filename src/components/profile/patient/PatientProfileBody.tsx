import {
  Building2,
  Calendar,
  Droplets,
  Heart,
  Lock,
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
} from 'lucide-react';
import { BadgeShowcase } from '@/components/achievements/BadgeShowcase';
import { getAchievementCategories } from '@/components/achievements/AchievementsView';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ClickableClinicName } from '@/components/search/ClickableClinicName';
import { ClickableDentistName } from '@/components/search/ClickableDentistName';
import { LEVEL_CONFIG, PLAN_CONFIG } from '@/data/mockDentistSearch';
import { getPatientInitials } from '@/lib/avatarUtils';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types/calendar';

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

function SectionCard({
  title,
  children,
  className,
}: {
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('bg-card/40 border border-border rounded-xl p-5 md:p-6', className)}>
      {title ? <h4 className="text-sm font-semibold text-foreground mb-4">{title}</h4> : null}
      {children}
    </section>
  );
}

export function PatientProfileBody({
  userRole,
  isMobile,
  onEditProfile,
}: {
  userRole: UserRole;
  isMobile: boolean;
  onEditProfile: () => void;
}) {
  const data = PATIENT_DATA;
  const levelCfg = LEVEL_CONFIG[data.level];
  const planCfg = PLAN_CONFIG[data.plan];
  const initials = getPatientInitials(data.name);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 md:px-10 py-6 space-y-6">
      {/* Header */}
      <SectionCard className="p-5 md:p-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-5">
          <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center text-3xl font-bold text-primary flex-shrink-0">
            {initials}
          </div>

          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-bold text-foreground">{data.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{data.subtitle}</p>

            <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-bold">{data.rating}</span>
                <span className="text-xs text-muted-foreground">({data.reviewCount} avaliações)</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
              <span className={cn('text-xs font-semibold px-2 py-0.5 rounded border', levelCfg.bg, levelCfg.color)}>
                {levelCfg.label}
              </span>
              <span className={cn('text-xs font-semibold px-2 py-0.5 rounded border', planCfg.bg, planCfg.color)}>
                📋 {planCfg.label}
              </span>
            </div>
          </div>

          <div className={cn('flex gap-2', isMobile ? 'w-full flex-col mt-3' : 'flex-col')}
          >
            <Button variant="outline" className="flex-1 min-h-[44px]" onClick={onEditProfile}>
              Editar Perfil
            </Button>
          </div>
        </div>
      </SectionCard>

      {/* Conquistas */}
      <BadgeShowcase
        userRole={userRole}
        categories={getAchievementCategories(userRole)}
        isOwnProfile
        className="p-5 md:p-6"
      />

      {/* Sobre */}
      <SectionCard title="Sobre">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{data.bio}</p>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Familiares:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.family.map((f) => (
                <Badge key={f.name} variant="secondary" className="text-xs py-1">
                  {f.name} ({f.age} anos{f.minor ? ' — Menor' : ''})
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Resumo de Saúde */}
      <SectionCard title="Resumo de Saúde">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-destructive" />
              <span className="text-muted-foreground">Grupo sanguíneo:</span>
              <span className="font-medium text-foreground">{data.health.bloodType}</span>
            </div>

            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-destructive mt-0.5" />
              <div className="flex-1">
                <div className="text-muted-foreground">Alergias:</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {data.health.allergies.map((a) => (
                    <Badge key={a} variant="destructive" className="text-[10px]">
                      {a}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <Heart className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <div className="text-muted-foreground">Condições:</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {data.health.conditions.map((c) => (
                    <Badge key={c} variant="secondary" className="text-[10px]">
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Pill className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <div className="text-muted-foreground">Medicação:</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {data.health.medications.map((m) => (
                    <Badge key={m} variant="outline" className="text-[10px]">
                      {m}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-[10px] text-muted-foreground bg-secondary/40 border border-border rounded-lg p-3">
          ℹ️ Informação visível apenas para si e os seus dentistas
        </p>
      </SectionCard>

      {/* Estatísticas */}
      <SectionCard title="Estatísticas">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: 'Total consultas', value: data.stats.totalConsultations, icon: Stethoscope },
            { label: 'Teleconsultas', value: data.stats.teleconsultations, icon: Video },
            { label: 'Comparecimento', value: data.stats.attendanceRate, icon: TrendingUp },
            { label: 'XP', value: `${data.stats.xp} XP`, icon: Star },
            { label: 'Pontos', value: `⭐ ${data.stats.rewardPoints} pts`, icon: Star },
          ].map((stat, idx) => (
            <div
              key={stat.label}
              className={cn(
                'bg-secondary/40 border border-border/60 rounded-lg p-3 md:p-4',
                idx === 4 && 'col-span-2 md:col-span-1'
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className="w-4 h-4 text-primary" />
                <span className="text-[11px] text-muted-foreground">{stat.label}</span>
              </div>
              <span className="text-lg font-bold text-foreground">{stat.value}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Os Meus Profissionais */}
      <SectionCard title="Os Meus Profissionais">
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-secondary/40 border border-border/60 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Stethoscope className="w-4 h-4 text-primary" />
              <div>
                <ClickableDentistName name={data.mainDentist.name} className="text-sm font-medium" />
                <div className="flex items-center gap-1.5 mt-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs text-foreground">{data.mainDentist.rating}</span>
                  <span className="text-[10px] text-muted-foreground">· {data.mainDentist.consultations} consultas</span>
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="text-[10px]">Principal</Badge>
          </div>

          <div className="flex items-center justify-between bg-secondary/40 border border-border/60 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Building2 className="w-4 h-4 text-primary" />
              <ClickableClinicName clinicId={data.mainClinic.id} name={data.mainClinic.name} className="text-sm font-medium" />
            </div>
            <Badge variant="secondary" className="text-[10px]">Principal</Badge>
          </div>

          <div className="flex items-start gap-3 bg-secondary/30 border border-border/60 rounded-lg p-4">
            <Calendar className="w-4 h-4 text-primary mt-0.5" />
            <span className="text-xs text-muted-foreground">
              Próxima consulta:{' '}
              <span className="font-medium text-foreground">{data.nextAppointment}</span>
            </span>
          </div>
        </div>
      </SectionCard>

      {/* Avaliações */}
      <SectionCard title="Avaliações">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="text-center md:text-left">
            <p className="text-4xl font-bold text-foreground">{data.rating}</p>
            <div className="flex justify-center md:justify-start mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'w-4 h-4',
                    i < Math.floor(data.rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'
                  )}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">{data.reviewCount} avaliações</p>
          </div>

          <div className="flex-1 space-y-2">
            {breakdown.map((b) => (
              <div key={b.stars} className="flex items-center gap-3 text-xs">
                <span className="w-10 text-muted-foreground">{b.stars}★</span>
                <Progress value={b.pct} className="h-2 flex-1" />
                <span className="w-10 text-right text-muted-foreground">{b.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 mt-6">
          {data.reviews.map((r, idx) => (
            <div key={idx} className="bg-secondary/40 border border-border/60 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <ClickableDentistName name={r.dentistName} className="text-xs font-semibold" />
                <div className="flex gap-0.5">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{r.comment}</p>
              <p className="text-[10px] text-muted-foreground/70 mt-2">{r.date}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Informação Pessoal */}
      <SectionCard title="Informação Pessoal">
        <div className="space-y-3 text-sm">
          {[
            { icon: Mail, label: 'Email', value: data.email },
            { icon: Users, label: 'Telefone', value: data.phone },
            { icon: Calendar, label: 'Nascimento', value: `${data.birthDate} (${data.age} anos)` },
            { icon: Users, label: 'Género', value: data.gender },
            {
              icon: Calendar,
              label: 'Morada',
              value: `${data.address}, ${data.postalCode} ${data.city}`,
            },
          ].map((item) => (
            <div key={item.label} className="flex items-start justify-between gap-4 py-3 border-b border-border/40 last:border-0">
              <div className="flex items-center gap-2 min-w-0">
                <item.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">{item.label}</span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-right text-foreground break-words">{item.value}</span>
                <Lock className="w-3 h-3 text-muted-foreground/60 flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
