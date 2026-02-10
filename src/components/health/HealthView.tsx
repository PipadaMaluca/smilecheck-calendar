import { useState } from 'react';
import { Heart, Droplets, Ruler, Weight, AlertTriangle, Pill, Activity, FileText, ClipboardList, Syringe, X, Plus, Eye, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import smileIcon from '@/assets/smilecheck-icon.png';

interface HealthViewProps {
  userRole: 'patient';
  onNavigate?: (tab: string) => void;
}

// Mock data
const initialAllergies = ['Penicilina', 'Látex'];
const initialMedications = [
  { name: 'Ibuprofeno', dosage: '400mg - 2x/dia' },
  { name: 'Omeprazol', dosage: '20mg - 1x/dia' },
];
const initialConditions = ['Hipertensão'];
const initialDocuments = [
  { id: '1', name: 'Raio-X Panorâmico', type: 'exame' as const, date: '28 Jan 2026', format: 'pdf' },
  { id: '2', name: 'Análises Sanguíneas', type: 'exame' as const, date: '15 Jan 2026', format: 'pdf' },
  { id: '3', name: 'Relatório Ortodontia', type: 'outro' as const, date: '10 Jan 2026', format: 'pdf' },
];
const initialPrescriptions = [
  {
    id: '1',
    dentist: 'Dr. Gonçalo Pipo',
    date: '28 Jan 2026',
    medications: 'Amoxicilina 500mg, Ibuprofeno 600mg',
  },
  {
    id: '2',
    dentist: 'Dra. Sofia Martins',
    date: '15 Dez 2025',
    medications: 'Clindamicina 300mg',
  },
];
const initialVaccines = [
  { name: 'Hepatite B', date: '12 Mar 2024' },
  { name: 'Tétano', date: '05 Jun 2022' },
];

export function HealthView({ userRole, onNavigate }: HealthViewProps) {
  const isMobile = useIsMobile();

  // Health profile
  const [bloodType, setBloodType] = useState('O+');
  const [height, setHeight] = useState('175');
  const [weight, setWeight] = useState('72');
  const [profileChanged, setProfileChanged] = useState(false);

  // Allergies
  const [allergies, setAllergies] = useState(initialAllergies);
  const [newAllergy, setNewAllergy] = useState('');

  // Medications
  const [medications, setMedications] = useState(initialMedications);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');

  // Conditions
  const [conditions, setConditions] = useState(initialConditions);
  const [newCondition, setNewCondition] = useState('');

  // Documents
  const [documents] = useState(initialDocuments);
  const [docFilter, setDocFilter] = useState('todos');

  // Prescriptions
  const [prescriptions] = useState(initialPrescriptions);

  // Vaccines
  const [vaccines, setVaccines] = useState(initialVaccines);
  const [newVaccineName, setNewVaccineName] = useState('');
  const [newVaccineDate, setNewVaccineDate] = useState('');

  const filteredDocs = docFilter === 'todos' ? documents : documents.filter(d => d.type === docFilter);

  const addAllergy = () => {
    if (newAllergy.trim()) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy('');
    }
  };

  const addMedication = () => {
    if (newMedName.trim()) {
      setMedications([...medications, { name: newMedName.trim(), dosage: newMedDosage.trim() || 'N/A' }]);
      setNewMedName('');
      setNewMedDosage('');
    }
  };

  const addCondition = () => {
    if (newCondition.trim()) {
      setConditions([...conditions, newCondition.trim()]);
      setNewCondition('');
    }
  };

  const addVaccine = () => {
    if (newVaccineName.trim()) {
      setVaccines([...vaccines, { name: newVaccineName.trim(), date: newVaccineDate.trim() || 'N/A' }]);
      setNewVaccineName('');
      setNewVaccineDate('');
    }
  };

  const RemoveButton = ({ onClick }: { onClick: () => void }) => (
    <button
      onClick={onClick}
      className="p-1 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
    >
      <X className="w-3.5 h-3.5" />
    </button>
  );

  const SectionIcon = ({ icon: Icon, label }: { icon: React.ElementType; label: string }) => (
    <div className="flex items-center gap-2">
      <div className="p-1.5 rounded-lg bg-primary/10">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <span className="font-semibold text-base">{label}</span>
    </div>
  );

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 md:p-6 pb-28 space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            A Minha Saúde
          </h1>
          <p className="text-sm text-muted-foreground">Mantenha os seus dados atualizados</p>
        </div>

        {/* Grid: 2 cols on desktop/tablet, 1 col on mobile */}
        <div className={cn('grid gap-4', isMobile ? 'grid-cols-1' : 'grid-cols-2')}>

          {/* 1. Perfil de Saúde */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base"><SectionIcon icon={Droplets} label="Perfil de Saúde" /></CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Grupo Sanguíneo</label>
                <Select value={bloodType} onValueChange={(v) => { setBloodType(v); setProfileChanged(true); }}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Ruler className="w-3 h-3" /> Altura (cm)
                  </label>
                  <Input type="number" value={height} onChange={e => { setHeight(e.target.value); setProfileChanged(true); }} className="h-9" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Weight className="w-3 h-3" /> Peso (kg)
                  </label>
                  <Input type="number" value={weight} onChange={e => { setWeight(e.target.value); setProfileChanged(true); }} className="h-9" />
                </div>
              </div>
              {profileChanged && (
                <Button size="sm" onClick={() => setProfileChanged(false)} className="w-full">
                  Guardar
                </Button>
              )}
            </CardContent>
          </Card>

          {/* 2. Alergias e Intolerâncias */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base"><SectionIcon icon={AlertTriangle} label="Alergias e Intolerâncias" /></CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {allergies.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Nenhuma alergia registada</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {allergies.map((a, i) => (
                    <Badge key={i} variant="secondary" className="gap-1 pr-1">
                      {a}
                      <RemoveButton onClick={() => setAllergies(allergies.filter((_, idx) => idx !== i))} />
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="Nova alergia..."
                  value={newAllergy}
                  onChange={e => setNewAllergy(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addAllergy()}
                  className="h-9 flex-1"
                />
                <Button size="sm" onClick={addAllergy} disabled={!newAllergy.trim()} className="gap-1">
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 3. Medicação Actual */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base"><SectionIcon icon={Pill} label="Medicação Actual" /></CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {medications.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Nenhuma medicação registada</p>
              ) : (
                <div className="space-y-2">
                  {medications.map((m, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                      <div>
                        <p className="text-sm font-medium">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.dosage}</p>
                      </div>
                      <RemoveButton onClick={() => setMedications(medications.filter((_, idx) => idx !== i))} />
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="Medicamento..."
                  value={newMedName}
                  onChange={e => setNewMedName(e.target.value)}
                  className="h-9 flex-1"
                />
                <Input
                  placeholder="Dosagem..."
                  value={newMedDosage}
                  onChange={e => setNewMedDosage(e.target.value)}
                  className="h-9 w-28"
                />
                <Button size="sm" onClick={addMedication} disabled={!newMedName.trim()} className="gap-1">
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 4. Condições Médicas */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base"><SectionIcon icon={Activity} label="Condições Médicas" /></CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {conditions.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Nenhuma condição registada</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {conditions.map((c, i) => (
                    <Badge key={i} variant="secondary" className="gap-1 pr-1">
                      {c}
                      <RemoveButton onClick={() => setConditions(conditions.filter((_, idx) => idx !== i))} />
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="Nova condição..."
                  value={newCondition}
                  onChange={e => setNewCondition(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCondition()}
                  className="h-9 flex-1"
                />
                <Button size="sm" onClick={addCondition} disabled={!newCondition.trim()} className="gap-1">
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 5. Documentos Médicos */}
          <Card className={cn(!isMobile && 'col-span-2')}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base"><SectionIcon icon={FileText} label="Documentos Médicos" /></CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Tabs value={docFilter} onValueChange={setDocFilter}>
                <TabsList className="h-8">
                  <TabsTrigger value="todos" className="text-xs px-3 h-7">Todos</TabsTrigger>
                  <TabsTrigger value="receita" className="text-xs px-3 h-7">Receitas</TabsTrigger>
                  <TabsTrigger value="exame" className="text-xs px-3 h-7">Exames</TabsTrigger>
                  <TabsTrigger value="outro" className="text-xs px-3 h-7">Outros</TabsTrigger>
                </TabsList>
              </Tabs>
              {filteredDocs.length === 0 ? (
                <p className="text-sm text-muted-foreground italic py-4 text-center">Nenhum documento</p>
              ) : (
                <div className="space-y-2">
                  {filteredDocs.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.date}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="gap-1 text-xs">
                        <Eye className="w-3.5 h-3.5" /> Ver
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <Button variant="outline" size="sm" className="w-full gap-1.5">
                <Upload className="w-4 h-4" /> Carregar Documento
              </Button>
            </CardContent>
          </Card>

          {/* 6. Receitas Médicas */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base"><SectionIcon icon={ClipboardList} label="Receitas Médicas" /></CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {prescriptions.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Nenhuma receita</p>
              ) : (
                <div className="space-y-2">
                  {prescriptions.map(rx => (
                    <div key={rx.id} className="p-3 rounded-lg bg-secondary/50 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{rx.dentist}</p>
                        <span className="text-xs text-muted-foreground">{rx.date}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{rx.medications}</p>
                      <Button variant="ghost" size="sm" className="gap-1 text-xs h-7 px-2 mt-1">
                        <Eye className="w-3.5 h-3.5" /> Ver PDF
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 7. Histórico de Vacinas */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base"><SectionIcon icon={Syringe} label="Histórico de Vacinas" /></CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {vaccines.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Nenhuma vacina registada</p>
              ) : (
                <div className="space-y-2">
                  {vaccines.map((v, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                      <div>
                        <p className="text-sm font-medium">{v.name}</p>
                        <p className="text-xs text-muted-foreground">{v.date}</p>
                      </div>
                      <RemoveButton onClick={() => setVaccines(vaccines.filter((_, idx) => idx !== i))} />
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="Vacina..."
                  value={newVaccineName}
                  onChange={e => setNewVaccineName(e.target.value)}
                  className="h-9 flex-1"
                />
                <Input
                  placeholder="Data..."
                  value={newVaccineDate}
                  onChange={e => setNewVaccineDate(e.target.value)}
                  className="h-9 w-28"
                />
                <Button size="sm" onClick={addVaccine} disabled={!newVaccineName.trim()} className="gap-1">
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollArea>
  );
}
