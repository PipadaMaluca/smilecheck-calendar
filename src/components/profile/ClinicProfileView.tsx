import { useState } from 'react';
import { ArrowLeft, Star, MapPin, Calendar, MessageCircle, Phone, Building2, Clock, User, Globe, Accessibility, Camera, Video, TrendingUp, Users, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { mockDentists, mockClinics, getDentistsForClinic } from '@/data/mockData';
import { LEVEL_CONFIG, getReviewsForDentist, MOCK_DENTIST_RESULTS } from '@/data/mockDentistSearch';
import { ClickableDentistName } from '@/components/search/ClickableDentistName';
import { BadgeShowcase } from '@/components/achievements/BadgeShowcase';
import { getAchievementCategories } from '@/components/achievements/AchievementsView';

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

const CLINIC_EXTRA: Record<string, {
  description: string;
  founded: number;
  rating: number;
  reviewCount: number;
  acceptsNewPatients: boolean;
  phone: string;
  email: string;
  website: string;
  xrayServices: string[];
  specialties: string[];
  hours: { day: string; hours: string }[];
  accessibility: string[];
  photos: string[];
}> = {
  '1': {
    description: 'Clínica dentária de referência com mais de 10 anos de experiência. Especializada em ortodontia, implantologia e estética dentária. Equipamento de última geração e equipa altamente qualificada.',
    founded: 2015,
    rating: 4.8,
    reviewCount: 125,
    acceptsNewPatients: true,
    phone: '+351 211 000 000',
    email: 'info@smilecheck.pt',
    website: 'www.smilecheck.pt',
    xrayServices: ['Raio-X Panorâmico', 'Raio-X Periapical', 'Raio-X Cefalométrico', 'TAC Dentário'],
    specialties: ['Generalista', 'Ortodontia', 'Endodontia', 'Cirurgia Oral', 'Implantologia', 'Odontopediatria'],
    hours: [
      { day: 'Segunda a Sexta', hours: '08:00 - 20:00' },
      { day: 'Sábado', hours: '09:00 - 14:00' },
      { day: 'Domingo', hours: 'Fechado' },
    ],
    accessibility: ['Acesso para cadeiras de rodas', 'Elevador', 'WC adaptado', 'Estacionamento reservado', 'Estacionamento gratuito', 'Próximo de transportes públicos'],
    photos: [],
  },
  '2': {
    description: 'Clínica dentária de referência na região de Mitry-Mory, com foco em cirurgia e prótese dentária.',
    founded: 2018, rating: 4.7, reviewCount: 185, acceptsNewPatients: true,
    phone: '+33 1 60 000 000', email: 'contact@mitry-dental.fr', website: 'www.mitry-dental.fr',
    xrayServices: ['Raio-X Panorâmico', 'Raio-X Periapical'],
    specialties: ['Cirurgia Oral', 'Prótese', 'Endodontia'],
    hours: [{ day: 'Segunda a Sexta', hours: '09:00 - 19:00' }, { day: 'Sábado', hours: '09:00 - 12:00' }],
    accessibility: ['Acesso para cadeiras de rodas', 'Estacionamento gratuito', 'Próximo de transportes públicos'],
    photos: [],
  },
  '3': {
    description: 'Centro dentário especializado em ortodontia e cirurgia oral em Montfermeil.',
    founded: 2020, rating: 4.6, reviewCount: 143, acceptsNewPatients: true,
    phone: '+33 1 43 000 000', email: 'contact@montfermeil-dental.fr', website: 'www.montfermeil-dental.fr',
    xrayServices: ['Raio-X Panorâmico', 'TAC Dentário'],
    specialties: ['Ortodontia', 'Cirurgia Oral', 'Prótese', 'Implantologia'],
    hours: [{ day: 'Segunda a Sexta', hours: '09:00 - 19:00' }],
    accessibility: ['Acesso para cadeiras de rodas', 'WC adaptado', 'Próximo de transportes públicos'],
    photos: [],
  },
};

const CLINIC_REVIEWS = [
  { id: 'cr1', patientName: 'Ana M.', rating: 5, date: '2026-01-28', comment: 'Clínica excelente, muito moderna e limpa. Recomendo a todos!' },
  { id: 'cr2', patientName: 'Pedro S.', rating: 5, date: '2026-01-25', comment: 'Equipa fantástica, recomendo a todos!' },
  { id: 'cr3', patientName: 'Maria L.', rating: 4, date: '2026-01-20', comment: 'Bom atendimento, boas instalações. Voltarei certamente.' },
  { id: 'cr4', patientName: 'João P.', rating: 5, date: '2026-01-15', comment: 'Nunca tive uma experiência tão boa num dentista.' },
];

const DENTIST_RATINGS: Record<string, number> = {
  '1': 4.9, '2': 4.7, '3': 4.8, '4': 4.6, '5': 4.5, '6': 4.4, '7': 4.3,
};

const DENTIST_SPECIALTIES: Record<string, string[]> = {
  '1': ['Cirurgia', 'Endodontia'],
  '2': ['Ortodontia', 'Prótese'],
  '3': ['Restauração', 'Odontopediatria'],
};

const CLINIC_SERVICES = [
  { name: 'Consulta de avaliação', price: 'desde €30' },
  { name: 'Teleconsulta', price: '€20' },
  { name: 'Destartarização', price: 'desde €50' },
  { name: 'Restauração dentária', price: 'desde €60' },
  { name: 'Endodontia', price: 'desde €150' },
  { name: 'Cirurgia oral', price: 'desde €200' },
  { name: 'Ortodontia', price: 'consultar' },
  { name: 'Implantologia', price: 'consultar' },
  { name: 'Prótese dentária', price: 'desde €180' },
  { name: 'Odontopediatria', price: 'desde €50' },
];

const CLINIC_STATS = {
  totalConsultations: '3 200+',
  confirmationRate: '92%',
  avgWaitTime: '8 min',
  activePatients: '850+',
};

export function ClinicProfileView({ clinicId, isOpen, onClose, onViewDentistProfile, inline, isFavorite, onToggleFavorite, isOwnProfile, onEditProfile }: ClinicProfileViewProps) {
  const isMobile = useIsMobile();
  const clinic = mockClinics.find(c => c.id === clinicId);
  const extra = CLINIC_EXTRA[clinicId] || CLINIC_EXTRA['1'];
  const dentists = getDentistsForClinic(clinicId)
    .sort((a, b) => (DENTIST_RATINGS[b.id] || 4.0) - (DENTIST_RATINGS[a.id] || 4.0));

  const breakdown = [
    { stars: 5, pct: 72 },
    { stars: 4, pct: 18 },
    { stars: 3, pct: 6 },
    { stars: 2, pct: 3 },
    { stars: 1, pct: 1 },
  ];

  if (!isOpen || !clinic) return null;

  const profileContent = (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
        <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Building2 className="w-12 h-12 text-primary" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-xl font-bold">{clinic.name}</h3>
          <p className="text-sm text-muted-foreground">Clínica Dentária</p>
          <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-bold">{extra.rating}</span>
            <span className="text-xs text-muted-foreground">({extra.reviewCount} avaliações)</span>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
            <Badge variant="secondary" className="text-xs bg-amber-500/15 text-amber-400 border-amber-500/30">Ouro</Badge>
            <span className="text-xs font-medium text-primary">3 800 pts</span>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-1 mt-1">
            <MapPin className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{clinic.address}</span>
          </div>
          {extra.acceptsNewPatients && (
            <Badge variant="default" className="mt-2 text-xs">✓ Aceita novos pacientes</Badge>
          )}
        </div>
        <div className={cn('flex gap-2', isMobile ? 'w-full' : 'flex-col')}>
          {isOwnProfile ? (
            <Button variant="outline" className="flex-1" onClick={onEditProfile}>Editar Perfil</Button>
          ) : (
            <>
              <Button className="flex-1"><Calendar className="w-4 h-4 mr-1" /> Marcar Consulta</Button>
              <Button variant="outline" className="flex-1"><MessageCircle className="w-4 h-4 mr-1" /> Mensagem</Button>
              <Button variant="outline" className="flex-1" onClick={() => window.open(`tel:${extra.phone}`)}>
                <Phone className="w-4 h-4 mr-1" /> Ligar
              </Button>
            </>
          )}
          {onToggleFavorite && (
            <Button variant="ghost" size={isMobile ? 'default' : 'icon'} onClick={onToggleFavorite} className={cn(isFavorite && 'text-amber-400')}>
              <Star className={cn('w-4 h-4', isFavorite && 'fill-amber-400')} />
              {isMobile && <span className="ml-1">Favoritos</span>}
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* Badge Showcase */}
      <BadgeShowcase
        userRole="clinic"
        categories={getAchievementCategories('clinic')}
        isOwnProfile={isOwnProfile}
      />

      <Separator />

      {/* Sobre */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold">Sobre</h4>
        <p className="text-sm text-muted-foreground">{extra.description}</p>
        <p className="text-xs text-muted-foreground">Fundada em {extra.founded}</p>
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-1.5">Serviços</p>
          <div className="flex flex-wrap gap-1.5">
            {extra.xrayServices.map(s => (
              <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
            ))}
            {extra.specialties.map(s => (
              <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* Hours */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold">Horário de Funcionamento</h4>
        <div className="space-y-1">
          {extra.hours.map(h => (
            <div key={h.day} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{h.day}</span>
              <span className={h.hours === 'Fechado' ? 'text-destructive' : 'font-medium'}>{h.hours}</span>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Team */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold">Equipa Médica</h4>
        <div className="space-y-2">
          {dentists.map(d => (
            <div key={d.id} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <ClickableDentistName name={d.name} className="text-sm font-medium" />
                <p className="text-xs text-muted-foreground">
                  {DENTIST_SPECIALTIES[d.id]?.join(', ') || d.specialty}
                </p>
                {DENTIST_RATINGS[d.id] && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-medium">{DENTIST_RATINGS[d.id]}</span>
                  </div>
                )}
              </div>
              <Badge variant="outline" className="text-[10px]">Aceita pacientes</Badge>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Serviços e Tarifas */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold">Tarifas</h4>
        <div className="space-y-1">
          {CLINIC_SERVICES.map(s => (
            <div key={s.name} className="flex justify-between text-sm py-1 border-b border-border/30 last:border-0">
              <span className="text-muted-foreground">{s.name}</span>
              <span className="font-medium">{s.price}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Video className="w-4 h-4 text-emerald-400" />
          <span>Teleconsultas disponíveis: <span className="font-medium">Sim (€20)</span></span>
        </div>
      </section>

      <Separator />

      {/* Estatísticas Públicas */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold">Estatísticas</h4>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total consultas realizadas', value: CLINIC_STATS.totalConsultations, icon: Stethoscope },
            { label: 'Taxa de confirmação', value: CLINIC_STATS.confirmationRate, icon: TrendingUp },
            { label: 'Tempo médio de espera', value: CLINIC_STATS.avgWaitTime, icon: Clock },
            { label: 'Pacientes ativos', value: CLINIC_STATS.activePatients, icon: Users },
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

      {/* Contact */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold">Contactos e Localização</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span>{clinic.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <a href={`tel:${extra.phone}`} className="text-primary hover:underline">{extra.phone}</a>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <span>{extra.website}</span>
          </div>
        </div>
        <div className="h-40 bg-secondary rounded-xl flex items-center justify-center text-muted-foreground text-sm">
          <MapPin className="w-5 h-5 mr-2" /> Mapa interactivo
        </div>
      </section>

      <Separator />

      {/* Accessibility */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold">Acessibilidade</h4>
        <div className="grid grid-cols-2 gap-2">
          {extra.accessibility.map(a => (
            <div key={a} className="flex items-center gap-2 text-sm">
              <span className="text-emerald-500">✓</span>
              <span>{a}</span>
            </div>
          ))}
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-emerald-500">✓</span>
            <span>Transportes públicos: Metro Avenida (5 min a pé)</span>
          </div>
        </div>
      </section>

      <Separator />

      {/* Galeria */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold">Galeria</h4>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
          {['Receção', 'Consultório 1', 'Equipamento', 'Equipa', 'Exterior'].map((label) => (
            <div key={label} className="aspect-square bg-secondary/50 rounded-lg flex flex-col items-center justify-center text-muted-foreground">
              <Camera className="w-5 h-5 mb-1" />
              <span className="text-[9px]">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Reviews */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold">Avaliações</h4>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold">{extra.rating}</p>
            <div className="flex justify-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={cn('w-4 h-4', i < Math.floor(extra.rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground')} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{extra.reviewCount}</p>
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
          {CLINIC_REVIEWS.map(r => (
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
        <button className="text-xs text-primary hover:underline">Ver todas as avaliações →</button>
      </section>
    </div>
  );

  // Inline mode
  if (inline) {
    return (
      <div className="p-5">
        {profileContent}
      </div>
    );
  }

  // Full-screen for all devices
  return (
    <div className="fixed inset-0 bg-background z-[60] flex flex-col overflow-hidden pb-[60px]">
      <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={onClose}><ArrowLeft className="w-5 h-5" /></Button>
        <h2 className="text-base font-semibold">{isOwnProfile ? 'Meu Perfil' : 'Perfil da Clínica'}</h2>
        <div className="w-10" />
      </div>
      <ScrollArea className="flex-1">
        <div className="p-5">{profileContent}</div>
      </ScrollArea>
    </div>
  );
}
