import { useState } from 'react';
import {
  CreditCard, Smartphone, Building2, Download, FileText, TrendingUp,
  Receipt, Users, ChevronRight, Star, Trash2, Edit2, Plus, Check, X,
  Loader2, ArrowLeft, Hash, Phone, MapPin, Mail
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { UserRole } from '@/types/calendar';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { PatientBillingView } from './PatientBillingView';
import { DentistBillingView } from './DentistBillingView';
import { ClinicBillingView } from './ClinicBillingView';

interface BillingViewProps {
  userRole: UserRole;
  initialTab?: string;
  onNavigate?: (tab: string) => void;
}

export function BillingView({ userRole, initialTab, onNavigate }: BillingViewProps) {
  if (userRole === 'patient') return <PatientBillingView initialTab={initialTab} onNavigate={onNavigate} />;
  if (userRole === 'dentist') return <DentistBillingView initialTab={initialTab} onNavigate={onNavigate} />;
  return <ClinicBillingView initialTab={initialTab} onNavigate={onNavigate} />;
}
