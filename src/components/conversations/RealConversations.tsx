import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Ban, MessageSquare, Paperclip, Plus, Send, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { PersonAvatar } from '@/components/ui/person-avatar';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/formatters';
import {
  fetchConversations, fetchContacts, fetchMessages, startConversation, sendMessage, voidMessage, markRead,
  openAttachment, canVoid, ATTACHMENT_MIME, type ConversationRow, type MessageRow, type Contact,
} from '@/data/conversationsSource';

/** Pending "open this conversation" handed over from other screens (e.g. availability contact). */
export const OPEN_CONVERSATION_KEY = 'sc:open-conversation';

const time = (iso: string) => formatDate(iso, { hour: '2-digit', minute: '2-digit' });

export function RealConversations() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const me = user?.id ?? '';
  const isMobile = useIsMobile();
  const [convs, setConvs] = useState<ConversationRow[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [picker, setPicker] = useState<Contact[] | null>(null);
  const [, tick] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const loadConvs = useCallback(async () => {
    try { setConvs(await fetchConversations()); } catch { setConvs([]); }
  }, []);
  const loadMessages = useCallback(async (id: string) => {
    try { setMessages(await fetchMessages(id)); await markRead(id); } catch { setMessages([]); }
  }, []);

  useEffect(() => {
    void loadConvs();
    const pending = sessionStorage.getItem(OPEN_CONVERSATION_KEY);
    if (pending) { sessionStorage.removeItem(OPEN_CONVERSATION_KEY); setSelected(pending); }
  }, [loadConvs]);
  useEffect(() => { if (selected) void loadMessages(selected); }, [selected, loadMessages]);
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [messages.length]);
  // Re-render every 30 s so the 5-minute "void" button disappears on time.
  useEffect(() => { const h = setInterval(() => tick((n) => n + 1), 30_000); return () => clearInterval(h); }, []);

  // Realtime: RLS only delivers rows of my own conversations.
  const selRef = useRef(selected); selRef.current = selected;
  useEffect(() => {
    const ch = supabase.channel(`chat-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (p) => {
        const row = (p.new ?? {}) as Partial<MessageRow>;
        if (row.conversation_id && row.conversation_id === selRef.current) void loadMessages(row.conversation_id);
        void loadConvs();
      })
      .subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, [loadConvs, loadMessages]);

  const current = useMemo(() => convs?.find((c) => c.id === selected) ?? null, [convs, selected]);

  const send = async () => {
    if (!selected || (!text.trim() && !file)) return;
    setSending(true);
    try { await sendMessage(selected, text, file); setText(''); setFile(null); await loadMessages(selected); void loadConvs(); }
    catch (e) {
      const m = (e as { message?: string }).message ?? '';
      toast.error(m.startsWith('dossierReal.') ? t(m) : t(`chatReal.errors.${m}`, { defaultValue: t('chatReal.sendError') }));
    } finally { setSending(false); }
  };
  const openNew = async () => {
    try { setPicker(await fetchContacts()); } catch { setPicker([]); }
  };
  const begin = async (c: Contact) => {
    try { const id = await startConversation(c.id); setPicker(null); await loadConvs(); setSelected(id); }
    catch { toast.error(t('chatReal.errors.no_relationship')); }
  };
  const view = async (m: MessageRow) => {
    const w = window.open('', '_blank', 'noopener');
    try { const url = await openAttachment(m.id); if (w) w.location.href = url; else window.location.assign(url); }
    catch { w?.close(); toast.error(t('dossierReal.docs.openError')); }
  };

  const list = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold">{t('chatReal.title')}</h2>
        <Button size="sm" variant="outline" className="gap-1" onClick={openNew}><Plus className="w-4 h-4" />{t('chatReal.new')}</Button>
      </div>
      <ScrollArea className="flex-1">
        {convs === null ? <div className="p-4 space-y-3"><Skeleton className="h-14" /><Skeleton className="h-14" /></div>
          : convs.length === 0 ? <EmptyState icon={MessageSquare} title={t('chatReal.empty')} description={t('chatReal.emptyHint')} />
          : convs.map((c) => (
            <button key={c.id} type="button" onClick={() => setSelected(c.id)}
              className={cn('w-full flex items-center gap-3 p-3 text-left border-b border-border/50 hover:bg-secondary/50', selected === c.id && 'bg-secondary')}>
              <PersonAvatar name={c.other_name ?? '—'} photo={c.other_avatar} kind={c.other_role === 'clinic' ? 'clinic' : 'person'} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium truncate">{c.other_name ?? '—'}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{formatDate(c.last_message_at, { day: 'numeric', month: 'short' })}</span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{c.last_body ?? t('chatReal.voided')}</p>
              </div>
              {c.unread > 0 && <span className="min-w-6 h-6 px-2 rounded-full bg-primary-solid text-primary-foreground text-xs font-semibold flex items-center justify-center">{c.unread}</span>}
            </button>
          ))}
      </ScrollArea>
    </div>
  );

  const thread = current || selected ? (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        {isMobile && <Button variant="ghost" size="icon" aria-label={t('a11y.back')} onClick={() => setSelected(null)}><ArrowLeft className="w-5 h-5" /></Button>}
        <PersonAvatar name={current?.other_name ?? '—'} photo={current?.other_avatar} kind={current?.other_role === 'clinic' ? 'clinic' : 'person'} />
        <span className="font-semibold">{current?.other_name ?? '—'}</span>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {messages.map((m) => {
            const mine = m.sender_id === me;
            return (
              <div key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                <div className={cn('max-w-[80%] rounded-2xl px-3 py-2 text-sm', mine ? 'bg-primary-solid text-primary-foreground' : 'bg-secondary')}>
                  {m.voided_at ? <span className="italic opacity-80">{t('chatReal.voided')}</span> : (
                    <>
                      {m.body && <p className="whitespace-pre-wrap break-words">{m.body}</p>}
                      {m.attachment_path && (
                        <button type="button" onClick={() => view(m)} className="mt-1 inline-flex items-center gap-1 underline">
                          <Paperclip className="w-3.5 h-3.5" />{t('chatReal.attachment')}
                        </button>
                      )}
                    </>
                  )}
                  <div className="flex items-center justify-end gap-2 mt-1 text-xs opacity-80">
                    <span>{time(m.created_at)}</span>
                    {mine && !m.voided_at && <span>{m.read_at ? t('chatReal.read') : t('chatReal.sent')}</span>}
                    {canVoid(m, me) && (
                      <button type="button" className="underline" onClick={async () => { try { await voidMessage(m.id); await loadMessages(m.conversation_id); } catch { toast.error(t('chatReal.errors.void_window_closed')); } }}>
                        <Ban className="inline w-3 h-3 mr-0.5" />{t('chatReal.void')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
      </ScrollArea>
      <div className="p-3 border-t border-border space-y-2">
        {file && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Paperclip className="w-3.5 h-3.5" /><span className="truncate">{file.name}</span>
            <Button variant="ghost" size="icon" aria-label={t('a11y.remove')} onClick={() => setFile(null)}><X className="w-4 h-4" /></Button>
          </div>
        )}
        <div className="flex gap-2">
          <input ref={fileRef} type="file" className="hidden" accept={ATTACHMENT_MIME.join(',')} onChange={(e) => { setFile(e.target.files?.[0] ?? null); e.target.value = ''; }} />
          <Button variant="ghost" size="icon" aria-label={t('chatReal.attach')} onClick={() => fileRef.current?.click()}><Paperclip className="w-5 h-5" /></Button>
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder={t('chatReal.placeholder')} maxLength={4000}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); } }} />
          <Button size="icon" aria-label={t('chatReal.send')} disabled={sending || (!text.trim() && !file)} onClick={send}><Send className="w-4 h-4" /></Button>
        </div>
      </div>
    </div>
  ) : (
    <div className="h-full flex items-center justify-center"><EmptyState icon={MessageSquare} title={t('chatReal.pick')} /></div>
  );

  return (
    <div className="flex h-full min-h-0">
      {(!isMobile || !selected) && <div className={cn('border-r border-border', isMobile ? 'w-full' : 'w-96 shrink-0')}>{list}</div>}
      {(!isMobile || selected) && <div className="flex-1 min-w-0">{thread}</div>}
      {picker && (
        <div className="fixed inset-0 z-modal bg-background/80 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={t('chatReal.new')}>
          <div className="w-full max-w-md bg-card border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{t('chatReal.new')}</h3>
              <Button variant="ghost" size="icon" aria-label={t('a11y.close')} onClick={() => setPicker(null)}><X className="w-4 h-4" /></Button>
            </div>
            {picker.length === 0 ? <p className="text-sm text-muted-foreground">{t('chatReal.noContacts')}</p> : (
              <ScrollArea className="max-h-80">
                {picker.map((c) => (
                  <button key={c.id} type="button" onClick={() => begin(c)} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary text-left">
                    <PersonAvatar name={c.name ?? '—'} photo={c.avatar_url} kind={c.role === 'clinic' ? 'clinic' : 'person'} size="xs" />
                    <span className="truncate">{c.name ?? '—'}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{t(`chatReal.role.${c.role}`)}</span>
                  </button>
                ))}
              </ScrollArea>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
