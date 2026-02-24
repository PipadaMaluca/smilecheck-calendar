import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { UserRole } from '@/types/calendar';

interface NotifOption {
  id: string;
  label: string;
  defaultChecked: boolean;
}

const PATIENT_OPTIONS: NotifOption[] = [
  { id: 'lembrete_24h', label: 'Lembrete 24h antes da consulta', defaultChecked: true },
  { id: 'lembrete_1h', label: 'Lembrete 1h antes da consulta', defaultChecked: true },
  { id: 'feedback', label: 'Pedir feedback após consulta', defaultChecked: true },
  { id: 'receita', label: 'Nova receita disponível', defaultChecked: true },
  { id: 'referencia', label: 'Nova carta de referência', defaultChecked: true },
  { id: 'consulta_alterada', label: 'Consulta alterada/cancelada', defaultChecked: true },
  { id: 'pontos', label: 'Pontos ganhos/perdidos', defaultChecked: true },
  { id: 'mensagem', label: 'Novas mensagens', defaultChecked: true },
  { id: 'referral_usado', label: 'Código referral usado', defaultChecked: true },
];

const DENTIST_OPTIONS: NotifOption[] = [
  { id: 'novo_agendamento', label: 'Novo paciente agendou consulta', defaultChecked: false },
  { id: 'paciente_confirmou', label: 'Paciente confirmou consulta', defaultChecked: true },
  { id: 'paciente_cancelou', label: 'Paciente cancelou consulta', defaultChecked: true },
  { id: 'sala_espera', label: 'Paciente em sala de espera', defaultChecked: true },
  { id: 'feedback_recebido', label: 'Feedback recebido de paciente', defaultChecked: true },
  { id: 'mensagem', label: 'Novas mensagens', defaultChecked: true },
  { id: 'pontos', label: 'Pontos ganhos', defaultChecked: true },
  { id: 'referral_usado', label: 'Código referral usado', defaultChecked: true },
  { id: 'referenciou_paciente', label: 'Paciente referenciado (10 pontos)', defaultChecked: true },
];

const CLINIC_OPTIONS: NotifOption[] = [
  { id: 'novo_agendamento', label: 'Novo agendamento', defaultChecked: false },
  { id: 'paciente_confirmou_cancelou', label: 'Paciente confirmou/cancelou', defaultChecked: true },
  { id: 'resumo_diario', label: 'Resumo diário de estatísticas', defaultChecked: true },
  { id: 'novo_dentista', label: 'Novo dentista registou-se', defaultChecked: true },
  { id: 'mensagem', label: 'Novas mensagens', defaultChecked: true },
  { id: 'referral_usado', label: 'Código referral usado', defaultChecked: true },
];

function getOptionsForRole(role: UserRole): NotifOption[] {
  switch (role) {
    case 'patient': return PATIENT_OPTIONS;
    case 'dentist': return DENTIST_OPTIONS;
    case 'clinic': return CLINIC_OPTIONS;
    default: return PATIENT_OPTIONS;
  }
}

interface NotificationSettingsSectionProps {
  userRole: UserRole;
}

export function NotificationSettingsSection({ userRole }: NotificationSettingsSectionProps) {
  const options = getOptionsForRole(userRole);
  const [checked, setChecked] = useState<Record<string, boolean>>(
    () => Object.fromEntries(options.map(o => [o.id, o.defaultChecked]))
  );

  const toggle = (id: string) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Card className="bg-card/80 backdrop-blur border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Notificações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {options.map(option => (
          <label key={option.id} className="flex items-center gap-3 cursor-pointer py-1">
            <Checkbox
              checked={checked[option.id] ?? option.defaultChecked}
              onCheckedChange={() => toggle(option.id)}
            />
            <span className="text-sm text-foreground">{option.label}</span>
          </label>
        ))}
      </CardContent>
    </Card>
  );
}
