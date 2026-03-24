// Clinical Safety System — auto-generated alerts & recall recommendations

export interface ClinicalAlert {
  id: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  trigger: string; // what condition triggered it
  acknowledged?: boolean;
  acknowledgedBy?: string;
  acknowledgedDate?: string;
}

export interface RecallRecommendation {
  intervalMonths: [number, number]; // min-max months
  reason: string;
  nextRecommendedDate: string;
  lastVisitDate: string;
  isOverdue: boolean;
  overdueDays?: number;
}

// Generate clinical alerts based on patient conditions & medications
export function generateClinicalAlerts(
  conditions: string[],
  medications: { name: string; dosage?: string; interaction?: string }[],
  allergies: string[]
): ClinicalAlert[] {
  const alerts: ClinicalAlert[] = [];
  const condSet = new Set(conditions.map(c => c.toLowerCase()));
  const medNames = medications.map(m => m.name.toLowerCase());
  const allergySet = new Set(allergies.map(a => a.toLowerCase()));

  // Diabetes
  if (condSet.has('diabetes tipo 2') || condSet.has('diabetes tipo 1') || condSet.has('diabetes')) {
    alerts.push({
      id: 'alert-diabetes',
      severity: 'medium',
      title: 'Risco Periodontal Aumentado',
      description: 'Paciente diabético. Maior risco de doença periodontal e cicatrização lenta.',
      trigger: 'Diabetes',
    });
  }

  // Anticoagulants
  const anticoagulants = ['varfarina', 'apixaban', 'rivaroxaban', 'dabigatran'];
  const foundAnticoag = medNames.find(m => anticoagulants.some(a => m.includes(a)));
  if (foundAnticoag) {
    const name = medications.find(m => anticoagulants.some(a => m.name.toLowerCase().includes(a)))?.name || foundAnticoag;
    alerts.push({
      id: 'alert-anticoag',
      severity: 'high',
      title: 'Risco de Hemorragia',
      description: `Paciente sob anticoagulantes (${name}). Verificar INR antes de procedimentos cirúrgicos.`,
      trigger: name,
    });
  }

  // Penicillin allergy
  if (allergySet.has('penicilina')) {
    alerts.push({
      id: 'alert-penicillin',
      severity: 'high',
      title: 'Alergia a Penicilina',
      description: 'Usar Clindamicina 600mg (30-60 min antes) em vez de Amoxicilina para profilaxia.',
      trigger: 'Alergia a Penicilina',
    });
  }

  // Endocarditis risk
  const endoConditions = ['válvula cardíaca protética', 'endocardite prévia', 'doença cardíaca congénita'];
  if (endoConditions.some(c => condSet.has(c))) {
    alerts.push({
      id: 'alert-endocarditis',
      severity: 'high',
      title: 'Risco de Endocardite Infecciosa',
      description: 'Profilaxia antibiótica obrigatória antes de procedimentos invasivos. Amoxicilina 2g (30-60 min antes).',
      trigger: 'Condição cardíaca',
    });
  }

  // Bisphosphonates
  const bisphos = ['alendronato', 'ácido zoledrónico', 'denosumab'];
  if (medNames.some(m => bisphos.some(b => m.includes(b)))) {
    alerts.push({
      id: 'alert-osteonecrose',
      severity: 'high',
      title: 'Risco de Osteonecrose Maxilar',
      description: 'Paciente sob bifosfonatos/denosumab. EVITAR procedimentos invasivos (extrações, implantes) sem avaliação prévia.',
      trigger: 'Bifosfonatos',
    });
  }

  // Corticosteroids
  const corticos = ['prednisona', 'prednisolona', 'dexametasona'];
  if (medNames.some(m => corticos.some(c => m.includes(c)))) {
    alerts.push({
      id: 'alert-cortico',
      severity: 'medium',
      title: 'Corticoterapia Crónica',
      description: 'Risco de insuficiência adrenal. Avaliar suplementação antes de procedimentos cirúrgicos.',
      trigger: 'Corticosteróides',
    });
  }

  // Joint prosthesis
  if (condSet.has('prótese articular')) {
    alerts.push({
      id: 'alert-prosthesis',
      severity: 'medium',
      title: 'Prótese Articular',
      description: 'Considerar profilaxia antibiótica. Confirmar com médico assistente.',
      trigger: 'Prótese articular',
    });
  }

  // Smoker
  if (condSet.has('fumador')) {
    alerts.push({
      id: 'alert-smoker',
      severity: 'medium',
      title: 'Fumador',
      description: 'Risco aumentado de doença periodontal e perda óssea.',
      trigger: 'Tabagismo',
    });
  }

  // Xerostomia
  if (condSet.has('xerostomia')) {
    alerts.push({
      id: 'alert-xerostomia',
      severity: 'medium',
      title: 'Xerostomia',
      description: 'Risco aumentado de cáries e infeções orais. Recomendar saliva artificial.',
      trigger: 'Xerostomia',
    });
  }

  // Oral cancer history
  if (condSet.has('historial de cancro oral')) {
    alerts.push({
      id: 'alert-cancer',
      severity: 'high',
      title: 'Historial de Cancro Oral',
      description: 'Vigilância apertada. Exame de rastreio a cada consulta.',
      trigger: 'Cancro oral',
    });
  }

  return alerts;
}

// Calculate recall recommendation based on conditions
export function calculateRecall(
  conditions: string[],
  lastVisitDate: string // format: "dd Mon yyyy"
): RecallRecommendation {
  const condSet = new Set(conditions.map(c => c.toLowerCase()));

  const recallRules: { condition: string; months: [number, number] }[] = [
    { condition: 'periodontite', months: [3, 4] },
    { condition: 'diabetes tipo 2', months: [3, 4] },
    { condition: 'diabetes tipo 1', months: [3, 4] },
    { condition: 'fumador', months: [3, 4] },
    { condition: 'xerostomia', months: [3, 4] },
    { condition: 'historial de cancro oral', months: [3, 6] },
    { condition: 'implantes dentários', months: [4, 6] },
    { condition: 'aparelho ortodôntico', months: [3, 6] },
    { condition: 'osteoporose', months: [6, 6] },
  ];

  let shortestMin = 6;
  let shortestMax = 12;
  let reason = 'Sem condições especiais — acompanhamento regular';

  for (const rule of recallRules) {
    if (condSet.has(rule.condition)) {
      if (rule.months[0] < shortestMin) {
        shortestMin = rule.months[0];
        shortestMax = rule.months[1];
        reason = `${rule.condition.charAt(0).toUpperCase() + rule.condition.slice(1)} — risco periodontal aumentado`;
      }
    }
  }

  // For demo: parse "15 Jan 2026" style dates
  const monthMap: Record<string, number> = {
    'Jan': 0, 'Fev': 1, 'Mar': 2, 'Abr': 3, 'Mai': 4, 'Jun': 5,
    'Jul': 6, 'Ago': 7, 'Set': 8, 'Out': 9, 'Nov': 10, 'Dez': 11
  };
  const parts = lastVisitDate.split(' ');
  const day = parseInt(parts[0]);
  const month = monthMap[parts[1]] ?? 0;
  const year = parseInt(parts[2]);
  const lastDate = new Date(year, month, day);
  
  const nextDate = new Date(lastDate);
  nextDate.setMonth(nextDate.getMonth() + shortestMin);
  
  const now = new Date(2026, 0, 31); // demo date
  const isOverdue = now > nextDate;
  const overdueDays = isOverdue ? Math.floor((now.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

  const formatDate = (d: Date) => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  return {
    intervalMonths: [shortestMin, shortestMax],
    reason,
    nextRecommendedDate: formatDate(nextDate),
    lastVisitDate,
    isOverdue,
    overdueDays: overdueDays > 0 ? overdueDays : undefined,
  };
}

export const SEVERITY_CONFIG = {
  high: { icon: '🔴', label: 'Alto', bg: 'bg-destructive/15', border: 'border-destructive/30', text: 'text-destructive' },
  medium: { icon: '🟡', label: 'Médio', bg: 'bg-yellow-500/15', border: 'border-yellow-500/30', text: 'text-yellow-400' },
  low: { icon: '🟢', label: 'Baixo', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-400' },
};
