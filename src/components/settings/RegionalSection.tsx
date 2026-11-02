import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, DollarSign, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const LANGUAGES = [
  { value: 'pt', label: 'i18nA.portuguese' },
  { value: 'fr', label: 'i18nA.french' },
  { value: 'en', label: 'i18nA.english' },
];

const CURRENCIES = [
  { value: 'EUR', label: 'i18nA.eur' },
  { value: 'USD', label: 'i18nA.usd' },
  { value: 'GBP', label: 'i18nA.gbp' },
  { value: 'BRL', label: 'i18nA.brl' },
  { value: 'CHF', label: 'i18nA.chf' },
];

const TIMEZONES = [
  { value: 'UTC', label: 'i18nA.utc' },
  { value: 'Europe/Lisbon', label: 'i18nA.lisbon' },
  { value: 'Europe/Paris', label: 'i18nA.paris' },
  { value: 'Europe/London', label: 'i18nA.london' },
  { value: 'America/New_York', label: 'i18nA.newYork' },
  { value: 'America/Sao_Paulo', label: 'i18nA.saoPaulo' },
  { value: 'Asia/Tokyo', label: 'i18nA.tokyo' },
];

export function RegionalSection() {
  const { t, i18n } = useTranslation();
  const [currency, setCurrency] = useState('EUR');
  const [timezone, setTimezone] = useState('Europe/Lisbon');
  const [autoTimezone, setAutoTimezone] = useState(true);

  return (
    <Card className="bg-card/80 backdrop-blur border-border">
      <CardHeader className="pb-2">
        <CardTitle size="compact">{t('settings.regional', 'Regional')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Language — unified here, no separate section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Globe className="w-3.5 h-3.5" />
            {t('sweep.regional.language')}
          </div>
          <Select value={i18n.language} onValueChange={(val) => i18n.changeLanguage(val)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map(l => (
                <SelectItem key={l.value} value={l.value}>{t(l.label)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Currency */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <DollarSign className="w-3.5 h-3.5" />
            {t('sweep.regional.currency')}
          </div>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map(c => (
                <SelectItem key={c.value} value={c.value}>{t(c.label)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Timezone */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            {t('sweep.regional.timezone')}
          </div>
          <label className="flex items-center gap-2 cursor-pointer py-1 press">
            <Checkbox
              checked={autoTimezone}
              onCheckedChange={(v) => setAutoTimezone(!!v)}
            />
            <span className="text-sm text-foreground">{t('sweep.regional.useDeviceTimezone')}</span>
          </label>
          {!autoTimezone && (
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map(tz => (
                  <SelectItem key={tz.value} value={tz.value}>{t(tz.label)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
