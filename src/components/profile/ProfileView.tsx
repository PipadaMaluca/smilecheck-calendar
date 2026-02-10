import { useState } from 'react';
import { X, ArrowLeft, User, Mail, Phone, Calendar, Hash, Stethoscope, Building2, MapPin, Globe, Clock, Video, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { UserRole } from '@/types/calendar';
import { mockDentists, mockClinics, mockFamilyMembers } from '@/data/mockData';
import { useIsMobile } from '@/hooks/use-mobile';
import { EditProfileView } from './EditProfileView';

interface ProfileViewProps {
  userRole: UserRole;
  isOpen: boolean;
  onClose: () => void;
}

function getProfileData(role: UserRole) {
  switch (role) {
    case 'patient':
      return {
        name: 'João Silva',
        subtitle: 'Paciente',
        email: 'joao.silva@email.com',
        phone: '+351 912 000 001',
        birthDate: '15/03/1981',
        age: 45,
        gender: 'Masculino',
        address: 'Rua das Flores 42, 3º Esq.',
        postalCode: '1200-123',
        city: 'Lisboa',
        country: 'Portugal',
      };
    case 'dentist':
      return {
        name: mockDentists[0].name,
        subtitle: 'Dentista',
        email: 'goncalo.pipo@smilecheck.pt',
        phone: '+351 910 000 000',
        birthDate: '22/07/1985',
        orderNumber: 'OMD-12345',
        orderCountry: 'Portugal',
        specialty: mockDentists[0].specialty,
        specialties: ['Generalista', 'Endodontia', 'Cirurgia Oral'],
        bio: 'Dentista com 12 anos de experiência em medicina dentária generalista. Especializado em tratamentos conservadores e endodontia.',
        languages: ['Português', 'Inglês', 'Francês'],
        teleconsultPrice: 20,
        urgencyPrice: 40,
        acceptsUrgencies: true,
        clinics: [
          { name: mockClinics[0].name, role: 'Dentista Principal' },
          { name: mockClinics[1].name, role: 'Colaborador' },
          { name: mockClinics[2].name, role: 'Colaborador' },
        ],
        rating: 4.8,
        totalReviews: 127,
      };
    case 'clinic':
      return {
        name: mockClinics[0].name,
        subtitle: 'Clínica',
        email: 'info@smilecheck.pt',
        phone: '+351 211 000 000',
        nif: '509 123 456',
        address: mockClinics[0].address,
        postalCode: '1250-096',
        city: 'Lisboa',
        country: 'Portugal',
        website: 'www.smilecheck.pt',
        description: 'Clínica dentária moderna localizada no coração de Lisboa, oferecendo uma gama completa de serviços dentários com tecnologia de ponta.',
        services: ['Implantologia', 'Ortodontia', 'Endodontia', 'Cirurgia Oral', 'Estética Dentária', 'Odontopediatria'],
        dentistCount: 7,
        rating: 4.9,
        totalReviews: 312,
      };
  }
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-2.5">
      <div className="flex items-center gap-2.5 min-w-0">
        <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className="text-sm text-foreground text-right ml-4">{value}</span>
    </div>
  );
}

export function ProfileView({ userRole, isOpen, onClose }: ProfileViewProps) {
  const [showEdit, setShowEdit] = useState(false);
  const isMobile = useIsMobile();
  const data = getProfileData(userRole);

  if (!isOpen) return null;

  if (showEdit) {
    return (
      <EditProfileView
        userRole={userRole}
        isOpen={true}
        onClose={() => setShowEdit(false)}
        onSave={() => setShowEdit(false)}
      />
    );
  }

  const content = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
        {isMobile ? (
          <>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-base font-semibold">Meu Perfil</h2>
            <div className="w-10" />
          </>
        ) : (
          <>
            <h2 className="text-base font-semibold">Meu Perfil</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-5 space-y-5">
          {/* Avatar + Name */}
          <div className="flex flex-col items-center gap-3">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              {userRole === 'clinic' ? (
                <Building2 className="w-10 h-10 text-primary" />
              ) : (
                <User className="w-10 h-10 text-primary" />
              )}
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-foreground">{data.name}</h3>
              <p className="text-sm text-muted-foreground">{data.subtitle}</p>
              {('rating' in data && data.rating) && (
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-medium">{data.rating}</span>
                  <span className="text-xs text-muted-foreground">({'totalReviews' in data ? data.totalReviews : 0} avaliações)</span>
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>
              Editar Perfil
            </Button>
          </div>

          <Separator />

          {/* Patient Info */}
          {userRole === 'patient' && (
            <div className="space-y-0 divide-y divide-border">
              <InfoRow icon={Mail} label="Email" value={data.email} />
              <InfoRow icon={Phone} label="Telefone" value={data.phone} />
              <InfoRow icon={Calendar} label="Nascimento" value={`${data.birthDate} (${data.age} anos)`} />
              <InfoRow icon={User} label="Género" value={data.gender!} />
              <InfoRow icon={MapPin} label="Morada" value={`${data.address}, ${data.postalCode} ${data.city}`} />
            </div>
          )}

          {/* Dentist Info */}
          {userRole === 'dentist' && 'orderNumber' in data && (
            <>
              <div className="space-y-0 divide-y divide-border">
                <InfoRow icon={Mail} label="Email" value={data.email} />
                <InfoRow icon={Phone} label="Telefone" value={data.phone} />
                <InfoRow icon={Calendar} label="Nascimento" value={data.birthDate!} />
                <InfoRow icon={Hash} label="Nº Ordem" value={data.orderNumber} />
                <InfoRow icon={Globe} label="País Ordem" value={data.orderCountry} />
              </div>

              <Separator />
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Especialidades</h4>
                <div className="flex flex-wrap gap-1.5">
                  {data.specialties.map(s => (
                    <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">Bio</h4>
                <p className="text-sm text-muted-foreground">{data.bio}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Idiomas</h4>
                <div className="flex flex-wrap gap-1.5">
                  {data.languages.map(l => (
                    <Badge key={l} variant="outline" className="text-xs">{l}</Badge>
                  ))}
                </div>
              </div>

              <Separator />
              <div className="space-y-0 divide-y divide-border">
                <InfoRow icon={Video} label="Teleconsulta" value={`€${data.teleconsultPrice}`} />
                <InfoRow icon={Video} label="Urgência" value={data.acceptsUrgencies ? `€${data.urgencyPrice}` : 'Não aceita'} />
              </div>

              <Separator />
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Clínicas</h4>
                <div className="space-y-2">
                  {data.clinics.map(c => (
                    <div key={c.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{c.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{c.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Clinic Info */}
          {userRole === 'clinic' && 'nif' in data && (
            <>
              <div className="space-y-0 divide-y divide-border">
                <InfoRow icon={Mail} label="Email" value={data.email} />
                <InfoRow icon={Phone} label="Telefone" value={data.phone} />
                <InfoRow icon={Hash} label="NIF" value={data.nif} />
                <InfoRow icon={MapPin} label="Morada" value={data.address} />
                <InfoRow icon={Globe} label="Website" value={data.website} />
              </div>

              <Separator />
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">Descrição</h4>
                <p className="text-sm text-muted-foreground">{data.description}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Serviços</h4>
                <div className="flex flex-wrap gap-1.5">
                  {data.services.map(s => (
                    <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                  ))}
                </div>
              </div>

              <InfoRow icon={User} label="Dentistas" value={`${data.dentistCount} activos`} />
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  // Mobile: full screen
  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-background z-[60] flex flex-col">
        {content}
      </div>
    );
  }

  // Desktop: modal overlay
  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center" onClick={onClose}>
      <div
        className="bg-card rounded-xl border border-border shadow-2xl w-full max-w-[500px] max-h-[85vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {content}
      </div>
    </div>
  );
}
