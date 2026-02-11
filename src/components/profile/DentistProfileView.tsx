import { useState } from 'react';
import { X, ArrowLeft, Star, MapPin, Calendar, MessageCircle, User, Video, Globe, Clock, Accessibility, CreditCard, GraduationCap, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { DentistSearchResult, LEVEL_CONFIG, getReviewsForDentist } from '@/data/mockDentistSearch';
import { BookingFlow } from '@/components/booking/BookingFlow';

interface DentistProfileViewProps {
  dentist: DentistSearchResult;
  isOpen: boolean;
  onClose: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onGoHome?: () => void;
}

// Mock enhanced data
const DENTIST_EXTRA = {
  yearsExperience: 15,
  education: 'Universidade de Lisboa - Faculdade de Medicina Dentária',
  languages: [
    { code: '🇵🇹', name: 'Português' },
    { code: '🇫🇷', name: 'Français' },
    { code: '🇬🇧', name: 'English' },
  ],
  acceptsNewPatients: true,
  presencialPrice: 'Variável conforme tratamento',
  paymentMethods: ['Cartão', 'MB WAY', 'Multibanco'],
  insurances: ['Médis', 'Multicare', 'AdvanceCare', 'ADSE'],
  clinicSchedules: [
    {
      clinicName: 'Clínica SmileCheck',
      address: 'Av. da Liberdade 123, Lisboa',
      distance: 2.5,
      days: [
        { day: 'Segunda', hours: '09:00 - 19:00' },
        { day: 'Terça', hours: '09:00 - 19:00' },
        { day: 'Quarta', hours: '09:00 - 13:00' },
        { day: 'Quinta', hours: '09:00 - 19:00' },
        { day: 'Sexta', hours: '09:00 - 19:00' },
      ],
      accessibility: ['Cadeira de rodas', 'Elevador', 'WC adaptado'],
    },
    {
      clinicName: 'Clínica Mitry-Mory',
      address: 'Rue de Paris 45, Mitry-Mory',
      distance: 4.2,
      days: [
        { day: 'Quarta', hours: '14:00 - 19:00' },
        { day: 'Sábado', hours: '09:00 - 13:00' },
      ],
      accessibility: ['Cadeira de rodas', 'Estacionamento gratuito'],
    },
  ],
};

export function DentistProfileView({ dentist, isOpen, onClose, isFavorite, onToggleFavorite, onGoHome }: DentistProfileViewProps) {
  const isMobile = useIsMobile();
  const [showBooking, setShowBooking] = useState(false);
  const levelCfg = LEVEL_CONFIG[dentist.level];
  const reviews = getReviewsForDentist(dentist.id);
  const initials = dentist.name.split(' ').filter((_, i, a) => i === 0 || i === a.length - 1).map(n => n[0]).join('');

  // Rating breakdown
  const breakdown = [
    { stars: 5, pct: 78 },
    { stars: 4, pct: 15 },
    { stars: 3, pct: 4 },
    { stars: 2, pct: 2 },
    { stars: 1, pct: 1 },
  ];

  if (!isOpen) return null;

  if (showBooking) {
    return (
      <BookingFlow
        dentist={dentist}
        onClose={() => setShowBooking(false)}
        onComplete={() => { setShowBooking(false); onClose(); }}
        onGoHome={onGoHome}
      />
    );
  }

  const profileContent = (
    <>

          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
            <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center text-3xl font-bold text-primary flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold text-foreground">{dentist.name}</h3>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 mt-1">
                {dentist.specialties.map(s => (
                  <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                ))}
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className={cn('text-sm font-bold', levelCfg.color)}>{dentist.rating}</span>
                  <span className="text-xs text-muted-foreground">({dentist.reviewCount} avaliações)</span>
                </div>
                <span className={cn('text-xs font-semibold px-2 py-0.5 rounded border', levelCfg.bg, levelCfg.color)}>
                  {levelCfg.label}
                </span>
              </div>
              <Badge variant={DENTIST_EXTRA.acceptsNewPatients ? 'default' : 'destructive'} className="mt-2 text-xs">
                {DENTIST_EXTRA.acceptsNewPatients ? '✓ Aceita novos pacientes' : '✗ Não aceita novos pacientes'}
              </Badge>
            </div>
            {/* Action buttons */}
            <div className={cn('flex gap-2', isMobile ? 'w-full' : 'flex-col')}>
              <Button className="flex-1" onClick={() => setShowBooking(true)}>
                <Calendar className="w-4 h-4 mr-1" /> Marcar
              </Button>
              <Button variant="outline" className="flex-1">
                <MessageCircle className="w-4 h-4 mr-1" /> Mensagem
              </Button>
              <Button
                variant="ghost"
                size={isMobile ? 'default' : 'icon'}
                onClick={onToggleFavorite}
                className={cn(isFavorite && 'text-amber-400')}
              >
                <Star className={cn('w-4 h-4', isFavorite && 'fill-amber-400')} />
                {isMobile && <span className="ml-1">Favoritos</span>}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Presentation */}
          <section className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Apresentação</h4>
            <p className="text-sm text-muted-foreground">{dentist.bio}</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
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
                {DENTIST_EXTRA.languages.map(l => (
                  <span key={l.name} className="text-sm">{l.code} {l.name}</span>
                ))}
              </div>
            </div>
          </section>

          <Separator />

          {/* Locations side by side */}
          <section className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Locais de Atendimento</h4>
            <div className={cn('grid gap-3', isMobile ? 'grid-cols-1' : 'grid-cols-2')}>
              {DENTIST_EXTRA.clinicSchedules.map((cs, i) => (
                <div key={i} className="bg-secondary/50 rounded-xl p-4 space-y-3 border border-border">
                  <div>
                    <p className="text-sm font-semibold">{cs.clinicName}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <MapPin className="w-3 h-3" />
                      <span>{cs.address} · {cs.distance} km</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {cs.days.map(d => (
                      <div key={d.day} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{d.day}</span>
                        <span className="font-medium">{d.hours}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {cs.accessibility.map(a => (
                      <Badge key={a} variant="outline" className="text-[10px]">✓ {a}</Badge>
                    ))}
                  </div>
                  <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => setShowBooking(true)}>
                    Marcar nesta clínica
                  </Button>
                </div>
              ))}
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
                  {DENTIST_EXTRA.paymentMethods.map(m => (
                    <Badge key={m} variant="outline" className="text-[10px]">{m}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-muted-foreground">Convenções</span>
                <div className="flex flex-wrap gap-1 justify-end">
                  {DENTIST_EXTRA.insurances.map(s => (
                    <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
                  ))}
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
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn('w-4 h-4', i < Math.floor(dentist.rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground')} />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{dentist.reviewCount} avaliações</p>
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
              {reviews.slice(0, 5).map(r => (
                <div key={r.id} className="bg-secondary/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold">{r.patientName}</span>
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
    </>
  );

  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-background z-[60] flex flex-col overflow-hidden">
        {/* Fixed header */}
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <Button variant="ghost" size="icon" onClick={onClose}><ArrowLeft className="w-5 h-5" /></Button>
          <h2 className="text-base font-semibold">Perfil do Dentista</h2>
          <div className="w-10" />
        </div>
        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-6">
            {profileContent}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-xl border border-border shadow-2xl w-full max-w-[700px] max-h-[90vh] md:max-h-[85vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Fixed header */}
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <h2 className="text-base font-semibold">Perfil do Dentista</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
        </div>
        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-6">
            {profileContent}
          </div>
        </div>
      </div>
    </div>
  );
}
