import { useState } from 'react';
import { Search, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UserRole } from '@/types/calendar';
import { ConsultationReasonSelector } from '../ConsultationReasonSelector';
import { mockDentists, mockClinics } from '@/data/mockData';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const DURATION_OPTIONS = ['15min', '30min', '45min', '1h', '1h30', '2h'];

const timeOptions: string[] = [];
for (let h = 6; h <= 22; h++) {
  timeOptions.push(`${h.toString().padStart(2, '0')}:00`);
  if (h < 22) timeOptions.push(`${h.toString().padStart(2, '0')}:30`);
}

const MOCK_PATIENTS = [
  { id: '1', firstName: 'Maria', lastName: 'Silva', dob: '1985-03-15', phone: '912345678', email: 'maria@email.com' },
  { id: '2', firstName: 'João', lastName: 'Santos', dob: '1990-07-22', phone: '913456789', email: 'joao@email.com' },
  { id: '3', firstName: 'Ana', lastName: 'Costa', dob: '1978-11-30', phone: '914567890', email: 'ana@email.com' },
];

interface Props {
  initialDate: Date;
  initialTime: string;
  dentistKey?: string;
  dentistName?: string;
  userRole: UserRole;
  onClose: () => void;
}

export function ConsultationTab({ initialDate, initialTime, dentistKey, dentistName, userRole, onClose }: Props) {
  const { t } = useTranslation();
  const [selectedDentist, setSelectedDentist] = useState(dentistKey || '1-1');
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState('30min');
  const [date, setDate] = useState<Date>(initialDate);
  const [time, setTime] = useState(initialTime);
  const [waitListAuto, setWaitListAuto] = useState(false);
  const [waitListTop, setWaitListTop] = useState(false);
  const [title, setTitle] = useState(t('creationTabs.mr'));
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [country, setCountry] = useState('Portugal');
  const [city, setCity] = useState('');
  const [mobile, setMobile] = useState('');
  const [landline, setLandline] = useState('');
  const [email, setEmail] = useState('');
  const [referrer, setReferrer] = useState('');
  const [notes, setNotes] = useState('');
  const [patientSuggestions, setPatientSuggestions] = useState<typeof MOCK_PATIENTS>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const TITLE_OPTIONS = [t('creationTabs.mr'), t('creationTabs.mrs'), t('creationTabs.unknown')];

  const dentistOptions = mockClinics.flatMap(clinic =>
    mockDentists.slice(0, 3).map(d => ({
      key: `${clinic.id}-${d.id}`,
      label: `${d.name} (${clinic.name.replace('Clínica ', '')})`,
    }))
  );

  const searchPatient = (query: string, field: string) => {
    if (query.length < 2) { setShowSuggestions(false); return; }
    const results = MOCK_PATIENTS.filter(p => {
      const searchStr = `${p.firstName} ${p.lastName} ${p.phone} ${p.email} ${p.dob}`.toLowerCase();
      return searchStr.includes(query.toLowerCase());
    });
    setPatientSuggestions(results);
    setShowSuggestions(results.length > 0);
  };

  const selectPatient = (p: typeof MOCK_PATIENTS[0]) => {
    setFirstName(p.firstName);
    setLastName(p.lastName);
    setDob(p.dob);
    setMobile(p.phone);
    setEmail(p.email);
    setIsNewPatient(false);
    setShowSuggestions(false);
  };

  const handleCreate = () => {
    if (!reason) { toast.error(t('creationTabs.selectReasonError')); return; }
    if (!firstName.trim()) { toast.error(t('creationTabs.patientNameError')); return; }
    toast.success(t('creationTabs.consultationCreated'));
    onClose();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        <div className="max-w-[600px] mx-auto space-y-5">
          {/* Dentist/Agenda */}
          <section className="bg-card rounded-xl p-4 border border-border">
            <h3 className="text-xs font-semibold text-muted-foreground mb-2">{t('creationTabs.agendaDentist')}</h3>
            <Select value={selectedDentist} onValueChange={setSelectedDentist}>
              <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {dentistOptions.map(d => (
                  <SelectItem key={d.key} value={d.key}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </section>

          {/* Reason */}
          <section className="bg-card rounded-xl p-4 border border-border">
            <h3 className="text-xs font-semibold text-muted-foreground mb-2">{t('creationTabs.consultationReason')}</h3>
            <ConsultationReasonSelector value={reason} onChange={setReason} />
            <div className="mt-3">
              <Label className="text-xs">{t('creationTabs.duration')}</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="text-sm mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          {/* Date/Time */}
          <section className="bg-card rounded-xl p-4 border border-border">
            <h3 className="text-xs font-semibold text-muted-foreground mb-2">{t('creationTabs.schedule')}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">{t('creationTabs.date')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs mt-1">
                      {format(date, 'dd/MM/yyyy', { locale: pt })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={date} onSelect={d => d && setDate(d)} className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label className="text-xs">{t('creationTabs.time')}</Label>
                <Select value={time} onValueChange={setTime}>
                  <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-48">
                    {timeOptions.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* Wait List */}
          <section className="bg-card rounded-xl p-4 border border-border space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground mb-1">{t('creationTabs.waitList')}</h3>
            <div className="flex items-center justify-between">
              <Label className="text-xs">{t('creationTabs.waitListNotify')}</Label>
              <Switch checked={waitListAuto} onCheckedChange={setWaitListAuto} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">{t('creationTabs.waitListTop')}</Label>
              <Switch checked={waitListTop} onCheckedChange={setWaitListTop} />
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-xs text-primary flex items-center gap-1 hover:underline">
                    <HelpCircle className="w-3 h-3" />
                    {t('creationTabs.waitListHelp')}
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">{t('creationTabs.waitListDesc')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </section>

          {/* Patient */}
          <section className="bg-card rounded-xl p-4 border border-border space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground mb-1">{t('creationTabs.patient')}</h3>
            <div className="flex gap-2">
              {TITLE_OPTIONS.map(t => (
                <Button key={t} variant={title === t ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setTitle(t)}>
                  {t}
                </Button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={isNewPatient} onChange={e => setIsNewPatient(e.target.checked)} className="rounded" />
              {t('creationTabs.newPatient')}
            </label>

            <div className="relative">
              <Label className="text-xs">{t('creationTabs.firstName')}</Label>
              <div className="relative">
                <Input
                  value={firstName}
                  onChange={e => { setFirstName(e.target.value); searchPatient(e.target.value, 'name'); }}
                  onFocus={() => firstName.length >= 2 && setShowSuggestions(patientSuggestions.length > 0)}
                  placeholder={t('creationTabs.searchPlaceholder')}
                  className="text-sm pr-8"
                />
                <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              </div>
              {showSuggestions && (
                <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {patientSuggestions.map(p => (
                    <button
                      key={p.id}
                      onClick={() => selectPatient(p)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-muted/30 border-b border-border last:border-0"
                    >
                      <span className="font-medium">{p.firstName} {p.lastName}</span>
                      <span className="text-muted-foreground ml-2">{p.phone}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label className="text-xs">{t('creationTabs.lastName')}</Label>
              <Input value={lastName} onChange={e => { setLastName(e.target.value); searchPatient(e.target.value, 'name'); }} placeholder={t('creationTabs.searchPlaceholder')} className="text-sm" />
            </div>

            <div>
              <Label className="text-xs">{t('creationTabs.dateOfBirth')}</Label>
              <Input type="date" value={dob} onChange={e => { setDob(e.target.value); searchPatient(e.target.value, 'dob'); }} className="text-sm" />
            </div>

            <div>
              <Label className="text-xs">{t('creationTabs.birthCountry')}</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Portugal', 'Brasil', 'Angola', 'Moçambique', 'Cabo Verde', 'Espanha', 'França', 'Reino Unido', 'Outro'].map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">{t('creationTabs.birthCity')}</Label>
              <Input value={city} onChange={e => setCity(e.target.value)} className="text-sm" />
            </div>

            <div>
              <Label className="text-xs">{t('creationTabs.mobile')}</Label>
              <Input value={mobile} onChange={e => { setMobile(e.target.value); searchPatient(e.target.value, 'phone'); }} placeholder={t('creationTabs.searchPlaceholder')} className="text-sm" />
            </div>

            <div>
              <Label className="text-xs">{t('creationTabs.landline')}</Label>
              <Input value={landline} onChange={e => setLandline(e.target.value)} className="text-sm" />
            </div>

            <div>
              <Label className="text-xs">{t('creationTabs.email')}</Label>
              <Input type="email" value={email} onChange={e => { setEmail(e.target.value); searchPatient(e.target.value, 'email'); }} placeholder={t('creationTabs.searchPlaceholder')} className="text-sm" />
            </div>
          </section>

          {/* Referrer */}
          <section className="bg-card rounded-xl p-4 border border-border">
            <h3 className="text-xs font-semibold text-muted-foreground mb-2">{t('creationTabs.referrer')}</h3>
            <Input value={referrer} onChange={e => setReferrer(e.target.value)} placeholder={t('creationTabs.referrerPlaceholder')} className="text-sm" />
            <p className="text-[10px] text-muted-foreground mt-1">{t('creationTabs.referrerNote')}</p>
          </section>

          {/* Notes */}
          <section className="bg-card rounded-xl p-4 border border-border">
            <h3 className="text-xs font-semibold text-muted-foreground mb-2">{t('creationTabs.notes')}</h3>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder={t('creationTabs.notesPlaceholder')} rows={3} className="text-sm" />
          </section>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="border-t border-border bg-card px-4 py-3 flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={onClose}>{t('creationTabs.cancel')}</Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.info(t('creationTabs.findOtherTime'))}>
            {t('creationTabs.findOtherTime')}
          </Button>
          <Button size="sm" onClick={handleCreate}>{t('creationTabs.createConsultation')}</Button>
        </div>
      </div>
    </div>
  );
}