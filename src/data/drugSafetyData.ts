// ═══════════════════════════════════════════════════════════
// Drug Safety Data: Allergen Tags & Drug Interactions
// ═══════════════════════════════════════════════════════════

// Predefined allergy categories for patient health profile
export const PREDEFINED_ALLERGIES = [
  'Penicilina',
  'Anti-inflamatórios não esteróides (AINEs)',
  'Anestésicos locais (Lidocaína, etc.)',
  'Látex',
  'Aspirina',
  'Sulfonamidas',
  'Cefalosporinas',
  'Macrólidos (Eritromicina, Azitromicina)',
] as const;

export type AllergenTag =
  | 'Penicilina'
  | 'AINEs'
  | 'Aspirina'
  | 'Anestésicos locais'
  | 'Macrólidos'
  | 'Cefalosporinas'
  | 'Sulfonamidas';

export interface MedicationDef {
  name: string;
  dosage: string;
  allergenTags: AllergenTag[];
}

// Extended medication list with allergen tags
export const MEDICATIONS_WITH_TAGS: MedicationDef[] = [
  // Penicilinas
  { name: 'Amoxicilina', dosage: '500mg', allergenTags: ['Penicilina'] },
  { name: 'Ampicilina', dosage: '500mg', allergenTags: ['Penicilina'] },
  { name: 'Amoxicilina + Ácido Clavulânico', dosage: '875/125mg', allergenTags: ['Penicilina'] },
  // AINEs
  { name: 'Ibuprofeno', dosage: '600mg', allergenTags: ['AINEs'] },
  { name: 'Nimesulida', dosage: '100mg', allergenTags: ['AINEs'] },
  { name: 'Diclofenac', dosage: '50mg', allergenTags: ['AINEs'] },
  { name: 'Naproxeno', dosage: '500mg', allergenTags: ['AINEs'] },
  { name: 'Piroxicam', dosage: '20mg', allergenTags: ['AINEs'] },
  // Aspirina
  { name: 'Aspirina', dosage: '500mg', allergenTags: ['Aspirina', 'AINEs'] },
  { name: 'AAS', dosage: '100mg', allergenTags: ['Aspirina', 'AINEs'] },
  // Anestésicos
  { name: 'Lidocaína', dosage: '2%', allergenTags: ['Anestésicos locais'] },
  { name: 'Articaína', dosage: '4%', allergenTags: ['Anestésicos locais'] },
  { name: 'Mepivacaína', dosage: '3%', allergenTags: ['Anestésicos locais'] },
  // Macrólidos
  { name: 'Eritromicina', dosage: '500mg', allergenTags: ['Macrólidos'] },
  { name: 'Azitromicina', dosage: '500mg', allergenTags: ['Macrólidos'] },
  // Cefalosporinas
  { name: 'Cefalexina', dosage: '500mg', allergenTags: ['Cefalosporinas'] },
  // Sulfonamidas
  { name: 'Sulfametoxazol', dosage: '800mg', allergenTags: ['Sulfonamidas'] },
  // Safe (no allergen tags)
  { name: 'Paracetamol', dosage: '1g', allergenTags: [] },
  { name: 'Clindamicina', dosage: '300mg', allergenTags: [] },
  { name: 'Metronidazol', dosage: '500mg', allergenTags: [] },
  { name: 'Cetorolac', dosage: '10mg', allergenTags: ['AINEs'] },
  { name: 'Prednisolona', dosage: '20mg', allergenTags: [] },
  { name: 'Clorexidina', dosage: '0.12%', allergenTags: [] },
  { name: 'Tramadol', dosage: '50mg', allergenTags: [] },
];

// Map patient-facing allergy names to allergen tags
export function patientAllergyToTags(allergy: string): AllergenTag[] {
  const lower = allergy.toLowerCase();
  if (lower === 'penicilina') return ['Penicilina'];
  if (lower.includes('aine') || lower.includes('anti-inflamatórios não esteróides')) return ['AINEs'];
  if (lower.includes('anestésicos locais') || lower.includes('lidocaína')) return ['Anestésicos locais'];
  if (lower === 'aspirina') return ['Aspirina'];
  if (lower.includes('sulfonamida')) return ['Sulfonamidas'];
  if (lower.includes('cefalosporina')) return ['Cefalosporinas'];
  if (lower.includes('macrólido') || lower.includes('eritromicina') || lower.includes('azitromicina')) return ['Macrólidos'];
  return [];
}

// Check if a medication is blocked by patient allergies
export function getMedicationAllergyBlock(
  med: MedicationDef,
  patientAllergies: string[]
): { blocked: boolean; matchedAllergy: string; matchedTag: AllergenTag } | null {
  const patientTags = patientAllergies.flatMap(a => {
    const tags = patientAllergyToTags(a);
    return tags.map(tag => ({ tag, allergy: a }));
  });

  for (const medTag of med.allergenTags) {
    const match = patientTags.find(pt => pt.tag === medTag);
    if (match) {
      return { blocked: true, matchedAllergy: match.allergy, matchedTag: medTag };
    }
  }
  return null;
}

// ═══════════════════════════════════════════════════════════
// Drug Interactions
// ═══════════════════════════════════════════════════════════

export interface DrugInteraction {
  currentMed: string; // regex-friendly pattern for patient's current medication
  prescribedTags: AllergenTag[] | string[]; // tags or med names that trigger interaction
  risk: string;
}

export const DRUG_INTERACTIONS: DrugInteraction[] = [
  {
    currentMed: 'varfarina',
    prescribedTags: ['AINEs'],
    risk: 'Aumento do risco de hemorragia',
  },
  {
    currentMed: 'varfarina',
    prescribedTags: ['Aspirina'],
    risk: 'Aumento do risco de hemorragia',
  },
  {
    currentMed: 'metformina',
    prescribedTags: ['AINEs'],
    risk: 'Aumento do risco renal',
  },
  {
    currentMed: 'anti-hipertensivo',
    prescribedTags: ['AINEs'],
    risk: 'Reduz eficácia do anti-hipertensivo',
  },
  {
    currentMed: 'antidepressivo',
    prescribedTags: ['Tramadol'],
    risk: 'Risco de síndrome serotoninérgico',
  },
];

// Common anti-hypertensives and antidepressants for matching
const ANTI_HYPERTENSIVES = ['losartan', 'enalapril', 'amlodipina', 'ramipril', 'valsartan', 'lisinopril', 'anti-hipertensivo'];
const ANTIDEPRESSANTS = ['sertralina', 'fluoxetina', 'paroxetina', 'escitalopram', 'venlafaxina', 'duloxetina', 'antidepressivo'];

function matchesCurrentMed(patientMedName: string, interactionPattern: string): boolean {
  const lower = patientMedName.toLowerCase();
  if (interactionPattern === 'anti-hipertensivo') {
    return ANTI_HYPERTENSIVES.some(h => lower.includes(h));
  }
  if (interactionPattern === 'antidepressivo') {
    return ANTIDEPRESSANTS.some(a => lower.includes(a));
  }
  return lower.includes(interactionPattern);
}

export interface InteractionWarning {
  currentMedName: string;
  prescribedMedName: string;
  risk: string;
}

export function getMedicationInteractions(
  med: MedicationDef,
  patientCurrentMeds: { name: string; dosage: string }[]
): InteractionWarning[] {
  const warnings: InteractionWarning[] = [];

  for (const interaction of DRUG_INTERACTIONS) {
    // Check if patient takes the interacting medication
    const matchedPatientMed = patientCurrentMeds.find(pm =>
      matchesCurrentMed(pm.name, interaction.currentMed)
    );
    if (!matchedPatientMed) continue;

    // Check if prescribed med matches via tags or name
    const matchesByTag = med.allergenTags.some(tag =>
      interaction.prescribedTags.includes(tag)
    );
    const matchesByName = interaction.prescribedTags.some(p =>
      med.name.toLowerCase().includes(p.toLowerCase())
    );

    if (matchesByTag || matchesByName) {
      warnings.push({
        currentMedName: matchedPatientMed.name,
        prescribedMedName: med.name,
        risk: interaction.risk,
      });
    }
  }

  return warnings;
}
