import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface PhoneInputProps {
  countryCode: string;
  onCountryCodeChange: (code: string) => void;
  phone: string;
  onPhoneChange: (phone: string) => void;
  error?: string;
  className?: string;
}

export function PhoneInput({ countryCode, onCountryCodeChange, phone, onPhoneChange, error, className }: PhoneInputProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const countryCodes = [
    { code: '+351', flag: '🇵🇹', label: 'Portugal' },
    { code: '+33', flag: '🇫🇷', label: t('phoneInput.france') },
  ];

  const selected = countryCodes.find(c => c.code === countryCode) || countryCodes[0];

  return (
    <div className={className}>
      <div className="flex gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className={cn(
              'flex items-center gap-1.5 h-12 px-3 rounded-md border bg-secondary text-sm whitespace-nowrap min-w-[100px] justify-between',
              error ? 'border-destructive' : 'border-border'
            )}
          >
            <span>{selected.flag}</span>
            <span className="text-foreground font-medium">{selected.code}</span>
            <svg className="w-3 h-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {open && (
            <div className="absolute z-50 top-full left-0 mt-1 w-48 rounded-md border border-border bg-popover shadow-lg">
              {countryCodes.map(c => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => { onCountryCodeChange(c.code); setOpen(false); }}
                  className={cn(
                    'flex items-center gap-2 w-full px-3 py-2.5 text-sm hover:bg-accent transition-colors',
                    c.code === countryCode && 'bg-accent'
                  )}
                >
                  <span>{c.flag}</span>
                  <span className="text-foreground">{c.label}</span>
                  <span className="text-muted-foreground ml-auto">{c.code}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <Input
          type="tel"
          placeholder="912 345 678"
          value={phone}
          onChange={e => {
            const val = e.target.value.replace(/[^\d\s]/g, '');
            onPhoneChange(val);
          }}
          className={cn('h-12 bg-secondary border-border flex-1', error && 'border-destructive')}
        />
      </div>
      {error && <p className="text-destructive text-xs mt-1">{error}</p>}
      <p className="text-xs text-muted-foreground mt-1.5">{t('phoneInput.requiredForVerification')}</p>
    </div>
  );
}
