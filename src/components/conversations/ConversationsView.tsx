import React, { useState } from 'react';
import { Search, ArrowLeft, Send, User, Stethoscope, Building2 } from 'lucide-react';
import { ClickableDentistName } from '@/components/search/ClickableDentistName';
import { ClickableClinicName } from '@/components/search/ClickableClinicName';
import { ClickablePatientName } from '@/components/search/ClickablePatientName';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserRole } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface Message {
  id: string;
  text: string;
  fromMe: boolean;
  time: string;
}

interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  type: 'Paciente' | 'Dentista' | 'Clínica';
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  messages: Message[];
}

const mockConversations: Record<UserRole, Conversation[]> = {
  patient: [
  {
    id: 'p1',
    name: 'Dr. Gonçalo Pipo',
    type: 'Dentista',
    lastMessage: 'Bom dia! A sua consulta está confirmada para amanhã às 10h.',
    lastMessageTime: '14:32',
    unread: 2,
    messages: [
    { id: 'm1', text: 'Olá Dr. Gonçalo, gostaria de confirmar a minha consulta.', fromMe: true, time: '14:20' },
    { id: 'm2', text: 'Bom dia! A sua consulta está confirmada para amanhã às 10h.', fromMe: false, time: '14:32' }]

  },
  {
    id: 'p2',
    name: 'Clínica SmileCheck',
    type: 'Clínica',
    lastMessage: 'Lembrete: a sua próxima consulta é dia 5 de Fevereiro.',
    lastMessageTime: 'Ontem',
    unread: 0,
    messages: [
    { id: 'm1', text: 'Lembrete: a sua próxima consulta é dia 5 de Fevereiro.', fromMe: false, time: 'Ontem' }]

  },
  {
    id: 'p3',
    name: 'Dra. Sofia Martins',
    type: 'Dentista',
    lastMessage: 'Os resultados do raio-X estão prontos. Pode passar na clínica.',
    lastMessageTime: '12 Jan',
    unread: 1,
    messages: [
    { id: 'm1', text: 'Dra. Sofia, já estão prontos os resultados?', fromMe: true, time: '11:00' },
    { id: 'm2', text: 'Os resultados do raio-X estão prontos. Pode passar na clínica.', fromMe: false, time: '11:45' }]

  }],

  dentist: [
  {
    id: 'd1',
    name: 'Maria Silva',
    type: 'Paciente',
    lastMessage: 'Obrigada doutor! Até amanhã.',
    lastMessageTime: '16:05',
    unread: 1,
    messages: [
    { id: 'm1', text: 'Maria, lembro-lhe da consulta amanhã às 09:30.', fromMe: true, time: '15:50' },
    { id: 'm2', text: 'Obrigada doutor! Até amanhã.', fromMe: false, time: '16:05' }]

  },
  {
    id: 'd2',
    name: 'João Santos',
    type: 'Paciente',
    lastMessage: 'Posso remarcar para sexta-feira?',
    lastMessageTime: '10:22',
    unread: 3,
    messages: [
    { id: 'm1', text: 'Bom dia João, a sua consulta é hoje às 14h.', fromMe: true, time: '09:00' },
    { id: 'm2', text: 'Posso remarcar para sexta-feira?', fromMe: false, time: '10:22' }]

  },
  {
    id: 'd3',
    name: 'Clínica SmileCheck',
    type: 'Clínica',
    lastMessage: 'A reunião de equipa foi movida para as 18h.',
    lastMessageTime: 'Ontem',
    unread: 0,
    messages: [
    { id: 'm1', text: 'A reunião de equipa foi movida para as 18h.', fromMe: false, time: 'Ontem' }]

  },
  {
    id: 'd4',
    name: 'Dr. Alexandre Bernardo',
    type: 'Dentista',
    lastMessage: 'Podes cobrir o meu turno na quinta?',
    lastMessageTime: '8 Jan',
    unread: 0,
    messages: [
    { id: 'm1', text: 'Podes cobrir o meu turno na quinta?', fromMe: false, time: '8 Jan' }]

  }],

  clinic: [
  {
    id: 'c1',
    name: 'Maria Silva',
    type: 'Paciente',
    lastMessage: 'Gostaria de agendar uma consulta para o meu filho.',
    lastMessageTime: '15:40',
    unread: 2,
    messages: [
    { id: 'm1', text: 'Gostaria de agendar uma consulta para o meu filho.', fromMe: false, time: '15:40' }]

  },
  {
    id: 'c2',
    name: 'Dr. Gonçalo Pipo',
    type: 'Dentista',
    lastMessage: 'Preciso de bloquear o horário da manhã de quarta.',
    lastMessageTime: '11:15',
    unread: 1,
    messages: [
    { id: 'm1', text: 'Preciso de bloquear o horário da manhã de quarta.', fromMe: false, time: '11:15' }]

  },
  {
    id: 'c3',
    name: 'Dr. Alexandre Bernardo',
    type: 'Dentista',
    lastMessage: 'O material de ortodontia já chegou?',
    lastMessageTime: 'Ontem',
    unread: 0,
    messages: [
    { id: 'm1', text: 'O material de ortodontia já chegou?', fromMe: false, time: 'Ontem' },
    { id: 'm2', text: 'Sim, já está disponível no stock.', fromMe: true, time: 'Ontem' }]

  },
  {
    id: 'c4',
    name: 'João Santos',
    type: 'Paciente',
    lastMessage: 'Qual o horário de funcionamento ao sábado?',
    lastMessageTime: '5 Jan',
    unread: 0,
    messages: [
    { id: 'm1', text: 'Qual o horário de funcionamento ao sábado?', fromMe: false, time: '5 Jan' },
    { id: 'm2', text: 'Estamos abertos das 9h às 13h.', fromMe: true, time: '5 Jan' }]

  }]

};

const typeBadgeConfig: Record<string, {icon: typeof User;className: string;}> = {
  Paciente: { icon: User, className: 'bg-blue-500/20 text-blue-400' },
  Dentista: { icon: Stethoscope, className: 'bg-emerald-500/20 text-emerald-400' },
  Clínica: { icon: Building2, className: 'bg-amber-500/20 text-amber-400' }
};

interface ConversationsViewProps {
  userRole: UserRole;
  onNavigate?: (tab: string) => void;
}

export function ConversationsView({ userRole }: ConversationsViewProps) {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const isMobile = useIsMobile();

  const conversations = mockConversations[userRole] || [];

  // Listen for open-chat events (e.g. from "Enviar Mensagem" in consultation detail)
  React.useEffect(() => {
    const handler = (e: Event) => {
      const dentistName = (e as CustomEvent<string>).detail;
      if (dentistName) {
        const conv = conversations.find(c => c.name === dentistName);
        if (conv) {
          setSelectedConversation(conv);
        } else {
          // Create a temporary conversation
          setSelectedConversation({
            id: `new-${Date.now()}`,
            name: dentistName,
            type: 'Dentista',
            lastMessage: '',
            lastMessageTime: 'Agora',
            unread: 0,
            messages: [],
          });
        }
      }
    };
    window.addEventListener('smilecheck:open-chat', handler);
    return () => window.removeEventListener('smilecheck:open-chat', handler);
  }, [conversations]);

  const filtered = searchQuery ?
  conversations.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase())) :
  conversations;

  const isDesktop = !isMobile;
  const showSplit = isDesktop;
  const showList = showSplit || !selectedConversation;
  const showChat = showSplit || !!selectedConversation;

  const handleBack = () => setSelectedConversation(null);

  const handleSend = () => {
    if (!messageInput.trim()) return;
    // Mock send — just clear input
    setMessageInput('');
  };

  return (
    <div className={cn('flex-1 flex overflow-hidden', showSplit ? 'flex-row' : 'flex-col')}>
      {/* Conversation List */}
      {showList &&
      <div className={cn(
        'flex flex-col border-r border-border',
        showSplit ? 'w-[30%] min-w-[280px] lg:w-[30%] md:w-[40%]' : 'flex-1'
      )}>
          {/* List Header */}
          <div className="p-4 border-b border-border space-y-3">
            <h2 className="text-lg font-bold">Conversas</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
              placeholder="Pesquisar conversa..."
              className="pl-9 h-9 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} />

            </div>
          </div>

          {/* List */}
          <ScrollArea className="flex-1">
            <div className="divide-y divide-border">
              {filtered.map((conversation) => {
              const isActive = selectedConversation?.id === conversation.id;
              const badge = typeBadgeConfig[conversation.type];
              const BadgeIcon = badge.icon;

              return (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={cn(
                    'w-full flex items-start gap-3 p-4 text-left transition-colors hover:bg-secondary/30',
                    isActive && 'bg-secondary/50',
                    conversation.unread > 0 && 'font-medium'
                  )}>

                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-primary" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn('text-sm truncate', conversation.unread > 0 && 'font-bold')}>
                          {conversation.type === 'Dentista' ?
                        <ClickableDentistName name={conversation.name} className={cn('text-sm', conversation.unread > 0 && 'font-bold')} /> :
                        conversation.type === 'Clínica' ?
                        <ClickableClinicName name={conversation.name} className={cn('text-sm', conversation.unread > 0 && 'font-bold')} /> :
                        conversation.type === 'Paciente' ?
                        <ClickablePatientName name={conversation.name} className={cn('text-sm', conversation.unread > 0 && 'font-bold')} /> :

                        conversation.name
                        }
                        </span>
                        <span className={cn('inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0', badge.className)}>
                          <BadgeIcon className="w-2.5 h-2.5" />
                          {conversation.type}
                        </span>
                      </div>
                      <p className={cn(
                      'text-xs truncate',
                      conversation.unread > 0 ? 'text-foreground' : 'text-muted-foreground'
                    )}>
                        {conversation.lastMessage}
                      </p>
                    </div>

                    {/* Time + Unread */}
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-[10px] text-muted-foreground">{conversation.lastMessageTime}</span>
                      {conversation.unread > 0 &&
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                          {conversation.unread}
                        </span>
                    }
                    </div>
                  </button>);

            })}
            </div>
          </ScrollArea>
        </div>
      }

      {/* Chat Area */}
      {showChat &&
      <div className="flex-1 flex flex-col">
          {selectedConversation ?
        <>
              {/* Chat Header */}
              <div className="h-14 flex items-center gap-3 px-4 border-b border-border flex-shrink-0">
                {!showSplit &&
            <Button variant="ghost" size="icon" onClick={handleBack} className="flex-shrink-0">
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
            }
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                   <p className="text-sm font-semibold truncate">
                     {selectedConversation.type === 'Dentista' ?
                <ClickableDentistName name={selectedConversation.name} className="text-sm font-semibold" /> :
                selectedConversation.type === 'Clínica' ?
                <ClickableClinicName name={selectedConversation.name} className="text-sm font-semibold" /> :
                selectedConversation.type === 'Paciente' ?
                <ClickablePatientName name={selectedConversation.name} className="text-sm font-semibold" /> :

                selectedConversation.name
                }
                   </p>
                  <span className={cn(
                'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium',
                typeBadgeConfig[selectedConversation.type].className
              )}>
                    {selectedConversation.type}
                  </span>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="max-w-2xl mx-auto space-y-3">
                  {selectedConversation.messages.map((msg) =>
              <div
                key={msg.id}
                className={cn('flex', msg.fromMe ? 'justify-end' : 'justify-start')}>

                      <div className={cn("max-w-[75%] rounded-2xl py-2.5 px-[15px] mx-[7px] my-[5px]",

                msg.fromMe ?
                'bg-primary text-primary-foreground rounded-br-md' :
                'bg-secondary rounded-bl-md'
                )}>
                        <p className="text-sm">{msg.text}</p>
                        <p className={cn(
                    'text-[10px] mt-1',
                    msg.fromMe ? 'text-primary-foreground/60' : 'text-muted-foreground'
                  )}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
              )}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-3 border-t border-border flex items-center gap-2 flex-shrink-0">
                <Input
              placeholder="Escrever mensagem..."
              className="flex-1 h-10"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()} />

                <Button size="icon" onClick={handleSend} disabled={!messageInput.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </> : (

        /* Empty state - desktop only */
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                  <Send className="w-7 h-7 text-muted-foreground/50" />
                </div>
                <p className="text-sm">Selecione uma conversa para começar</p>
              </div>
            </div>)
        }
        </div>
      }
    </div>);

}