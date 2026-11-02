import { useTranslation } from 'react-i18next';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export type RewardSort = 'popular' | 'pointsAsc' | 'pointsDesc';

export interface RewardFilterState {
  range: [number, number];
  sort: RewardSort;
  affordableOnly: boolean;
}

interface RewardsFiltersProps {
  value: RewardFilterState;
  max: number;
  onChange: (next: RewardFilterState) => void;
  onClear: () => void;
  isDirty: boolean;
}

const SORTS: { key: RewardSort; labelKey: string }[] = [
  { key: 'popular', labelKey: 'store.sortPopular' },
  { key: 'pointsAsc', labelKey: 'store.sortPointsAsc' },
  { key: 'pointsDesc', labelKey: 'store.sortPointsDesc' },
];

export function RewardsFilters({ value, max, onChange, onClear, isDirty }: RewardsFiltersProps) {
  const { t } = useTranslation();
  const step = max > 2000 ? 50 : 10;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground">{t('store.sortBy')}</p>
        <RadioGroup
          value={value.sort}
          onValueChange={v => onChange({ ...value, sort: v as RewardSort })}
          className="gap-1"
        >
          {SORTS.map(s => (
            <Label key={s.key} htmlFor={`reward-sort-${s.key}`} className="flex items-center gap-3 min-h-11 cursor-pointer text-sm font-normal">
              <RadioGroupItem id={`reward-sort-${s.key}`} value={s.key} />
              {t(s.labelKey)}
            </Label>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-foreground">{t('store.pointsRange')}</p>
          <span className="text-sm text-muted-foreground tabular-nums">
            {value.range[0].toLocaleString()} – {value.range[1].toLocaleString()} {t('store.points')}
          </span>
        </div>
        <div className="py-3">
          <Slider
            min={0}
            max={max}
            step={step}
            minStepsBetweenThumbs={1}
            value={value.range}
            onValueChange={v => onChange({ ...value, range: [v[0], v[1]] as [number, number] })}
            aria-label={t('store.pointsRange')}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 min-h-11">
        <Label htmlFor="reward-affordable" className="text-sm font-normal cursor-pointer">{t('store.affordableOnly')}</Label>
        <Switch
          id="reward-affordable"
          checked={value.affordableOnly}
          onCheckedChange={c => onChange({ ...value, affordableOnly: c })}
        />
      </div>

      <Button type="button" variant="outline" className="w-full min-h-11" onClick={onClear} disabled={!isDirty}>
        {t('store.clearFilters')}
      </Button>
    </div>
  );
}
