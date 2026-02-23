import { useState } from 'react';
import { ChevronDown, ChevronRight, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConsultationSubType {
  label: string;
  online?: boolean;
}

interface ConsultationGroup {
  label: string;
  items: ConsultationSubType[];
}

const CONSULTATION_GROUPS: ConsultationGroup[] = [
  {
    label: 'Paciente Novo: Adulto',
    items: [
      { label: 'Primeira Consulta', online: true },
      { label: 'Visita de controlo', online: true },
    ],
  },
  {
    label: 'Criança menos de 16 Anos',
    items: [
      { label: 'Criança – Primeira Consulta', online: true },
      { label: 'Restaurações em Criança' },
      { label: 'Extrações em Criança' },
    ],
  },
  {
    label: 'Controlo Anual/Limpeza Dentária',
    items: [
      { label: 'Destartarização', online: true },
      { label: 'Raspagem Radicular' },
    ],
  },
  {
    label: 'Urgência',
    items: [{ label: 'Urgência', online: true }],
  },
  {
    label: 'Cirurgia Oral',
    items: [
      { label: 'Extração Dentária' },
      { label: 'Cirurgia Complexa' },
      { label: 'Cirurgia de Implante' },
    ],
  },
  {
    label: 'Dentisteria',
    items: [
      { label: 'Restauração Dentária' },
      { label: 'Branqueamento Dentário' },
    ],
  },
  {
    label: 'Endodontia',
    items: [
      { label: 'Desvitalização' },
      { label: 'Retratamento Endodôntico' },
    ],
  },
  {
    label: 'Ortodontia',
    items: [
      { label: 'Ortodontia – 1ª Consulta', online: true },
      { label: 'Ortodontia – Manutenção' },
    ],
  },
  {
    label: 'Prótese Fixa',
    items: [
      { label: 'Inlay/Onlay/Overlay' },
      { label: 'Coroas/Pontes' },
      { label: 'Facetas' },
      { label: 'Cimentação de Prótese' },
    ],
  },
  {
    label: 'Prótese Removível',
    items: [
      { label: 'Moldes/Impressões' },
      { label: 'Ceras e Impressões de Moldeiras Individuais' },
      { label: 'Ensaios' },
      { label: 'Entrega de Prótese' },
    ],
  },
  {
    label: 'Radiografia',
    items: [
      { label: 'Teleradiografia' },
      { label: 'CBCT (Scanner 3D)' },
    ],
  },
  {
    label: 'Teleconsulta',
    items: [{ label: 'Teleconsulta', online: true }],
  },
];

interface Props {
  value: string;
  onChange: (v: string) => void;
  asCheckboxList?: boolean;
  selectedItems?: string[];
  onToggleItem?: (item: string) => void;
}

export function ConsultationReasonSelector({ value, onChange, asCheckboxList, selectedItems, onToggleItem }: Props) {
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev =>
      prev.includes(label) ? prev.filter(g => g !== label) : [...prev, label]
    );
  };

  if (asCheckboxList) {
    return (
      <div className="space-y-1 max-h-60 overflow-y-auto">
        {CONSULTATION_GROUPS.map(group => {
          const isExpanded = expandedGroups.includes(group.label);
          return (
            <div key={group.label}>
              <button
                type="button"
                onClick={() => toggleGroup(group.label)}
                className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted/30 rounded"
              >
                {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                {group.label}
              </button>
              {isExpanded && (
                <div className="ml-5 space-y-0.5">
                  {group.items.map(item => (
                    <label key={item.label} className="flex items-center gap-2 px-2 py-1 text-xs hover:bg-muted/20 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedItems?.includes(item.label) || false}
                        onChange={() => onToggleItem?.(item.label)}
                        className="rounded border-border"
                      />
                      <span>{item.label}</span>
                      {item.online && <Globe className="w-3 h-3 text-primary" />}
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-1 max-h-60 overflow-y-auto border border-border rounded-lg p-2">
      {CONSULTATION_GROUPS.map(group => {
        const isExpanded = expandedGroups.includes(group.label);
        const isSingleItem = group.items.length === 1;

        if (isSingleItem) {
          const item = group.items[0];
          return (
            <button
              key={group.label}
              type="button"
              onClick={() => onChange(item.label)}
              className={cn(
                'flex items-center gap-2 w-full text-left px-3 py-2 text-sm rounded-md transition-colors',
                value === item.label ? 'bg-primary/20 text-primary font-medium' : 'hover:bg-muted/30'
              )}
            >
              <span>{item.label}</span>
              {item.online && <Globe className="w-3 h-3 text-primary" />}
            </button>
          );
        }

        return (
          <div key={group.label}>
            <button
              type="button"
              onClick={() => toggleGroup(group.label)}
              className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted/30 rounded-md"
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              {group.label}
            </button>
            {isExpanded && (
              <div className="ml-4 space-y-0.5">
                {group.items.map(item => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => onChange(item.label)}
                    className={cn(
                      'flex items-center gap-2 w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors',
                      value === item.label ? 'bg-primary/20 text-primary font-medium' : 'hover:bg-muted/30'
                    )}
                  >
                    <span>{item.label}</span>
                    {item.online && <Globe className="w-3 h-3 text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
