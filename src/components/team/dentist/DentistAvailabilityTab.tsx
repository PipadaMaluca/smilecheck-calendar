import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AvailabilitySection } from '../shared/AvailabilitySection';

const clinics = [
  { id: '1', name: 'Clínica SmileCheck' },
  { id: '2', name: 'Clínica Mitry-Mory' },
  { id: '3', name: 'Clínica Montfermeil' },
];

export function DentistAvailabilityTab() {
  return (
    <Tabs defaultValue="1" className="w-full">
      <TabsList className="w-full overflow-x-auto justify-start flex-nowrap">
        {clinics.map((c) => (
          <TabsTrigger key={c.id} value={c.id} className="text-xs whitespace-nowrap flex-shrink-0">
            {c.name}
          </TabsTrigger>
        ))}
      </TabsList>
      {clinics.map((c) => (
        <TabsContent key={c.id} value={c.id} className="mt-4">
          <AvailabilitySection dentistName="Dr. Gonçalo Pipo" />
        </TabsContent>
      ))}
    </Tabs>
  );
}
