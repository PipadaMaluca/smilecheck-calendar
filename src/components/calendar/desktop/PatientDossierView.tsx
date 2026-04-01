import { useState, useMemo } from 'react';
import { User, Phone, Mail, MapPin, MessageCircle, FileText, AlertTriangle, Pill, Camera, ChevronDown, ChevronUp, Upload, Eye, ArrowLeft, Star, Video, Calendar as CalendarIcon, Check, SkipForward } from 'lucide-react';
import { UserRole } from '@/types/calendar';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CATEGORY_COLORS, CATEGORY_LABELS, getCategoryBadgeStyle } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { ClickableDentistName } from '@/components/search/ClickableDentistName';
import { ClickableClinicName } from '@/components/search/ClickableClinicName';
import { useTeleconsulta } from '@/contexts/TeleconsultaContext';
import { generateClinicalAlerts, calculateRecall, SEVERITY_CONFIG, ClinicalAlert } from '@/data/clinicalSafetyData';
import { toast } from 'sonner';

interface PatientDossierViewProps {
  patientId: string;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  userRole?: UserRole;
}

const MOCK_PATIENT_DATA: Record<string, any> = {
  default: {
    name: 'Ana Ferreira',
    age: 51,
    phone: '+351 944 444 444',
    email: 'ana.ferreira@email.com',
    address: 'Rua das Flores 45, 1200-195 Lisboa',
    dob: '12/03/1975',
    gender: 'Feminino',
    birthCountry: 'Portugal',
    birthCity: 'Lisboa',
    idNumber: '12345678',
    bloodType: 'A+',
    height: '165 cm',
    weight: '62 kg',
    allergies: ['Penicilina', 'Látex'],
    medications: [
      { name: 'Varfarina', dosage: '5mg/dia', interaction: 'Risco com AINEs' },
      { name: 'Omeprazol', dosage: '20mg/dia' },
    ],
    conditions: ['Hipertensão', 'Diabetes Tipo 2'],
    vaccines: ['COVID-19 (3 doses)', 'Tétano (2024)', 'Gripe (2025)'],
    prescriptions: [
      { id: 'rx1', date: '15 Jan 2026', dentist: 'Dr. Gonçalo Pipo', medications: ['Ibuprofeno 400mg', 'Amoxicilina 500mg'] },
      { id: 'rx2', date: '02 Dez 2025', dentist: 'Dr. Alexandre Bernardo', medications: ['Paracetamol 1g'] },
    ],
    referrals: [
      { id: 'ref1', date: '10 Jan 2026', from: 'Dr. Gonçalo Pipo', to: 'Dr. Frederico Cardoso', reason: 'Avaliação cirúrgica dente 38' },
    ],
    images: [
      { id: 'img1', date: '15 Jan 2026', category: 'Ortopantomografia', description: 'Panorâmica inicial', uploadedBy: 'Dr. Gonçalo Pipo' },
      { id: 'img2', date: '02 Dez 2025', category: 'Foto Intraoral', description: 'Dente 46 pré-tratamento', uploadedBy: 'Paciente' },
      { id: 'img3', date: '18 Out 2025', category: 'Radiografia Periapical', description: 'Dente 15', uploadedBy: 'Dr. Alexandre Bernardo' },
    ],
    consultations: [
      { date: '31 Jan 2026', time: '10:30', type: 'Urgência', category: 'urgencia', dentist: 'Dr. Gonçalo Pipo', clinic: 'Clínica SmileCheck', status: 'Em sala de espera', price: 80, hasPrescription: true, notes: 'Dor aguda dente 46' },
      { date: '15 Jan 2026', time: '09:00', type: 'Restauração', category: 'restauracao', dentist: 'Dr. Gonçalo Pipo', clinic: 'Clínica SmileCheck', status: 'Concluída', price: 60, hasPrescription: true, notes: 'Dente 15 face oclusal' },
      { date: '02 Dez 2025', time: '14:30', type: 'Destartarização', category: 'destartarizacao', dentist: 'Dr. Alexandre Bernardo', clinic: 'Clínica SmileCheck', status: 'Concluída', price: 50, hasPrescription: false, notes: 'Limpeza semestral' },
      { date: '18 Out 2025', time: '10:00', type: '1ª Consulta', category: 'primeira_consulta', dentist: 'Dr. Gonçalo Pipo', clinic: 'Clínica SmileCheck', status: 'Concluída', price: 40, hasPrescription: false, notes: 'Avaliação inicial completa' },
      { date: '05 Jun 2025', time: '16:00', type: 'Teleconsulta', category: 'teleconsulta', dentist: 'Dr. Gil Santos', clinic: 'Clínica SmileCheck', status: 'Concluída', price: 25, hasPrescription: false, notes: 'Follow-up pós-extração' },
    ],
  },
};

const IMAGE_CATEGORIES = ['Radiografia Periapical', 'Ortopantomografia', 'Teleradiografia', 'CBCT', 'Foto Intraoral', 'Outro'];

export function PatientDossierView({ patientId, onClose, onNavigate, userRole }: PatientDossierViewProps) {
  const { t } = useTranslation();
  const [clinicalNotes, setClinicalNotes] = useState('Paciente com boa higiene oral. Acompanhamento periodontal recomendado.');
  const [expandedConsultation, setExpandedConsultation] = useState<number | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewPrescription, setPreviewPrescription] = useState<any | null>(null);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Set<string>>(new Set());
  const [showIgnoreDropdown, setShowIgnoreDropdown] = useState<string | null>(null);
  const startTeleconsulta = useTeleconsulta();

  const data = MOCK_PATIENT_DATA.default;
  const hasTeleconsultaToday = data.consultations.some((c: any) => c.category === 'teleconsulta' && c.date === '05 Jun 2025');

  const filteredConsultations = useMemo(() => {
    if (userRole === 'dentist') {
      return data.consultations.filter((c: any) => c.dentist === 'Dr. Gonçalo Pipo');
    }
    return data.consultations;
  }, [userRole, data.consultations]);

  // Clinical Safety System
  const clinicalAlerts = useMemo(() =>
    generateClinicalAlerts(data.conditions, data.medications, data.allergies),
    [data.conditions, data.medications, data.allergies]
  );

  const recall = useMemo(() =>
    calculateRecall(data.conditions, '15 Jan 2026'),
    [data.conditions]
  );

  const handleAcknowledge = (alertId: string) => {
    setAcknowledgedAlerts(prev => new Set([...prev, alertId]));
    toast.success(t('dossier.alertConfirmed'));
  };

  const handleIgnore = (alertId: string, reason: string) => {
    setAcknowledgedAlerts(prev => new Set([...prev, alertId]));
    setShowIgnoreDropdown(null);
    toast.success(`${t('dossier.alertIgnored')}: ${reason}`);
  };

  const isDentist = userRole === 'dentist';
  const isClinic = userRole === 'clinic';

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-5">
          {/* Header: Info left, Actions right */}
          <div className="flex flex-col md:flex-row items-start gap-5">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="w-18 h-18 md:w-20 md:h-20 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <User className="w-9 h-9 md:w-10 md:h-10 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-foreground">{data.name}</h1>
                <p className="text-sm text-muted-foreground mt-0.5">{data.age} anos</p>
                <div className="flex flex-col gap-1 mt-2 text-sm">
                  <a href={`tel:${data.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <Phone className="w-3.5 h-3.5" /> {data.phone}
                  </a>
                  <a href={`mailto:${data.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <Mail className="w-3.5 h-3.5" /> {data.email}
                  </a>
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" /> {data.address}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons — desktop: right column, mobile: below info */}
            <div className={cn(
              'shrink-0 flex flex-col gap-2',
              'w-full md:w-[200px]'
            )}>
              {isDentist ? (
                <>
                  <Button size="sm" variant="secondary" className="gap-1.5 w-full md:justify-start" onClick={() => startTeleconsulta(data.name, hasTeleconsultaToday)}>
                    <Video className="w-3.5 h-3.5" /> {t('dossier.startTeleconsult')}
                  </Button>
                  <Button size="sm" variant="secondary" className="gap-1.5 w-full md:justify-start" onClick={() => onNavigate('conversas')}>
                    <MessageCircle className="w-3.5 h-3.5" /> {t('dossier.sendMessage')}
                  </Button>
                  <Button size="sm" variant="secondary" className="gap-1.5 w-full md:justify-start" onClick={() => onNavigate('prescrever')}>
                    <Pill className="w-3.5 h-3.5" /> {t('dossier.prescribeReceipt')}
                  </Button>
                  <Button size="sm" variant="secondary" className="gap-1.5 w-full md:justify-start" onClick={() => onNavigate('referencia')}>
                    <FileText className="w-3.5 h-3.5" /> {t('dossier.recommendPatient')}
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 w-full md:justify-start border-destructive/30 text-destructive hover:bg-destructive/10">
                    <AlertTriangle className="w-3.5 h-3.5" /> {t('dossier.blockPatient')}
                  </Button>
                </>
              ) : isClinic ? (
                <>
                  <Button size="sm" variant="secondary" className="gap-1.5 w-full md:justify-start" onClick={() => onNavigate('conversas')}>
                    <MessageCircle className="w-3.5 h-3.5" /> {t('dossier.sendMessage')}
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 w-full md:justify-start border-destructive/30 text-destructive hover:bg-destructive/10">
                    <AlertTriangle className="w-3.5 h-3.5" /> {t('dossier.blockPatient')}
                  </Button>
                </>
              ) : null}
            </div>
          </div>

          {/* 2-Column Grid: Left = Dados Pessoais + Saúde merged, Right = Alertas + Medicação */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* LEFT COLUMN */}
            <div className="space-y-4">
              {/* Dados Pessoais */}
              <div className="bg-card rounded-xl border border-border p-4 space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase">{t('dossier.personalData')}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">{t('dossier.birthDate')}:</span> <span className="ml-1">{data.dob}</span></div>
                  <div><span className="text-muted-foreground">{t('dossier.gender')}:</span> <span className="ml-1">{data.gender}</span></div>
                  <div><span className="text-muted-foreground">{t('dossier.country')}:</span> <span className="ml-1">{data.birthCountry}</span></div>
                  <div><span className="text-muted-foreground">{t('dossier.city')}:</span> <span className="ml-1">{data.birthCity}</span></div>
                  <div className="col-span-2"><span className="text-muted-foreground">{t('dossier.idNumber')}:</span> <span className="ml-1">{data.idNumber}</span></div>
                </div>
              </div>

              {/* Saúde (merged box) */}
              <div className="bg-card rounded-xl border border-border p-4 space-y-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase">Saúde</h3>
                {/* Mini cards */}
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="bg-secondary/50 rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-muted-foreground">Tipo Sanguíneo</p>
                    <p className="font-bold text-base mt-0.5">{data.bloodType}</p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-muted-foreground">Altura</p>
                    <p className="font-bold text-base mt-0.5">{data.height}</p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-muted-foreground">Peso</p>
                    <p className="font-bold text-base mt-0.5">{data.weight}</p>
                  </div>
                </div>
                <Separator className="my-1" />
                {/* Condições Médicas */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-semibold text-muted-foreground uppercase">Condições Médicas</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {data.conditions.map((c: string) => (
                      <span key={c} className="text-xs px-2.5 py-1 rounded-full bg-secondary text-foreground">{c}</span>
                    ))}
                  </div>
                </div>
                <Separator className="my-1" />
                {/* Alergias */}
                <div className={cn('space-y-2 rounded-lg p-2.5', data.allergies.length > 0 ? 'bg-destructive/5 border border-destructive/20' : '')}>
                  <h4 className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                    {data.allergies.length > 0 && <AlertTriangle className="w-3.5 h-3.5 text-destructive" />}
                    Alergias e Intolerâncias
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {data.allergies.map((a: string) => (
                      <span key={a} className="text-xs px-2.5 py-1 rounded-full bg-destructive/20 text-destructive font-medium">{a}</span>
                    ))}
                    {data.allergies.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma alergia registada</p>}
                  </div>
                </div>
                <Separator className="my-1" />
                {/* Vacinas */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-semibold text-muted-foreground uppercase">Vacinas</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {data.vaccines.map((v: string) => (
                      <span key={v} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary">{v}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-4">
              {/* Alertas Clínicos */}
              {(isDentist || isClinic) && clinicalAlerts.length > 0 && (
                <div className="bg-yellow-500/5 rounded-xl border border-yellow-500/20 p-4 space-y-3">
                  <h3 className="text-xs font-semibold text-yellow-400 uppercase flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Alertas Clínicos ({clinicalAlerts.length})
                  </h3>
                  <div className="space-y-2">
                    {clinicalAlerts.map((alert) => {
                      const sev = SEVERITY_CONFIG[alert.severity];
                      const isAck = acknowledgedAlerts.has(alert.id);
                      return (
                        <div key={alert.id} className={cn('rounded-lg p-3 border', sev.bg, sev.border, isAck && 'opacity-60')}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold flex items-center gap-1.5">
                                {sev.icon} {alert.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
                            </div>
                            <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded', sev.bg, sev.text)}>{sev.label}</span>
                          </div>
                          {isAck ? (
                            <p className="text-[10px] text-emerald-400 mt-1.5 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Verificado por Dr. Gonçalo Pipo — 31 Jan 2026
                            </p>
                          ) : (isDentist || isClinic) && (
                            <div className="flex items-center gap-2 mt-2">
                              <Button size="sm" variant="ghost" className="h-6 text-[11px] gap-1 text-emerald-400 hover:text-emerald-300" onClick={() => handleAcknowledge(alert.id)}>
                                <Check className="w-3 h-3" /> Confirmar
                              </Button>
                              <div className="relative">
                                <Button size="sm" variant="ghost" className="h-6 text-[11px] gap-1 text-muted-foreground" onClick={() => setShowIgnoreDropdown(showIgnoreDropdown === alert.id ? null : alert.id)}>
                                  <SkipForward className="w-3 h-3" /> Ignorar
                                </Button>
                                {showIgnoreDropdown === alert.id && (
                                  <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 py-1 w-40">
                                    {['Já verificado', 'Não aplicável', 'Outro'].map(r => (
                                      <button key={r} className="w-full text-left px-3 py-1.5 text-xs hover:bg-secondary/50" onClick={() => handleIgnore(alert.id, r)}>{r}</button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {(isDentist || isClinic) && clinicalAlerts.length === 0 && (
                <div className="bg-card rounded-xl border border-border p-4 space-y-3">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Alertas Clínicos
                  </h3>
                  <p className="text-sm text-muted-foreground">✅ Sem alertas clínicos ativos</p>
                </div>
              )}

              {/* Medicação Atual */}
              <div className="bg-card rounded-xl border border-border p-4 space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5" /> Medicação Atual
                </h3>
                <div className="space-y-2">
                  {data.medications.map((m: any) => (
                    <div key={m.name} className={cn('text-sm p-2.5 rounded-lg', m.interaction ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-secondary/30')}>
                      <span className="font-medium">{m.name}</span> <span className="text-muted-foreground">— {m.dosage}</span>
                      {m.interaction && <p className="text-xs text-yellow-400 mt-0.5">⚠️ {m.interaction}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Below grid: Recall + Histórico + Documentos (unchanged) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(isDentist || isClinic) && (
              <div className={cn('rounded-xl border p-4 space-y-3', recall.isOverdue ? 'bg-destructive/5 border-destructive/20' : 'bg-card border-border')}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5" /> Recall Recomendado
                </h3>
                <p className="text-lg font-bold text-foreground">
                  A cada {recall.intervalMonths[0]}{recall.intervalMonths[0] !== recall.intervalMonths[1] ? `-${recall.intervalMonths[1]}` : ''} meses
                </p>
                <p className="text-xs text-muted-foreground">{recall.reason}</p>
                <div className="text-sm space-y-1">
                  <p className="text-muted-foreground">Última consulta: {recall.lastVisitDate}</p>
                  <p className={cn('font-medium', recall.isOverdue ? 'text-destructive' : 'text-foreground')}>
                    Próxima recomendada: {recall.nextRecommendedDate}
                  </p>
                  {recall.isOverdue && (
                    <p className="text-xs text-destructive font-semibold mt-1">
                      🔴 ATENÇÃO: Consulta em atraso! Última visita há {Math.floor((recall.overdueDays || 0) / 30)} meses.
                    </p>
                  )}
                </div>
                <Button size="sm" variant="secondary" className="gap-1.5 w-full mt-1" onClick={() => onNavigate('agendar')}>
                  <CalendarIcon className="w-3.5 h-3.5" /> Agendar Consulta
                </Button>
              </div>
            )}

            <div className="bg-card rounded-xl border border-border p-4 space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase">Histórico de Consultas</h3>
              <div className="space-y-2">
                {filteredConsultations.slice(0, 5).map((c: any, i: number) => {
                  const catColor = CATEGORY_COLORS[c.category as keyof typeof CATEGORY_COLORS];
                  const isExpanded = expandedConsultation === i;
                  return (
                    <div key={i} className="border border-border/50 rounded-lg overflow-hidden">
                      <button
                        className="w-full flex items-center gap-2 p-2.5 text-left hover:bg-secondary/30 transition-colors"
                        onClick={() => setExpandedConsultation(isExpanded ? null : i)}
                      >
                        <div className="w-1 h-7 rounded-full shrink-0" style={{ backgroundColor: catColor?.hex || undefined }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{c.date} — {c.time}</span>
                            <div className="flex items-center gap-1.5">
                              {c.hasPrescription && <FileText className="w-3 h-3 text-primary" />}
                              <span className="text-[10px] text-muted-foreground">{c.status}</span>
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap">
                            <span className="px-1.5 py-0 rounded-full text-[10px] font-medium" style={getCategoryBadgeStyle(catColor?.hex || '#9E9E9E')}>{c.type}</span>
                            {userRole !== 'dentist' && <> • <ClickableDentistName name={c.dentist} className="text-xs text-muted-foreground" /></>}
                            • <ClickableClinicName name={c.clinic} className="text-xs text-muted-foreground" />
                          </p>
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="px-3 pb-2.5 pt-0 space-y-1 border-t border-border/30">
                          {c.price && <p className="text-xs text-muted-foreground">Valor: €{c.price}</p>}
                          {c.notes && <p className="text-xs text-muted-foreground">Notas: {c.notes}</p>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Documentos + Radiografias side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card rounded-xl border border-border p-4 space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase">Documentos</h3>
              <Tabs defaultValue="receitas">
                <TabsList className="bg-secondary/50 h-8">
                  <TabsTrigger value="receitas" className="text-[11px] h-6">Receitas</TabsTrigger>
                  <TabsTrigger value="cartas" className="text-[11px] h-6">Cartas</TabsTrigger>
                  <TabsTrigger value="exames" className="text-[11px] h-6">Exames</TabsTrigger>
                  <TabsTrigger value="outros" className="text-[11px] h-6">Outros</TabsTrigger>
                </TabsList>
                <TabsContent value="receitas" className="space-y-2 mt-2">
                  {data.prescriptions.map((rx: any) => (
                    <div key={rx.id} className="flex items-center justify-between p-2.5 bg-secondary/30 rounded-lg">
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{rx.date}</p>
                        <p className="text-xs text-muted-foreground"><ClickableDentistName name={rx.dentist} className="text-xs text-muted-foreground" /></p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{rx.medications.join(', ')}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="gap-1 text-[11px] shrink-0" onClick={() => setPreviewPrescription(rx)}>
                        <Eye className="w-3 h-3" /> Ver
                      </Button>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="cartas" className="space-y-2 mt-2">
                  {data.referrals.map((ref: any) => (
                    <div key={ref.id} className="p-2.5 bg-secondary/30 rounded-lg">
                      <p className="text-sm font-medium">{ref.date}</p>
                      <p className="text-xs text-muted-foreground">De: <ClickableDentistName name={ref.from} className="text-xs text-muted-foreground" /> → Para: <ClickableDentistName name={ref.to} className="text-xs text-muted-foreground" /></p>
                      <p className="text-xs text-muted-foreground mt-0.5">{ref.reason}</p>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="exames" className="mt-2">
                  <p className="text-sm text-muted-foreground">Nenhum exame registado</p>
                </TabsContent>
                <TabsContent value="outros" className="mt-2">
                  <p className="text-sm text-muted-foreground">Nenhum documento adicional</p>
                </TabsContent>
              </Tabs>
            </div>

            <div className="bg-card rounded-xl border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase">Radiografias e Imagens</h3>
                <Button size="sm" variant="secondary" className="gap-1.5 text-[11px]" onClick={() => setShowUploadModal(true)}>
                  <Upload className="w-3 h-3" /> Upload
                </Button>
              </div>
              <Tabs defaultValue="radiografias">
                <TabsList className="bg-secondary/50 h-8">
                  <TabsTrigger value="radiografias" className="text-[11px] h-6">Radiografias</TabsTrigger>
                  <TabsTrigger value="fotos" className="text-[11px] h-6">Fotos</TabsTrigger>
                </TabsList>
                <TabsContent value="radiografias" className="mt-2">
                  <div className="grid grid-cols-2 gap-3">
                    {data.images.filter((img: any) => img.category !== 'Foto Intraoral' && img.category !== 'Foto Frontal').map((img: any) => (
                      <button key={img.id} className="bg-secondary/50 rounded-lg p-2.5 text-left hover:bg-secondary/70 transition-colors" onClick={() => setPreviewImage(img.id)}>
                        <div className="w-full aspect-square rounded-lg bg-muted flex items-center justify-center mb-1.5">
                          <Camera className="w-6 h-6 text-muted-foreground/30" />
                        </div>
                        <p className="text-xs font-medium truncate">{img.category}</p>
                        <p className="text-[10px] text-muted-foreground">{img.date}</p>
                      </button>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="fotos" className="mt-2">
                  <div className="grid grid-cols-2 gap-3">
                    {data.images.filter((img: any) => img.category === 'Foto Intraoral' || img.category === 'Foto Frontal').map((img: any) => (
                      <button key={img.id} className="bg-secondary/50 rounded-lg p-2.5 text-left hover:bg-secondary/70 transition-colors" onClick={() => setPreviewImage(img.id)}>
                        <div className="w-full aspect-square rounded-lg bg-muted flex items-center justify-center mb-1.5">
                          <Camera className="w-6 h-6 text-muted-foreground/30" />
                        </div>
                        <p className="text-xs font-medium truncate">{img.category}</p>
                        <p className="text-[10px] text-muted-foreground">{img.date}</p>
                      </button>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Notas Clínicas */}
          <div className="bg-card rounded-xl border border-border p-4 space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase">Notas Clínicas Gerais</h3>
            <Textarea
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="Notas gerais sobre o paciente..."
              className="min-h-[80px] bg-secondary/50 border-border text-sm"
            />
          </div>
        </div>
      </ScrollArea>

      {/* Preview Prescription Modal */}
      {previewPrescription && (
        <>
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" onClick={() => setPreviewPrescription(null)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-card rounded-xl border border-border p-6 z-50 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">Receita — {previewPrescription.date}</h3>
              <Button variant="ghost" size="icon" onClick={() => setPreviewPrescription(null)}><ArrowLeft className="w-4 h-4" /></Button>
            </div>
            <p className="text-sm text-muted-foreground">{previewPrescription.dentist}</p>
            <Separator />
            <div className="space-y-1">
              {previewPrescription.medications.map((m: string, i: number) => (
                <p key={i} className="text-sm">💊 {m}</p>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Preview Image Modal */}
      {previewImage && (
        <>
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" onClick={() => setPreviewImage(null)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-lg bg-card rounded-xl border border-border p-6 z-50 flex flex-col items-center gap-4">
            <div className="w-full flex justify-start">
              <Button variant="ghost" size="icon" onClick={() => setPreviewImage(null)}><ArrowLeft className="w-4 h-4" /></Button>
            </div>
            <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center">
              <Camera className="w-16 h-16 text-muted-foreground/20" />
            </div>
            <p className="text-sm text-muted-foreground">Pré-visualização de imagem</p>
          </div>
        </>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <>
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" onClick={() => setShowUploadModal(false)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-card rounded-xl border border-border p-6 z-50 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">Upload de Imagem</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowUploadModal(false)}><ArrowLeft className="w-4 h-4" /></Button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Categoria</label>
                <select className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm">
                  {IMAGE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Descrição</label>
                <input className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm" placeholder="Descrição da imagem..." />
              </div>
              <div className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Clique ou arraste o ficheiro</p>
              </div>
              <Button className="w-full">Fazer Upload</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
