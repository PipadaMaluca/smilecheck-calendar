export interface RewardProduct {
  id: string;
  name: string;
  description?: string;
  points: number;
  category: string;
  subcategory?: string;
  brand?: string;
  discount?: string;
  emoji?: string;
}

export interface Brand {
  id: string;
  name: string;
  description: string;
  products: RewardProduct[];
}

export interface RewardsTabConfig {
  key: string;
  label: string;
  type: 'products' | 'brands';
  products?: RewardProduct[];
  brands?: Brand[];
}

export interface RedeemHistoryItem {
  id: string;
  name: string;
  points: number;
  date: string;
  code: string;
  status: 'pendente' | 'usado' | 'expirado';
}

// ═══════════════════════════════════════
// PATIENT DATA
// ═══════════════════════════════════════

const patientConsultas: RewardProduct[] = [
  { id: 'pc1', name: 'Teleconsulta com 50% desconto', points: 150, category: 'Consultas', emoji: '📱', discount: '50%' },
  { id: 'pc2', name: 'Teleconsulta grátis', points: 300, category: 'Consultas', emoji: '📱' },
];

const patientHigieneOral: RewardProduct[] = [
  // Fio Dentário
  { id: 'ph1', name: 'Fio dentário clássico', points: 50, category: 'Higiene Oral', subcategory: 'Fio Dentário', emoji: '🧵' },
  { id: 'ph2', name: 'Fio dentário com cera', points: 60, category: 'Higiene Oral', subcategory: 'Fio Dentário', emoji: '🧵' },
  { id: 'ph3', name: 'Raspador de língua', points: 60, category: 'Higiene Oral', subcategory: 'Outros Acessórios', emoji: '👅' },
  { id: 'ph4', name: 'Fio dentário para aparelho/implantes', points: 80, category: 'Higiene Oral', subcategory: 'Fio Dentário', emoji: '🧵' },
  // Escovas + Pastas
  { id: 'ph5', name: 'Escova manual básica', points: 80, category: 'Higiene Oral', subcategory: 'Escovas', emoji: '🪥' },
  { id: 'ph6', name: 'Pasta anti-cáries', points: 80, category: 'Higiene Oral', subcategory: 'Pastas de Dentes', emoji: '🧴' },
  { id: 'ph7', name: 'Escovilhões interdentários (pack)', points: 100, category: 'Higiene Oral', subcategory: 'Fio Dentário', emoji: '🪥' },
  { id: 'ph8', name: 'Elixir anti-cáries', points: 100, category: 'Higiene Oral', subcategory: 'Elixires/Bochechos', emoji: '🫗' },
  { id: 'ph9', name: 'Elixir sem álcool', points: 100, category: 'Higiene Oral', subcategory: 'Elixires/Bochechos', emoji: '🫗' },
  { id: 'ph10', name: 'Pasta branqueadora', points: 100, category: 'Higiene Oral', subcategory: 'Pastas de Dentes', emoji: '🧴' },
  { id: 'ph11', name: 'Pasta para sensibilidade', points: 100, category: 'Higiene Oral', subcategory: 'Pastas de Dentes', emoji: '🧴' },
  { id: 'ph12', name: 'Elixir para gengivas sensíveis', points: 120, category: 'Higiene Oral', subcategory: 'Elixires/Bochechos', emoji: '🫗' },
  { id: 'ph13', name: 'Escova manual premium', points: 120, category: 'Higiene Oral', subcategory: 'Escovas', emoji: '🪥' },
  { id: 'ph14', name: 'Pasta para gengivas', points: 120, category: 'Higiene Oral', subcategory: 'Pastas de Dentes', emoji: '🧴' },
  { id: 'ph15', name: 'Cabeças de substituição (x2)', points: 150, category: 'Higiene Oral', subcategory: 'Escovas', emoji: '🪥' },
  { id: 'ph16', name: 'Elixir branqueador', points: 150, category: 'Higiene Oral', subcategory: 'Elixires/Bochechos', emoji: '🫗' },
  { id: 'ph17', name: 'Kit de viagem', points: 200, category: 'Higiene Oral', subcategory: 'Outros Acessórios', emoji: '🧳' },
  { id: 'ph18', name: 'Cabeças de substituição (x4)', points: 280, category: 'Higiene Oral', subcategory: 'Escovas', emoji: '🪥' },
  { id: 'ph19', name: 'Protetor bucal (bruxismo)', points: 400, category: 'Higiene Oral', subcategory: 'Outros Acessórios', emoji: '🦷' },
  { id: 'ph20', name: 'Escova eléctrica básica', points: 1500, category: 'Higiene Oral', subcategory: 'Escovas', emoji: '🪥' },
  { id: 'ph21', name: 'Irrigador oral básico', points: 2000, category: 'Higiene Oral', subcategory: 'Outros Acessórios', emoji: '💧' },
  { id: 'ph22', name: 'Escova eléctrica premium', points: 3500, category: 'Higiene Oral', subcategory: 'Escovas', emoji: '🪥' },
  { id: 'ph23', name: 'Irrigador oral premium', points: 3500, category: 'Higiene Oral', subcategory: 'Outros Acessórios', emoji: '💧' },
];

const patientBrands: Brand[] = [
  {
    id: 'aquafresh', name: 'AQUAFRESH', description: 'Pastas e escovas',
    products: [
      { id: 'aq1', name: 'Pasta Triple Protection', points: 80, category: 'Marcas', brand: 'AQUAFRESH', emoji: '🧴' },
      { id: 'aq2', name: 'Pasta Intense White', points: 100, category: 'Marcas', brand: 'AQUAFRESH', emoji: '🧴' },
      { id: 'aq3', name: 'Escova Manual Flex', points: 90, category: 'Marcas', brand: 'AQUAFRESH', emoji: '🪥' },
    ],
  },
  {
    id: 'colgate', name: 'COLGATE', description: 'Pastas, escovas e elixires',
    products: [
      { id: 'co1', name: 'Pasta Total Original', points: 80, category: 'Marcas', brand: 'COLGATE', emoji: '🧴' },
      { id: 'co2', name: 'Pasta Max White', points: 100, category: 'Marcas', brand: 'COLGATE', emoji: '🧴' },
      { id: 'co3', name: 'Elixir Plax', points: 100, category: 'Marcas', brand: 'COLGATE', emoji: '🫗' },
      { id: 'co4', name: 'Escova 360 Advanced', points: 120, category: 'Marcas', brand: 'COLGATE', emoji: '🪥' },
      { id: 'co5', name: 'Pasta Sensitive Pro-Relief', points: 120, category: 'Marcas', brand: 'COLGATE', emoji: '🧴' },
    ],
  },
  {
    id: 'lacer', name: 'LACER', description: 'Pastas e elixires especializados',
    products: [
      { id: 'la1', name: 'Pasta Lacer', points: 90, category: 'Marcas', brand: 'LACER', emoji: '🧴' },
      { id: 'la2', name: 'Elixir Lacer', points: 100, category: 'Marcas', brand: 'LACER', emoji: '🫗' },
      { id: 'la3', name: 'Pasta Lacer Oros', points: 120, category: 'Marcas', brand: 'LACER', emoji: '🧴' },
      { id: 'la4', name: 'Gel Bioadhesivo Lacer', points: 150, category: 'Marcas', brand: 'LACER', emoji: '🧴' },
    ],
  },
  {
    id: 'oralb', name: 'ORAL-B', description: 'Escovas elétricas, fio e elixires',
    products: [
      { id: 'ob1', name: 'Fio Dentário Essential Floss', points: 80, category: 'Marcas', brand: 'ORAL-B', emoji: '🧵' },
      { id: 'ob2', name: 'Fio Dentário Superfloss', points: 100, category: 'Marcas', brand: 'ORAL-B', emoji: '🧵' },
      { id: 'ob3', name: 'Elixir Pro-Expert', points: 120, category: 'Marcas', brand: 'ORAL-B', emoji: '🫗' },
      { id: 'ob4', name: 'Escova Manual Pro-Expert', points: 150, category: 'Marcas', brand: 'ORAL-B', emoji: '🪥' },
      { id: 'ob5', name: 'Escova Eléctrica Vitality', points: 1800, category: 'Marcas', brand: 'ORAL-B', emoji: '🪥' },
      { id: 'ob6', name: 'Escova Eléctrica Pro 2', points: 2500, category: 'Marcas', brand: 'ORAL-B', emoji: '🪥' },
      { id: 'ob7', name: 'Irrigador Oral Aquacare', points: 3000, category: 'Marcas', brand: 'ORAL-B', emoji: '💧' },
      { id: 'ob8', name: 'Escova Eléctrica iO Series 5', points: 4000, category: 'Marcas', brand: 'ORAL-B', emoji: '🪥' },
    ],
  },
  {
    id: 'parodontax', name: 'PARODONTAX', description: 'Pastas para gengivas',
    products: [
      { id: 'pa1', name: 'Pasta Original', points: 100, category: 'Marcas', brand: 'PARODONTAX', emoji: '🧴' },
      { id: 'pa2', name: 'Pasta Extra Fresh', points: 110, category: 'Marcas', brand: 'PARODONTAX', emoji: '🧴' },
      { id: 'pa3', name: 'Pasta Complete Protection', points: 130, category: 'Marcas', brand: 'PARODONTAX', emoji: '🧴' },
    ],
  },
  {
    id: 'sensodyne', name: 'SENSODYNE', description: 'Pastas para sensibilidade',
    products: [
      { id: 'se1', name: 'Pasta Repair & Protect', points: 100, category: 'Marcas', brand: 'SENSODYNE', emoji: '🧴' },
      { id: 'se2', name: 'Pasta Rapid Relief', points: 110, category: 'Marcas', brand: 'SENSODYNE', emoji: '🧴' },
      { id: 'se3', name: 'Pasta Pronamel', points: 120, category: 'Marcas', brand: 'SENSODYNE', emoji: '🧴' },
      { id: 'se4', name: 'Elixir Sensodyne', points: 120, category: 'Marcas', brand: 'SENSODYNE', emoji: '🫗' },
    ],
  },
];

// ═══════════════════════════════════════
// DENTIST DATA
// ═══════════════════════════════════════

const dentistSubscricao: RewardProduct[] = [
  { id: 'dd1', name: 'Destaque no perfil 1 semana', points: 300, category: 'Subscrição', emoji: '📍' },
  { id: 'dd2', name: 'Destaque no perfil 1 mês', points: 1000, category: 'Subscrição', emoji: '📍' },
  { id: 'ds1', name: '1 mês Pro grátis', points: 2000, category: 'Subscrição', emoji: '⭐' },
  { id: 'ds2', name: '1 mês Premium grátis', points: 3000, category: 'Subscrição', emoji: '👑' },
];

const dentistEquipamento: RewardProduct[] = [
  // Curetas e Instrumentos
  { id: 'de1', name: 'Espátulas Resinas Compostas 7pcs (Hu-Friedy)', points: 500, category: 'Equipamento', subcategory: 'Curetas e Instrumentos', discount: '10%', emoji: '🔧' },
  { id: 'de2', name: 'Conjunto 7 Curetas Gracey (LM-Instruments)', points: 700, category: 'Equipamento', subcategory: 'Curetas e Instrumentos', discount: '10%', emoji: '🔧' },
  { id: 'de3', name: 'Conjunto 7 Curetas Gracey (Hu-Friedy)', points: 800, category: 'Equipamento', subcategory: 'Curetas e Instrumentos', discount: '10%', emoji: '🔧' },
  // Turbinas e Peças de Mão
  { id: 'de4', name: 'NSK Ti-Max Z45L (45° com luz)', points: 1500, category: 'Equipamento', subcategory: 'Turbinas e Peças de Mão', discount: '10%', emoji: '⚙️' },
  { id: 'de5', name: 'W&H Alegra TE-98 LQ', points: 1800, category: 'Equipamento', subcategory: 'Turbinas e Peças de Mão', discount: '10%', emoji: '⚙️' },
  { id: 'de6', name: 'KaVo MASTERtorque M8900L', points: 2000, category: 'Equipamento', subcategory: 'Turbinas e Peças de Mão', discount: '10%', emoji: '⚙️' },
  // Lupas Dentárias
  { id: 'de7', name: 'ExamVision Lupas 2.5x', points: 2000, category: 'Equipamento', subcategory: 'Lupas Dentárias com Luz', discount: '10%', emoji: '🔍' },
  { id: 'de8', name: 'Orascoptic Lupas 3.0x', points: 2500, category: 'Equipamento', subcategory: 'Lupas Dentárias com Luz', discount: '10%', emoji: '🔍' },
  // Destartarização
  { id: 'de9', name: 'EMS Airflow One', points: 2500, category: 'Equipamento', subcategory: 'Destartarização (Airflow)', discount: '10%', emoji: '💨' },
  { id: 'de10', name: 'Zeiss EyeMag Pro', points: 3500, category: 'Equipamento', subcategory: 'Lupas Dentárias com Luz', discount: '10%', emoji: '🔍' },
  { id: 'de11', name: 'EMS Airflow Prophylaxis Master', points: 4000, category: 'Equipamento', subcategory: 'Destartarização (Airflow)', discount: '10%', emoji: '💨' },
  // Implantes
  { id: 'de12', name: 'NSK Surgic Pro2', points: 4500, category: 'Equipamento', subcategory: 'Implantes (Máquinas)', discount: '10%', emoji: '🦷' },
  { id: 'de13', name: 'W&H Implantmed SI-1023', points: 5000, category: 'Equipamento', subcategory: 'Implantes (Máquinas)', discount: '10%', emoji: '🦷' },
  { id: 'de14', name: 'Bien-Air Chiropro', points: 5500, category: 'Equipamento', subcategory: 'Implantes (Máquinas)', discount: '10%', emoji: '🦷' },
];

const dentistFormacao: RewardProduct[] = [
  // Congressos Portugal
  { id: 'df1', name: 'Bilhete Congresso SPEMD — 50% desconto', points: 1200, category: 'Formação', subcategory: 'Congressos Portugal', discount: '50%', emoji: '🎓' },
  { id: 'df2', name: 'Bilhete Congresso SPPO — 50% desconto', points: 1200, category: 'Formação', subcategory: 'Congressos Portugal', discount: '50%', emoji: '🎓' },
  { id: 'df3', name: 'Bilhete Congresso OMD — 50% desconto', points: 1500, category: 'Formação', subcategory: 'Congressos Portugal', discount: '50%', emoji: '🎓' },
  { id: 'df4', name: 'Bilhete Congresso SPEMD — grátis', points: 2400, category: 'Formação', subcategory: 'Congressos Portugal', emoji: '🎓' },
  { id: 'df5', name: 'Bilhete Congresso SPPO — grátis', points: 2400, category: 'Formação', subcategory: 'Congressos Portugal', emoji: '🎓' },
  { id: 'df6', name: 'Bilhete Congresso OMD — grátis', points: 3000, category: 'Formação', subcategory: 'Congressos Portugal', emoji: '🎓' },
  // Congressos Internacionais
  { id: 'df7', name: 'Bilhete Expodental Madrid — 50% desconto', points: 1800, category: 'Formação', subcategory: 'Congressos Internacionais', discount: '50%', emoji: '🌍' },
  { id: 'df8', name: 'Bilhete ADF Paris — 50% desconto', points: 2000, category: 'Formação', subcategory: 'Congressos Internacionais', discount: '50%', emoji: '🌍' },
  { id: 'df9', name: 'Bilhete IDS Cologne — 50% desconto', points: 2500, category: 'Formação', subcategory: 'Congressos Internacionais', discount: '50%', emoji: '🌍' },
  { id: 'df10', name: 'Bilhete Expodental Madrid — grátis', points: 3600, category: 'Formação', subcategory: 'Congressos Internacionais', emoji: '🌍' },
  { id: 'df11', name: 'Bilhete ADF Paris — grátis', points: 4000, category: 'Formação', subcategory: 'Congressos Internacionais', emoji: '🌍' },
  { id: 'df12', name: 'Bilhete IDS Cologne — grátis', points: 5000, category: 'Formação', subcategory: 'Congressos Internacionais', emoji: '🌍' },
];

// ═══════════════════════════════════════
// CLINIC DATA
// ═══════════════════════════════════════

const clinicSubscricao: RewardProduct[] = [
  { id: 'cd1', name: 'Destaque nos resultados 1 semana', points: 500, category: 'Subscrição', emoji: '📍' },
  { id: 'cd2', name: 'Destaque nos resultados 1 mês', points: 1800, category: 'Subscrição', emoji: '📍' },
  { id: 'cs1', name: '1 mês Pro grátis', points: 4000, category: 'Subscrição', emoji: '⭐' },
  { id: 'cs2', name: '1 mês Premium grátis', points: 5000, category: 'Subscrição', emoji: '👑' },
];

const clinicEquipamento: RewardProduct[] = [
  // Material em Bulk
  { id: 'ce1', name: 'Vale €50 em material (Promodentaire)', points: 500, category: 'Equipamento', subcategory: 'Material em Bulk', emoji: '📦' },
  { id: 'ce2', name: 'Vale €100 em material (Promodentaire)', points: 1000, category: 'Equipamento', subcategory: 'Material em Bulk', emoji: '📦' },
  { id: 'ce3', name: 'Seladora Melag MELAseal 200', points: 2000, category: 'Equipamento', subcategory: 'Esterilização', discount: '5%', emoji: '🔒' },
  { id: 'ce4', name: 'Vale €250 em material (Promodentaire)', points: 2500, category: 'Equipamento', subcategory: 'Material em Bulk', emoji: '📦' },
  { id: 'ce5', name: 'Bellus3D Face Camera', points: 3000, category: 'Equipamento', subcategory: 'Scanner Facial 3D', discount: '5%', emoji: '📸' },
  // Raio-X
  { id: 'ce6', name: 'Vatech EzSensor', points: 4500, category: 'Equipamento', subcategory: 'Raio-X Periapical', discount: '5%', emoji: '📡' },
  { id: 'ce7', name: 'Carestream RVG 6200', points: 5000, category: 'Equipamento', subcategory: 'Raio-X Periapical', discount: '5%', emoji: '📡' },
  { id: 'ce8', name: 'Planmeca ProSensor HD', points: 5500, category: 'Equipamento', subcategory: 'Raio-X Periapical', discount: '5%', emoji: '📡' },
  // Esterilização
  { id: 'ce9', name: 'Mocom Exacta', points: 6000, category: 'Equipamento', subcategory: 'Esterilização', discount: '5%', emoji: '🔒' },
  { id: 'ce10', name: 'W&H Lara', points: 7000, category: 'Equipamento', subcategory: 'Esterilização', discount: '5%', emoji: '🔒' },
  { id: 'ce11', name: 'Melag Vacuklav 24 B+', points: 8000, category: 'Equipamento', subcategory: 'Esterilização', discount: '5%', emoji: '🔒' },
  { id: 'ce12', name: 'Melag Melatherm 10', points: 9000, category: 'Equipamento', subcategory: 'Esterilização', discount: '5%', emoji: '🔒' },
  // Ortopantomógrafo
  { id: 'ce13', name: 'Vatech PaX-i', points: 15000, category: 'Equipamento', subcategory: 'Ortopantomógrafo', discount: '5%', emoji: '🏥' },
  { id: 'ce14', name: 'Carestream CS 8100', points: 16000, category: 'Equipamento', subcategory: 'Ortopantomógrafo', discount: '5%', emoji: '🏥' },
  { id: 'ce15', name: 'Planmeca ProOne', points: 18000, category: 'Equipamento', subcategory: 'Ortopantomógrafo', discount: '5%', emoji: '🏥' },
  // Scanner Facial
  { id: 'ce16', name: 'Artec Leo', points: 20000, category: 'Equipamento', subcategory: 'Scanner Facial 3D', discount: '5%', emoji: '📸' },
  // CBCT
  { id: 'ce17', name: 'Vatech PaX-i3D Green', points: 25000, category: 'Equipamento', subcategory: 'CBCT (Scanner 3D)', discount: '5%', emoji: '🖥️' },
  { id: 'ce18', name: 'Carestream CS 9600', points: 30000, category: 'Equipamento', subcategory: 'CBCT (Scanner 3D)', discount: '5%', emoji: '🖥️' },
  { id: 'ce19', name: 'Planmeca Viso G5', points: 35000, category: 'Equipamento', subcategory: 'CBCT (Scanner 3D)', discount: '5%', emoji: '🖥️' },
];

const clinicSoftware: RewardProduct[] = [
  { id: 'csw1', name: 'SmileCloud — 1 mês grátis', points: 1500, category: 'Software', subcategory: 'SMILECLOUD', emoji: '☁️' },
  { id: 'csw2', name: 'Medit — 1 mês grátis', points: 2000, category: 'Software', subcategory: 'MEDIT', emoji: '💻' },
  { id: 'csw3', name: 'Planmeca Romexis — 1 mês grátis', points: 2000, category: 'Software', subcategory: 'PLANMECA ROMEXIS', emoji: '💻' },
  { id: 'csw4', name: 'SmileCloud — 10% desconto anual', points: 2500, category: 'Software', subcategory: 'SMILECLOUD', discount: '10%', emoji: '☁️' },
  { id: 'csw5', name: 'Exocad — 1 mês grátis', points: 2500, category: 'Software', subcategory: 'EXOCAD', emoji: '💻' },
  { id: 'csw6', name: '3Shape — 1 mês grátis', points: 3000, category: 'Software', subcategory: '3SHAPE', emoji: '💻' },
  { id: 'csw7', name: 'Medit — 10% desconto anual', points: 3500, category: 'Software', subcategory: 'MEDIT', discount: '10%', emoji: '💻' },
  { id: 'csw8', name: 'Planmeca Romexis — 10% desconto anual', points: 3500, category: 'Software', subcategory: 'PLANMECA ROMEXIS', discount: '10%', emoji: '💻' },
  { id: 'csw9', name: 'Exocad — 10% desconto anual', points: 4000, category: 'Software', subcategory: 'EXOCAD', discount: '10%', emoji: '💻' },
  { id: 'csw10', name: '3Shape — 10% desconto anual', points: 5000, category: 'Software', subcategory: '3SHAPE', discount: '10%', emoji: '💻' },
];

// ═══════════════════════════════════════
// TABS CONFIG PER ROLE
// ═══════════════════════════════════════

const patientSubscricao: RewardProduct[] = [
  { id: 'ps1', name: '1 mês Pro grátis', points: 500, category: 'Subscrição', emoji: '⭐' },
  { id: 'ps2', name: '1 mês Premium grátis', points: 1000, category: 'Subscrição', emoji: '👑' },
];

export const REWARD_TABS: Record<string, RewardsTabConfig[]> = {
  patient: [
    { key: 'consultas', label: 'Consultas', type: 'products', products: patientConsultas },
    { key: 'higiene', label: 'Higiene Oral', type: 'products', products: patientHigieneOral },
    { key: 'marcas', label: 'Marcas', type: 'brands', brands: patientBrands },
    { key: 'subscricao', label: 'Subscrição', type: 'products', products: patientSubscricao },
  ],
  dentist: [
    { key: 'equipamento', label: 'Equipamento', type: 'products', products: dentistEquipamento },
    { key: 'formacao', label: 'Formação', type: 'products', products: dentistFormacao },
    { key: 'subscricao', label: 'Subscrição', type: 'products', products: dentistSubscricao },
  ],
  clinic: [
    { key: 'equipamento', label: 'Equipamento', type: 'products', products: clinicEquipamento },
    { key: 'software', label: 'Software', type: 'products', products: clinicSoftware },
    { key: 'subscricao', label: 'Subscrição', type: 'products', products: clinicSubscricao },
  ],
};

/** Collect ALL products for a role, sorted by points ascending */
export function getAllProductsForRole(role: string): RewardProduct[] {
  const tabs = REWARD_TABS[role] || REWARD_TABS.patient;
  const all: RewardProduct[] = [];
  tabs.forEach(tab => {
    if (tab.products) all.push(...tab.products);
    if (tab.brands) tab.brands.forEach(b => all.push(...b.products));
  });
  return all.sort((a, b) => a.points - b.points);
}

// ═══════════════════════════════════════
// MOCK HISTORY
// ═══════════════════════════════════════

export const MOCK_REDEEM_HISTORY: RedeemHistoryItem[] = [
  { id: 'h1', name: 'Fio dentário clássico', points: 50, date: '20 Fev 2026', code: 'SC-FIO-A3X9K2', status: 'usado' },
  { id: 'h2', name: 'Pasta anti-cáries', points: 80, date: '05 Fev 2026', code: 'SC-PAS-B7M4Q1', status: 'pendente' },
  { id: 'h3', name: 'Teleconsulta com 50% desconto', points: 150, date: '15 Jan 2026', code: 'SC-TEL-C2N8P5', status: 'pendente' },
  { id: 'h4', name: 'Kit de viagem', points: 200, date: '20 Dez 2025', code: 'SC-KIT-D6R3T8', status: 'expirado' },
];
