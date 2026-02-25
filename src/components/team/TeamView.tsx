import { useState } from 'react';
import { User, Star, ChevronDown, ChevronUp, MapPin, Plus, X, Mail, MessageCircle, Link2, Copy, Check, Award, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { UserRole } from '@/types/calendar';
import { mockDentists, mockClinics, getDentistsForClinic, clinicDentists } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { ClickableDentistName } from '@/components/search/ClickableDentistName';
import { ClickableClinicName } from '@/components/search/ClickableClinicName';

interface TeamViewProps {
  userRole: UserRole;
  onNavigate?: (tab: string) => void;
}

// Mock data for extra dentist info
const dentistExtras: Record<string, {rating: number;level: string;consultationsThisMonth: number;}> = {
  '1': { rating: 4.8, level: 'Ouro', consultationsThisMonth: 142 },
  '2': { rating: 4.9, level: 'Platina', consultationsThisMonth: 118 },
  '3': { rating: 4.5, level: 'Prata', consultationsThisMonth: 95 },
  '4': { rating: 4.6, level: 'Ouro', consultationsThisMonth: 87 },
  '5': { rating: 4.3, level: 'Bronze', consultationsThisMonth: 64 },
  '6': { rating: 4.7, level: 'Ouro', consultationsThisMonth: 103 },
  '7': { rating: 4.4, level: 'Prata', consultationsThisMonth: 78 }
};

const levelColors: Record<string, string> = {
  'Lata': 'bg-muted text-muted-foreground border-muted',
  'Bronze': 'bg-amber-900/20 text-amber-700 border-amber-700/30',
  'Prata': 'bg-slate-300/20 text-slate-500 border-slate-400/30',
  'Ouro': 'bg-amber-400/20 text-amber-500 border-amber-500/30',
  'Platina': 'bg-violet-400/20 text-violet-400 border-violet-400/30',
  'Diamante': 'bg-cyan-400/20 text-cyan-300 border-cyan-400/30'
};

function StarRating({ rating }: {rating: number;}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) =>
      <Star
        key={i}
        className={cn(
          'w-3.5 h-3.5',
          i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
        )} />

      )}
      <span className="text-xs text-muted-foreground ml-1">{rating.toFixed(1)}</span>
    </div>);

}

function LevelBadge({ level }: {level: string;}) {
  const colors = levelColors[level] || levelColors['Lata'];
  return (
    <Badge variant="outline" className={cn('text-[10px] px-2 py-0.5 font-semibold', colors)}>
      <Award className="w-3 h-3 mr-1" />
      {level}
    </Badge>);

}

function DentistCard({
  dentist,
  extras,
  showActions,
  onRemove





}: {dentist: typeof mockDentists[0];extras: typeof dentistExtras['1'];showActions: boolean;onRemove?: () => void;}) {
  return (
    <Card className="group hover:shadow-md transition-shadow border-border/50">
      <CardContent className="p-4">
        <div className="pr-0 items-start justify-start pl-[3px] gap-[5px] px-px flex flex-row">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-[5px]">
              <div>
                <p className="font-semibold text-sm text-foreground">
                  <ClickableDentistName name={dentist.name} className="font-semibold text-sm text-foreground" />
                </p>
                <p className="text-xs text-muted-foreground">{dentist.specialty}</p>
              </div>
              {showActions && onRemove &&
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive/60 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={onRemove}>

                  <X className="w-[15px] h-[15px]" />
                </Button>
              }
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <StarRating rating={extras.rating} />
              <LevelBadge level={extras.level} />
            </div>
            {showActions &&
            <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-muted-foreground">
                  {extras.consultationsThisMonth} consultas este mês
                </span>
              </div>
            }
          </div>
        </div>
      </CardContent>
    </Card>);

}

function AddDentistModal({ open, onClose }: {open: boolean;onClose: () => void;}) {
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://smilecheck.app/convite/abc123');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Dentista</DialogTitle>
          <DialogDescription>Convide um dentista para a sua equipa</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* By Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              Por Email
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1" />

              <Button size="sm" disabled={!email}>Enviar</Button>
            </div>
          </div>

          <Separator />

          {/* By WhatsApp */}
          <Button variant="outline" className="w-full justify-start gap-2" onClick={() => window.open('https://wa.me/?text=Junta-te à minha equipa no SmileCheck: https://smilecheck.app/convite/abc123')}>
            <MessageCircle className="w-4 h-4 text-green-500" />
            Enviar por WhatsApp
          </Button>

          {/* By Link */}
          <Button variant="outline" className="w-full justify-start gap-2" onClick={handleCopyLink}>
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Link2 className="w-4 h-4 text-muted-foreground" />}
            {copied ? 'Copiado!' : 'Copiar Link de Convite'}
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-2">
            O dentista receberá pontos de referral quando se registar
          </p>
        </div>
      </DialogContent>
    </Dialog>);

}

// ===== DENTIST VIEW: Read-only, grouped by clinic =====
function DentistTeamView() {
  const [expandedClinics, setExpandedClinics] = useState<string[]>(['1']);

  // Clinics where the current dentist (Dr. Gonçalo Pipo, id=1) works
  const myClinics = clinicDentists.
  filter((cd) => cd.dentistId === '1').
  map((cd) => {
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
      <h2 className="text-lg font-bold text-foreground">A Minha Equipa</h2>

      {myClinics.map(({ clinic, colleagues }) => {
        const isExpanded = expandedClinics.includes(clinic.id);
        return (
          <Card key={clinic.id} className="border-border/50">
            <button
              onClick={() => toggleClinic(clinic.id)}
              className="w-full p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors rounded-t-lg">

              <div className="text-left">
                <p className="font-semibold text-sm text-foreground">
                  <ClickableClinicName name={clinic.name} clinicId={clinic.id} className="font-semibold text-sm text-foreground" />
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" />
                  {clinic.address}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">{colleagues.length} colegas</Badge>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
            </button>
            {isExpanded &&
            <CardContent className="pt-0 pb-4 px-4 space-y-3">
                <Separator className="mb-3" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {colleagues.map((d) =>
                <DentistCard
                  key={d.id}
                  dentist={d}
                  extras={dentistExtras[d.id] || { rating: 4.0, level: 'Lata', consultationsThisMonth: 0 }}
                  showActions={false} />

                )}
                </div>
                {colleagues.length === 0 &&
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum colega nesta clínica</p>
              }
              </CardContent>
            }
          </Card>);

      })}
    </div>);

}

// ===== CLINIC VIEW: Full management =====
function ClinicTeamView() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [removeConfirm, setRemoveConfirm] = useState<string | null>(null);

  // Current clinic is SmileCheck (id=1)
  const clinicDentistsList = getDentistsForClinic('1');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Gerir Equipa</h2>
          <p className="text-sm text-muted-foreground">{clinicDentistsList.length} dentistas activos</p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setAddModalOpen(true)}>
          <Plus className="w-4 h-4" />
          Adicionar Dentista
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mx-[5px] my-[15px]">
        {clinicDentistsList.map((d) =>
        <div key={d.id} className="relative pl-[5px] pb-0 pt-[3px] pr-[3px] border px-[3px] py-px bg-popover">
            <DentistCard
            dentist={d}
            extras={dentistExtras[d.id] || { rating: 4.0, level: 'Lata', consultationsThisMonth: 0 }}
            showActions
            onRemove={() => setRemoveConfirm(d.id)} />

          </div>
        )}
      </div>

      {/* Remove Confirmation Dialog */}
      <Dialog open={!!removeConfirm} onOpenChange={() => setRemoveConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Remover Dentista
            </DialogTitle>
            <DialogDescription>
              Tem a certeza que deseja remover este dentista da equipa? Esta acção não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setRemoveConfirm(null)}>Cancelar</Button>
            <Button variant="destructive" size="sm" onClick={() => setRemoveConfirm(null)}>Remover</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AddDentistModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </div>);

}

// ===== PATIENT VIEW: Not available =====
function PatientTeamView() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
      <AlertCircle className="w-10 h-10 text-muted-foreground/50" />
      <p className="text-lg font-medium">Página não disponível</p>
      <p className="text-sm text-muted-foreground/70">Esta secção não está disponível para pacientes.</p>
    </div>);

}

export function TeamView({ userRole, onNavigate }: TeamViewProps) {
  return (
    <ScrollArea className="flex-1">
      <div className="p-6 max-w-3xl mx-auto pb-8">
        {userRole === 'patient' && <PatientTeamView />}
        {userRole === 'dentist' && <DentistTeamView />}
        {userRole === 'clinic' && <ClinicTeamView />}
      </div>
    </ScrollArea>);

}