import { useState } from 'react';
import { CalendarPlus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Consultation } from '@/types/calendar';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ConsultationExportDropdownProps {
  consultation: Consultation;
}

function generateICSContent(c: Consultation): string {
  const [h, m] = c.time.split(':').map(Number);
  const start = new Date(c.date);
  start.setHours(h, m, 0, 0);
  const end = new Date(start.getTime() + c.duration * 60000);

  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SmileCheck//PT',
    'BEGIN:VEVENT',
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:Consulta - ${c.patient.name}`,
    `DESCRIPTION:Dentista: ${c.dentist.name}\\nClínica: ${c.clinic.name}\\nTipo: ${c.type}`,
    `LOCATION:${c.clinic.name} - ${c.clinic.address}`,
    `UID:${c.id}@smilecheck.app`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

function downloadICS(c: Consultation) {
  const content = generateICSContent(c);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `consulta-${format(c.date, 'yyyy-MM-dd')}-${c.time.replace(':', '')}.ics`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success('Ficheiro .ics descarregado!');
}

function openGoogleCalendar(c: Consultation) {
  const [h, m] = c.time.split(':').map(Number);
  const start = new Date(c.date);
  start.setHours(h, m, 0, 0);
  const end = new Date(start.getTime() + c.duration * 60000);

  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Consulta - ${c.patient.name}`)}&dates=${fmt(start)}/${fmt(end)}&details=${encodeURIComponent(`Dentista: ${c.dentist.name}\nClínica: ${c.clinic.name}`)}&location=${encodeURIComponent(`${c.clinic.name} - ${c.clinic.address}`)}`;
  window.open(url, '_blank');
}

function openOutlook(c: Consultation) {
  const [h, m] = c.time.split(':').map(Number);
  const start = new Date(c.date);
  start.setHours(h, m, 0, 0);
  const end = new Date(start.getTime() + c.duration * 60000);

  const url = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(`Consulta - ${c.patient.name}`)}&startdt=${start.toISOString()}&enddt=${end.toISOString()}&body=${encodeURIComponent(`Dentista: ${c.dentist.name}\nClínica: ${c.clinic.name}`)}&location=${encodeURIComponent(`${c.clinic.name} - ${c.clinic.address}`)}`;
  window.open(url, '_blank');
}

export function ConsultationExportDropdown({ consultation }: ConsultationExportDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <CalendarPlus className="w-4 h-4" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => openGoogleCalendar(consultation)} className="gap-2 cursor-pointer">
          <span className="text-base">📱</span>
          Adicionar ao Google Calendar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => downloadICS(consultation)} className="gap-2 cursor-pointer">
          <span className="text-base">🍎</span>
          Adicionar ao Apple Calendar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openOutlook(consultation)} className="gap-2 cursor-pointer">
          <span className="text-base">📧</span>
          Adicionar ao Outlook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => downloadICS(consultation)} className="gap-2 cursor-pointer">
          <Download className="w-4 h-4" />
          Descarregar .ics
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
