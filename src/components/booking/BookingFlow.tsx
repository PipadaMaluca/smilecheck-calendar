import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  X, MapPin, Video, Building2, Check, ChevronLeft, ChevronRight,
  AlertTriangle, CreditCard, Smartphone, Calendar as CalendarIcon, Clock,
  Download, Loader2, Star, Landmark, Coins, Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { DentistSearchResult, getAvailabilityForDentist } from '@/data/mockDentistSearch';
import { useIsMobile } from '@/hooks/use-mobile';
import { generateReceipt } from '@/components/billing/billingMockData';
import { toast } from 'sonner';

interface BookingFlowProps {
  dentist: DentistSearchResult;
  onClose: () => void;
  onComplete: () => void;
  onGoHome?: () => void;
  initialTime?: string;
  initialDayLabel?: string;
}

type BookingStep = 'clinic' | 'type' | 'datetime' | 'confirm' | 'payment' | 'processing' | 'success';

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

export function BookingFlow({ dentist, onClose, onComplete, onGoHome, initialTime, initialDayLabel }: BookingFlowProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const skipClinic = dentist.clinics.length <= 1;

  // Resolve initial date from dayLabel
  const resolveDate = (label?: string): Date | undefined => {
    if (!label) return undefined;
    const lower = label.toLowerCase();
    const today = new Date();
    if (lower === 'hoje') return today;
    if (lower === 'amanhã') { const d = new Date(today); d.setDate(d.getDate() + 1); return d; }
    // Try day-of-week matching
    const dayNames = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
    const idx = dayNames.findIndex(n => lower.startsWith(n));
    if (idx >= 0) {
      const d = new Date(today);
      const diff = (idx - d.getDay() + 7) % 7 || 7;
      d.setDate(d.getDate() + diff);
      return d;
    }
    return undefined;
  };

  const hasQuickBook = !!(initialTime && initialDayLabel);
  const quickDate = resolveDate(initialDayLabel);

  const [step, setStep] = useState<BookingStep>(hasQuickBook ? 'confirm' : (skipClinic ? 'type' : 'clinic'));
  const [data, setData] = useState<BookingData>({
    clinic: skipClinic ? dentist.clinics[0] : null,
    consultationType: hasQuickBook ? 'presencial' : null,
    isUrgent: false,
    date: quickDate,
    time: initialTime || null,
  });
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [saveCard, setSaveCard] = useState(true);
  const [mbwayPhone, setMbwayPhone] = useState('+351 912 000 001');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState<boolean | null>(null);
  const [discount, setDiscount] = useState(0);
  const [useSavedCard, setUseSavedCard] = useState(true);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const receiptId = `SC-2026-00${Math.floor(Math.random() * 900 + 100)}`;

  const allSteps: BookingStep[] = skipClinic
    ? ['type', 'datetime', 'confirm', ...(data.consultationType === 'teleconsulta' ? ['payment' as const, 'processing' as const] : []), 'success']
    : ['clinic', 'type', 'datetime', 'confirm', ...(data.consultationType === 'teleconsulta' ? ['payment' as const, 'processing' as const] : []), 'success'];

  const steps = allSteps;
  const visibleSteps = allSteps.filter(s => s !== 'success' && s !== 'processing');
  const currentIdx = visibleSteps.indexOf(step as any);
  const progress = (step === 'success' || step === 'processing') ? 100 : ((currentIdx + 1) / visibleSteps.length) * 100;

  const initials = (() => {
    const parts = dentist.name.split(' ').filter(n => !['dr.', 'dr', 'dra.', 'dra'].includes(n.toLowerCase()));
    if (parts.length <= 1) return parts[0]?.[0]?.toUpperCase() || '?';
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  })();

  const basePrice = data.consultationType === 'teleconsulta'
    ? dentist.teleconsultaPrice + (data.isUrgent ? 5 : 0)
    : 0;
  const finalPrice = Math.max(0, basePrice - discount);
  const totalPrice = basePrice;

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
        if (paymentMethod === 'card-new' && !useSavedCard) {
          const rawNum = cardNumber.replace(/\s/g, '');
          return rawNum.length === 16 && cardExpiry.length === 5 && cardCvv.length === 3 && cardName.trim().length > 0;
        }
        if (paymentMethod === 'mbway') return mbwayPhone.length >= 9;
        return true;
      }
      default: return true;
    }
  };

  const handleApplyPromo = () => {
    if (promoCode.toLowerCase() === 'smile20') {
      setPromoApplied(true);
      setDiscount(Math.round(basePrice * 0.2 * 100) / 100);
    } else {
      setPromoApplied(false);
      setDiscount(0);
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
    setStep('processing');
    setTimeout(() => {
      setPaymentFailed(false);
      setStep('success');
    }, 2000);
  };

  const availableSlots = ALL_SLOTS.filter(s => {
    if (data.consultationType === 'presencial') return s < '19:00' && !OCCUPIED_SLOTS.includes(s);
    return !OCCUPIED_SLOTS.includes(s);
  });

  // Step renderers
  const renderClinicStep = () => (
    <div className="space-y-4 animate-fade-in">
      <h3 className="text-lg font-semibold text-foreground">{t('booking.wherePrefer')}</h3>
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
      <h3 className="text-lg font-semibold text-foreground">{t('booking.whatType')}</h3>
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
              <p className="font-semibold text-foreground">{t('booking.inPerson')}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t('booking.atClinic')} {data.clinic?.name}</p>
              <p className="text-xs text-primary mt-1">{t('booking.payAtClinic')}</p>
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
              <p className="font-semibold text-foreground">{t('editConsultation.teleconsultation')}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t('booking.videoConsultation')}</p>
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
              <span className="text-sm text-foreground">{t('booking.isUrgent')} (+€5)</span>
            </div>
          </label>
        )}
      </div>
    </div>
  );

  const renderDateTimeStep = () => (
    <div className="space-y-4 animate-fade-in">
      <h3 className="text-lg font-semibold text-foreground">{t('booking.chooseDatetime')}</h3>
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
            {t('booking.availableSlots')} — {data.date.toLocaleDateString(i18n.language === 'en' ? 'en-GB' : i18n.language === 'fr' ? 'fr-FR' : 'pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}
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
      <h3 className="text-lg font-semibold text-foreground">{t('booking.confirmBooking')}</h3>
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
        <p className="text-sm font-medium text-foreground">{t('booking.teleconsultWith')} {dentist.name}</p>
        <p className="text-xs text-muted-foreground">📅 {data.date?.toLocaleDateString('pt-PT')} ⏰ {data.time} (30 min)</p>
        <p className="text-xs text-muted-foreground">🏥 {data.clinic?.name}</p>
        <div className="border-t border-border pt-1 mt-1 space-y-0.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('editConsultation.teleconsultation')}</span>
            <span className="text-foreground">€{dentist.teleconsultaPrice}</span>
          </div>
          {data.isUrgent && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('booking.urgencyFee')}</span>
              <span className="text-foreground">€5</span>
            </div>
          )}
          {discount > 0 && (
            <div className="flex justify-between text-sm text-emerald-400">
              <span>{t('booking.discount')} (-20%)</span>
              <span>-€{discount.toFixed(2)}</span>
            </div>
          )}
          <div className="border-t border-border pt-1 mt-1 flex justify-between text-sm font-bold">
            <span className="text-foreground">Total</span>
            <span className="text-primary">€{finalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Saved cards */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">{t('booking.savedCards')}</p>
        <button
          onClick={() => { setPaymentMethod('card'); setUseSavedCard(true); }}
          className={cn(
            'w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
            paymentMethod === 'card' && useSavedCard ? 'border-primary bg-primary/10 ring-1 ring-primary' : 'border-border bg-secondary hover:border-muted-foreground/40'
          )}
        >
          <CreditCard className="w-4 h-4" />
          <span className="text-sm font-medium text-foreground">Visa ****4532</span>
          <Star className="w-3 h-3 text-amber-400 ml-auto" />
        </button>
      </div>

      {/* Payment methods */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">{t('booking.otherMethod')}</p>
        {[
          { id: 'card-new', label: t('booking.newCard'), icon: <CreditCard className="w-4 h-4" />, expandable: true },
          { id: 'mbway', label: 'MB WAY', icon: <Smartphone className="w-4 h-4" />, expandable: false },
          { id: 'multibanco', label: 'Multibanco', icon: <Landmark className="w-4 h-4" />, expandable: false },
          { id: 'pontos', label: t('booking.pointsBalance', { balance: 850 }), icon: <Coins className="w-4 h-4" />, expandable: false },
        ].map(m => (
          <div key={m.id}>
            <button
              onClick={() => { setPaymentMethod(m.id); if (m.id === 'card-new') setUseSavedCard(false); }}
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
            {/* Inline card form — expands below "Novo cartão" when selected */}
            {m.id === 'card-new' && paymentMethod === 'card-new' && (
              <div className="space-y-3 animate-fade-in border border-border rounded-xl p-4 bg-secondary/30 mt-2">
          <div className="relative">
            <Input
              placeholder={t('booking.cardNumber')}
              value={cardNumber}
              onChange={e => {
                const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
                const formatted = raw.replace(/(.{4})/g, '$1 ').trim();
                setCardNumber(formatted);
              }}
              maxLength={19}
              className="pr-12"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {cardNumber.replace(/\s/g, '').startsWith('4') ? (
                <span className="text-xs font-bold text-blue-400">VISA</span>
              ) : cardNumber.replace(/\s/g, '').startsWith('5') ? (
                <span className="text-xs font-bold text-orange-400">MC</span>
              ) : cardNumber.replace(/\s/g, '').startsWith('3') ? (
                <span className="text-xs font-bold text-blue-300">AMEX</span>
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
            </div>
          </div>
          {cardNumber.length > 0 && cardNumber.replace(/\s/g, '').length < 16 && (
            <p className="text-xs text-destructive">{t('booking.cardNumberDigits')}</p>
          )}
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="MM/YY"
                value={cardExpiry}
                onChange={e => {
                  let val = e.target.value.replace(/\D/g, '').slice(0, 4);
                  if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2);
                  setCardExpiry(val);
                }}
                maxLength={5}
              />
              {cardExpiry.length > 0 && cardExpiry.length < 5 && (
                <p className="text-xs text-destructive mt-1">Formato: MM/AA</p>
              )}
            </div>
            <div className="w-24">
              <Input
                placeholder="CVV"
                value={cardCvv}
                onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                maxLength={3}
                type="password"
              />
              {cardCvv.length > 0 && cardCvv.length < 3 && (
                <p className="text-xs text-destructive mt-1">{t('booking.digits3')}</p>
              )}
            </div>
          </div>
          <Input
            placeholder={t('booking.cardName')}
            value={cardName}
            onChange={e => setCardName(e.target.value)}
          />
          {cardName.length === 0 && cardNumber.length > 0 && (
            <p className="text-xs text-destructive">{t('booking.nameRequired')}</p>
          )}
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={saveCard} onCheckedChange={(v) => setSaveCard(!!v)} />
            <span className="text-xs text-muted-foreground">{t('booking.saveCardFuture')}</span>
          </label>
              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  disabled={(() => {
                    const rawNum = cardNumber.replace(/\s/g, '');
                    return rawNum.length !== 16 || cardExpiry.length !== 5 || cardCvv.length !== 3 || cardName.trim().length === 0;
                  })()}
                  onClick={() => {
                    setPaymentMethod('card');
                    setUseSavedCard(true);
                    toast.success(t('booking.cardAdded'));
                  }}
                  className="text-xs"
                >
                  ✅ Confirmar Cartão
                </Button>
                <button
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => { setPaymentMethod(null); setCardNumber(''); setCardExpiry(''); setCardCvv(''); setCardName(''); }}
                >
                  Cancelar
                </button>
              </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* MB WAY */}
      {paymentMethod === 'mbway' && (
        <div className="animate-fade-in space-y-2">
          <Input placeholder={t('booking.phoneNumber')} value={mbwayPhone} onChange={e => setMbwayPhone(e.target.value)} maxLength={16} />
          <p className="text-xs text-muted-foreground">{t('booking.confirmOnPhone')}</p>
        </div>
      )}

      {/* Multibanco */}
      {paymentMethod === 'multibanco' && (
        <div className="animate-fade-in p-3 rounded-xl bg-secondary border border-border space-y-2">
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t('booking.entity')}</span><span className="text-foreground font-mono">21 312</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t('booking.reference')}</span><span className="text-foreground font-mono">123 456 789</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t('booking.value')}</span><span className="text-foreground font-bold">€{finalPrice.toFixed(2)}</span></div>
          <p className="text-xs text-muted-foreground">{t('booking.validFor24h')}</p>
        </div>
      )}

      {/* Points */}
      {paymentMethod === 'pontos' && (
        <div className="animate-fade-in p-3 rounded-xl bg-primary/10 border border-primary/20 space-y-1">
          <p className="text-sm text-foreground">Usar {Math.round(finalPrice * 10)} pontos (= €{finalPrice.toFixed(2)})</p>
          <p className="text-xs text-muted-foreground">Saldo após: {850 - Math.round(finalPrice * 10)} pts</p>
        </div>
      )}

      {/* Promo code */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Tag className="w-3 h-3" /> {t('booking.promoCode')}</p>
        <div className="flex gap-2">
          <Input placeholder={t('booking.code')} value={promoCode} onChange={e => { setPromoCode(e.target.value); setPromoApplied(null); }} className="flex-1" />
          <Button size="sm" variant="outline" onClick={handleApplyPromo}>{t('common.apply')}</Button>
        </div>
        {promoApplied === true && <p className="text-xs text-emerald-400">✅ -20% aplicado! Total: €{finalPrice.toFixed(2)}</p>}
        {promoApplied === false && <p className="text-xs text-destructive">❌ Código inválido</p>}
      </div>

      {/* Terms */}
      <label className="flex items-center gap-3 cursor-pointer">
        <Checkbox checked={acceptTerms} onCheckedChange={(v) => setAcceptTerms(!!v)} />
        <span className="text-xs text-muted-foreground">{t('booking.acceptTerms')}</span>
      </label>
    </div>
  );

  const renderProcessing = () => (
    <div className="flex flex-col items-center text-center space-y-5 py-16 animate-fade-in">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
      <p className="text-sm text-muted-foreground">{t('booking.processing')}</p>
    </div>
  );

  const renderSuccess = () => (
    <div className="flex flex-col items-center text-center space-y-5 py-8 animate-fade-in">
      {paymentFailed ? (
        <>
          <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center">
            <X className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">{t('booking.paymentFailed')}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t('booking.tryAgainOrChange')}</p>
          </div>
          <div className="flex gap-3 w-full pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setStep('payment')}>{t('booking.changeMethod')}</Button>
            <Button className="flex-1" onClick={handlePay}>{t('booking.tryAgain')}</Button>
          </div>
        </>
      ) : (
        <>
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Check className="w-8 h-8 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">{data.consultationType === 'teleconsulta' ? t('booking.paymentConfirmed') : t('booking.appointmentBooked')}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t('booking.confirmationEmail')}</p>
          </div>
          {data.consultationType === 'teleconsulta' && (
            <div className="w-full p-3 rounded-xl bg-secondary border border-border text-left space-y-1 text-xs text-muted-foreground">
              <p className="font-medium text-foreground text-sm">{t('booking.receipt')}</p>
              <p>Nº {receiptId}</p>
              <p>{data.date?.toLocaleDateString('pt-PT')} — €{finalPrice.toFixed(2)}</p>
              <p>{t('booking.method')}: {paymentMethod === 'card' ? 'Visa ****4532' : paymentMethod === 'mbway' ? 'MB WAY' : paymentMethod === 'pontos' ? 'Pontos SmileCheck' : 'Multibanco'}</p>
            </div>
          )}
          <div className="w-full space-y-2 text-left">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary border border-border">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">{initials}</div>
              <span className="text-sm font-semibold text-foreground">{dentist.name}</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary border border-border">
              <CalendarIcon className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm text-foreground">
                {data.date?.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })} às {data.time}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full pt-2">
            {data.consultationType === 'teleconsulta' && (
              <Button variant="outline" className="w-full gap-2" onClick={() => { generateReceipt('142', `Teleconsulta ${dentist.name}`, finalPrice, 'Visa ****4532'); toast.success('Recibo descarregado'); }}>
                <Download className="w-4 h-4" /> Descarregar Recibo
              </Button>
            )}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 border-border" onClick={() => { onGoHome ? onGoHome() : onComplete(); }}>
                Voltar ao Início
              </Button>
              <Button className="flex-1" onClick={onClose}>
                Ver na Agenda
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 'clinic': return renderClinicStep();
      case 'type': return renderTypeStep();
      case 'datetime': return renderDateTimeStep();
      case 'confirm': return renderConfirmStep();
      case 'payment': return renderPaymentStep();
      case 'processing': return renderProcessing();
      case 'success': return renderSuccess();
    }
  };

  const renderButtons = () => {
    if (step === 'success' || step === 'processing') return null;
    return (
      <div className="flex gap-3 pt-4">
        {currentIdx === 0 ? (
          <Button variant="outline" className="flex-1 border-border" onClick={onClose}>{t('common.cancel')}</Button>
        ) : (
          <Button variant="outline" className="flex-1 border-border" onClick={goPrev}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
          </Button>
        )}
        {step === 'confirm' ? (
          <Button className="flex-1" onClick={handleConfirm}>
            {data.consultationType === 'teleconsulta' ? t('common.next') : t('common.confirm')}
            {data.consultationType !== 'teleconsulta' && <Check className="w-4 h-4 ml-1" />}
            {data.consultationType === 'teleconsulta' && <ChevronRight className="w-4 h-4 ml-1" />}
          </Button>
        ) : step === 'payment' ? (
          <Button className="flex-1" onClick={handlePay} disabled={!canProceed()}>
            Pagar €{finalPrice.toFixed(2)}
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
      {step !== 'success' && step !== 'processing' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{t('common.step')} {currentIdx + 1} {t('common.of')} {visibleSteps.length}</span>
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
        {step !== 'success' && step !== 'processing' && (
          <div className="flex gap-3 p-4 border-t border-border bg-background">
            {currentIdx === 0 ? (
              <Button variant="outline" className="flex-1 border-border" onClick={onClose}>{t('common.cancel')}</Button>
            ) : (
              <Button variant="outline" className="flex-1 border-border" onClick={goPrev}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
              </Button>
            )}
            {step === 'confirm' ? (
              <Button className="flex-1" onClick={handleConfirm}>
                {data.consultationType === 'teleconsulta' ? t('common.next') : t('common.confirm')}
                {data.consultationType !== 'teleconsulta' && <Check className="w-4 h-4 ml-1" />}
                {data.consultationType === 'teleconsulta' && <ChevronRight className="w-4 h-4 ml-1" />}
              </Button>
            ) : step === 'payment' ? (
              <Button className="flex-1" onClick={handlePay} disabled={!canProceed()}>
                Pagar €{finalPrice.toFixed(2)}
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
