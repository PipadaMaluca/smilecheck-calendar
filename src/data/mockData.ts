import { Consultation, Dentist, Clinic, TimeSlot } from '@/types/calendar';

export const mockClinics: Clinic[] = [
  { id: '1', name: 'Clínica Dentária SmileCheck', address: 'Av. da Liberdade 123, Lisboa', distance: 2.5 },
  { id: '2', name: 'Centro Dentário Sorriso', address: 'Rua Augusta 45, Lisboa', distance: 4.2 },
];

export const mockDentists: Dentist[] = [
  { id: '1', name: 'Dr. Gonçalo Pipo', specialty: 'Ortodontia' },
  { id: '2', name: 'Dr. Alexandre Bernardo', specialty: 'Endodontia' },
  { id: '3', name: 'Dr. Gil Santos', specialty: 'Periodontia' },
];

// Helper to create patient
const createPatient = (id: string, name: string, phone: string, rating: number, level: string) => ({
  id,
  name,
  phone,
  rating,
  level,
});

export const mockConsultations: Consultation[] = [
  // ===== JANUARY 28 (existing data) =====
  {
    id: '1',
    type: 'teleconsulta',
    category: 'teleconsulta',
    date: new Date(2026, 0, 28),
    time: '09:30',
    duration: 30,
    patient: createPatient('p1', 'Maria Oliveira', '+351 912 345 678', 4.8, 'Gold'),
    dentist: mockDentists[0],
    clinic: mockClinics[0],
    price: 25,
    isPaid: true,
    paymentMethod: 'MB Way',
    triage: {
      symptom: 'Dor no dente molar inferior direito',
      duration: 'Há 3 dias',
      intensity: 4,
      photos: 3,
      urgency: 'prioritario',
    },
  },
  {
    id: '2',
    type: 'presencial',
    category: 'restauracao',
    date: new Date(2026, 0, 28),
    time: '11:00',
    duration: 45,
    patient: createPatient('p2', 'João Ferreira', '+351 923 456 789', 4.5, 'Silver'),
    dentist: mockDentists[1],
    clinic: mockClinics[0],
    price: 60,
    isPaid: false,
  },
  {
    id: '3',
    type: 'teleconsulta',
    category: 'teleconsulta',
    date: new Date(2026, 0, 28),
    time: '14:30',
    duration: 20,
    patient: createPatient('p3', 'Sofia Martins', '+351 934 567 890', 5.0, 'Platinum'),
    dentist: mockDentists[0],
    clinic: mockClinics[0],
    price: 20,
    isPaid: true,
    paymentMethod: 'Cartão',
    triage: {
      symptom: 'Sensibilidade ao frio nos dentes frontais',
      duration: 'Há 1 semana',
      intensity: 2,
      photos: 1,
      urgency: 'rotina',
    },
  },
  
  // ===== JANUARY 29 =====
  {
    id: '4',
    type: 'presencial',
    category: 'protese',
    date: new Date(2026, 0, 29),
    time: '10:00',
    duration: 60,
    patient: createPatient('p4', 'Pedro Almeida', '+351 945 678 901', 4.2, 'Bronze'),
    dentist: mockDentists[2],
    clinic: mockClinics[0],
    price: 80,
    isPaid: true,
    paymentMethod: 'Transferência',
  },
  
  // ===== JANUARY 30 =====
  {
    id: '5',
    type: 'teleconsulta',
    category: 'teleconsulta',
    date: new Date(2026, 0, 30),
    time: '16:00',
    duration: 30,
    patient: createPatient('p5', 'Rita Gomes', '+351 956 789 012', 4.7, 'Gold'),
    dentist: mockDentists[0],
    clinic: mockClinics[0],
    price: 25,
    isPaid: false,
    triage: {
      symptom: 'Gengivas a sangrar durante escovagem',
      duration: 'Há 2 semanas',
      intensity: 3,
      photos: 2,
      urgency: 'prioritario',
    },
  },
  
  // ===== JANUARY 31 - Full Day Example for Dr. Carlos Silva =====
  // MANHÃ (Clínica)
  {
    id: '31-1',
    type: 'presencial',
    category: 'primeira_consulta',
    date: new Date(2026, 0, 31),
    time: '09:00',
    duration: 30,
    patient: createPatient('p31-1', 'Pedro Almeida', '+351 911 111 111', 4.5, 'Bronze'),
    dentist: mockDentists[0], // Dr. Gonçalo Pipo
    clinic: mockClinics[0],
    price: 40,
    isPaid: true,
    paymentMethod: 'MB Way',
    notes: 'Check-up completo',
  },
  {
    id: '31-2',
    type: 'presencial',
    category: 'restauracao',
    date: new Date(2026, 0, 31),
    time: '09:30',
    duration: 30,
    patient: createPatient('p31-2', 'Maria Silva', '+351 922 222 222', 4.8, 'Gold'),
    dentist: mockDentists[0],
    clinic: mockClinics[0],
    price: 60,
    isPaid: true,
    paymentMethod: 'Cartão',
    notes: 'Dente 36',
  },
  {
    id: '31-3',
    type: 'presencial',
    category: 'destartarizacao',
    date: new Date(2026, 0, 31),
    time: '10:00',
    duration: 30,
    patient: createPatient('p31-3', 'João Costa', '+351 933 333 333', 4.2, 'Silver'),
    dentist: mockDentists[0],
    clinic: mockClinics[0],
    price: 50,
    isPaid: false,
    notes: 'Limpeza semestral',
  },
  {
    id: '31-4',
    type: 'presencial',
    category: 'urgencia',
    date: new Date(2026, 0, 31),
    time: '10:30',
    duration: 30,
    patient: createPatient('p31-4', 'Ana Ferreira', '+351 944 444 444', 3.9, 'Bronze'),
    dentist: mockDentists[0],
    clinic: mockClinics[0],
    price: 80,
    isPaid: true,
    paymentMethod: 'Dinheiro',
    notes: 'Dor aguda dente 48',
    triage: {
      symptom: 'Dor intensa no dente',
      duration: 'Desde ontem',
      intensity: 5,
      photos: 2,
      urgency: 'urgente',
    },
  },
  {
    id: '31-5',
    type: 'presencial',
    category: 'endodontia',
    date: new Date(2026, 0, 31),
    time: '11:00',
    duration: 60,
    patient: createPatient('p31-5', 'Carlos Santos', '+351 955 555 555', 4.6, 'Gold'),
    dentist: mockDentists[0],
    clinic: mockClinics[0],
    price: 150,
    isPaid: true,
    paymentMethod: 'Transferência',
    notes: 'Desvitalização 46',
  },
  {
    id: '31-6',
    type: 'teleconsulta',
    category: 'teleconsulta_urgente',
    date: new Date(2026, 0, 31),
    time: '12:00',
    duration: 30,
    patient: createPatient('p31-6', 'Rita Oliveira', '+351 966 666 666', 4.3, 'Silver'),
    dentist: mockDentists[0],
    clinic: mockClinics[0],
    price: 35,
    isPaid: false,
    triage: {
      symptom: 'Inchaço na gengiva',
      duration: 'Há 2 dias',
      intensity: 4,
      photos: 3,
      urgency: 'urgente',
    },
  },
  
  // TARDE (Clínica)
  {
    id: '31-7',
    type: 'presencial',
    category: 'cirurgia',
    date: new Date(2026, 0, 31),
    time: '14:00',
    duration: 60,
    patient: createPatient('p31-7', 'Miguel Rodrigues', '+351 977 777 777', 4.9, 'Platinum'),
    dentist: mockDentists[0],
    clinic: mockClinics[0],
    price: 200,
    isPaid: true,
    paymentMethod: 'Cartão',
    notes: 'Extração dente 48',
  },
  {
    id: '31-8',
    type: 'presencial',
    category: 'protese',
    date: new Date(2026, 0, 31),
    time: '15:00',
    duration: 60,
    patient: createPatient('p31-8', 'Teresa Martins', '+351 988 888 888', 4.4, 'Gold'),
    dentist: mockDentists[0],
    clinic: mockClinics[0],
    price: 180,
    isPaid: false,
    notes: 'Coroa cerâmica 11',
  },
  {
    id: '31-9',
    type: 'presencial',
    category: 'restauracao',
    date: new Date(2026, 0, 31),
    time: '16:00',
    duration: 30,
    patient: createPatient('p31-9', 'Bruno Pereira', '+351 999 999 999', 4.1, 'Silver'),
    dentist: mockDentists[0],
    clinic: mockClinics[0],
    price: 60,
    isPaid: true,
    paymentMethod: 'MB Way',
    notes: 'Restauração 25',
  },
  {
    id: '31-10',
    type: 'presencial',
    category: 'primeira_consulta',
    date: new Date(2026, 0, 31),
    time: '16:30',
    duration: 30,
    patient: createPatient('p31-10', 'Sofia Lopes', '+351 910 101 010', 5.0, 'Platinum'),
    dentist: mockDentists[0],
    clinic: mockClinics[0],
    price: 40,
    isPaid: true,
    paymentMethod: 'Cartão',
    notes: 'Avaliação ortodontia',
  },
  {
    id: '31-11',
    type: 'presencial',
    category: 'destartarizacao',
    date: new Date(2026, 0, 31),
    time: '17:00',
    duration: 30,
    patient: createPatient('p31-11', 'André Gomes', '+351 920 202 020', 4.3, 'Gold'),
    dentist: mockDentists[0],
    clinic: mockClinics[0],
    price: 50,
    isPaid: false,
  },
  {
    id: '31-12',
    type: 'presencial',
    category: 'restauracao',
    date: new Date(2026, 0, 31),
    time: '17:30',
    duration: 30,
    patient: createPatient('p31-12', 'Helena Nunes', '+351 930 303 030', 4.7, 'Silver'),
    dentist: mockDentists[0],
    clinic: mockClinics[0],
    price: 60,
    isPaid: true,
    paymentMethod: 'Dinheiro',
    notes: 'Dente 14',
  },
  
  // NOITE (Teleconsultas)
  {
    id: '31-13',
    type: 'teleconsulta',
    category: 'teleconsulta',
    date: new Date(2026, 0, 31),
    time: '18:30',
    duration: 30,
    patient: createPatient('p31-13', 'Paulo Dias', '+351 940 404 040', 4.5, 'Gold'),
    dentist: mockDentists[0],
    clinic: mockClinics[0],
    price: 25,
    isPaid: true,
    paymentMethod: 'MB Way',
  },
  {
    id: '31-14',
    type: 'teleconsulta',
    category: 'teleconsulta',
    date: new Date(2026, 0, 31),
    time: '19:30',
    duration: 30,
    patient: createPatient('p31-14', 'Diana Cruz', '+351 950 505 050', 4.8, 'Platinum'),
    dentist: mockDentists[0],
    clinic: mockClinics[0],
    price: 25,
    isPaid: false,
  },
  {
    id: '31-15',
    type: 'teleconsulta',
    category: 'teleconsulta',
    date: new Date(2026, 0, 31),
    time: '20:30',
    duration: 30,
    patient: createPatient('p31-15', 'Tiago Moreira', '+351 960 606 060', 4.2, 'Silver'),
    dentist: mockDentists[0],
    clinic: mockClinics[0],
    price: 25,
    isPaid: true,
    paymentMethod: 'Cartão',
  },
  {
    id: '31-16',
    type: 'teleconsulta',
    category: 'teleconsulta',
    date: new Date(2026, 0, 31),
    time: '21:00',
    duration: 30,
    patient: createPatient('p31-16', 'Inês Cardoso', '+351 970 707 070', 4.9, 'Gold'),
    dentist: mockDentists[0],
    clinic: mockClinics[0],
    price: 25,
    isPaid: true,
    paymentMethod: 'MB Way',
  },
];

export const generateTimeSlots = (date: Date, consultations: Consultation[]): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const dayConsultations = consultations.filter(
    c => c.date.toDateString() === date.toDateString()
  );

  // Extended hours for January 31 (09:00 - 22:00)
  const isJan31 = date.getDate() === 31 && date.getMonth() === 0;
  const startHour = 8;
  const endHour = isJan31 ? 22 : 20;

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minutes = 0; minutes < 60; minutes += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      const consultation = dayConsultations.find(c => c.time === timeString);
      
      // Block lunch time (13:00-14:00)
      if (hour === 13) {
        slots.push({
          time: timeString,
          status: 'bloqueado',
          blockReason: 'ALMOÇO',
        });
      // Also block dinner break for Jan 31 (18:00-18:30 and 19:00-19:30 and 20:00-20:30)
      } else if (isJan31 && ((hour === 18 && minutes === 0) || (hour === 19 && minutes === 0) || (hour === 20 && minutes === 0))) {
        // These are pauses between teleconsultas
        slots.push({
          time: timeString,
          status: 'livre',
        });
      } else if (consultation) {
        slots.push({
          time: timeString,
          status: 'ocupado',
          consultation,
        });
      } else {
        slots.push({
          time: timeString,
          status: 'livre',
        });
      }
    }
  }

  return slots;
};
