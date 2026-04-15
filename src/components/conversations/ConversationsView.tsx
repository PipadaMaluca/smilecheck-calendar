import React, { useState, useEffect, useRef } from 'react';
import { Search, ArrowLeft, Send, User, Stethoscope, Building2, MessageSquare, Plus, X } from 'lucide-react';
import { CoachMark } from '@/components/onboarding/CoachMark';
import { ClickableDentistName } from '@/components/search/ClickableDentistName';
import { ClickableClinicName } from '@/components/search/ClickableClinicName';
import { ClickablePatientName } from '@/components/search/ClickablePatientName';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserRole } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from 'react-i18next';
import { useSimulatedLoading } from '@/hooks/use-simulated-loading';
import { ChatListSkeleton } from '@/components/skeletons';

interface Message {
  id: string;
  text: string;
  fromMe: boolean;
  time: string;
  date?: string;
}

interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  type: 'Paciente' | 'Dentista' | 'Clínica';
  lastMessage: string;
  lastMessageTime: string;
  lastMessageFromMe?: boolean;
  unread: number;
  online?: boolean | null;
  isTyping?: boolean;
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
      lastMessageFromMe: false,
      unread: 2,
      online: true,
      isTyping: true,
      messages: [
        { id: 'm1', text: 'Olá Dr. Gonçalo, gostaria de confirmar a minha consulta.', fromMe: true, time: '10:15', date: '28 Jan 2026' },
        { id: 'm2', text: 'Claro! Deixe-me verificar a agenda.', fromMe: false, time: '10:20', date: '28 Jan 2026' },
        { id: 'm3', text: 'Obrigado, fico a aguardar.', fromMe: true, time: '10:22', date: '28 Jan 2026' },
        { id: 'm4', text: 'Temos disponibilidade amanhã às 10h. Serve-lhe?', fromMe: false, time: '11:00', date: 'Ontem' },
        { id: 'm5', text: 'Perfeito, pode confirmar!', fromMe: true, time: '14:20', date: 'Hoje' },
        { id: 'm6', text: 'Bom dia! A sua consulta está confirmada para amanhã às 10h.', fromMe: false, time: '14:32', date: 'Hoje' },
      ],
    },
    {
      id: 'p2',
      name: 'Clínica SmileCheck',
      type: 'Clínica',
      lastMessage: 'Lembrete: a sua próxima consulta é dia 5 de Fevereiro.',
      lastMessageTime: 'Ontem',
      lastMessageFromMe: false,
      unread: 0,
      online: null,
      messages: [
        { id: 'm1', text: 'Lembrete: a sua próxima consulta é dia 5 de Fevereiro.', fromMe: false, time: '09:00', date: 'Ontem' },
      ],
    },
    {
      id: 'p3',
      name: 'Dra. Sofia Martins',
      type: 'Dentista',
      lastMessage: 'Os resultados do raio-X estão prontos. Pode passar na clínica.',
      lastMessageTime: '12 Jan',
      lastMessageFromMe: false,
      unread: 1,
      online: false,
      messages: [
        { id: 'm1', text: 'Dra. Sofia, já estão prontos os resultados?', fromMe: true, time: '11:00', date: '12 Jan 2026' },
        { id: 'm2', text: 'Os resultados do raio-X estão prontos. Pode passar na clínica.', fromMe: false, time: '11:45', date: '12 Jan 2026' },
      ],
    },
  ],
  dentist: [
    {
      id: 'd1',
      name: 'Maria Silva',
      type: 'Paciente',
      lastMessage: 'Obrigada doutor! Até amanhã.',
      lastMessageTime: '16:05',
      lastMessageFromMe: false,
      unread: 1,
      online: true,
      isTyping: true,
      messages: [
        { id: 'm1', text: 'Bom dia Maria, como se sente após o tratamento?', fromMe: true, time: '09:30', date: 'Ontem' },
        { id: 'm2', text: 'Muito melhor, obrigada! A dor passou.', fromMe: false, time: '10:15', date: 'Ontem' },
        { id: 'm3', text: 'Ótimo! Lembro-lhe da consulta amanhã às 09:30.', fromMe: true, time: '15:50', date: 'Hoje' },
        { id: 'm4', text: 'Obrigada doutor! Até amanhã.', fromMe: false, time: '16:05', date: 'Hoje' },
      ],
    },
    {
      id: 'd2',
      name: 'João Santos',
      type: 'Paciente',
      lastMessage: 'Posso remarcar para sexta-feira?',
      lastMessageTime: '10:22',
      lastMessageFromMe: false,
      unread: 3,
      online: false,
      messages: [
        { id: 'm1', text: 'Bom dia João, a sua consulta é hoje às 14h.', fromMe: true, time: '09:00', date: 'Hoje' },
        { id: 'm2', text: 'Bom dia doutor, infelizmente surgiu um imprevisto.', fromMe: false, time: '09:45', date: 'Hoje' },
        { id: 'm3', text: 'Posso remarcar para sexta-feira?', fromMe: false, time: '10:22', date: 'Hoje' },
      ],
    },
    {
      id: 'd3',
      name: 'Clínica SmileCheck',
      type: 'Clínica',
      lastMessage: 'A reunião de equipa foi movida para as 18h.',
      lastMessageTime: 'Ontem',
      lastMessageFromMe: false,
      unread: 0,
      online: null,
      messages: [
        { id: 'm1', text: 'A reunião de equipa foi movida para as 18h.', fromMe: false, time: '17:30', date: 'Ontem' },
      ],
    },
    {
      id: 'd4',
      name: 'Dr. Alexandre Bernardo',
      type: 'Dentista',
      lastMessage: 'Claro, sem problema!',
      lastMessageTime: '8 Jan',
      lastMessageFromMe: true,
      unread: 0,
      online: true,
      messages: [
        { id: 'm1', text: 'Podes cobrir o meu turno na quinta?', fromMe: false, time: '14:00', date: '8 Jan 2026' },
        { id: 'm2', text: 'Claro, sem problema!', fromMe: true, time: '14:30', date: '8 Jan 2026' },
      ],
    },
  ],
  clinic: [
    {
      id: 'c1',
      name: 'Maria Silva',
      type: 'Paciente',
      lastMessage: 'Gostaria de agendar uma consulta para o meu filho.',
      lastMessageTime: '15:40',
      lastMessageFromMe: false,
      unread: 2,
      online: true,
      isTyping: true,
      messages: [
        { id: 'm1', text: 'Boa tarde, gostaria de agendar uma consulta para o meu filho.', fromMe: false, time: '15:30', date: 'Hoje' },
        { id: 'm2', text: 'Gostaria de agendar uma consulta para o meu filho.', fromMe: false, time: '15:40', date: 'Hoje' },
      ],
    },
    {
      id: 'c2',
      name: 'Dr. Gonçalo Pipo',
      type: 'Dentista',
      lastMessage: 'Preciso de bloquear o horário da manhã de quarta.',
      lastMessageTime: '11:15',
      lastMessageFromMe: false,
      unread: 1,
      online: false,
      messages: [
        { id: 'm1', text: 'Preciso de bloquear o horário da manhã de quarta.', fromMe: false, time: '11:15', date: 'Hoje' },
      ],
    },
    {
      id: 'c3',
      name: 'Dr. Alexandre Bernardo',
      type: 'Dentista',
      lastMessage: 'Sim, já está disponível no stock.',
      lastMessageTime: 'Ontem',
      lastMessageFromMe: true,
      unread: 0,
      online: null,
      messages: [
        { id: 'm1', text: 'O material de ortodontia já chegou?', fromMe: false, time: '10:00', date: 'Ontem' },
        { id: 'm2', text: 'Sim, já está disponível no stock.', fromMe: true, time: '10:30', date: 'Ontem' },
      ],
    },
    {
      id: 'c4',
      name: 'João Santos',
      type: 'Paciente',
      lastMessage: 'Estamos abertos das 9h às 13h.',
      lastMessageTime: '5 Jan',
      lastMessageFromMe: true,
      unread: 0,
      online: false,
      messages: [
        { id: 'm1', text: 'Qual o horário de funcionamento ao sábado?', fromMe: false, time: '09:00', date: '5 Jan 2026' },
        { id: 'm2', text: 'Estamos abertos das 9h às 13h.', fromMe: true, time: '09:15', date: '5 Jan 2026' },
      ],
    },
  ],
};

const typeBadgeConfig: Record<string, { icon: typeof User; className: string }> = {
  Paciente: { icon: User, className: 'bg-blue-500/20 text-blue-400' },
  Dentista: { icon: Stethoscope, className: 'bg-emerald-500/20 text-emerald-400' },
  Clínica: { icon: Building2, className: 'bg-amber-500/20 text-amber-400' },
};

function OnlineStatusDot({ online }: { online?: boolean | null }) {
  if (online === null || online === undefined) return null;
  return (
    <span
      className={cn(
        'absolute bottom-0 right-0 w-2 h-2 rounded-full border-2 border-background',
        online ? 'bg-emerald-500' : 'bg-muted-foreground/50'
      )}
    />
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-2 px-1">
      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
    </div>
  );
}

function DateSeparator({ date }: { date: string }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-border" />
      <span className="text-[10px] text-muted-foreground font-medium px-2">{date}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function renderName(type: string, name: string, className?: string) {
  if (type === 'Dentista') return <ClickableDentistName name={name} className={className} />;
  if (type === 'Clínica') return <ClickableClinicName name={name} className={className} />;
  if (type === 'Paciente') return <ClickablePatientName name={name} className={className} />;
  return name;
}

interface ConversationsViewProps {
  userRole: UserRole;
  onNavigate?: (tab: string) => void;
}

export function ConversationsView({ userRole, onNavigate }: ConversationsViewProps) {
  const { t } = useTranslation();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [newConvSearch, setNewConvSearch] = useState('');
  const isMobile = useIsMobile();
  const isLoading = useSimulatedLoading(1000);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversations = mockConversations[userRole] || [];

  useEffect(() => {
    const handler = (e: Event) => {
      const dentistName = (e as CustomEvent<string>).detail;
      if (dentistName) {
        const conv = conversations.find((c) => c.name === dentistName);
        if (conv) {
          setSelectedConversation(conv);
        } else {
          setSelectedConversation({
            id: `new-${Date.now()}`,
            name: dentistName,
            type: 'Dentista',
            lastMessage: '',
            lastMessageTime: 'Agora',
            unread: 0,
            online: null,
            messages: [],
          });
        }
      }
    };
    window.addEventListener('smilecheck:open-chat', handler);
    return () => window.removeEventListener('smilecheck:open-chat', handler);
  }, [conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation]);

  const filtered = searchQuery
    ? conversations.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : conversations;

  const isDesktop = !isMobile;
  const showSplit = isDesktop;
  const showList = showSplit || !selectedConversation;
  const showChat = showSplit || !!selectedConversation;

  const handleBack = () => setSelectedConversation(null);

  const handleSend = () => {
    if (!messageInput.trim()) return;
    setMessageInput('');
  };

  const handleNewConversation = () => {
    setShowNewConversation(true);
    setNewConvSearch('');
  };

  const mockNewContacts = userRole === 'patient'
    ? [
        { name: 'Dr. Pedro Almeida', type: 'Dentista' as const },
        { name: 'Dra. Ana Costa', type: 'Dentista' as const },
        { name: 'Clínica DentCare', type: 'Clínica' as const },
      ]
    : userRole === 'dentist'
    ? [
        { name: 'Ana Rodrigues', type: 'Paciente' as const },
        { name: 'Carlos Ferreira', type: 'Paciente' as const },
        { name: 'Clínica DentCare', type: 'Clínica' as const },
      ]
    : [
        { name: 'Teresa Oliveira', type: 'Paciente' as const },
        { name: 'Dra. Ana Costa', type: 'Dentista' as const },
        { name: 'Pedro Mendes', type: 'Paciente' as const },
      ];

  const filteredNewContacts = newConvSearch
    ? mockNewContacts.filter((c) => c.name.toLowerCase().includes(newConvSearch.toLowerCase()))
    : mockNewContacts;

  const startNewConversation = (name: string, type: Conversation['type']) => {
    setShowNewConversation(false);
    setSelectedConversation({
      id: `new-${Date.now()}`,
      name,
      type,
      lastMessage: '',
      lastMessageTime: 'Agora',
      unread: 0,
      online: null,
      messages: [],
    });
  };

  // Group messages by date for date separators
  const getMessagesWithSeparators = (messages: Message[]) => {
    const items: Array<{ type: 'date'; date: string } | { type: 'message'; message: Message }> = [];
    let lastDate = '';
    for (const msg of messages) {
      const date = msg.date || '';
      if (date && date !== lastDate) {
        items.push({ type: 'date', date });
        lastDate = date;
      }
      items.push({ type: 'message', message: msg });
    }
    return items;
  };

  return (
    <>
    <div className={cn('flex-1 flex overflow-hidden', showSplit ? 'flex-row' : 'flex-col')}>
      {showList && (
        <div
          className={cn(
            'flex flex-col border-r border-border relative',
            showSplit ? 'w-[30%] min-w-[280px] lg:w-[30%] md:w-[40%]' : 'flex-1'
          )}
        >
          <div className="p-4 border-b border-border space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{t('chat.title')}</h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleNewConversation}
                title={t('chat.newConversation')}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="relative" id="coachmark-chat-list">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('chat.searchPlaceholder')}
                className="pl-9 h-9 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* New conversation overlay */}
          {showNewConversation && (
            <div className="absolute inset-0 z-10 bg-background flex flex-col">
              <div className="p-4 border-b border-border space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">{t('chat.newConversation')}</h2>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowNewConversation(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={t('chat.searchContact')}
                    className="pl-9 h-9 text-sm"
                    value={newConvSearch}
                    onChange={(e) => setNewConvSearch(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
              <ScrollArea className="flex-1">
                <div className="divide-y divide-border">
                  {filteredNewContacts.map((contact) => {
                    const badge = typeBadgeConfig[contact.type];
                    const BadgeIcon = badge.icon;
                    return (
                      <button
                        key={contact.name}
                        onClick={() => startNewConversation(contact.name, contact.type)}
                        className="w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-secondary/30"
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{contact.name}</p>
                        </div>
                        <span className={cn('inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0', badge.className)}>
                          <BadgeIcon className="w-2.5 h-2.5" />
                          {contact.type}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}

          {isLoading ? (
            <div className="p-2">
              <ChatListSkeleton />
            </div>
          ) : (
            <ScrollArea className="flex-1">
              <div className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                    <MessageSquare className="w-12 h-12 text-muted-foreground/30 mb-4" />
                    <h3 className="text-base font-bold text-foreground mb-1">{t('emptyStates.chatTitle')}</h3>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      {t(
                        userRole === 'patient'
                          ? 'emptyStates.chatDescPatient'
                          : userRole === 'dentist'
                          ? 'emptyStates.chatDescDentist'
                          : 'emptyStates.chatDescClinic'
                      )}
                    </p>
                  </div>
                ) : (
                  filtered.map((conversation) => {
                    const isActive = selectedConversation?.id === conversation.id;
                    const badge = typeBadgeConfig[conversation.type];
                    const BadgeIcon = badge.icon;
                    const isUnread = conversation.unread > 0;

                    // Preview text
                    let previewText = conversation.lastMessage;
                    if (conversation.isTyping) {
                      previewText = '';
                    } else if (conversation.lastMessageFromMe) {
                      previewText = `${t('chat.you')}: ${conversation.lastMessage}`;
                    }

                    return (
                      <button
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation)}
                        className={cn(
                          'w-full flex items-start gap-3 p-4 text-left transition-colors hover:bg-secondary/30',
                          isActive && 'bg-secondary/50'
                        )}
                      >
                        {/* Avatar with online dot */}
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <OnlineStatusDot online={conversation.online} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={cn('text-sm truncate', isUnread && 'font-bold')}>
                              {renderName(
                                conversation.type,
                                conversation.name,
                                cn('text-sm', isUnread && 'font-bold')
                              )}
                            </span>
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0',
                                badge.className
                              )}
                            >
                              <BadgeIcon className="w-2.5 h-2.5" />
                              {conversation.type}
                            </span>
                          </div>
                          {conversation.isTyping ? (
                            <p className="text-xs italic text-muted-foreground">{t('chat.typing')}</p>
                          ) : (
                            <p
                              className={cn(
                                'text-xs truncate',
                                isUnread ? 'text-foreground font-medium' : 'text-muted-foreground'
                              )}
                            >
                              {previewText}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className="text-[10px] text-muted-foreground">{conversation.lastMessageTime}</span>
                          {isUnread && (
                            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                              {conversation.unread}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      )}

      {showChat && (
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat header */}
              <div className="h-14 flex items-center gap-3 px-4 border-b border-border flex-shrink-0">
                {!showSplit && (
                  <Button variant="ghost" size="icon" onClick={handleBack} className="flex-shrink-0">
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                )}
                <div className="relative flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <OnlineStatusDot online={selectedConversation.online} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {renderName(selectedConversation.type, selectedConversation.name, 'text-sm font-semibold')}
                  </p>
                  {selectedConversation.isTyping ? (
                    <p className="text-[11px] italic text-muted-foreground">{t('chat.typing')}</p>
                  ) : (
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium',
                        typeBadgeConfig[selectedConversation.type].className
                      )}
                    >
                      {selectedConversation.type}
                    </span>
                  )}
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="max-w-2xl mx-auto space-y-1">
                  {getMessagesWithSeparators(selectedConversation.messages).map((item, idx) => {
                    if (item.type === 'date') {
                      return <DateSeparator key={`date-${idx}`} date={item.date} />;
                    }
                    const msg = item.message;
                    return (
                      <div key={msg.id} className={cn('flex', msg.fromMe ? 'justify-end' : 'justify-start')}>
                        <div
                          className={cn(
                            'max-w-[75%] rounded-2xl py-2.5 px-[15px] mx-[7px] my-[5px]',
                            msg.fromMe
                              ? 'bg-primary text-primary-foreground rounded-br-md'
                              : 'bg-secondary rounded-bl-md'
                          )}
                        >
                          <p className="text-sm">{msg.text}</p>
                          <p
                            className={cn(
                              'text-[10px] mt-1',
                              msg.fromMe ? 'text-primary-foreground/60' : 'text-muted-foreground'
                            )}
                          >
                            {msg.time}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing indicator in chat */}
                  {selectedConversation.isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-secondary rounded-2xl rounded-bl-md py-2.5 px-[15px] mx-[7px] my-[5px]">
                        <TypingDots />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message input */}
              <div className="p-3 border-t border-border flex items-center gap-2 flex-shrink-0">
                <Input
                  placeholder={t('chat.typeMessage')}
                  className="flex-1 h-10"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <Button size="icon" onClick={handleSend} disabled={!messageInput.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                  <Send className="w-7 h-7 text-muted-foreground/50" />
                </div>
                <p className="text-sm">{t('chat.selectConversation')}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
    <CoachMark
      id={`chat-${userRole}`}
      targetId="coachmark-chat-list"
      title={t('coachmarks.chatTitle')}
      description={t('coachmarks.chatDesc')}
      enabled={!isLoading}
    />
    </>
  );
}
