import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronRight, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConsultationSubType {
  labelKey: string;
  online?: boolean;
}

interface ConsultationGroup {
  labelKey: string;
  items: ConsultationSubType[];
}

const CONSULTATION_GROUPS: ConsultationGroup[] = [
  {
    labelKey: 'consultationReasons.newAdultPatient',
    items: [
      { labelKey: 'consultationReasons.firstConsultation', online: true },
      { labelKey: 'consultationReasons.controlVisit', online: true },
    ],
  },
  {
    labelKey: 'consultationReasons.childUnder16',
    items: [
      { labelKey: 'consultationReasons.childFirstConsultation', online: true },
      { labelKey: 'consultationReasons.childRestorations' },
      { labelKey: 'consultationReasons.childExtractions' },
    ],
  },
  {
    labelKey: 'consultationReasons.annualCheckup',
    items: [
      { labelKey: 'consultationReasons.scaling', online: true },
      { labelKey: 'consultationReasons.rootPlaning' },
    ],
  },
  {
    labelKey: 'consultationReasons.emergency',
    items: [{ labelKey: 'consultationReasons.emergency', online: true }],
  },
  {
    labelKey: 'consultationReasons.oralSurgery',
    items: [
      { labelKey: 'consultationReasons.toothExtraction' },
      { labelKey: 'consultationReasons.complexSurgery' },
      { labelKey: 'consultationReasons.implantSurgery' },
    ],
  },
  {
    labelKey: 'consultationReasons.restorativeDentistry',
    items: [
      { labelKey: 'consultationReasons.dentalRestoration' },
      { labelKey: 'consultationReasons.dentalWhitening' },
    ],
  },
  {
    labelKey: 'consultationReasons.endodontics',
    items: [
      { labelKey: 'consultationReasons.rootCanal' },
      { labelKey: 'consultationReasons.endoRetreatment' },
    ],
  },
  {
    labelKey: 'consultationReasons.orthodontics',
    items: [
      { labelKey: 'consultationReasons.orthoFirstConsultation', online: true },
      { labelKey: 'consultationReasons.orthoMaintenance' },
    ],
  },
  {
    labelKey: 'consultationReasons.fixedProsthetics',
    items: [
      { labelKey: 'consultationReasons.inlayOnlayOverlay' },
      { labelKey: 'consultationReasons.crownsBridges' },
      { labelKey: 'consultationReasons.veneers' },
      { labelKey: 'consultationReasons.prosthesisCementation' },
    ],
  },
  {
    labelKey: 'consultationReasons.removableProsthetics',
    items: [
      { labelKey: 'consultationReasons.impressions' },
      { labelKey: 'consultationReasons.waxImpressions' },
      { labelKey: 'consultationReasons.tryIns' },
      { labelKey: 'consultationReasons.prosthesisDelivery' },
    ],
  },
  {
    labelKey: 'consultationReasons.radiology',
    items: [
      { labelKey: 'consultationReasons.cephalometric' },
      { labelKey: 'consultationReasons.cbct' },
    ],
  },
  {
    labelKey: 'consultationReasons.teleconsultation',
    items: [{ labelKey: 'consultationReasons.teleconsultation', online: true }],
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
  const { t } = useTranslation();
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev =>
      prev.includes(key) ? prev.filter(g => g !== key) : [...prev, key]
    );
  };

  if (asCheckboxList) {
    return (
      <div className="space-y-1 max-h-60 overflow-y-auto">
        {CONSULTATION_GROUPS.map(group => {
          const isExpanded = expandedGroups.includes(group.labelKey);
          return (
            <div key={group.labelKey}>
              <button
                type="button"
                onClick={() => toggleGroup(group.labelKey)}
                className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted/30 rounded"
              >
                {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                {t(group.labelKey)}
              </button>
              {isExpanded && (
                <div className="ml-5 space-y-0.5">
                  {group.items.map(item => {
                    const label = t(item.labelKey);
                    return (
                      <label key={item.labelKey} className="flex items-center gap-2 px-2 py-1 text-xs hover:bg-muted/20 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedItems?.includes(label) || false}
                          onChange={() => onToggleItem?.(label)}
                          className="rounded border-border"
                        />
                        <span>{label}</span>
                        {item.online && <Globe className="w-3 h-3 text-primary" />}
                      </label>
                    );
                  })}
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
        const isExpanded = expandedGroups.includes(group.labelKey);
        const isSingleItem = group.items.length === 1;

        if (isSingleItem) {
          const item = group.items[0];
          const label = t(item.labelKey);
          return (
            <button
              key={group.labelKey}
              type="button"
              onClick={() => onChange(label)}
              className={cn(
                'flex items-center gap-2 w-full text-left px-3 py-2 text-sm rounded-md transition-colors',
                value === label ? 'bg-primary/20 text-primary font-medium' : 'hover:bg-muted/30'
              )}
            >
              <span>{label}</span>
              {item.online && <Globe className="w-3 h-3 text-primary" />}
            </button>
          );
        }

        return (
          <div key={group.labelKey}>
            <button
              type="button"
              onClick={() => toggleGroup(group.labelKey)}
              className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted/30 rounded-md"
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              {t(group.labelKey)}
            </button>
            {isExpanded && (
              <div className="ml-4 space-y-0.5">
                {group.items.map(item => {
                  const label = t(item.labelKey);
                  return (
                    <button
                      key={item.labelKey}
                      type="button"
                      onClick={() => onChange(label)}
                      className={cn(
                        'flex items-center gap-2 w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors',
                        value === label ? 'bg-primary/20 text-primary font-medium' : 'hover:bg-muted/30'
                      )}
                    >
                      <span>{label}</span>
                      {item.online && <Globe className="w-3 h-3 text-primary" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
