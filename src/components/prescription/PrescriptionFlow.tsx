import { useState, useMemo } from 'react';
import { X, Search, User, Pill, FileText, Check, Plus, QrCode, Download, Mail, Send, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { mockConsultations, mockDentists, mockClinics } from '@/data/mockData';
import {
  MEDICATIONS_WITH_TAGS,
  getMedicationAllergyBlock,
  getMedicationInteractions,
  type MedicationDef,
  type InteractionWarning } from
'@/data/drugSafetyData';

interface PrescriptionFlowProps {
  onClose: () => void;
  onGoHome?: () => void;
  preSelectedPatient?: {id: string;name: string;age: number;};
  inline?: boolean;
}

type PrescriptionStep = 'patient' | 'medications' | 'preview' | 'success';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  posology: string;
}

// Mock patient health data (mirrors HealthView's defaultHealthData)
const PATIENT_HEALTH: Record<string, {
  allergies: string[];
  medications: {name: string;dosage: string;}[];
}> = {
  'fm1': {
    allergies: ['Penicilina', 'Látex'],
    medications: [{ name: 'Ibuprofeno', dosage: '400mg' }, { name: 'Omeprazol', dosage: '20mg' }]
  },
  'fm2': {
    allergies: ['Aspirina'],
    medications: []
  },
  'gp-p2': {
    allergies: ['Penicilina'],
    medications: [{ name: 'Varfarina', dosage: '5mg' }]
  },
  'gp-p4': {
    allergies: ['Anti-inflamatórios não esteróides (AINEs)'],
    medications: [{ name: 'Losartan', dosage: '50mg' }]
  },
  'ab-p4': {
    allergies: [],
    medications: [{ name: 'Sertralina', dosage: '50mg' }]
  }
};

const getPatientHealth = (patientId: string) =>
PATIENT_HEALTH[patientId] || { allergies: [], medications: [] };

// Extract recent patients from consultations
const getRecentPatients = () => {
  const seen = new Map<string, {id: string;name: string;age: number;lastDate: Date;}>();
  mockConsultations.forEach((c) => {
    if (!seen.has(c.patient.id) || c.date > seen.get(c.patient.id)!.lastDate) {
      seen.set(c.patient.id, {
        id: c.patient.id,
        name: c.patient.name,
        age: c.patient.age || 30,
        lastDate: c.date
      });
    }
  });
  return Array.from(seen.values()).sort((a, b) => b.lastDate.getTime() - a.lastDate.getTime());
};

export function PrescriptionFlow({ onClose, onGoHome, preSelectedPatient }: PrescriptionFlowProps) {
  const isMobile = useIsMobile();
  const skipPatient = !!preSelectedPatient;

  const [currentStep, setCurrentStep] = useState<PrescriptionStep>(skipPatient ? 'medications' : 'patient');
  const [selectedPatient, setSelectedPatient] = useState<{id: string;name: string;age: number;} | null>(preSelectedPatient || null);
  const [patientSearch, setPatientSearch] = useState('');
  const [medications, setMedications] = useState<Medication[]>([]);
  const [medSearch, setMedSearch] = useState('');
  const [manualMode, setManualMode] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualDosage, setManualDosage] = useState('');
  const [manualPosology, setManualPosology] = useState('');
  const [sendToHealth, setSendToHealth] = useState(true);
  const [sendByEmail, setSendByEmail] = useState(false);
  const [downloadPdf, setDownloadPdf] = useState(false);

  const recentPatients = useMemo(() => getRecentPatients(), []);
  const filteredPatients = useMemo(() => {
    if (!patientSearch) return recentPatients.slice(0, 10);
    const q = patientSearch.toLowerCase();
    return recentPatients.filter((p) => p.name.toLowerCase().includes(q));
  }, [patientSearch, recentPatients]);

  // Patient health data for allergy/interaction checks
  const patientHealth = useMemo(() => {
    if (!selectedPatient) return { allergies: [], medications: [] };
    return getPatientHealth(selectedPatient.id);
  }, [selectedPatient]);

  const filteredMeds = useMemo(() => {
    if (!medSearch) return MEDICATIONS_WITH_TAGS;
    const q = medSearch.toLowerCase();
    return MEDICATIONS_WITH_TAGS.filter((m) => m.name.toLowerCase().includes(q) || m.dosage.toLowerCase().includes(q));
  }, [medSearch]);

  const steps: PrescriptionStep[] = skipPatient ?
  ['medications', 'preview', 'success'] :
  ['patient', 'medications', 'preview', 'success'];

  const stepIndex = steps.indexOf(currentStep);

  const addMedication = (name: string, dosage: string) => {
    setMedications((prev) => [...prev, {
      id: `med-${Date.now()}-${Math.random()}`,
      name,
      dosage,
      posology: ''
    }]);
  };

  const removeMedication = (id: string) => {
    setMedications((prev) => prev.filter((m) => m.id !== id));
  };

  const updatePosology = (id: string, posology: string) => {
    setMedications((prev) => prev.map((m) => m.id === id ? { ...m, posology } : m));
  };

  const addManualMedication = () => {
    if (manualName.trim()) {
      addMedication(manualName, manualDosage);
      setManualName('');
      setManualDosage('');
      setManualPosology('');
      setManualMode(false);
    }
  };

  const goNext = () => {
    const next = steps[stepIndex + 1];
    if (next) setCurrentStep(next);
  };

  const goPrev = () => {
    const prev = steps[stepIndex - 1];
    if (prev) setCurrentStep(prev);
  };

  const today = new Date();
  const rxCode = `RX${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const totalVisibleSteps = steps.filter((s) => s !== 'success').length;
  const currentStepNumber = Math.min(stepIndex + 1, totalVisibleSteps);

  // Progress bar
  const ProgressBar = () =>
  <div className="space-y-2 px-4 py-3">
      <p className="text-xs text-muted-foreground text-center">Passo {currentStepNumber} de {totalVisibleSteps}</p>
      <div className="flex items-center gap-2">
        {steps.filter((s) => s !== 'success').map((step, i) =>
      <div key={step} className="flex-1">
            <div className={cn(
          'h-1.5 rounded-full transition-all',
          i <= stepIndex && currentStep !== 'success' ? 'bg-primary' : 'bg-muted'
        )} />
          </div>
      )}
      </div>
    </div>;


  // Step 1: Patient Selection
  const renderPatientStep = () =>
  <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <h2 className="text-lg font-bold">Para quem é a receita?</h2>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
        placeholder="Pesquisar paciente..."
        value={patientSearch}
        onChange={(e) => setPatientSearch(e.target.value)}
        className="pl-9" />
      
      </div>
      <div className="space-y-2">
        {filteredPatients.map((patient) =>
      <button
        key={patient.id}
        onClick={() => setSelectedPatient(patient)}
        className={cn("w-full flex items-center p-3 rounded-lg border transition-all hover:border-primary hover:bg-primary/5 px-[10px] py-[5px] gap-[10px]",

        selectedPatient?.id === patient.id ? 'border-primary bg-primary/10' : 'border-border'
        )}>
        
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/20 text-primary text-xs">
                {patient.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="text-left flex-1">
              <p className="text-sm font-medium">{patient.name}</p>
              <p className="text-xs text-muted-foreground">{patient.age} anos</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">
                {patient.lastDate.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </p>
              {selectedPatient?.id === patient.id && <Check className="w-5 h-5 text-primary" />}
            </div>
          </button>
      )}
      </div>
    </div>;


  // Medication item with allergy/interaction checks
  const MedicationListItem = ({ med }: {med: MedicationDef;}) => {
    const alreadyAdded = medications.some((m) => m.name === med.name && m.dosage === med.dosage);
    const allergyBlock = getMedicationAllergyBlock(med, patientHealth.allergies);
    const interactions = getMedicationInteractions(med, patientHealth.medications);
    const isBlocked = !!allergyBlock;
    const hasInteraction = interactions.length > 0;

    const content =
    <button
      key={`${med.name}-${med.dosage}`}
      onClick={() => !alreadyAdded && !isBlocked && addMedication(med.name, med.dosage)}
      disabled={alreadyAdded || isBlocked}
      className={cn(
        'w-full flex items-center justify-between p-2.5 rounded-lg text-sm transition-all',
        isBlocked ?
        'opacity-50 cursor-not-allowed bg-muted/30' :
        alreadyAdded ?
        'bg-primary/10 text-primary cursor-default' :
        hasInteraction ?
        'hover:bg-muted/50 border border-amber-500/30 bg-amber-500/5' :
        'hover:bg-muted/50 border border-transparent hover:border-border'
      )}>
      
        <div className="flex items-center gap-2">
          {isBlocked ?
        <AlertTriangle className="w-4 h-4 text-destructive" /> :
        hasInteraction ?
        <AlertTriangle className="w-4 h-4 text-amber-500" /> :

        <Pill className="w-4 h-4 text-muted-foreground" />
        }
          <span className={cn(isBlocked && 'line-through text-muted-foreground')}>{med.name} {med.dosage}</span>
        </div>
        {isBlocked ?
      <span className="text-[10px] font-medium text-destructive">BLOQUEADO</span> :
      hasInteraction ?
      <span className="text-[10px] font-medium text-amber-500">INTERAÇÃO</span> :
      alreadyAdded ?
      <Check className="w-4 h-4 text-primary" /> :

      <Plus className="w-4 h-4 text-muted-foreground" />
      }
      </button>;


    // Wrap with tooltip if blocked or has interaction
    if (isBlocked) {
      return (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>{content}</TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs p-3 space-y-1">
              <p className="text-sm font-semibold text-destructive flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> ALERGIA DETECTADA
              </p>
              <p className="text-xs">Paciente alérgico a: <strong>{allergyBlock!.matchedAllergy}</strong></p>
              <p className="text-xs">Este medicamento contém <strong>{allergyBlock!.matchedTag}</strong></p>
              <p className="text-xs text-muted-foreground mt-1">Prescrição bloqueada por segurança</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>);

    }

    if (hasInteraction && !alreadyAdded) {
      return (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>{content}</TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs p-3 space-y-1">
              <p className="text-sm font-semibold text-amber-500 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> INTERAÇÃO MEDICAMENTOSA
              </p>
              {interactions.map((w, i) =>
              <div key={i} className="text-xs space-y-0.5">
                  <p>Paciente toma: <strong>{w.currentMedName}</strong></p>
                  <p>Interação com: <strong>{w.prescribedMedName}</strong></p>
                  <p className="text-muted-foreground">Risco: {w.risk}</p>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Pode prescrever com precaução</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>);

    }

    return content;
  };

  // Step 2: Medications
  const renderMedicationsStep = () =>
  <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <h2 className="text-lg font-bold">Prescrever medicamentos</h2>

      {/* Patient banner */}
      {selectedPatient &&
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/20 text-primary text-xs">
              {selectedPatient.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium">{selectedPatient.name}</p>
            <p className="text-xs text-muted-foreground">{selectedPatient.age} anos</p>
          </div>
          {/* Allergy badges */}
          {patientHealth.allergies.length > 0 &&
      <div className="flex flex-wrap gap-1">
              {patientHealth.allergies.map((a) =>
        <span key={a} className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-medium">
                  ⚠️ {a}
                </span>
        )}
            </div>
      }
        </div>
    }

      {/* Current medication warning */}
      {patientHealth.medications.length > 0 &&
    <div className="p-2.5 rounded-lg border border-amber-500/30 bg-amber-500/5">
          <p className="text-xs font-medium text-amber-600 mb-1">Medicação actual do paciente:</p>
          <div className="flex flex-wrap gap-1">
            {patientHealth.medications.map((m) =>
        <span key={m.name} className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600">
                {m.name} {m.dosage}
              </span>
        )}
          </div>
        </div>
    }

      <div className={cn('gap-4', isMobile ? 'flex flex-col' : 'grid grid-cols-2')}>
        {/* Left: medication list */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
            placeholder="Pesquisar medicamento..."
            value={medSearch}
            onChange={(e) => setMedSearch(e.target.value)}
            className="pl-9" />
          
          </div>
          <div className="space-y-1 max-h-[300px] overflow-y-auto">
            {filteredMeds.map((med) =>
          <MedicationListItem key={`${med.name}-${med.dosage}`} med={med} />
          )}
          </div>

          {/* Manual add */}
          {manualMode ?
        <div className="space-y-2 p-3 rounded-lg border border-border bg-card">
              <Input placeholder="Nome do medicamento" value={manualName} onChange={(e) => setManualName(e.target.value)} />
              <Input placeholder="Dosagem (ex: 500mg)" value={manualDosage} onChange={(e) => setManualDosage(e.target.value)} />
              <div className="flex gap-2">
                <Button size="sm" onClick={addManualMedication} disabled={!manualName.trim()}>Adicionar</Button>
                <Button size="sm" variant="outline" onClick={() => setManualMode(false)}>Cancelar</Button>
              </div>
            </div> :

        <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => setManualMode(true)}>
              <Plus className="w-4 h-4" /> Adicionar medicamento manualmente
            </Button>
        }
        </div>

        {/* Right: current prescription */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4" /> Receita actual ({medications.length})
          </h3>
          {medications.length === 0 ?
        <div className="p-6 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg">
              Adicione medicamentos à receita
            </div> :

        <div className="space-y-3">
              {medications.map((med) => {
            // Check interaction for already-added meds
            const medDef = MEDICATIONS_WITH_TAGS.find((m) => m.name === med.name);
            const interactions = medDef ? getMedicationInteractions(medDef, patientHealth.medications) : [];
            return (
              <div key={med.id} className={cn(
                'p-3 rounded-lg border bg-card space-y-2',
                interactions.length > 0 ? 'border-amber-500/50' : 'border-border'
              )}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {interactions.length > 0 && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                        <span className="text-sm font-medium">{med.name} {med.dosage}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeMedication(med.id)}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    {interactions.length > 0 &&
                <p className="text-[10px] text-amber-500 font-medium">
                        ⚠️ Interação com {interactions.map((w) => w.currentMedName).join(', ')} — {interactions[0].risk}
                      </p>
                }
                    <Input
                  placeholder="Posologia (ex: 1 comprimido de 8 em 8 horas durante 7 dias)"
                  value={med.posology}
                  onChange={(e) => updatePosology(med.id, e.target.value)}
                  className="text-xs h-8" />
                
                  </div>);

          })}
            </div>
        }
        </div>
      </div>
    </div>;


  // Step 3: Preview
  const renderPreviewStep = () =>
  <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <h2 className="text-lg font-bold">Pré-visualização da receita</h2>

      {/* PDF Preview */}
      <div className="bg-white text-gray-900 rounded-lg border-2 border-gray-200 p-6 space-y-4 shadow-sm max-w-lg mx-auto">
        {/* Header */}
        <div className="border-b border-gray-300 pb-3 space-y-1">
          <h3 className="text-base font-bold text-gray-900">{mockDentists[0].name}</h3>
          <p className="text-xs text-gray-600">{mockDentists[0].specialty}</p>
          <p className="text-xs text-gray-600">{mockClinics[0].name} • {mockClinics[0].address}</p>
          <p className="text-xs text-gray-600">Nº Ordem: OMD-12345</p>
        </div>

        {/* Date */}
        <div className="text-xs text-gray-500">
          Data: {today.toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}
        </div>

        {/* Patient */}
        <div className="border-b border-gray-200 pb-2">
          <p className="text-sm"><span className="font-semibold">Paciente:</span> {selectedPatient?.name}</p>
          <p className="text-xs text-gray-600">{selectedPatient?.age} anos</p>
          {patientHealth.allergies.length > 0 &&
        <p className="text-xs text-red-600 mt-1">⚠️ Alergias: {patientHealth.allergies.join(', ')}</p>
        }
        </div>

        {/* Medications */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Medicamentos:</h4>
          {medications.map((med, i) =>
        <div key={med.id} className="pl-3 border-l-2 border-primary space-y-0.5">
              <p className="text-sm font-medium">{i + 1}. {med.name} {med.dosage}</p>
              {med.posology && <p className="text-xs text-gray-600 italic">{med.posology}</p>}
            </div>
        )}
        </div>

        {/* Signature area */}
        <div className="pt-6 border-t border-gray-200 flex items-end justify-between">
          <div>
            <div className="w-40 border-b border-gray-400 mb-1" />
            <p className="text-xs text-gray-600">Assinatura do Médico Dentista</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <QrCode className="w-12 h-12 text-gray-400" />
            <p className="text-[9px] text-gray-400">smilecheck.app/rx/{rxCode}</p>
          </div>
        </div>
      </div>

      {/* Send options */}
      <div className="space-y-3 max-w-lg mx-auto">
        <h3 className="text-sm font-semibold">Opções de envio:</h3>
        <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 cursor-pointer">
          <Checkbox checked={sendToHealth} onCheckedChange={(v) => setSendToHealth(!!v)} />
          <Send className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">Enviar para a área Saúde do paciente</span>
        </label>
        <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 cursor-pointer">
          <Checkbox checked={sendByEmail} onCheckedChange={(v) => setSendByEmail(!!v)} />
          <Mail className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">Enviar por Email</span>
        </label>
        <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 cursor-pointer">
          <Checkbox checked={downloadPdf} onCheckedChange={(v) => setDownloadPdf(!!v)} />
          <Download className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">Download PDF</span>
        </label>
      </div>
    </div>;


  // Success
  const renderSuccessStep = () =>
  <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center space-y-4 max-w-sm">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
          <Check className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-xl font-bold">Receita enviada com sucesso!</h2>
        <p className="text-sm text-muted-foreground">
          O paciente <span className="font-medium text-foreground">{selectedPatient?.name}</span> foi notificado
        </p>
        <div className="text-left bg-muted/30 rounded-lg p-4 space-y-1">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Medicamentos prescritos:</p>
          {medications.map((med) =>
        <p key={med.id} className="text-sm">• {med.name} {med.dosage}</p>
        )}
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => {
          setCurrentStep(skipPatient ? 'medications' : 'patient');
          setSelectedPatient(preSelectedPatient || null);
          setMedications([]);
        }}>
            Nova Receita
          </Button>
          <Button className="flex-1" onClick={() => {
          if (onGoHome) onGoHome();else
          onClose();
        }}>
            Voltar ao Início
          </Button>
        </div>
      </div>
    </div>;


  // Bottom buttons
  const renderBottomButtons = () => {
    if (currentStep === 'success') return null;

    return (
      <div className={cn(
        'border-t border-border bg-card flex justify-center',
        isMobile ? 'fixed bottom-[60px] left-0 right-0 z-[60] p-4' : 'p-3'
      )}>
        <div className="flex gap-2 w-full max-w-[600px]">
          {currentStep === steps[0] ?
          <Button variant="outline" size="sm" className="flex-1" onClick={onClose}>Cancelar</Button> :

          <Button variant="outline" size="sm" className="flex-1" onClick={goPrev}>Anterior</Button>
          }
          {currentStep === 'patient' ?
          <Button size="sm" className="flex-1" disabled={!selectedPatient} onClick={goNext}>Seguinte</Button> :
          currentStep === 'medications' ?
          <Button size="sm" className="flex-1" disabled={medications.length === 0} onClick={goNext}>Pré-visualizar</Button> :
          currentStep === 'preview' ?
          <Button size="sm" className="flex-1" onClick={goNext}>Assinar e Enviar</Button> :
          null}
        </div>
      </div>);

  };

  return (
    <div className={cn(
      'flex flex-col bg-background',
      isMobile ?
      'fixed inset-0 z-[55]' :
      'flex-1'
    )}>
      <div className={cn(
        'flex flex-col bg-background overflow-hidden',
        isMobile ?
        'w-full h-full pb-[60px]' :
        'w-full h-full max-w-2xl mx-auto'
      )}>
        {/* Header */}
        <div className="flex items-center justify-center p-4 border-b border-border flex-shrink-0">
          <div className="w-full max-w-[600px]">
            <h1 className="text-base font-bold text-center">Prescrever Receita</h1>
          </div>
        </div>

        <div className="max-w-[600px] mx-auto w-full"><ProgressBar /></div>

        {/* Step content */}
        {currentStep === 'patient' && renderPatientStep()}
        {currentStep === 'medications' && renderMedicationsStep()}
        {currentStep === 'preview' && renderPreviewStep()}
        {currentStep === 'success' && renderSuccessStep()}

        {/* Bottom buttons */}
        {renderBottomButtons()}
      </div>
    </div>);

}