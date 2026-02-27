import { useState } from 'react';
import { X, ArrowLeft, User, Camera, Trash2, Building2, Plus } from 'lucide-react';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger } from
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
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSms, setNotifSms] = useState(false);
  const [notifReminders, setNotifReminders] = useState(true);

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

  const content =
  <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
        {isMobile ?
      <>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-base font-semibold">Editar Perfil</h2>
            <div className="w-10" />
          </> :

      <>
            <h2 className="text-base font-semibold">Editar Perfil</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </>
      }
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
              </div>

              <SectionTitle>Morada</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldGroup label="Morada" className="md:col-span-2">
                  <Input value={patientAddress} onChange={(e) => setPatientAddress(e.target.value)} />
                </FieldGroup>
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
              <SectionTitle>Notificações</SectionTitle>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Notificações por email</span>
                  <Switch checked={notifEmail} onCheckedChange={setNotifEmail} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Notificações por SMS</span>
                  <Switch checked={notifSms} onCheckedChange={setNotifSms} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Lembretes de consulta</span>
                  <Switch checked={notifReminders} onCheckedChange={setNotifReminders} />
                </div>
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
                <FieldGroup label="Email">
                  <Input type="email" value={dentistEmail} onChange={(e) => setDentistEmail(e.target.value)} />
                </FieldGroup>
                <FieldGroup label="Telefone">
                  <Input value={dentistPhone} onChange={(e) => setDentistPhone(e.target.value)} />
                </FieldGroup>
                <FieldGroup label="Data de nascimento">
                  <Input type="date" value={dentistBirthDate} onChange={(e) => setDentistBirthDate(e.target.value)} />
                </FieldGroup>
              </div>

              <SectionTitle>Dados Profissionais</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldGroup label="Número da Ordem">
                  <Input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} />
                </FieldGroup>
                <FieldGroup label="País da Ordem">
                  <Input value={orderCountry} onChange={(e) => setOrderCountry(e.target.value)} />
                </FieldGroup>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Especialidades</Label>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES.map((s) =>
              <Badge
                key={s}
                variant={selectedSpecialties.includes(s) ? 'default' : 'outline'}
                className="cursor-pointer transition-colors"
                onClick={() => toggleMultiSelect(selectedSpecialties, setSelectedSpecialties, s)}>

                      {s}
                    </Badge>
              )}
                </div>
              </div>

              <FieldGroup label={`Sobre (${dentistBio.length}/500)`}>
                <Textarea
              value={dentistBio}
              onChange={(e) => e.target.value.length <= 500 && setDentistBio(e.target.value)}
              rows={3}
              placeholder="Descreva a sua experiência..." />

              </FieldGroup>

              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Idiomas</Label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((l) =>
              <Badge
                key={l}
                variant={selectedLanguages.includes(l) ? 'default' : 'outline'}
                className="cursor-pointer transition-colors"
                onClick={() => toggleMultiSelect(selectedLanguages, setSelectedLanguages, l)}>

                      {l}
                    </Badge>
              )}
                </div>
              </div>

              <Separator />
              <SectionTitle>Disponibilidade</SectionTitle>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Aceita novos pacientes</span>
                <Switch checked={acceptsNewPatients} onCheckedChange={setAcceptsNewPatients} />
              </div>

              <SectionTitle>Teleconsulta</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldGroup label="Preço teleconsulta (€)">
                  <Input type="number" value={teleconsultPrice} onChange={(e) => setTeleconsultPrice(e.target.value)} />
                </FieldGroup>
                <div className="flex items-center justify-between md:items-end">
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
                        <Switch
                  checked={d.active}
                  onCheckedChange={(checked) => {
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

                <span className="text-destructive text-xs px-0 pl-[10px]">Não trabalha</span>
                }
                      </div>
              )}
                  </div>
                </div>
          )}

              <Separator />
              <SectionTitle>Notificações</SectionTitle>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Notificações por email</span>
                  <Switch checked={dentistNotifEmail} onCheckedChange={setDentistNotifEmail} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Notificações por SMS</span>
                  <Switch checked={dentistNotifSms} onCheckedChange={setDentistNotifSms} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Alertas de marcações</span>
                  <Switch checked={dentistNotifBookings} onCheckedChange={setDentistNotifBookings} />
                </div>
              </div>
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
                <FieldGroup label="Email">
                  <Input type="email" value={clinicEmail} onChange={(e) => setClinicEmail(e.target.value)} />
                </FieldGroup>
                <FieldGroup label="Telefone">
                  <Input value={clinicPhone} onChange={(e) => setClinicPhone(e.target.value)} />
                </FieldGroup>
                <FieldGroup label="NIF/NIPC">
                  <Input value={clinicNif} onChange={(e) => setClinicNif(e.target.value)} />
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
                <FieldGroup label="Website">
                  <Input value={clinicWebsite} onChange={(e) => setClinicWebsite(e.target.value)} />
                </FieldGroup>
              </div>

              <FieldGroup label={`Descrição (${clinicDescription.length}/1000)`}>
                <Textarea
              value={clinicDescription}
              onChange={(e) => e.target.value.length <= 1000 && setClinicDescription(e.target.value)}
              rows={3} />

              </FieldGroup>

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
                  <Input
                placeholder="Novo serviço..."
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newService.trim()) {
                    setClinicServices([...clinicServices, newService.trim()]);
                    setNewService('');
                  }
                }}
                className="flex-1" />

                  <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  if (newService.trim()) {
                    setClinicServices([...clinicServices, newService.trim()]);
                    setNewService('');
                  }
                }}>

                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Separator />
              <SectionTitle>Disponibilidade</SectionTitle>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Aceita novos pacientes</span>
                <Switch checked={clinicAcceptsNewPatients} onCheckedChange={setClinicAcceptsNewPatients} />
              </div>

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
                {['Acesso a cadeira de rodas', 'Elevador', 'WC adaptado', 'Estacionamento reservado', 'Estacionamento gratuito', 'Próximo de transportes públicos'].map((acc) =>
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
                    <Switch
                checked={h.open}
                onCheckedChange={(checked) => {
                  const updated = [...clinicHours];
                  updated[i] = { ...updated[i], open: checked };
                  setClinicHours(updated);
                }} />

                    {h.open ?
              <>
                        <Input
                  type="time"
                  value={h.start}
                  onChange={(e) => {
                    const updated = [...clinicHours];
                    updated[i] = { ...updated[i], start: e.target.value };
                    setClinicHours(updated);
                  }}
                  className="w-28 h-8 text-xs" />

                        <span className="text-muted-foreground">-</span>
                        <Input
                  type="time"
                  value={h.end}
                  onChange={(e) => {
                    const updated = [...clinicHours];
                    updated[i] = { ...updated[i], end: e.target.value };
                    setClinicHours(updated);
                  }}
                  className="w-28 h-8 text-xs" />

                      </> :

              <span className="text-destructive text-xs">Encerrado</span>
              }
                  </div>
            )}
              </div>

              <Separator />
              <SectionTitle>Notificações</SectionTitle>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Notificações por email</span>
                  <Switch checked={clinicNotifEmail} onCheckedChange={setClinicNotifEmail} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Relatórios semanais</span>
                  <Switch checked={clinicWeeklyReports} onCheckedChange={setClinicWeeklyReports} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Marcações online</span>
                  <Switch checked={clinicOnlineBookings} onCheckedChange={setClinicOnlineBookings} />
                </div>
              </div>
            </>
        }

          <Separator />

          {/* Security section */}
          <div className="space-y-3">
            <Button variant="outline" className="w-full">Alterar password</Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full gap-2">
                  <Trash2 className="w-4 h-4" />
                  Eliminar conta
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

  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-background z-[65] flex flex-col pb-[60px]">
        {content}
      </div>);

  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[65] flex items-center justify-center" onClick={onClose}>
      <div
        className="bg-card rounded-xl border border-border shadow-2xl w-full max-w-[600px] max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}>

        {content}
      </div>
    </div>);

}