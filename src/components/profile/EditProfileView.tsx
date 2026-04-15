import { useState } from 'react';
import { X, ArrowLeft, User, Camera, Trash2, Building2, Plus, Search as SearchIcon, Briefcase, Lock, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserRole } from '@/types/calendar';
import { mockDentists, mockClinics } from '@/data/mockData';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from
'@/components/ui/alert-dialog';

interface EditProfileViewProps {
  userRole: UserRole;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  inline?: boolean;
}

const SPECIALTIES = [
'Generalista', 'Ortodontia', 'Implantologia', 'Endodontia',
'Periodontia', 'Odontopediatria', 'Cirurgia Oral', 'Prostodontia', 'Estética Dentária'];


const LANGUAGES = ['Português', 'Inglês', 'Francês', 'Espanhol', 'Alemão', 'Italiano'];
const WEEKDAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const JOB_TYPES = ['Tempo Inteiro', 'Tempo Parcial', 'Freelancer', 'Substituição'];
const JOB_PERIODS = ['Manhãs', 'Tardes', 'Noites', 'Fins de semana'];
const BENEFITS_OPTIONS = ['Seguro de saúde', 'Formação contínua paga', 'Participação em congressos', 'Material clínico incluído', 'Estacionamento', 'Alimentação'];
const PAYMENT_METHODS = ['Cartão', 'MB WAY', 'Multibanco', 'Espèces', 'CB', 'Chèque', 'Transferência'];
const INSURANCE_OPTIONS = ['Médis', 'Multicare', 'AdvanceCare', 'ADSE', 'Mutuelle générale', 'MGEN', 'Harmonie'];
const ACCESSIBILITY_OPTIONS = ['Acesso a cadeira de rodas', 'Elevador', 'WC adaptado', 'Estacionamento reservado', 'Estacionamento gratuito', 'Próximo de transportes públicos'];
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function DentistJobToggles() {
  const [enabled, setEnabled] = useState(false);
  const [jobTypes, setJobTypes] = useState<string[]>([]);
  const [periods, setPeriods] = useState<string[]>([]);
  const [specificHours, setSpecificHours] = useState('');
  const [teleconsultas, setTeleconsultas] = useState(false);
  const [showSalary, setShowSalary] = useState(false);
  const [salary, setSalary] = useState('');
  const [negotiable, setNegotiable] = useState(true);
  const [availableDate, setAvailableDate] = useState('');
  const [note, setNote] = useState('');
  const { t } = useTranslation();

  const toggle = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SearchIcon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">{t('editProfile.availableForOpportunities')}</span>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>
      {enabled &&
      <div className="space-y-4 pl-2 border-l-2 border-primary/20 ml-2">
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">{t('editProfile.typeWanted')}</Label>
            <div className="flex flex-wrap gap-2">
              {JOB_TYPES.map((jt) =>
            <Badge key={jt} variant={jobTypes.includes(jt) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggle(jobTypes, setJobTypes, jt)}>{jt}</Badge>
            )}
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">{t('editProfile.scheduleAvailability')}</Label>
            <div className="flex flex-wrap gap-2">
              {JOB_PERIODS.map((p) =>
            <Badge key={p} variant={periods.includes(p) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggle(periods, setPeriods, p)}>{p}</Badge>
            )}
            </div>
          </div>
          <div>
            <Label className="text-xs">{t('editProfile.specificHours')}</Label>
            <Input placeholder={t('editProfile.specificHoursPlaceholder')} value={specificHours} onChange={(e) => setSpecificHours(e.target.value)} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">{t('editProfile.teleconsultAvailableLabel')}</span>
            <Switch checked={teleconsultas} onCheckedChange={setTeleconsultas} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">{t('editProfile.showSalary')}</span>
            <Switch checked={showSalary} onCheckedChange={setShowSalary} />
          </div>
          {showSalary &&
        <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">{t('editProfile.salaryExpectation')}</Label>
                <Input type="number" placeholder={t('editProfile.salaryExample')} value={salary} onChange={(e) => setSalary(e.target.value)} />
              </div>
              <div className="flex items-center gap-2 self-end">
                <input type="checkbox" checked={negotiable} onChange={() => setNegotiable(!negotiable)} className="rounded" />
                <span className="text-xs">{t('editProfile.negotiable')}</span>
              </div>
            </div>
        }
          <div>
            <Label className="text-xs">{t('editProfile.availabilityDate')}</Label>
            <Input type="date" value={availableDate} onChange={(e) => setAvailableDate(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">{t('editProfile.additionalNote')}</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder={t('editProfile.additionalInfo')} />
          </div>
          <p className="text-[10px] text-muted-foreground bg-amber-500/10 border border-amber-500/20 rounded-lg p-2">
            {t('editProfile.visibleToClinics')}
          </p>
        </div>
      }
    </div>);

}

function ClinicJobToggles() {
  const [enabled, setEnabled] = useState(false);
  const [contractTypes, setContractTypes] = useState<string[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [schedule, setSchedule] = useState('');
  const [salaryValue, setSalaryValue] = useState('');
  const [salaryType, setSalaryType] = useState('Mensal');
  const [benefits, setBenefits] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [description, setDescription] = useState('');
  const { t } = useTranslation();

  const toggle = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SearchIcon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">{t('editProfile.lookingForDentists')}</span>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>
      {enabled &&
      <div className="space-y-4 pl-2 border-l-2 border-primary/20 ml-2">
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">{t('editProfile.contractType')}</Label>
            <div className="flex flex-wrap gap-2">
              {JOB_TYPES.map((jt) =>
            <Badge key={jt} variant={contractTypes.includes(jt) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggle(contractTypes, setContractTypes, jt)}>{jt}</Badge>
            )}
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">{t('editProfile.specialtiesSought')}</Label>
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES.map((s) =>
            <Badge key={s} variant={specialties.includes(s) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggle(specialties, setSpecialties, s)}>{s}</Badge>
            )}
            </div>
          </div>
          <div>
            <Label className="text-xs">{t('editProfile.schedule')}</Label>
            <Input placeholder={t('editProfile.schedulePlaceholder')} value={schedule} onChange={(e) => setSchedule(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">{t('editProfile.baseSalary')}</Label>
              <Input type="number" placeholder={t('editProfile.salaryExample')} value={salaryValue} onChange={(e) => setSalaryValue(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">{t('editProfile.salaryType')}</Label>
              <Select value={salaryType} onValueChange={setSalaryType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mensal">{t('editProfile.perMonth')}</SelectItem>
                  <SelectItem value="Por consulta">{t('editProfile.perConsultation')}</SelectItem>
                  <SelectItem value="Percentagem">{t('editProfile.percentPerConsultation')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs mb-2 block">{t('editProfile.benefitsOffered')}</Label>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {BENEFITS_OPTIONS.map((b) =>
            <label key={b} className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" checked={benefits.includes(b)} onChange={() => toggle(benefits, setBenefits, b)} className="rounded" />
                  {b}
                </label>
            )}
            </div>
          </div>
          <div>
            <Label className="text-xs">{t('editProfile.startDate')}</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">{t('editProfile.jobDescription')}</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder={t('editProfile.jobDescPlaceholder')} />
          </div>
          <p className="text-[10px] text-muted-foreground bg-amber-500/10 border border-amber-500/20 rounded-lg p-2">
            {t('editProfile.visibleToDentists')}
          </p>
        </div>
      }
    </div>);

}

  if (inline) {
    return <div className="max-w-2xl mx-auto">{content}</div>;
  }

  return (
    <div className="fixed inset-0 bg-background z-[65] flex flex-col pb-[60px]">
      {content}
    </div>);

}