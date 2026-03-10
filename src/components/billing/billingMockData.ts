export const patientPayments = [
  { id: '1', date: '15 Jan 2026', description: 'Teleconsulta Dr. Gonçalo Pipo', amount: 20, method: 'Visa ****4532', type: 'teleconsulta' },
  { id: '2', date: '1 Jan 2026', description: 'Plano Pro (mensal)', amount: 4.99, method: 'Visa ****4532', type: 'plano' },
  { id: '3', date: '20 Dez 2025', description: 'Teleconsulta Dr. Alexandre Bernardo', amount: 20, method: 'MB WAY', type: 'teleconsulta' },
  { id: '4', date: '1 Dez 2025', description: 'Plano Pro (mensal)', amount: 4.99, method: 'Visa ****4532', type: 'plano' },
  { id: '5', date: '15 Nov 2025', description: 'Teleconsulta Dr. Gil Santos', amount: 20, method: 'Visa ****4532', type: 'teleconsulta' },
];

export const dentistTeleconsultas = [
  { id: '1', date: '15 Jan', patient: 'João Silva', duration: '30min', amount: 20, commission: 3, net: 17 },
  { id: '2', date: '12 Jan', patient: 'Maria Silva', duration: '30min', amount: 20, commission: 3, net: 17 },
  { id: '3', date: '10 Jan', patient: 'Ana Costa', duration: '30min', amount: 20, commission: 3, net: 17 },
  { id: '4', date: '8 Jan', patient: 'Pedro Santos', duration: '45min', amount: 25, commission: 3.75, net: 21.25 },
  { id: '5', date: '5 Jan', patient: 'Sofia Mendes', duration: '30min', amount: 20, commission: 3, net: 17 },
  { id: '6', date: '3 Jan', patient: 'Ricardo Oliveira', duration: '30min', amount: 20, commission: 3, net: 17 },
  { id: '7', date: '28 Dez', patient: 'Carla Rodrigues', duration: '30min', amount: 20, commission: 3, net: 17 },
  { id: '8', date: '25 Dez', patient: 'Tiago Ferreira', duration: '30min', amount: 20, commission: 3, net: 17 },
  { id: '9', date: '22 Dez', patient: 'Inês Pereira', duration: '45min', amount: 25, commission: 3.75, net: 21.25 },
  { id: '10', date: '20 Dez', patient: 'Miguel Alves', duration: '30min', amount: 20, commission: 3, net: 17 },
  { id: '11', date: '18 Dez', patient: 'Beatriz Sousa', duration: '30min', amount: 20, commission: 3, net: 17 },
  { id: '12', date: '15 Dez', patient: 'Hugo Martins', duration: '30min', amount: 20, commission: 3, net: 17 },
];

export const dentistRevenueMonths = [
  { month: 'Ago', presencial: 1800, teleconsulta: 180 },
  { month: 'Set', presencial: 2100, teleconsulta: 200 },
  { month: 'Out', presencial: 2300, teleconsulta: 220 },
  { month: 'Nov', presencial: 2000, teleconsulta: 200 },
  { month: 'Dez', presencial: 2200, teleconsulta: 210 },
  { month: 'Jan', presencial: 2210, teleconsulta: 240 },
];

export const clinicDentistRevenue = [
  { id: '1', name: 'Dr. Gonçalo Pipo', consultas: 52, tele: 15, revenue: 4200, color: 'hsl(210, 80%, 55%)' },
  { id: '2', name: 'Dr. Alexandre Bernardo', consultas: 48, tele: 12, revenue: 3800, color: 'hsl(150, 60%, 45%)' },
  { id: '3', name: 'Dr. Gil Santos', consultas: 45, tele: 18, revenue: 4800, color: 'hsl(30, 80%, 55%)' },
];

export const savedCards = [
  { id: '1', type: 'Visa', last4: '4532', isDefault: true },
  { id: '2', type: 'Mastercard', last4: '8901', isDefault: false },
];

export function generateReceipt(id: string, description: string, amount: number, method: string) {
  const receiptContent = `
RECIBO — SmileCheck
═══════════════════════════════════

Nº: SC-2026-${id.padStart(5, '0')}
Data: ${new Date().toLocaleDateString('pt-PT')}

Serviço: ${description}

Valor (s/ IVA): €${(amount / 1.23).toFixed(2)}
IVA (23%): €${(amount - amount / 1.23).toFixed(2)}
Total: €${amount.toFixed(2)}

Método: ${method}

═══════════════════════════════════
SmileCheck, Lda.
NIF: 509 000 000
Rua da Saúde, 100 · 1000-001 Lisboa
info@smilecheck.pt
  `.trim();

  const blob = new Blob([receiptContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `recibo-SC-2026-${id.padStart(5, '0')}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
