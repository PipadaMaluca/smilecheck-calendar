import { useState } from 'react';
import { ArrowLeft, Upload, X, FileText, AlertTriangle, Clock, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface ContestationViewProps {
  onBack: () => void;
  entryData?: {
    name: string;
    date: string;
    points: number;
    reason: string;
    hoursAgo: number;
  };
}

const MOTIVOS = [
  'Compareci mas não fui registado',
  'Cancelei com antecedência (>24h)',
  'Houve um erro do sistema',
  'Emergência médica/pessoal',
  'Outro motivo',
];

export function ContestationView({ onBack, entryData }: ContestationViewProps) {
  const [selectedMotivo, setSelectedMotivo] = useState<string>('');
  const [explanation, setExplanation] = useState('');
  const [files, setFiles] = useState<{ name: string; size: string }[]>([
    { name: 'comprovativo_medico.pdf', size: '2.4 MB' },
  ]);
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const entry = entryData || {
    name: 'Dr. Gonçalo Pipo',
    date: '31 Jan 2026',
    points: -8,
    reason: 'Faltou à consulta',
    hoursAgo: 4,
  };

  const remainingHours = Math.max(0, 24 - entry.hoursAgo);
  const remainingMinutes = 15;

  if (submitted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <span className="text-6xl">✅</span>
        <h2 className="text-xl font-bold text-foreground">Contestação submetida com sucesso!</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          Receberá uma notificação com o resultado dentro de 48h.
        </p>
        <Button onClick={onBack}>Voltar ao Histórico</Button>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5 pb-32">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold text-foreground">Contestar Avaliação</h1>
        </div>

        {/* Original evaluation card */}
        <Card className="bg-card/80 border-border">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {entry.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{entry.name}</p>
                  <p className="text-xs text-muted-foreground">{entry.date}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Recebida há {entry.hoursAgo}h</p>
            </div>
            <Badge className="bg-destructive/15 text-destructive border-destructive/30 text-xs">
              {entry.points} pontos · {entry.reason}
            </Badge>
          </CardContent>
        </Card>

        {/* Warning banner */}
        <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-amber-400">
              Tem 24h para contestar após ver esta notificação.
            </p>
            <p className="text-xs text-amber-400/80">
              Tempo restante: {remainingHours}h {remainingMinutes}min
            </p>
          </div>
        </div>

        {/* Motivo */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-foreground">Motivo da Contestação</h3>
          <RadioGroup value={selectedMotivo} onValueChange={setSelectedMotivo} className="space-y-2">
            {MOTIVOS.map((motivo) => (
              <div key={motivo} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 transition-colors cursor-pointer">
                <RadioGroupItem value={motivo} id={motivo} />
                <Label htmlFor={motivo} className="text-sm text-foreground cursor-pointer flex-1">{motivo}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Explicação */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-foreground">Explicação</h3>
          <Textarea
            placeholder="Explique a situação"
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            maxLength={500}
            className="min-h-[100px]"
          />
          <p className="text-[10px] text-muted-foreground text-right">{explanation.length}/500 caracteres</p>
        </div>

        {/* Documentos */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-foreground">Documentos de Suporte</h3>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/30 active:border-primary/40 transition-colors cursor-pointer">
            <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">
              <span className="hidden sm:inline">Arraste ficheiros ou clique para selecionar</span>
              <span className="sm:hidden">Toque para selecionar ficheiros</span>
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">Máx. 3 ficheiros, 5MB cada (PDF, JPG, PNG)</p>
          </div>
          {files.length > 0 && (
            <div className="space-y-1.5">
              {files.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-foreground">{f.name}</span>
                    <span className="text-[10px] text-muted-foreground">— {f.size}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setFiles(files.filter((_, j) => j !== i))}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs text-blue-400">
              O dentista terá 48h para analisar. Se não for resolvido, um algoritmo decidirá.
            </p>
            <p className="text-[10px] text-blue-400/70">
              3 contestações rejeitadas = -5 pontos
            </p>
          </div>
        </div>

        {/* Agreement */}
        <div className="flex items-center gap-3">
          <Checkbox checked={agreed} onCheckedChange={(c) => setAgreed(!!c)} id="agree" />
          <Label htmlFor="agree" className="text-xs text-foreground cursor-pointer">
            Declaro que as informações são verdadeiras
          </Label>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            className="flex-1"
            disabled={!agreed || !selectedMotivo}
            onClick={() => setSubmitted(true)}
          >
            Submeter Contestação
          </Button>
          <Button variant="outline" onClick={onBack}>Cancelar</Button>
        </div>
      </div>
    </ScrollArea>
  );
}
