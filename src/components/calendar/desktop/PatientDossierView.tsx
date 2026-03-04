import { useState, useMemo } from 'react';
import { User, Phone, Mail, MapPin, MessageCircle, FileText, AlertTriangle, Pill, Camera, ChevronDown, ChevronUp, Upload, Eye, X, Star, Video } from 'lucide-react';
import { UserRole } from '@/types/calendar';
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

interface PatientDossierViewProps {
  patientId: string;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  userRole?: UserRole;
}

// Mock patient full data
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
  const [clinicalNotes, setClinicalNotes] = useState('Paciente com boa higiene oral. Acompanhamento periodontal recomendado.');
  const [expandedConsultation, setExpandedConsultation] = useState<number | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewPrescription, setPreviewPrescription] = useState<any | null>(null);
  const startTeleconsulta = useTeleconsulta();

  const data = MOCK_PATIENT_DATA.default;

  // Check if patient has teleconsulta today
  const hasTeleconsultaToday = data.consultations.some((c: any) => c.category === 'teleconsulta' && c.date === '05 Jun 2025');

  // For dentist role, filter consultations to only show this dentist's consultations
  const filteredConsultations = useMemo(() => {
    if (userRole === 'dentist') {
      return data.consultations.filter((c: any) => c.dentist === 'Dr. Gonçalo Pipo');
    }
    return data.consultations;
  }, [userRole, data.consultations]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <User className="w-10 h-10 text-muted-foreground" />
              </div>
              <div>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3" style={{ maxWidth: '100%' }}>
                  <Button size="sm" variant="secondary" className="gap-1.5" onClick={() => startTeleconsulta(data.name, hasTeleconsultaToday)}>
                    <Video className="w-3.5 h-3.5" /> Iniciar Teleconsulta
                  </Button>
                  <Button size="sm" variant="secondary" className="gap-1.5" onClick={() => onNavigate('conversas')}>
                    <MessageCircle className="w-3.5 h-3.5" /> Enviar Mensagem
                  </Button>
                  <Button size="sm" variant="secondary" className="gap-1.5" onClick={() => onNavigate('prescrever')}>
                    <FileText className="w-3.5 h-3.5" /> Prescrever Receita
                  </Button>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Dados Pessoais */}
          <div className="bg-card rounded-xl border border-border p-4 space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase">Dados Pessoais</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Data de nascimento:</span> <span className="ml-1">{data.dob}</span></div>
              <div><span className="text-muted-foreground">Género:</span> <span className="ml-1">{data.gender}</span></div>
              <div><span className="text-muted-foreground">País:</span> <span className="ml-1">{data.birthCountry}</span></div>
              <div><span className="text-muted-foreground">Cidade:</span> <span className="ml-1">{data.birthCity}</span></div>
              <div><span className="text-muted-foreground">Nº Identificação:</span> <span className="ml-1">{data.idNumber}</span></div>
            </div>
          </div>

          {/* Saúde */}
          <div className="bg-card rounded-xl border border-border p-4 space-y-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase">Saúde</h3>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Tipo Sanguíneo</p>
                <p className="font-bold text-lg mt-1">{data.bloodType}</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Altura</p>
                <p className="font-bold text-lg mt-1">{data.height}</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Peso</p>
                <p className="font-bold text-lg mt-1">{data.weight}</p>
              </div>
            </div>

            {/* Allergies */}
            {data.allergies.length > 0 && (
              <div className="bg-destructive/10 rounded-lg p-3 space-y-2">
                <p className="text-xs font-semibold text-destructive flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Alergias
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {data.allergies.map((a: string) => (
                    <span key={a} className="text-xs px-2 py-1 rounded-full bg-destructive/20 text-destructive font-medium">{a}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Medications */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5" /> Medicação Atual
              </p>
              {data.medications.map((m: any) => (
                <div key={m.name} className={cn('text-sm p-2 rounded-lg', m.interaction ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-secondary/30')}>
                  <span className="font-medium">{m.name}</span> <span className="text-muted-foreground">— {m.dosage}</span>
                  {m.interaction && <p className="text-xs text-yellow-400 mt-0.5">⚠️ {m.interaction}</p>}
                </div>
              ))}
            </div>

            {/* Conditions */}
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">Condições Médicas</p>
              <div className="flex flex-wrap gap-1.5">
                {data.conditions.map((c: string) => (
                  <span key={c} className="text-xs px-2 py-1 rounded-full bg-secondary text-foreground">{c}</span>
                ))}
              </div>
            </div>

            {/* Vaccines */}
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">Vacinas</p>
              <div className="flex flex-wrap gap-1.5">
                {data.vaccines.map((v: string) => (
                  <span key={v} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">{v}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Documentos e Receitas */}
          <div className="bg-card rounded-xl border border-border p-4 space-y-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase">Documentos e Receitas</h3>
            <Tabs defaultValue="receitas">
              <TabsList className="bg-secondary/50">
                <TabsTrigger value="receitas" className="text-xs">Receitas</TabsTrigger>
                <TabsTrigger value="referencias" className="text-xs">Cartas de Referência</TabsTrigger>
              </TabsList>
              <TabsContent value="receitas" className="space-y-2 mt-3">
                {data.prescriptions.map((rx: any) => (
                  <div key={rx.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{rx.date}</p>
                      <p className="text-xs text-muted-foreground"><ClickableDentistName name={rx.dentist} className="text-xs text-muted-foreground" /></p>
                      <p className="text-xs text-muted-foreground mt-0.5">{rx.medications.join(', ')}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={() => setPreviewPrescription(rx)}>
                      <Eye className="w-3.5 h-3.5" /> Ver
                    </Button>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="referencias" className="space-y-2 mt-3">
                {data.referrals.map((ref: any) => (
                  <div key={ref.id} className="p-3 bg-secondary/30 rounded-lg">
                    <p className="text-sm font-medium">{ref.date}</p>
                    <p className="text-xs text-muted-foreground">De: <ClickableDentistName name={ref.from} className="text-xs text-muted-foreground" /> → Para: <ClickableDentistName name={ref.to} className="text-xs text-muted-foreground" /></p>
                    <p className="text-xs text-muted-foreground mt-0.5">{ref.reason}</p>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Radiografias e Imagens */}
          <div className="bg-card rounded-xl border border-border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase">Radiografias e Imagens</h3>
              <Button size="sm" variant="secondary" className="gap-1.5 text-xs" onClick={() => setShowUploadModal(true)}>
                <Upload className="w-3.5 h-3.5" /> Upload
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {data.images.map((img: any) => (
                <button
                  key={img.id}
                  className="bg-secondary/50 rounded-lg p-3 text-left hover:bg-secondary/70 transition-colors"
                  onClick={() => setPreviewImage(img.id)}
                >
                  <div className="w-full aspect-square rounded-lg bg-muted flex items-center justify-center mb-2">
                    <Camera className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                  <p className="text-xs font-medium truncate">{img.category}</p>
                  <p className="text-[10px] text-muted-foreground">{img.date}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{img.uploadedBy}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Notas Clínicas Gerais */}
          <div className="bg-card rounded-xl border border-border p-4 space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase">Notas Clínicas Gerais</h3>
            <Textarea
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="Notas gerais sobre o paciente..."
              className="min-h-[100px] bg-secondary/50 border-border text-sm"
            />
          </div>

          {/* Histórico de Consultas */}
          <div className="bg-card rounded-xl border border-border p-4 space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase">Histórico de Consultas</h3>
            <div className="space-y-2">
              {filteredConsultations.map((c: any, i: number) => {
                const catColor = CATEGORY_COLORS[c.category as keyof typeof CATEGORY_COLORS];
                const isExpanded = expandedConsultation === i;
                return (
                  <div key={i} className="border border-border/50 rounded-lg overflow-hidden">
                    <button
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-secondary/30 transition-colors"
                      onClick={() => setExpandedConsultation(isExpanded ? null : i)}
                    >
                      <div className="w-1 h-8 rounded-full shrink-0" style={{ backgroundColor: catColor?.hex || undefined }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{c.date} — {c.time}</span>
                          <div className="flex items-center gap-2">
                            {c.hasPrescription && <FileText className="w-3.5 h-3.5 text-primary" />}
                            <span className="text-xs text-muted-foreground">{c.status}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap"><span className="px-1.5 py-0 rounded-full text-[10px] font-medium inline-block" style={getCategoryBadgeStyle(catColor?.hex || '#9E9E9E')}>{c.type}</span>{userRole !== 'dentist' && <> • <ClickableDentistName name={c.dentist} className="text-xs text-muted-foreground" /></>} • <ClickableClinicName name={c.clinic} className="text-xs text-muted-foreground" /></p>
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="px-3 pb-3 pt-0 space-y-1 border-t border-border/30">
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
      </ScrollArea>

      {/* Preview Prescription Modal */}
      {previewPrescription && (
        <>
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" onClick={() => setPreviewPrescription(null)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-card rounded-xl border border-border p-6 z-50 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">Receita — {previewPrescription.date}</h3>
              <Button variant="ghost" size="icon" onClick={() => setPreviewPrescription(null)}><X className="w-4 h-4" /></Button>
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
            <div className="w-full flex justify-end">
              <Button variant="ghost" size="icon" onClick={() => setPreviewImage(null)}><X className="w-4 h-4" /></Button>
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
              <Button variant="ghost" size="icon" onClick={() => setShowUploadModal(false)}><X className="w-4 h-4" /></Button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Categoria</label>
                <select className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm">
                  {IMAGE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
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
