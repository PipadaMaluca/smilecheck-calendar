import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { UserRole } from '@/types/calendar';

interface NotifOption {
  id: string;
  labelKey: string;
  fallback: string;
  defaultChecked: boolean;
}

interface NotifGroup {
  headerKey: string;
  fallback: string;
  options: NotifOption[];
}

const PATIENT_GROUPS: NotifGroup[] = [
  {
    headerKey: 'settings.notifConsultas',
    fallback: 'Consultas',
    options: [
      { id: 'lembrete_24h', labelKey: '', fallback: 'Lembrete 24h antes da consulta', defaultChecked: true },
      { id: 'lembrete_1h', labelKey: '', fallback: 'Lembrete 1h antes da consulta', defaultChecked: true },
      { id: 'consulta_alterada', labelKey: '', fallback: 'Consulta alterada/cancelada', defaultChecked: true },
      { id: 'receita', labelKey: '', fallback: 'Nova receita disponível', defaultChecked: true },
      { id: 'referencia', labelKey: '', fallback: 'Nova carta de referência', defaultChecked: true },
    ],
  },
  {
    headerKey: 'settings.notifCommunication',
    fallback: 'Comunicação',
    options: [
      { id: 'feedback', labelKey: '', fallback: 'Pedir feedback após consulta', defaultChecked: true },
      { id: 'mensagem', labelKey: '', fallback: 'Novas mensagens', defaultChecked: true },
    ],
  },
  {
    headerKey: 'settings.notifPointsReferral',
    fallback: 'Pontos & Referral',
    options: [
      { id: 'pontos', labelKey: '', fallback: 'Pontos ganhos/perdidos', defaultChecked: true },
      { id: 'referral_usado', labelKey: '', fallback: 'Código referral usado', defaultChecked: true },
    ],
  },
];

const DENTIST_GROUPS: NotifGroup[] = [
  {
    headerKey: 'settings.notifConsultas',
    fallback: 'Consultas',
    options: [
      { id: 'novo_agendamento', labelKey: '', fallback: 'Novo paciente agendou consulta', defaultChecked: false },
      { id: 'paciente_confirmou', labelKey: '', fallback: 'Paciente confirmou consulta', defaultChecked: true },
      { id: 'paciente_cancelou', labelKey: '', fallback: 'Paciente cancelou consulta', defaultChecked: true },
      { id: 'sala_espera', labelKey: '', fallback: 'Paciente em sala de espera', defaultChecked: true },
    ],
  },
  {
    headerKey: 'settings.notifCommunication',
    fallback: 'Comunicação',
    options: [
      { id: 'feedback_recebido', labelKey: '', fallback: 'Feedback recebido de paciente', defaultChecked: true },
      { id: 'mensagem', labelKey: '', fallback: 'Novas mensagens', defaultChecked: true },
    ],
  },
  {
    headerKey: 'settings.notifPointsReferral',
    fallback: 'Pontos & Referral',
    options: [
      { id: 'pontos', labelKey: '', fallback: 'Pontos ganhos', defaultChecked: true },
      { id: 'referral_usado', labelKey: '', fallback: 'Código referral usado', defaultChecked: true },
      { id: 'referenciou_paciente', labelKey: '', fallback: 'Paciente referenciado (10 pontos)', defaultChecked: true },
    ],
  },
];

const CLINIC_GROUPS: NotifGroup[] = [
  {
    headerKey: 'settings.notifConsultas',
    fallback: 'Consultas',
    options: [
      { id: 'novo_agendamento', labelKey: '', fallback: 'Novo agendamento', defaultChecked: false },
      { id: 'paciente_confirmou_cancelou', labelKey: '', fallback: 'Paciente confirmou/cancelou', defaultChecked: true },
      { id: 'resumo_diario', labelKey: '', fallback: 'Resumo diário de estatísticas', defaultChecked: true },
    ],
  },
  {
    headerKey: 'settings.notifCommunication',
    fallback: 'Comunicação',
    options: [
      { id: 'novo_dentista', labelKey: '', fallback: 'Novo dentista registou-se', defaultChecked: true },
      { id: 'mensagem', labelKey: '', fallback: 'Novas mensagens', defaultChecked: true },
    ],
  },
  {
    headerKey: 'settings.notifPointsReferral',
    fallback: 'Pontos & Referral',
    options: [
      { id: 'referral_usado', labelKey: '', fallback: 'Código referral usado', defaultChecked: true },
    ],
  },
];

function getGroupsForRole(role: UserRole): NotifGroup[] {
  switch (role) {
    case 'patient': return PATIENT_GROUPS;
    case 'dentist': return DENTIST_GROUPS;
    case 'clinic': return CLINIC_GROUPS;
    default: return PATIENT_GROUPS;
  }
}

interface NotificationSettingsSectionProps {
  userRole: UserRole;
}

export function NotificationSettingsSection({ userRole }: NotificationSettingsSectionProps) {
  const { t } = useTranslation();
  const groups = getGroupsForRole(userRole);
  const allOptions = groups.flatMap(g => g.options);
  const [checked, setChecked] = useState<Record<string, boolean>>(
    () => Object.fromEntries(allOptions.map(o => [o.id, o.defaultChecked]))
  );

  const toggle = (id: string) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Card className="bg-card/80 backdrop-blur border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{t('settings.notifications')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {groups.map((group, gi) => (
          <div key={group.headerKey}>
            {gi > 0 && <Separator className="my-3" />}
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              {t(group.headerKey, group.fallback)}
            </p>
            <div className="space-y-2">
              {group.options.map(option => (
                <label key={option.id} className="flex items-center gap-3 cursor-pointer py-1">
                  <Checkbox
                    checked={checked[option.id] ?? option.defaultChecked}
                    onCheckedChange={() => toggle(option.id)}
                  />
                  <span className="text-sm text-foreground">{option.fallback}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
