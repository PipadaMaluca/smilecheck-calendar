import { useState, useCallback } from 'react';
import { Heart, Droplets, Ruler, Weight, AlertTriangle, Pill, Activity, FileText, ClipboardList, Syringe, X, Plus, Eye, Upload, UserPlus, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { mockFamilyMembers } from '@/data/mockData';
import { PREDEFINED_ALLERGIES } from '@/data/drugSafetyData';
import { ClickableDentistName } from '@/components/search/ClickableDentistName';
import { useTranslation } from 'react-i18next';

// Interfaces and types
interface HealthViewProps {
  userRole: 'patient';
  onNavigate?: (tab: string) => void;
}

interface FamilyMember {
  id: string;
  name: string;
  age: number;
  relation: string;
}

interface MemberHealthData {
  bloodType: string;
  height: string;
  weight: string;
  allergies: string[];
  medications: { name: string; dosage: string }[];
  conditions: string[];
  documents: { id: string; name: string; type: 'exame' | 'receita' | 'outro'; date: string; format: string }[];
  prescriptions: { id: string; dentist: string; date: string; medications: string }[];
  vaccines: { name: string; date: string }[];
}

const defaultHealthData: Record<string, MemberHealthData> = {
  fm1: {
    bloodType: 'O+', height: '178', weight: '75',
    allergies: ['Penicilina', 'Látex'],
    medications: [{ name: 'Ibuprofeno', dosage: '400mg - 2x/dia' }, { name: 'Omeprazol', dosage: '20mg - 1x/dia' }],
    conditions: ['Hipertensão'],
    documents: [
      { id: '1', name: 'Raio-X Panorâmico', type: 'exame', date: '28 Jan 2026', format: 'pdf' },
      { id: '2', name: 'Análises Sanguíneas', type: 'exame', date: '15 Jan 2026', format: 'pdf' },
    ],
    prescriptions: [
      { id: '1', dentist: 'Dr. Gonçalo Pipo', date: '28 Jan 2026', medications: 'Amoxicilina 500mg, Ibuprofeno 600mg' },
    ],
    vaccines: [{ name: 'Hepatite B', date: '12 Mar 2024' }, { name: 'Tétano', date: '05 Jun 2022' }],
  },
  fm2: {
    bloodType: 'A+', height: '165', weight: '62',
    allergies: ['Aspirina'],
    medications: [],
    conditions: [],
    documents: [
      { id: '3', name: 'Relatório Ortodontia', type: 'outro', date: '10 Jan 2026', format: 'pdf' },
    ],
    prescriptions: [
      { id: '2', dentist: 'Dra. Sofia Martins', date: '15 Dez 2025', medications: 'Clindamicina 300mg' },
    ],
    vaccines: [{ name: 'Hepatite B', date: '20 Jan 2023' }],
  },
  fm3: {
    bloodType: 'O+', height: '152', weight: '42',
    allergies: [],
    medications: [],
    conditions: [],
    documents: [],
    prescriptions: [],
    vaccines: [{ name: 'Hepatite B', date: '10 Set 2014' }, { name: 'Tétano', date: '15 Mar 2020' }],
  },
};

const emptyHealthData = (): MemberHealthData => ({
  bloodType: '', height: '', weight: '',
  allergies: [], medications: [], conditions: [],
  documents: [], prescriptions: [], vaccines: [],
});

export function HealthView({ userRole, onNavigate }: HealthViewProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const [members, setMembers] = useState<FamilyMember[]>([...mockFamilyMembers]);
  const [selectedMemberId, setSelectedMemberId] = useState(members[0].id);
  const [healthData, setHealthData] = useState<Record<string, MemberHealthData>>(defaultHealthData);
  const [profileChanged, setProfileChanged] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberBirthYear, setNewMemberBirthYear] = useState('');
  const [newMemberRelation, setNewMemberRelation] = useState('');

  const [newAllergy, setNewAllergy] = useState('');
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newVaccineName, setNewVaccineName] = useState('');
  const [newVaccineDate, setNewVaccineDate] = useState('');
  const [docFilter, setDocFilter] = useState('todos');

  const data = healthData[selectedMemberId] || emptyHealthData();

  const updateData = useCallback((updater: (prev: MemberHealthData) => MemberHealthData) => {
    setHealthData(prev => ({
      ...prev,
      [selectedMemberId]: updater(prev[selectedMemberId] || emptyHealthData()),
    }));
  }, [selectedMemberId]);

  const filteredDocs = docFilter === 'todos' ? data.documents : data.documents.filter(d => d.type === docFilter);

  const addMember = () => {
    if (!newMemberName.trim() || !newMemberRelation) return;
    const age = newMemberBirthYear ? new Date().getFullYear() - parseInt(newMemberBirthYear) : 0;
    const newId = `fm-${Date.now()}`;
    setMembers(prev => [...prev, { id: newId, name: newMemberName.trim(), age, relation: newMemberRelation }]);
    setHealthData(prev => ({ ...prev, [newId]: emptyHealthData() }));
    setSelectedMemberId(newId);
    setShowAddModal(false);
    setNewMemberName('');
    setNewMemberBirthYear('');
    setNewMemberRelation('');
  };

  const RemoveButton = ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick} className="p-1 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
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

  const referrals = [
    { id: 'ref1', from: 'Dr. Gonçalo Pipo', to: 'Dr. Alexandre Bernardo', reason: 'Referência para Endodontia', date: '20 Jan 2026' },
    { id: 'ref2', from: 'Dr. Gil Santos', to: 'Dr. Gonçalo Pipo', reason: 'Referência para Cirurgia Oral', date: '10 Dez 2025' },
  ];

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 md:p-6 pb-28 space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            {t('health.title')}
          </h1>
          <p className="text-sm text-muted-foreground">{t('health.subtitle')}</p>
        </div>

        {/* Family Member Tabs */}
        <div className="space-y-2">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide pb-1 min-w-0">
            {members.map(member => (
              <button
                key={member.id}
                onClick={() => { setSelectedMemberId(member.id); setProfileChanged(false); setDocFilter('todos'); }}
                className={cn(
                  'flex-shrink-0 flex flex-col items-center px-4 py-2 rounded-lg transition-colors duration-150 border-b-2',
                  selectedMemberId === member.id
                    ? 'bg-primary/10 border-primary text-foreground'
                    : 'bg-transparent border-transparent text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                )}
              >
                <span className="text-sm font-medium whitespace-nowrap">{member.name}</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[11px] text-muted-foreground">{member.age} {t('health.years')}</span>
                  {member.age < 18 && (
                    <Badge variant="secondary" className="text-[11px] px-1 py-0 h-3.5 bg-amber-500/20 text-warning border-amber-500/30">
                      {t('health.minor')}
                    </Badge>
                  )}
                </div>
              </button>
            ))}
          </div>
          <div className="flex justify-center">
            <button
              onClick={() => setShowAddModal(true)}
              aria-label={t('account.addMember')}
              className="bg-transparent border border-dashed border-[#2196F3] rounded-[20px] px-4 py-1.5 text-xs font-semibold text-[#2196F3] hover:bg-[#2196F3]/10 transition-colors"
            >
              + {t('account.addMember')}
            </button>
          </div>
        </div>

        {/* Grid: 2 cols on desktop/tablet, 1 col on mobile */}
        <div className={cn('grid gap-4 animate-fade-in', isMobile ? 'grid-cols-1' : 'grid-cols-2')}>

          {/* ROW 1 LEFT: Alergias e Intolerâncias */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base"><SectionIcon icon={AlertTriangle} label={t('health.allergies')} /></CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {PREDEFINED_ALLERGIES.map(allergy => {
                  const isChecked = data.allergies.includes(allergy);
                  return (
                      <label key={allergy} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors press">
                       <Checkbox
                         checked={isChecked}
                         onCheckedChange={() => {
                          updateData(d => ({
                            ...d,
                            allergies: isChecked
                              ? d.allergies.filter(a => a !== allergy)
                              : [...d.allergies, allergy],
                          }));
                        }}
                       />
                      <span className="text-sm">{allergy}</span>
                    </label>
                  );
                })}
              </div>
              {data.allergies.filter(a => !PREDEFINED_ALLERGIES.includes(a as any)).length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {data.allergies.filter(a => !PREDEFINED_ALLERGIES.includes(a as any)).map((a, i) => (
                    <Badge key={i} variant="secondary" className="gap-1 pr-1">
                      {a}
                      <RemoveButton onClick={() => updateData(d => ({ ...d, allergies: d.allergies.filter(al => al !== a) }))} />
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input placeholder={t('health.otherAllergy')} value={newAllergy} onChange={e => setNewAllergy(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newAllergy.trim()) { updateData(d => ({ ...d, allergies: [...d.allergies, newAllergy.trim()] })); setNewAllergy(''); } }} className="h-9 flex-1" />
                <Button size="sm" onClick={() => { if (newAllergy.trim()) { updateData(d => ({ ...d, allergies: [...d.allergies, newAllergy.trim()] })); setNewAllergy(''); } }} disabled={!newAllergy.trim()} className="gap-1">
                  <Plus className="w-3.5 h-3.5" /> {t('health.add')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ROW 1 RIGHT: Condições Médicas */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base"><SectionIcon icon={Activity} label={t('health.conditions')} /></CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.conditions.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">{t('health.noConditions')}</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {data.conditions.map((c, i) => (
                    <Badge key={i} variant="secondary" className="gap-1 pr-1">
                      {c}
                      <RemoveButton onClick={() => updateData(d => ({ ...d, conditions: d.conditions.filter((_, idx) => idx !== i) }))} />
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input placeholder={t('health.newCondition')} value={newCondition} onChange={e => setNewCondition(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newCondition.trim()) { updateData(d => ({ ...d, conditions: [...d.conditions, newCondition.trim()] })); setNewCondition(''); } }} className="h-9 flex-1" />
                <Button size="sm" onClick={() => { if (newCondition.trim()) { updateData(d => ({ ...d, conditions: [...d.conditions, newCondition.trim()] })); setNewCondition(''); } }} disabled={!newCondition.trim()} className="gap-1">
                  <Plus className="w-3.5 h-3.5" /> {t('health.add')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ROW 2 LEFT: Medicação Actual */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base"><SectionIcon icon={Pill} label={t('health.currentMedication')} /></CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.medications.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">{t('health.noMedication')}</p>
              ) : (
                <div className="space-y-2">
                  {data.medications.map((m, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                      <div>
                        <p className="text-sm font-medium">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.dosage}</p>
                      </div>
                      <RemoveButton onClick={() => updateData(d => ({ ...d, medications: d.medications.filter((_, idx) => idx !== i) }))} />
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input placeholder={t('health.medication')} value={newMedName} onChange={e => setNewMedName(e.target.value)} className="h-9 flex-1" />
                <Input placeholder={t('health.dosage')} value={newMedDosage} onChange={e => setNewMedDosage(e.target.value)} className="h-9 w-28" />
                <Button size="sm" onClick={() => { if (newMedName.trim()) { updateData(d => ({ ...d, medications: [...d.medications, { name: newMedName.trim(), dosage: newMedDosage.trim() || 'N/A' }] })); setNewMedName(''); setNewMedDosage(''); } }} disabled={!newMedName.trim()} className="gap-1">
                  <Plus className="w-3.5 h-3.5" /> {t('health.add')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ROW 2 RIGHT: Perfil de Saúde */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base"><SectionIcon icon={Droplets} label={t('health.healthProfile')} /></CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">{t('health.bloodGroup')}</label>
                <Select value={data.bloodType} onValueChange={(v) => { updateData(d => ({ ...d, bloodType: v })); setProfileChanged(true); }}>
                  <SelectTrigger className="h-9"><SelectValue placeholder={t('health.selectPlaceholder')} /></SelectTrigger>
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
                    <Ruler className="w-3 h-3" /> {t('health.height')}
                  </label>
                  <Input type="number" value={data.height} onChange={e => { updateData(d => ({ ...d, height: e.target.value })); setProfileChanged(true); }} className="h-9" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Weight className="w-3 h-3" /> {t('health.weight')}
                  </label>
                  <Input type="number" value={data.weight} onChange={e => { updateData(d => ({ ...d, weight: e.target.value })); setProfileChanged(true); }} className="h-9" />
                </div>
              </div>
              {profileChanged && (
                <Button size="sm" onClick={() => setProfileChanged(false)} className="w-full">{t('health.save')}</Button>
              )}
            </CardContent>
          </Card>

          {/* ROW 3 LEFT: Histórico de Vacinas */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base"><SectionIcon icon={Syringe} label={t('health.vaccines')} /></CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.vaccines.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">{t('health.noVaccines')}</p>
              ) : (
                <div className="space-y-2">
                  {data.vaccines.map((v, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                      <div>
                        <p className="text-sm font-medium">{v.name}</p>
                        <p className="text-xs text-muted-foreground">{v.date}</p>
                      </div>
                      <RemoveButton onClick={() => updateData(d => ({ ...d, vaccines: d.vaccines.filter((_, idx) => idx !== i) }))} />
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input placeholder={t('health.vaccine')} value={newVaccineName} onChange={e => setNewVaccineName(e.target.value)} className="h-9 flex-1" />
                <Input placeholder={t('health.dateLabel')} value={newVaccineDate} onChange={e => setNewVaccineDate(e.target.value)} className="h-9 w-28" />
                <Button size="sm" onClick={() => { if (newVaccineName.trim()) { updateData(d => ({ ...d, vaccines: [...d.vaccines, { name: newVaccineName.trim(), date: newVaccineDate.trim() || 'N/A' }] })); setNewVaccineName(''); setNewVaccineDate(''); } }} disabled={!newVaccineName.trim()} className="gap-1">
                  <Plus className="w-3.5 h-3.5" /> {t('health.add')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ROW 3 RIGHT: Documentos Médicos */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base"><SectionIcon icon={FileText} label={t('health.medicalDocuments')} /></CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Tabs value={docFilter} onValueChange={setDocFilter}>
                <TabsList className="h-8">
                  <TabsTrigger value="todos" className="text-xs px-3 h-7">{t('health.all')}</TabsTrigger>
                  <TabsTrigger value="receita" className="text-xs px-3 h-7">{t('health.prescriptions')}</TabsTrigger>
                  <TabsTrigger value="exame" className="text-xs px-3 h-7">{t('health.exams')}</TabsTrigger>
                  <TabsTrigger value="outro" className="text-xs px-3 h-7">{t('health.others')}</TabsTrigger>
                </TabsList>
              </Tabs>
              {filteredDocs.length === 0 ? (
                <p className="text-sm text-muted-foreground italic py-4 text-center">{t('health.noDocuments')}</p>
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
                        <Eye className="w-3.5 h-3.5" /> {t('health.viewBtn')}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <Button variant="outline" size="sm" className="w-full gap-1.5">
                <Upload className="w-4 h-4" /> {t('health.uploadDocument')}
              </Button>
            </CardContent>
          </Card>

          {/* ROW 4 LEFT: Receitas Médicas */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base"><SectionIcon icon={ClipboardList} label={t('health.medicalPrescriptions')} /></CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.prescriptions.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">{t('health.noPrescriptions')}</p>
              ) : (
                <div className="space-y-2">
                  {data.prescriptions.map(rx => (
                    <div key={rx.id} className="p-3 rounded-lg bg-secondary/50 space-y-1">
                      <div className="flex items-center justify-between">
                        <ClickableDentistName name={rx.dentist} className="text-sm font-medium" />
                        <span className="text-xs text-muted-foreground">{rx.date}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{rx.medications}</p>
                      <Button variant="ghost" size="sm" className="gap-1 text-xs h-7 px-2 mt-1">
                        <Eye className="w-3.5 h-3.5" /> {t('health.viewPdf')}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ROW 4 RIGHT: Cartas de Referência */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base"><SectionIcon icon={Send} label={t('health.referralLetters')} /></CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {referrals.length === 0 ? (
                <p className="text-sm text-muted-foreground italic py-4 text-center">{t('health.noReferralLetters')}</p>
              ) : (
                <div className="space-y-2">
                  {referrals.map(ref => (
                    <div key={ref.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-sm">
                          <ClickableDentistName name={ref.from} className="text-sm font-medium" />
                          <span className="text-muted-foreground">→</span>
                          <ClickableDentistName name={ref.to} className="text-sm font-medium" />
                        </div>
                        <p className="text-xs text-muted-foreground">{ref.reason}</p>
                        <p className="text-xs text-muted-foreground">{ref.date}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="gap-1 text-xs">
                        <Eye className="w-3.5 h-3.5" /> {t('health.viewPdf')}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <Button variant="outline" size="sm" className="w-full gap-1.5">
                <Upload className="w-4 h-4" /> {t('health.uploadDocument')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Family Member Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              {t('health.addFamilyMember')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t('health.name')}</Label>
              <Input placeholder={t('health.namePlaceholder')} value={newMemberName} onChange={e => setNewMemberName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t('health.birthYear')}</Label>
              <Input type="number" placeholder={t('health.birthYearPlaceholder')} value={newMemberBirthYear} onChange={e => setNewMemberBirthYear(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t('health.relationship')}</Label>
              <Select value={newMemberRelation} onValueChange={setNewMemberRelation}>
                <SelectTrigger><SelectValue placeholder={t('health.selectPlaceholder')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Filho/a">{t('health.child')}</SelectItem>
                  <SelectItem value="Cônjuge">{t('health.spouse')}</SelectItem>
                  <SelectItem value="Pai">{t('health.father')}</SelectItem>
                  <SelectItem value="Mãe">{t('health.mother')}</SelectItem>
                  <SelectItem value="Outro">{t('health.other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>{t('common.cancel')}</Button>
            <Button onClick={addMember} disabled={!newMemberName.trim() || !newMemberRelation}>{t('health.add')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ScrollArea>
  );
}
