import { Consultation, Dentist, Clinic, TimeSlot } from '@/types/calendar';

export const mockClinics: Clinic[] = [
  { id: '1', name: 'Clínica Dentária SmileCheck', address: 'Av. da Liberdade 123, Lisboa', distance: 2.5 },
  { id: '2', name: 'Centro Dentário Sorriso', address: 'Rua Augusta 45, Lisboa', distance: 4.2 },
];

export const mockDentists: Dentist[] = [
  { id: '1', name: 'Dr. Carlos Silva', specialty: 'Ortodontia' },
  { id: '2', name: 'Dra. Ana Santos', specialty: 'Endodontia' },
  { id: '3', name: 'Dr. Miguel Costa', specialty: 'Periodontia' },
];

export const mockConsultations: Consultation[] = [
  {
    id: '1',
    type: 'teleconsulta',
    date: new Date(2026, 0, 28),
    time: '09:30',
    duration: 30,
    patient: {
      id: 'p1',
      name: 'Maria Oliveira',
      phone: '+351 912 345 678',
      rating: 4.8,
      level: 'Gold',
    },
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
    date: new Date(2026, 0, 28),
    time: '11:00',
    duration: 45,
    patient: {
      id: 'p2',
      name: 'João Ferreira',
      phone: '+351 923 456 789',
      rating: 4.5,
      level: 'Silver',
    },
    dentist: mockDentists[1],
    clinic: mockClinics[0],
    price: 60,
    isPaid: false,
  },
  {
    id: '3',
    type: 'teleconsulta',
    date: new Date(2026, 0, 28),
    time: '14:30',
    duration: 20,
    patient: {
      id: 'p3',
      name: 'Sofia Martins',
      phone: '+351 934 567 890',
      rating: 5.0,
      level: 'Platinum',
    },
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
  {
    id: '4',
    type: 'presencial',
    date: new Date(2026, 0, 29),
    time: '10:00',
    duration: 60,
    patient: {
      id: 'p4',
      name: 'Pedro Almeida',
      phone: '+351 945 678 901',
      rating: 4.2,
      level: 'Bronze',
    },
    dentist: mockDentists[2],
    clinic: mockClinics[0],
    price: 80,
    isPaid: true,
    paymentMethod: 'Transferência',
  },
  {
    id: '5',
    type: 'teleconsulta',
    date: new Date(2026, 0, 30),
    time: '16:00',
    duration: 30,
    patient: {
      id: 'p5',
      name: 'Rita Gomes',
      phone: '+351 956 789 012',
      rating: 4.7,
      level: 'Gold',
    },
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
];

export const generateTimeSlots = (date: Date, consultations: Consultation[]): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const dayConsultations = consultations.filter(
    c => c.date.toDateString() === date.toDateString()
  );

  for (let hour = 8; hour < 20; hour++) {
    for (let minutes = 0; minutes < 60; minutes += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      const consultation = dayConsultations.find(c => c.time === timeString);
      
      // Block lunch time
      if (hour === 13) {
        slots.push({
          time: timeString,
          status: 'bloqueado',
          blockReason: 'ALMOÇO',
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
