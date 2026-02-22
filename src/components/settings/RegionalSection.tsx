import { useState } from 'react';
import { Globe, DollarSign, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const LANGUAGES = [
  { value: 'pt', label: '🇵🇹 Português' },
  { value: 'fr', label: '🇫🇷 Français' },
  { value: 'en', label: '🇬🇧 English' },
];

const CURRENCIES = [
  { value: 'EUR', label: '€ EUR - Euro' },
  { value: 'USD', label: '$ USD - Dólar Americano' },
  { value: 'GBP', label: '£ GBP - Libra Esterlina' },
  { value: 'BRL', label: 'R$ BRL - Real Brasileiro' },
  { value: 'CHF', label: 'CHF - Franco Suíço' },
];

const TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'Europe/Lisbon', label: 'Europe/Lisbon (WET)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET)' },
  { value: 'Europe/London', label: 'Europe/London (GMT)' },
  { value: 'America/New_York', label: 'America/New_York (EST)' },
  { value: 'America/Sao_Paulo', label: 'America/São_Paulo (BRT)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
];

export function RegionalSection() {
  const [language, setLanguage] = useState('pt');
  const [currency, setCurrency] = useState('EUR');
  const [timezone, setTimezone] = useState('Europe/Lisbon');
  const [autoTimezone, setAutoTimezone] = useState(true);

  return (
    <Card className="bg-card/80 backdrop-blur border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Regional</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Language */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Globe className="w-3.5 h-3.5" />
            Idioma
          </div>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map(l => (
                <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Currency */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <DollarSign className="w-3.5 h-3.5" />
            Moeda
          </div>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map(c => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Timezone */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            Fuso Horário
          </div>
          <label className="flex items-center gap-2 cursor-pointer py-1">
            <Checkbox
              checked={autoTimezone}
              onCheckedChange={(v) => setAutoTimezone(!!v)}
            />
            <span className="text-sm text-foreground">Usar fuso horário do dispositivo</span>
          </label>
          {!autoTimezone && (
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
