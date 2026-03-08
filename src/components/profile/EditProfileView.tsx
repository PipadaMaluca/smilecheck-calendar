import { useState } from 'react';
import { X, ArrowLeft, User, Camera, Trash2, Building2, Plus, Search as SearchIcon, Briefcase, Lock, Globe } from 'lucide-react';
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

  const toggle = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SearchIcon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Disponível para novas oportunidades</span>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>
      {enabled &&
      <div className="space-y-4 pl-2 border-l-2 border-primary/20 ml-2">
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Tipo pretendido</Label>
            <div className="flex flex-wrap gap-2">
              {JOB_TYPES.map((t) =>
            <Badge key={t} variant={jobTypes.includes(t) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggle(jobTypes, setJobTypes, t)}>{t}</Badge>
            )}
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Disponibilidade horária</Label>
            <div className="flex flex-wrap gap-2">
              {JOB_PERIODS.map((p) =>
            <Badge key={p} variant={periods.includes(p) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggle(periods, setPeriods, p)}>{p}</Badge>
            )}
            </div>
          </div>
          <div>
            <Label className="text-xs">Horários específicos (opcional)</Label>
            <Input placeholder="Ex: Seg e Qua tardes" value={specificHours} onChange={(e) => setSpecificHours(e.target.value)} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Disponível para teleconsultas</span>
            <Switch checked={teleconsultas} onCheckedChange={setTeleconsultas} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Mostrar expectativa salarial?</span>
            <Switch checked={showSalary} onCheckedChange={setShowSalary} />
          </div>
          {showSalary &&
        <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Expectativa (€)</Label>
                <Input type="number" placeholder="Ex: 2500" value={salary} onChange={(e) => setSalary(e.target.value)} />
              </div>
              <div className="flex items-center gap-2 self-end">
                <input type="checkbox" checked={negotiable} onChange={() => setNegotiable(!negotiable)} className="rounded" />
                <span className="text-xs">Negociável</span>
              </div>
            </div>
        }
          <div>
            <Label className="text-xs">Data de disponibilidade</Label>
            <Input type="date" value={availableDate} onChange={(e) => setAvailableDate(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Nota adicional</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Informações adicionais..." />
          </div>
          <p className="text-[10px] text-muted-foreground bg-amber-500/10 border border-amber-500/20 rounded-lg p-2">
            ⚠️ Esta informação é visível apenas para clínicas na secção Propostas de Trabalho.
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

  const toggle = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SearchIcon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">À procura de dentistas</span>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>
      {enabled &&
      <div className="space-y-4 pl-2 border-l-2 border-primary/20 ml-2">
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Tipo de contrato oferecido</Label>
            <div className="flex flex-wrap gap-2">
              {JOB_TYPES.map((t) =>
            <Badge key={t} variant={contractTypes.includes(t) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggle(contractTypes, setContractTypes, t)}>{t}</Badge>
            )}
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Especialidades procuradas</Label>
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES.map((s) =>
            <Badge key={s} variant={specialties.includes(s) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggle(specialties, setSpecialties, s)}>{s}</Badge>
            )}
            </div>
          </div>
          <div>
            <Label className="text-xs">Horário</Label>
            <Input placeholder="Ex: Seg-Sex 14:00-20:00" value={schedule} onChange={(e) => setSchedule(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Remuneração base</Label>
              <Input type="number" placeholder="Valor" value={salaryValue} onChange={(e) => setSalaryValue(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Tipo</Label>
              <Select value={salaryType} onValueChange={setSalaryType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mensal">€/mês</SelectItem>
                  <SelectItem value="Por consulta">€/consulta</SelectItem>
                  <SelectItem value="Percentagem">%/consulta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs mb-2 block">Benefícios oferecidos</Label>
            <div className="grid grid-cols-2 gap-2">
              {BENEFITS_OPTIONS.map((b) =>
            <label key={b} className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" checked={benefits.includes(b)} onChange={() => toggle(benefits, setBenefits, b)} className="rounded" />
                  {b}
                </label>
            )}
            </div>
          </div>
          <div>
            <Label className="text-xs">Data de início</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Descrição da vaga</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Descreva a oportunidade..." />
          </div>
          <p className="text-[10px] text-muted-foreground bg-amber-500/10 border border-amber-500/20 rounded-lg p-2">
            ⚠️ Esta informação é visível apenas para dentistas na secção Propostas de Trabalho.
          </p>
        </div>
      }
    </div>);

}

function SectionTitle({ children }: {children: React.ReactNode;}) {
  return <h4 className="text-sm font-semibold text-foreground mb-3">{children}</h4>;
}

function FieldGroup({ label, children, className }: {label: string;children: React.ReactNode;className?: string;}) {
  return (
    <div className={className}>
      <Label className="text-xs text-muted-foreground mb-1.5 block">{label}</Label>
      {children}
    </div>);

}

function PrivacyField({ label, children, className }: {label: string;children: React.ReactNode;className?: string;}) {
  const [isPrivate, setIsPrivate] = useState(true);
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1.5">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <button onClick={() => setIsPrivate(!isPrivate)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
          <Lock className="w-3 h-3" />
          {isPrivate ? 'Privado' : 'Público'}
        </button>
      </div>
      {children}
    </div>);

}

export function EditProfileView({ userRole, isOpen, onClose, onSave, inline }: EditProfileViewProps) {
  const isMobile = useIsMobile();

  // Patient state
  const [patientName, setPatientName] = useState('João Silva');
  const [patientEmail, setPatientEmail] = useState('joao.silva@email.com');
  const [patientPhone, setPatientPhone] = useState('+351 912 000 001');
  const [patientBirthDate, setPatientBirthDate] = useState('1981-03-15');
  const [patientGender, setPatientGender] = useState('masculino');
  const [patientAddress, setPatientAddress] = useState('Rua das Flores 42, 3º Esq.');
  const [patientPostalCode, setPatientPostalCode] = useState('1200-123');
  const [patientCity, setPatientCity] = useState('Lisboa');
  const [patientCountry, setPatientCountry] = useState('Portugal');
  const [patientBio, setPatientBio] = useState('Paciente regular com foco em prevenção. Acompanhamento desde 2023.');
  const [patientBloodType, setPatientBloodType] = useState('O+');
  const [patientLanguages, setPatientLanguages] = useState<string[]>(['Português', 'Inglês']);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSms, setNotifSms] = useState(false);
  const [notifPush, setNotifPush] = useState(true);
  const [notifReminders, setNotifReminders] = useState(true);
  const [familyMembers, setFamilyMembers] = useState([
  { name: 'Maria Silva', age: '42', relation: 'Esposa' },
  { name: 'Pedro Silva', age: '12', relation: 'Filho' }]
  );

  // Dentist state
  const [dentistName, setDentistName] = useState(mockDentists[0].name);
  const [dentistEmail, setDentistEmail] = useState('goncalo.pipo@smilecheck.pt');
  const [dentistPhone, setDentistPhone] = useState('+351 910 000 000');
  const [dentistBirthDate, setDentistBirthDate] = useState('1985-07-22');
  const [orderNumber, setOrderNumber] = useState('OMD-12345');
  const [orderCountry, setOrderCountry] = useState('Portugal');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(['Generalista', 'Endodontia', 'Cirurgia Oral']);
  const [dentistBio, setDentistBio] = useState('Dentista com 12 anos de experiência em medicina dentária generalista.');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['Português', 'Inglês', 'Francês']);
  const [teleconsultPrice, setTeleconsultPrice] = useState('20');
  const [acceptsUrgencies, setAcceptsUrgencies] = useState(true);
  const [urgencyPrice, setUrgencyPrice] = useState('40');
  const [dentistNotifEmail, setDentistNotifEmail] = useState(true);
  const [dentistNotifSms, setDentistNotifSms] = useState(false);
  const [dentistNotifBookings, setDentistNotifBookings] = useState(true);
  const [acceptsNewPatients, setAcceptsNewPatients] = useState(true);
  const [teleconsultaAvailable, setTeleconsultaAvailable] = useState(true);
  const [dentistYearsExp, setDentistYearsExp] = useState('15');
  const [dentistUniversity, setDentistUniversity] = useState('Universidade de Lisboa - Faculdade de Medicina Dentária');
  const [dentistSchedules, setDentistSchedules] = useState([
  { clinic: 'Clínica SmileCheck', days: WEEKDAYS.map((d, i) => ({ day: d, active: i < 5, start: '09:00', end: '19:00' })) },
  { clinic: 'Clínica Mitry-Mory', days: WEEKDAYS.map((d, i) => ({ day: d, active: i === 2 || i === 5, start: i === 2 ? '14:00' : '09:00', end: i === 2 ? '19:00' : '13:00' })) }]
  );

  // Clinic state
  const [clinicName, setClinicName] = useState(mockClinics[0].name);
  const [clinicEmail, setClinicEmail] = useState('info@smilecheck.pt');
  const [clinicPhone, setClinicPhone] = useState('+351 211 000 000');
  const [clinicNif, setClinicNif] = useState('509 123 456');
  const [clinicAddress, setClinicAddress] = useState(mockClinics[0].address);
  const [clinicPostalCode, setClinicPostalCode] = useState('1250-096');
  const [clinicCity, setClinicCity] = useState('Lisboa');
  const [clinicCountry, setClinicCountry] = useState('Portugal');
  const [clinicWebsite, setClinicWebsite] = useState('www.smilecheck.pt');
  const [clinicDescription, setClinicDescription] = useState('Clínica dentária moderna localizada no coração de Lisboa.');
  const [clinicServices, setClinicServices] = useState<string[]>(['Implantologia', 'Ortodontia', 'Endodontia', 'Cirurgia Oral']);
  const [newService, setNewService] = useState('');
  const [clinicLanguages, setClinicLanguages] = useState<string[]>(['Português', 'Inglês', 'Francês']);
  const [clinicYearsExp, setClinicYearsExp] = useState('10');
  const [clinicCertifications, setClinicCertifications] = useState('ISO 9001');
  const [clinicTeleconsultaPrice, setClinicTeleconsultaPrice] = useState('20');
  const [clinicPaymentMethods, setClinicPaymentMethods] = useState<string[]>(['Cartão', 'MB WAY', 'Multibanco']);
  const [clinicInsurances, setClinicInsurances] = useState<string[]>(['Médis', 'Multicare', 'AdvanceCare', 'ADSE']);
  const [clinicTeleconsultas, setClinicTeleconsultas] = useState(true);
  const [clinicHours, setClinicHours] = useState(
    WEEKDAYS.map((day, i) => ({
      day,
      open: i < 6,
      start: i < 5 ? '09:00' : i === 5 ? '09:00' : '',
      end: i < 5 ? '21:00' : i === 5 ? '13:00' : ''
    }))
  );
  const [clinicNotifEmail, setClinicNotifEmail] = useState(true);
  const [clinicWeeklyReports, setClinicWeeklyReports] = useState(true);
  const [clinicOnlineBookings, setClinicOnlineBookings] = useState(true);
  const [clinicAcceptsNewPatients, setClinicAcceptsNewPatients] = useState(true);
  const [clinicXrayServices, setClinicXrayServices] = useState(['Raio-X Panorâmico', 'Raio-X Periapical']);
  const [clinicAccessibility, setClinicAccessibility] = useState(['Acesso a cadeira de rodas', 'Elevador']);

  if (!isOpen) return null;

  const toggleMultiSelect = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const handleSave = () => {
    toast.success('Perfil atualizado com sucesso');
    onSave();
  };

  const handleDeleteAccount = () => {
    toast.error('Conta eliminada (simulação)');
    onClose();
  };

  const addFamilyMember = () => {
    setFamilyMembers((prev) => [...prev, { name: '', age: '', relation: '' }]);
  };

  const removeFamilyMember = (idx: number) => {
    setFamilyMembers((prev) => prev.filter((_, i) => i !== idx));
  };

  const content =
  <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-base font-semibold">Editar Perfil</h2>
        <div className="w-10" />
      </div>

      <ScrollArea className="flex-1">
        <div className="p-5 space-y-6 pb-32 md:pb-6">
          {/* Photo */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                {userRole === 'clinic' ? <Building2 className="w-10 h-10 text-primary" /> : <User className="w-10 h-10 text-primary" />}
              </div>
              <button className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <span className="text-xs text-muted-foreground">Alterar {userRole === 'clinic' ? 'logo' : 'foto'}</span>
          </div>

          {/* ===== PATIENT FIELDS ===== */}
          {userRole === 'patient' &&
        <>
              <SectionTitle>Dados Pessoais</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldGroup label="Nome completo">
                  <Input value={patientName} onChange={(e) => setPatientName(e.target.value)} />
                </FieldGroup>
                <FieldGroup label="Email">
                  <Input type="email" value={patientEmail} onChange={(e) => setPatientEmail(e.target.value)} />
                </FieldGroup>
                <FieldGroup label="Telefone">
                  <Input value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} />
                </FieldGroup>
                <FieldGroup label="Data de nascimento">
                  <Input type="date" value={patientBirthDate} onChange={(e) => setPatientBirthDate(e.target.value)} />
                </FieldGroup>
                <FieldGroup label="Género">
                  <Select value={patientGender} onValueChange={setPatientGender}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="feminino">Feminino</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                      <SelectItem value="prefiro_nao_dizer">Prefiro não dizer</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldGroup>
                <FieldGroup label="Grupo sanguíneo">
                  <Select value={patientBloodType} onValueChange={setPatientBloodType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {BLOOD_TYPES.map((bt) => <SelectItem key={bt} value={bt}>{bt}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FieldGroup>
              </div>

              <FieldGroup label={`Sobre (${patientBio.length}/500)`}>
                <Textarea value={patientBio} onChange={(e) => e.target.value.length <= 500 && setPatientBio(e.target.value)} rows={3} placeholder="Descreva-se..." />
              </FieldGroup>

              <SectionTitle>Morada</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PrivacyField label="Morada" className="md:col-span-2">
                  <Input value={patientAddress} onChange={(e) => setPatientAddress(e.target.value)} />
                </PrivacyField>
                <FieldGroup label="Código postal">
                  <Input value={patientPostalCode} onChange={(e) => setPatientPostalCode(e.target.value)} />
                </FieldGroup>
                <FieldGroup label="Cidade">
                  <Input value={patientCity} onChange={(e) => setPatientCity(e.target.value)} />
                </FieldGroup>
                <FieldGroup label="País">
                  <Input value={patientCountry} onChange={(e) => setPatientCountry(e.target.value)} />
                </FieldGroup>
              </div>

              <Separator />
              <SectionTitle>Idiomas</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((l) =>
            <Badge key={l} variant={patientLanguages.includes(l) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggleMultiSelect(patientLanguages, setPatientLanguages, l)}>{l}</Badge>
            )}
              </div>

              <Separator />
              <SectionTitle>Familiares</SectionTitle>
              <div className="space-y-3">
                {familyMembers.map((fm, idx) =>
            <div key={idx} className="flex items-center gap-2">
                    <Input placeholder="Nome" value={fm.name} onChange={(e) => {const u = [...familyMembers];u[idx] = { ...u[idx], name: e.target.value };setFamilyMembers(u);}} className="flex-1" />
                    <Input placeholder="Idade" value={fm.age} onChange={(e) => {const u = [...familyMembers];u[idx] = { ...u[idx], age: e.target.value };setFamilyMembers(u);}} className="w-20" />
                    <Input placeholder="Relação" value={fm.relation} onChange={(e) => {const u = [...familyMembers];u[idx] = { ...u[idx], relation: e.target.value };setFamilyMembers(u);}} className="w-28" />
                    <Button variant="ghost" size="icon" onClick={() => removeFamilyMember(idx)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
            )}
                <Button variant="outline" size="sm" onClick={addFamilyMember} className="gap-1"><Plus className="w-3 h-3" /> Adicionar familiar</Button>
              </div>

              <Separator />
              <SectionTitle>Notificações</SectionTitle>
              <div className="space-y-3">
                <div className="flex items-center justify-between"><span className="text-sm">Notificações por email</span><Switch checked={notifEmail} onCheckedChange={setNotifEmail} /></div>
                <div className="flex items-center justify-between"><span className="text-sm">Notificações push</span><Switch checked={notifPush} onCheckedChange={setNotifPush} /></div>
                <div className="flex items-center justify-between"><span className="text-sm">Notificações por SMS</span><Switch checked={notifSms} onCheckedChange={setNotifSms} /></div>
                <div className="flex items-center justify-between"><span className="text-sm">Lembretes de consulta</span><Switch checked={notifReminders} onCheckedChange={setNotifReminders} /></div>
              </div>
            </>
        }

          {/* ===== DENTIST FIELDS ===== */}
          {userRole === 'dentist' &&
        <>
              <SectionTitle>Dados Pessoais</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldGroup label="Nome completo">
                  <Input value={dentistName} onChange={(e) => setDentistName(e.target.value)} />
                </FieldGroup>
                <PrivacyField label="Email">
                  <Input type="email" value={dentistEmail} onChange={(e) => setDentistEmail(e.target.value)} />
                </PrivacyField>
                <PrivacyField label="Telefone">
                  <Input value={dentistPhone} onChange={(e) => setDentistPhone(e.target.value)} />
                </PrivacyField>
                <PrivacyField label="Data de nascimento">
                  <Input type="date" value={dentistBirthDate} onChange={(e) => setDentistBirthDate(e.target.value)} />
                </PrivacyField>
              </div>

              <SectionTitle>Dados Profissionais</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PrivacyField label="Número da Ordem">
                  <Input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} />
                </PrivacyField>
                <FieldGroup label="País da Ordem">
                  <Input value={orderCountry} onChange={(e) => setOrderCountry(e.target.value)} />
                </FieldGroup>
                <FieldGroup label="Anos de experiência">
                  <Input type="number" value={dentistYearsExp} onChange={(e) => setDentistYearsExp(e.target.value)} />
                </FieldGroup>
                <FieldGroup label="Universidade / Formação">
                  <Input value={dentistUniversity} onChange={(e) => setDentistUniversity(e.target.value)} />
                </FieldGroup>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Especialidades</Label>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES.map((s) =>
              <Badge key={s} variant={selectedSpecialties.includes(s) ? 'default' : 'outline'} className="cursor-pointer transition-colors" onClick={() => toggleMultiSelect(selectedSpecialties, setSelectedSpecialties, s)}>{s}</Badge>
              )}
                </div>
              </div>

              <FieldGroup label={`Sobre (${dentistBio.length}/500)`}>
                <Textarea value={dentistBio} onChange={(e) => e.target.value.length <= 500 && setDentistBio(e.target.value)} rows={3} placeholder="Descreva a sua experiência..." />
              </FieldGroup>

              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Idiomas</Label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((l) =>
              <Badge key={l} variant={selectedLanguages.includes(l) ? 'default' : 'outline'} className="cursor-pointer transition-colors" onClick={() => toggleMultiSelect(selectedLanguages, setSelectedLanguages, l)}>{l}</Badge>
              )}
                </div>
              </div>

              <Separator />
              <SectionTitle>Disponibilidade</SectionTitle>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Aceita novos pacientes</span>
                  <Switch checked={acceptsNewPatients} onCheckedChange={setAcceptsNewPatients} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Disponível para teleconsultas</span>
                  <Switch checked={teleconsultaAvailable} onCheckedChange={setTeleconsultaAvailable} />
                </div>
              </div>

              <SectionTitle>Teleconsulta</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-[5px] mt-[10px] mb-0">
                <FieldGroup label="Preço teleconsulta (€)">
                  <Input type="number" value={teleconsultPrice} onChange={(e) => setTeleconsultPrice(e.target.value)} />
                </FieldGroup>
                <div className="items-center py-0 gap-0 mx-[200px] md:items-center justify-between flex flex-row ml-0 mr-0">
                  <span className="text-sm">Aceita urgências</span>
                  <Switch checked={acceptsUrgencies} onCheckedChange={setAcceptsUrgencies} />
                </div>
                {acceptsUrgencies &&
            <FieldGroup label="Preço urgência (€)">
                    <Input type="number" value={urgencyPrice} onChange={(e) => setUrgencyPrice(e.target.value)} />
                  </FieldGroup>
            }
              </div>

              <Separator />
              <SectionTitle>Horários por Clínica</SectionTitle>
              {dentistSchedules.map((sched, si) =>
          <div key={sched.clinic} className="mb-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">{sched.clinic}</p>
                  <div className="space-y-1.5">
                    {sched.days.map((d, di) =>
              <div key={d.day} className="flex items-center gap-2 text-sm">
                        <span className="w-16 text-xs text-muted-foreground">{d.day.slice(0, 3)}</span>
                        <Switch checked={d.active} onCheckedChange={(checked) => {
                  const updated = [...dentistSchedules];
                  updated[si].days[di] = { ...d, active: checked };
                  setDentistSchedules(updated);
                }} />
                        {d.active ?
                <>
                            <Input type="time" value={d.start} onChange={(e) => {
                    const updated = [...dentistSchedules];
                    updated[si].days[di] = { ...d, start: e.target.value };
                    setDentistSchedules(updated);
                  }} className="w-24 h-7 text-xs" />
                            <span className="text-muted-foreground">-</span>
                            <Input type="time" value={d.end} onChange={(e) => {
                    const updated = [...dentistSchedules];
                    updated[si].days[di] = { ...d, end: e.target.value };
                    setDentistSchedules(updated);
                  }} className="w-24 h-7 text-xs" />
                          </> :

                <span className="text-destructive text-xs pl-2">Não trabalha</span>
                }
                      </div>
              )}
                  </div>
                </div>
          )}

              <Separator />
              <SectionTitle>Notificações</SectionTitle>
              <div className="space-y-3">
                <div className="flex items-center justify-between"><span className="text-sm">Notificações por email</span><Switch checked={dentistNotifEmail} onCheckedChange={setDentistNotifEmail} /></div>
                <div className="flex items-center justify-between"><span className="text-sm">Notificações por SMS</span><Switch checked={dentistNotifSms} onCheckedChange={setDentistNotifSms} /></div>
                <div className="flex items-center justify-between"><span className="text-sm">Alertas de marcações</span><Switch checked={dentistNotifBookings} onCheckedChange={setDentistNotifBookings} /></div>
              </div>

              <Separator />
              <SectionTitle>
                <span className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-primary" /> Disponibilidade Profissional</span>
              </SectionTitle>
              <DentistJobToggles />
            </>
        }

          {/* ===== CLINIC FIELDS ===== */}
          {userRole === 'clinic' &&
        <>
              <SectionTitle>Dados da Clínica</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldGroup label="Nome">
                  <Input value={clinicName} onChange={(e) => setClinicName(e.target.value)} />
                </FieldGroup>
                <FieldGroup label="NIF/NIPC">
                  <Input value={clinicNif} onChange={(e) => setClinicNif(e.target.value)} />
                </FieldGroup>
                <FieldGroup label="Email">
                  <Input type="email" value={clinicEmail} onChange={(e) => setClinicEmail(e.target.value)} />
                </FieldGroup>
                <FieldGroup label="Telefone">
                  <Input value={clinicPhone} onChange={(e) => setClinicPhone(e.target.value)} />
                </FieldGroup>
                <FieldGroup label="Website">
                  <Input value={clinicWebsite} onChange={(e) => setClinicWebsite(e.target.value)} />
                </FieldGroup>
              </div>

              <SectionTitle>Morada</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldGroup label="Morada" className="md:col-span-2">
                  <Input value={clinicAddress} onChange={(e) => setClinicAddress(e.target.value)} />
                </FieldGroup>
                <FieldGroup label="Código postal">
                  <Input value={clinicPostalCode} onChange={(e) => setClinicPostalCode(e.target.value)} />
                </FieldGroup>
                <FieldGroup label="Cidade">
                  <Input value={clinicCity} onChange={(e) => setClinicCity(e.target.value)} />
                </FieldGroup>
                <FieldGroup label="País">
                  <Input value={clinicCountry} onChange={(e) => setClinicCountry(e.target.value)} />
                </FieldGroup>
              </div>

              <FieldGroup label={`Descrição (${clinicDescription.length}/1000)`}>
                <Textarea value={clinicDescription} onChange={(e) => e.target.value.length <= 1000 && setClinicDescription(e.target.value)} rows={3} />
              </FieldGroup>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldGroup label="Anos de experiência">
                  <Input type="number" value={clinicYearsExp} onChange={(e) => setClinicYearsExp(e.target.value)} />
                </FieldGroup>
                <FieldGroup label="Certificações">
                  <Input value={clinicCertifications} onChange={(e) => setClinicCertifications(e.target.value)} placeholder="Ex: ISO 9001" />
                </FieldGroup>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Idiomas</Label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((l) =>
              <Badge key={l} variant={clinicLanguages.includes(l) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggleMultiSelect(clinicLanguages, setClinicLanguages, l)}>{l}</Badge>
              )}
                </div>
              </div>

              <Separator />
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Serviços oferecidos</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {clinicServices.map((s) =>
              <Badge key={s} variant="secondary" className="gap-1">
                      {s}
                      <button onClick={() => setClinicServices(clinicServices.filter((x) => x !== s))} className="ml-1 hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
              )}
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Novo serviço..." value={newService} onChange={(e) => setNewService(e.target.value)}
              onKeyDown={(e) => {if (e.key === 'Enter' && newService.trim()) {setClinicServices([...clinicServices, newService.trim()]);setNewService('');}}}
              className="flex-1" />
                  <Button variant="outline" size="icon" onClick={() => {if (newService.trim()) {setClinicServices([...clinicServices, newService.trim()]);setNewService('');}}}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Separator />
              <SectionTitle>Disponibilidade</SectionTitle>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Aceita novos pacientes</span>
                  <Switch checked={clinicAcceptsNewPatients} onCheckedChange={setClinicAcceptsNewPatients} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Teleconsultas disponíveis</span>
                  <Switch checked={clinicTeleconsultas} onCheckedChange={setClinicTeleconsultas} />
                </div>
              </div>

              <SectionTitle>Tarifas</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldGroup label="Preço teleconsulta (€)">
                  <Input type="number" value={clinicTeleconsultaPrice} onChange={(e) => setClinicTeleconsultaPrice(e.target.value)} />
                </FieldGroup>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Métodos de pagamento</Label>
                <div className="flex flex-wrap gap-2">
                  {PAYMENT_METHODS.map((m) =>
              <Badge key={m} variant={clinicPaymentMethods.includes(m) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggleMultiSelect(clinicPaymentMethods, setClinicPaymentMethods, m)}>{m}</Badge>
              )}
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Convenções / Seguros</Label>
                <div className="flex flex-wrap gap-2">
                  {INSURANCE_OPTIONS.map((ins) =>
              <Badge key={ins} variant={clinicInsurances.includes(ins) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggleMultiSelect(clinicInsurances, setClinicInsurances, ins)}>{ins}</Badge>
              )}
                </div>
              </div>

              <Separator />
              <SectionTitle>Tipos de Raio-X</SectionTitle>
              <div className="space-y-2">
                {['Raio-X Panorâmico', 'Raio-X Periapical', 'Raio-X Cefalométrico', 'TAC Dentário'].map((xray) =>
            <label key={xray} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={clinicXrayServices.includes(xray)} onChange={() => {
                setClinicXrayServices((prev) => prev.includes(xray) ? prev.filter((x) => x !== xray) : [...prev, xray]);
              }} className="rounded" />
                    {xray}
                  </label>
            )}
              </div>

              <SectionTitle>Acessibilidade</SectionTitle>
              <div className="space-y-2">
                {ACCESSIBILITY_OPTIONS.map((acc) =>
            <label key={acc} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={clinicAccessibility.includes(acc)} onChange={() => {
                setClinicAccessibility((prev) => prev.includes(acc) ? prev.filter((x) => x !== acc) : [...prev, acc]);
              }} className="rounded" />
                    {acc}
                  </label>
            )}
              </div>

              <Separator />
              <SectionTitle>Horário de Funcionamento</SectionTitle>
              <div className="space-y-2">
                {clinicHours.map((h, i) =>
            <div key={h.day} className="flex items-center gap-2 text-sm">
                    <span className="w-20 text-muted-foreground">{h.day}</span>
                    <Switch checked={h.open} onCheckedChange={(checked) => {
                const updated = [...clinicHours];
                updated[i] = { ...updated[i], open: checked };
                setClinicHours(updated);
              }} />
                    {h.open ?
              <>
                        <Input type="time" value={h.start} onChange={(e) => {const u = [...clinicHours];u[i] = { ...u[i], start: e.target.value };setClinicHours(u);}} className="w-28 h-8 text-xs" />
                        <span className="text-muted-foreground">-</span>
                        <Input type="time" value={h.end} onChange={(e) => {const u = [...clinicHours];u[i] = { ...u[i], end: e.target.value };setClinicHours(u);}} className="w-28 h-8 text-xs" />
                      </> :

              <span className="text-destructive text-xs">Encerrado</span>
              }
                  </div>
            )}
              </div>

              <Separator />
              <SectionTitle>Notificações</SectionTitle>
              <div className="space-y-3">
                <div className="flex items-center justify-between"><span className="text-sm">Notificações por email</span><Switch checked={clinicNotifEmail} onCheckedChange={setClinicNotifEmail} /></div>
                <div className="flex items-center justify-between"><span className="text-sm">Relatórios semanais</span><Switch checked={clinicWeeklyReports} onCheckedChange={setClinicWeeklyReports} /></div>
                <div className="flex items-center justify-between"><span className="text-sm">Marcações online</span><Switch checked={clinicOnlineBookings} onCheckedChange={setClinicOnlineBookings} /></div>
              </div>

              <Separator />
              <SectionTitle>
                <span className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-primary" /> Recrutamento</span>
              </SectionTitle>
              <ClinicJobToggles />
            </>
        }

          <Separator />

          {/* Security section */}
          <div className="space-y-3">
            <Button variant="outline" className="w-full">Alterar password</Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full gap-2">
                  <Trash2 className="w-4 h-4" /> Eliminar conta
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Eliminar conta?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação é irreversível. Todos os seus dados serão permanentemente eliminados.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </ScrollArea>

      {/* Fixed bottom buttons */}
      <div className={`border-t border-border p-4 flex gap-3 flex-shrink-0 ${isMobile ? 'fixed bottom-0 left-0 right-0 bg-background z-10' : ''}`}>
        <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
        <Button className="flex-1" onClick={handleSave}>Guardar Alterações</Button>
      </div>
    </div>;


  if (inline) {
    return <div className="max-w-2xl mx-auto">{content}</div>;
  }

  return (
    <div className="fixed inset-0 bg-background z-[65] flex flex-col pb-[60px]">
      {content}
    </div>);

}