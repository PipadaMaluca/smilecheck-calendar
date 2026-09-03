import { useTranslation } from 'react-i18next';
import { Glyph } from '@/components/ui/glyph';
import { User, Star, Award, MoreVertical, Calendar, BarChart3, Key, Pause, Play, X, Phone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ClickableDentistName } from '@/components/search/ClickableDentistName';
import { cn } from '@/lib/utils';

export interface DentistInfo {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  level: string;
  consultationsThisMonth: number;
  teleconsultationsThisMonth?: number;
  confirmationRate?: number;
  memberSince?: string;
  status: 'active' | 'paused' | 'pending';
  scheduleSummary?: string;
  teleconsultas?: boolean;
  specialties?: string[];
}

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
  'Diamante': 'bg-cyan-400/20 text-cyan-300 border-cyan-400/30'
};

const STATUS_KEY_MAP: Record<string, string> = {
  active: 'team.statusActive',
  paused: 'team.statusPaused',
  pending: 'team.statusPending',
};

const statusConfig = {
  active: { icon: '✅', className: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30' },
  paused: { icon: '⏸️', className: 'bg-amber-500/15 text-amber-500 border-amber-500/30' },
  pending: { icon: '⏳', className: 'bg-muted text-muted-foreground border-border' },
};

interface TeamDentistCardProps {
  dentist: DentistInfo;
  showActions?: boolean;
  onViewAgenda?: () => void;
  onEditSchedule?: () => void;
  onViewStats?: () => void;
  onManagePermissions?: () => void;
  onTogglePause?: () => void;
  onRemove?: () => void;
}

export function TeamDentistCard({
  dentist,
  showActions = false,
  onViewAgenda,
  onEditSchedule,
  onViewStats,
  onManagePermissions,
  onTogglePause,
  onRemove,
}: TeamDentistCardProps) {
  const { t } = useTranslation();
  const status = statusConfig[dentist.status];

  return (
    <Card className="group hover:shadow-md transition-shadow border-border/50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="h-11 w-11 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <ClickableDentistName name={dentist.name} className="font-semibold text-sm text-foreground" />
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={cn('w-3 h-3', i <= Math.round(dentist.rating) ? 'fill-amber-400 text-warning' : 'text-muted-foreground/30')}
                      />
                    ))}
                    <span className="text-xs text-muted-foreground ml-0.5">{dentist.rating.toFixed(1)}</span>
                  </div>
                  <Badge variant="outline" className={cn('text-[11px] px-1.5 py-0', levelColors[dentist.level] || levelColors['Lata'])}>
                    <Award className="w-2.5 h-2.5 mr-0.5" />{t(LEVEL_KEY_MAP[dentist.level] || dentist.level)}
                  </Badge>
                  <Badge variant="outline" className={cn('text-[11px] px-1.5 py-0', status.className)}>
                    <Glyph emoji={status.icon} className="inline w-3.5 h-3.5 mr-1 -mt-0.5" /> {t(STATUS_KEY_MAP[dentist.status])}
                  </Badge>
                </div>
              </div>
              {showActions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem onClick={onViewAgenda}><Calendar className="w-4 h-4 mr-2" />{t('team.viewAgenda')}</DropdownMenuItem>
                    <DropdownMenuItem onClick={onEditSchedule}><Calendar className="w-4 h-4 mr-2" />{t('team.editSchedule')}</DropdownMenuItem>
                    <DropdownMenuItem onClick={onViewStats}><BarChart3 className="w-4 h-4 mr-2" />{t('team.viewStats')}</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onManagePermissions}><Key className="w-4 h-4 mr-2" />{t('team.managePermissions')}</DropdownMenuItem>
                    <DropdownMenuItem onClick={onTogglePause}>
                      {dentist.status === 'paused' ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                      {dentist.status === 'paused' ? t('team.reactivate') : t('team.pause')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onRemove} className="text-destructive focus:text-destructive">
                      <X className="w-4 h-4 mr-2" />{t('team.removeFromTeam')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Specialties */}
            {dentist.specialties && dentist.specialties.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {dentist.specialties.map((s) => (
                  <Badge key={s} variant="secondary" className="text-[11px] px-1.5 py-0">{s}</Badge>
                ))}
              </div>
            )}

            {/* Details */}
            <div className="mt-2 space-y-0.5 text-xs text-muted-foreground">
              {dentist.scheduleSummary && <p>
<Glyph emoji="🕐" className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />{dentist.scheduleSummary}</p>}
              {dentist.teleconsultas !== undefined && (
                <p><Phone className="w-3 h-3 inline mr-1" />{dentist.teleconsultas ? `✅ ${t('team.teleconsultations')}` : `❌ ${t('team.noTeleconsultations')}`}</p>
              )}
              <p>
                {dentist.consultationsThisMonth} {t('team.consultationsLabel')}
                {dentist.teleconsultationsThisMonth !== undefined && ` · ${dentist.teleconsultationsThisMonth} ${t('team.teleconsultationsLabel')}`}
                {dentist.confirmationRate !== undefined && ` · ${dentist.confirmationRate}% ${t('team.confirmationLabel')}`}
              </p>
              {dentist.memberSince && <p className="text-muted-foreground/60">{t('team.memberSince')} {dentist.memberSince}</p>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
