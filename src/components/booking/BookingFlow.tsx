import { useState } from 'react';
import { 
  X, MapPin, Video, Building2, Check, ChevronLeft, ChevronRight,
  AlertTriangle, CreditCard, Smartphone, Calendar as CalendarIcon, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { DentistSearchResult, getAvailabilityForDentist } from '@/data/mockDentistSearch';
import { useIsMobile } from '@/hooks/use-mobile';

interface BookingFlowProps {
  dentist: DentistSearchResult;
  onClose: () => void;
  onComplete: () => void;
  onGoHome?: () => void;
}

type BookingStep = 'clinic' | 'type' | 'datetime' | 'confirm' | 'payment' | 'success';

interface BookingData {
  clinic: DentistSearchResult['clinics'][0] | null;
  consultationType: 'presencial' | 'teleconsulta' | null;
  isUrgent: boolean;
  date: Date | undefined;
  time: string | null;
}

const ALL_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00', '20:30',
];

const OCCUPIED_SLOTS = ['09:30', '10:30', '14:30', '16:00', '17:30', '19:30'];

export function BookingFlow({ dentist, onClose, onComplete, onGoHome }: BookingFlowProps) {
  const isMobile = useIsMobile();
  const skipClinic = dentist.clinics.length <= 1;
  
  const [step, setStep] = useState<BookingStep>(skipClinic ? 'type' : 'clinic');
  const [data, setData] = useState<BookingData>({
    clinic: skipClinic ? dentist.clinics[0] : null,
    consultationType: null,
    isUrgent: false,
    date: undefined,
    time: null,
  });
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [mbwayPhone, setMbwayPhone] = useState('');

  const allSteps: BookingStep[] = skipClinic
    ? ['type', 'datetime', 'confirm', ...(data.consultationType === 'teleconsulta' ? ['payment' as const] : []), 'success']
    : ['clinic', 'type', 'datetime', 'confirm', ...(data.consultationType === 'teleconsulta' ? ['payment' as const] : []), 'success'];

  const steps = allSteps;
  const visibleSteps = allSteps.filter(s => s !== 'success');
  const currentIdx = visibleSteps.indexOf(step as any);
  const progress = step === 'success' ? 100 : ((currentIdx + 1) / visibleSteps.length) * 100;

  const initials = dentist.name
    .split(' ')
    .filter((_, i, a) => i === 0 || i === a.length - 1)
    .map(n => n[0])
    .join('');

  const totalPrice = data.consultationType === 'teleconsulta'
    ? dentist.teleconsultaPrice + (data.isUrgent ? 5 : 0)
    : 0;

  const goNext = () => {
    const idx = steps.indexOf(step);
    if (idx < steps.length - 1) setStep(steps[idx + 1]);
  };

  const goPrev = () => {
    const idx = steps.indexOf(step);
    if (idx > 0) setStep(steps[idx - 1]);
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 'clinic': return data.clinic !== null;
      case 'type': return data.consultationType !== null;
      case 'datetime': return data.date !== undefined && data.time !== null;
      case 'confirm': return true;
      case 'payment': {
        if (!acceptTerms || !paymentMethod) return false;
        if (paymentMethod === 'card') return cardNumber.length >= 16 && cardExpiry.length >= 4 && cardCvv.length >= 3;
        if (paymentMethod === 'mbway') return mbwayPhone.length >= 9;
        return true;
      }
      default: return true;
    }
  };

  const handleConfirm = () => {
    if (data.consultationType === 'teleconsulta') {
      goNext(); // go to payment
    } else {
      // presencial - skip payment, go to success
      const successIdx = steps.indexOf('success');
      if (successIdx >= 0) setStep('success');
      else setStep('success');
    }
  };

  const handlePay = () => {
    setStep('success');
  };

  const availableSlots = ALL_SLOTS.filter(s => {
    if (data.consultationType === 'presencial') return s < '19:00' && !OCCUPIED_SLOTS.includes(s);
    return !OCCUPIED_SLOTS.includes(s);
  });

  // Step renderers
  const renderClinicStep = () => (
    <div className="space-y-4 animate-fade-in">
      <h3 className="text-lg font-semibold text-foreground">Onde prefere ser atendido?</h3>
      <div className="space-y-3">
        {dentist.clinics.map(c => (
          <button
            key={c.id}
            onClick={() => setData(d => ({ ...d, clinic: c }))}
            className={cn(
              'w-full p-4 rounded-xl border text-left transition-all',
              data.clinic?.id === c.id
                ? 'border-primary bg-primary/10 ring-1 ring-primary'
                : 'border-border bg-secondary hover:border-muted-foreground/40'
            )}
          >
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-foreground text-sm">{c.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{c.address}</p>
                <p className="text-xs text-primary mt-1">{c.distance} km</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderTypeStep = () => (
    <div className="space-y-4 animate-fade-in">
      <h3 className="text-lg font-semibold text-foreground">Que tipo de consulta pretende?</h3>
      <div className="space-y-3">
        <button
          onClick={() => setData(d => ({ ...d, consultationType: 'presencial', isUrgent: false }))}
          className={cn(
            'w-full p-4 rounded-xl border text-left transition-all',
            data.consultationType === 'presencial'
              ? 'border-primary bg-primary/10 ring-1 ring-primary'
              : 'border-border bg-secondary hover:border-muted-foreground/40'
          )}
        >
          <div className="flex items-start gap-3">
            <Building2 className="w-6 h-6 text-primary mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Presencial</p>
              <p className="text-xs text-muted-foreground mt-0.5">Na clínica {data.clinic?.name}</p>
              <p className="text-xs text-primary mt-1">A pagar na clínica</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => setData(d => ({ ...d, consultationType: 'teleconsulta' }))}
          className={cn(
            'w-full p-4 rounded-xl border text-left transition-all',
            data.consultationType === 'teleconsulta'
              ? 'border-primary bg-primary/10 ring-1 ring-primary'
              : 'border-border bg-secondary hover:border-muted-foreground/40'
          )}
        >
          <div className="flex items-start gap-3">
            <Video className="w-6 h-6 text-primary mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Teleconsulta</p>
              <p className="text-xs text-muted-foreground mt-0.5">Consulta por vídeo</p>
              <p className="text-xs text-primary mt-1">€{dentist.teleconsultaPrice}</p>
            </div>
          </div>
        </button>
        {data.consultationType === 'teleconsulta' && (
          <label className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 cursor-pointer">
            <Checkbox
              checked={data.isUrgent}
              onCheckedChange={(v) => setData(d => ({ ...d, isUrgent: !!v }))}
            />
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="text-sm text-foreground">É urgente (+€5)</span>
            </div>
          </label>
        )}
      </div>
    </div>
  );

  const renderDateTimeStep = () => (
    <div className="space-y-4 animate-fade-in">
      <h3 className="text-lg font-semibold text-foreground">Escolha a data e hora</h3>
      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={data.date}
          onSelect={(d) => setData(prev => ({ ...prev, date: d, time: null }))}
          disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
          className="p-3 pointer-events-auto rounded-xl border border-border bg-secondary"
        />
      </div>
      {data.date && (
        <div>
          <p className="text-sm font-medium text-foreground mb-2">
            Horários disponíveis — {data.date.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {ALL_SLOTS
              .filter(s => data.consultationType === 'presencial' ? s < '19:00' : true)
              .map(slot => {
                const occupied = OCCUPIED_SLOTS.includes(slot);
                const selected = data.time === slot;
                return (
                  <button
                    key={slot}
                    disabled={occupied}
                    onClick={() => setData(d => ({ ...d, time: slot }))}
                    className={cn(
                      'text-sm py-2 px-1 rounded-lg border transition-all',
                      occupied && 'opacity-40 cursor-not-allowed bg-muted border-border text-muted-foreground line-through',
                      !occupied && !selected && 'border-border bg-secondary text-foreground hover:border-primary/50',
                      selected && 'border-primary bg-primary text-primary-foreground font-semibold'
                    )}
                  >
                    {slot}
                  </button>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );

  const renderConfirmStep = () => (
    <div className="space-y-4 animate-fade-in">
      <h3 className="text-lg font-semibold text-foreground">Confirme a sua marcação</h3>
      <div className="space-y-3">
        {/* Dentist */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary border border-border">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">{initials}</div>
          <div>
            <p className="text-sm font-semibold text-foreground">{dentist.name}</p>
            <p className="text-xs text-muted-foreground">{dentist.specialties.join(', ')}</p>
          </div>
        </div>
        {/* Clinic */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary border border-border">
          <MapPin className="w-5 h-5 text-primary shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">{data.clinic?.name}</p>
            <p className="text-xs text-muted-foreground">{data.clinic?.address}</p>
          </div>
        </div>
        {/* Type */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary border border-border">
          {data.consultationType === 'teleconsulta' ? <Video className="w-5 h-5 text-primary" /> : <Building2 className="w-5 h-5 text-primary" />}
          <div>
            <p className="text-sm font-semibold text-foreground">{data.consultationType === 'teleconsulta' ? 'Teleconsulta' : 'Presencial'}</p>
            {data.isUrgent && <p className="text-xs text-destructive">⚠️ Urgente (+€5)</p>}
          </div>
        </div>
        {/* Date & Time */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary border border-border">
          <CalendarIcon className="w-5 h-5 text-primary shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              {data.date?.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <p className="text-xs text-muted-foreground">{data.time}</p>
          </div>
        </div>
        {/* Price */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/20">
          <span className="text-sm font-semibold text-foreground">Preço</span>
          <span className="text-sm font-bold text-primary">
            {data.consultationType === 'teleconsulta' ? `€${totalPrice}` : 'A pagar na clínica'}
          </span>
        </div>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-4 animate-fade-in">
      <h3 className="text-lg font-semibold text-foreground">Pagamento</h3>
      {/* Summary */}
      <div className="p-3 rounded-xl bg-secondary border border-border space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Teleconsulta</span>
          <span className="text-foreground">€{dentist.teleconsultaPrice}</span>
        </div>
        {data.isUrgent && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Taxa urgência</span>
            <span className="text-foreground">€5</span>
          </div>
        )}
        <div className="border-t border-border pt-1 mt-1 flex justify-between text-sm font-bold">
          <span className="text-foreground">Total</span>
          <span className="text-primary">€{totalPrice}</span>
        </div>
      </div>

      {/* Payment methods */}
      <div className="space-y-2">
        {[
          { id: 'apple', label: 'Apple Pay', icon: <Smartphone className="w-4 h-4" /> },
          { id: 'google', label: 'Google Pay', icon: <Smartphone className="w-4 h-4" /> },
          { id: 'card', label: 'Cartão de Crédito', icon: <CreditCard className="w-4 h-4" /> },
          { id: 'paypal', label: 'PayPal', icon: <CreditCard className="w-4 h-4" /> },
          { id: 'mbway', label: 'MB WAY', icon: <Smartphone className="w-4 h-4" /> },
        ].map(m => (
          <button
            key={m.id}
            onClick={() => setPaymentMethod(m.id)}
            className={cn(
              'w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
              paymentMethod === m.id
                ? 'border-primary bg-primary/10 ring-1 ring-primary'
                : 'border-border bg-secondary hover:border-muted-foreground/40'
            )}
          >
            {m.icon}
            <span className="text-sm font-medium text-foreground">{m.label}</span>
          </button>
        ))}
      </div>

      {/* Card fields */}
      {paymentMethod === 'card' && (
        <div className="space-y-3 animate-fade-in">
          <Input placeholder="Número do cartão" value={cardNumber} onChange={e => setCardNumber(e.target.value)} maxLength={19} />
          <div className="flex gap-3">
            <Input placeholder="MM/AA" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} maxLength={5} className="flex-1" />
            <Input placeholder="CVV" value={cardCvv} onChange={e => setCardCvv(e.target.value)} maxLength={4} className="w-24" />
          </div>
        </div>
      )}

      {/* MB WAY field */}
      {paymentMethod === 'mbway' && (
        <div className="animate-fade-in">
          <Input placeholder="Número de telemóvel" value={mbwayPhone} onChange={e => setMbwayPhone(e.target.value)} maxLength={12} />
        </div>
      )}

      {/* Terms */}
      <label className="flex items-center gap-3 cursor-pointer">
        <Checkbox checked={acceptTerms} onCheckedChange={(v) => setAcceptTerms(!!v)} />
        <span className="text-xs text-muted-foreground">Aceito os termos e condições</span>
      </label>
    </div>
  );

  const renderSuccess = () => (
    <div className="flex flex-col items-center text-center space-y-5 py-8 animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
        <Check className="w-8 h-8 text-emerald-500" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-foreground">Consulta Agendada!</h3>
        <p className="text-sm text-muted-foreground mt-1">Receberá confirmação por email</p>
        <p className="text-xs text-muted-foreground mt-0.5">Lembrete 24h e 1h antes</p>
      </div>
      <div className="w-full space-y-2 text-left">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary border border-border">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">{initials}</div>
          <span className="text-sm font-semibold text-foreground">{dentist.name}</span>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary border border-border">
          <MapPin className="w-4 h-4 text-primary shrink-0" />
          <span className="text-sm text-foreground">{data.clinic?.name}</span>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary border border-border">
          <CalendarIcon className="w-4 h-4 text-primary shrink-0" />
          <span className="text-sm text-foreground">
            {data.date?.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })} às {data.time}
          </span>
        </div>
      </div>
      <div className="flex gap-3 w-full pt-2">
        <Button variant="outline" className="flex-1 border-border" onClick={() => {
          if (onGoHome) {
            onGoHome();
          } else {
            onComplete();
          }
        }}>
          Voltar ao Início
        </Button>
        <Button className="flex-1" onClick={onClose}>
          Ver Detalhes
        </Button>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 'clinic': return renderClinicStep();
      case 'type': return renderTypeStep();
      case 'datetime': return renderDateTimeStep();
      case 'confirm': return renderConfirmStep();
      case 'payment': return renderPaymentStep();
      case 'success': return renderSuccess();
    }
  };

  const renderButtons = () => {
    if (step === 'success') return null;
    return (
      <div className="flex gap-3 pt-4">
        {currentIdx === 0 ? (
          <Button variant="outline" className="flex-1 border-border" onClick={onClose}>Cancelar</Button>
        ) : (
          <Button variant="outline" className="flex-1 border-border" onClick={goPrev}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
          </Button>
        )}
        {step === 'confirm' ? (
          <Button className="flex-1" onClick={handleConfirm}>
            {data.consultationType === 'teleconsulta' ? 'Seguinte' : 'Confirmar'}
            {data.consultationType !== 'teleconsulta' && <Check className="w-4 h-4 ml-1" />}
            {data.consultationType === 'teleconsulta' && <ChevronRight className="w-4 h-4 ml-1" />}
          </Button>
        ) : step === 'payment' ? (
          <Button className="flex-1" onClick={handlePay} disabled={!canProceed()}>
            Pagar €{totalPrice}
          </Button>
        ) : (
          <Button className="flex-1" onClick={goNext} disabled={!canProceed()}>
            Seguinte <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    );
  };

  const content = (
    <div className="space-y-4">
      {step !== 'success' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Passo {currentIdx + 1} de {visibleSteps.length}</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      )}
      {renderCurrentStep()}
      {!isMobile && renderButtons()}
    </div>
  );

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[60] bg-background" style={{ bottom: '60px' }}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">Marcar Consulta</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto" style={{ height: 'calc(100% - 57px - 64px)' }}>
          <div className="p-4 pb-8">{content}</div>
        </div>
        {step !== 'success' && (
          <div className="flex gap-3 p-4 border-t border-border bg-background">
            {currentIdx === 0 ? (
              <Button variant="outline" className="flex-1 border-border" onClick={onClose}>Cancelar</Button>
            ) : (
              <Button variant="outline" className="flex-1 border-border" onClick={goPrev}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
              </Button>
            )}
            {step === 'confirm' ? (
              <Button className="flex-1" onClick={handleConfirm}>
                {data.consultationType === 'teleconsulta' ? 'Seguinte' : 'Confirmar'}
                {data.consultationType !== 'teleconsulta' && <Check className="w-4 h-4 ml-1" />}
                {data.consultationType === 'teleconsulta' && <ChevronRight className="w-4 h-4 ml-1" />}
              </Button>
            ) : step === 'payment' ? (
              <Button className="flex-1" onClick={handlePay} disabled={!canProceed()}>
                Pagar €{totalPrice}
              </Button>
            ) : (
              <Button className="flex-1" onClick={goNext} disabled={!canProceed()}>
                Seguinte <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[500px] max-h-[90vh] bg-card rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <h2 className="text-base font-semibold text-foreground">Marcar Consulta</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">
          <div className="p-6 pb-8">{content}</div>
        </div>
      </div>
    </div>
  );
}
