import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Star, Award, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ClickableDentistName } from '@/components/search/ClickableDentistName';
import { ClickableClinicName } from '@/components/search/ClickableClinicName';
import { mockClinics, clinicDentists, getDentistsForClinic } from '@/data/mockData';
import { cn } from '@/lib/utils';

const dentistExtras: Record<string, { rating: number; level: string; scheduleSummary: string }> = {
  '2': { rating: 4.9, level: 'Platina', scheduleSummary: 'Seg-Sex 09:00-19:00' },
  '3': { rating: 4.5, level: 'Prata', scheduleSummary: 'Seg-Sex 09:00-19:00' },
  '4': { rating: 4.6, level: 'Ouro', scheduleSummary: 'Seg-Sex 09:00-19:00' },
  '5': { rating: 4.3, level: 'Bronze', scheduleSummary: 'Seg-Sex 09:00-18:00' },
  '6': { rating: 4.7, level: 'Ouro', scheduleSummary: 'Seg-Sex 08:00-20:00' },
  '7': { rating: 4.4, level: 'Prata', scheduleSummary: 'Seg-Sex 08:00-20:00' },
};

const LEVEL_KEY_MAP: Record<string, string> = {
  'Lata': 'onboarding.levels.can',
  'Bronze': 'onboarding.levels.bronze',
  'Prata': 'onboarding.levels.silver',
  'Ouro': 'onboarding.levels.gold',
  'Platina': 'onboarding.levels.platinum',
  'Diamante': 'onboarding.levels.diamond',
  'Adamantino': 'onboarding.levels.adamantine',
};

const levelColors: Record<string, string> = {
  'Lata': 'bg-muted text-muted-foreground border-muted',
  'Bronze': 'bg-amber-900/20 text-amber-700 border-amber-700/30',
  'Prata': 'bg-slate-300/20 text-slate-500 border-slate-400/30',
  'Ouro': 'bg-amber-400/20 text-amber-500 border-amber-500/30',
  'Platina': 'bg-violet-400/20 text-violet-400 border-violet-400/30',
  'Diamante': 'bg-cyan-400/20 text-cyan-300 border-cyan-400/30',
};

export function DentistTeamTab() {
  const { t } = useTranslation();
  const [expandedClinics, setExpandedClinics] = useState<string[]>(['1']);

  const myClinics = clinicDentists
    .filter((cd) => cd.dentistId === '1')
    .map((cd) => {
      const clinic = mockClinics.find((c) => c.id === cd.clinicId)!;
      const colleagues = getDentistsForClinic(cd.clinicId).filter((d) => d.id !== '1');
      return { clinic, colleagues };
    });

  const toggleClinic = (id: string) => {
    setExpandedClinics((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-4">
      {myClinics.map(({ clinic, colleagues }) => {
        const isExpanded = expandedClinics.includes(clinic.id);
        return (
          <Card key={clinic.id} className="border-border/50">
            <button
              onClick={() => toggleClinic(clinic.id)}
              className="w-full p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors rounded-t-lg"
            >
              <div className="text-left">
                <ClickableClinicName name={clinic.name} clinicId={clinic.id} className="font-semibold text-sm text-foreground" />
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" />{clinic.address}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">{colleagues.length} colegas</Badge>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
            </button>
            {isExpanded && (
              <CardContent className="pt-0 pb-4 px-4 space-y-3">
                <Separator className="mb-3" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {colleagues.sort((a, b) => (dentistExtras[b.id]?.rating || 0) - (dentistExtras[a.id]?.rating || 0)).map((d) => {
                    const extras = dentistExtras[d.id] || { rating: 4.0, level: 'Lata', scheduleSummary: '' };
                    return (
                      <Card key={d.id} className="border-border/50">
                        <CardContent className="p-3 flex items-start gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <ClickableDentistName name={d.name} className="font-semibold text-sm text-foreground" />
                            <p className="text-xs text-muted-foreground">{d.specialty}</p>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((i) => (
                                  <Star key={i} className={cn('w-3 h-3', i <= Math.round(extras.rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30')} />
                                ))}
                                <span className="text-[11px] text-muted-foreground ml-0.5">{extras.rating.toFixed(1)}</span>
                              </div>
                              <Badge variant="outline" className={cn('text-[11px] px-1.5 py-0', levelColors[extras.level])}>
                                <Award className="w-2.5 h-2.5 mr-0.5" />{t(LEVEL_KEY_MAP[extras.level] || extras.level)}
                              </Badge>
                            </div>
                            {extras.scheduleSummary && (
                              <p className="text-[11px] text-muted-foreground mt-1">🕐 {extras.scheduleSummary}</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                {colleagues.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhum colega nesta clínica</p>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
