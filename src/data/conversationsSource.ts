import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { signPrivateFile, validateDocFile, DOC_MIME } from '@/data/dossierSource';

/**
 * Real conversations. Server rules: a conversation can only be started by the
 * RPC `start_conversation` (patient↔professional needs a booked/past
 * appointment; professionals share a clinic or an approved clinic contacts a
 * dentist with published availability). Messages are written only by
 * `send_message`; the author may void his own within 5 minutes; nothing is
 * deleted. Attachments live in the private `message-attachments` bucket and
 * are opened only through the `sign-file` edge function.
 */
const rpc = (fn: string, args: Record<string, unknown> = {}) => supabase.rpc(fn as never, args as never);

export const VOID_WINDOW_MS = 5 * 60 * 1000;
export const ATTACHMENT_BUCKET = 'message-attachments';
export { DOC_MIME as ATTACHMENT_MIME };

export interface ConversationRow {
  id: string; kind: 'patient_professional' | 'professional'; last_message_at: string;
  other_id: string; other_name: string | null; other_avatar: string | null; other_role: 'patient' | 'dentist' | 'clinic';
  unread: number; last_body: string | null;
}
export interface MessageRow {
  id: string; conversation_id: string; sender_id: string; body: string; attachment_path: string | null;
  attachment_mime: string | null; attachment_size: number | null; read_at: string | null; voided_at: string | null; created_at: string;
}
export interface Contact { id: string; name: string | null; avatar_url: string | null; role: 'patient' | 'dentist' | 'clinic' }

/** Author can void a message only within 5 minutes of sending it. */
export function canVoid(m: Pick<MessageRow, 'sender_id' | 'created_at' | 'voided_at'>, me: string, now = Date.now()) {
  return m.sender_id === me && !m.voided_at && now - new Date(m.created_at).getTime() <= VOID_WINDOW_MS;
}

export async function fetchConversations(): Promise<ConversationRow[]> {
  const { data, error } = await rpc('my_conversations');
  if (error) throw error;
  return (Array.isArray(data) ? data : []) as unknown as ConversationRow[];
}
export async function fetchContacts(): Promise<Contact[]> {
  const { data, error } = await rpc('my_contactable_profiles');
  if (error) throw error;
  return (Array.isArray(data) ? data : []) as unknown as Contact[];
}
export async function fetchMessages(conversationId: string): Promise<MessageRow[]> {
  const { data, error } = await supabase.from('messages' as never).select('*').eq('conversation_id', conversationId).order('created_at', { ascending: true }).limit(500);
  if (error) throw error;
  return (data ?? []) as unknown as MessageRow[];
}
export async function startConversation(otherId: string): Promise<string> {
  const { data, error } = await rpc('start_conversation', { _other: otherId });
  if (error) throw error;
  return data as unknown as string;
}
export async function sendMessage(conversationId: string, body: string, file?: File | null) {
  let path: string | null = null;
  if (file) {
    const err = validateDocFile(file);
    if (err) throw new Error(err);
    const ext = file.type === 'application/pdf' ? 'pdf' : file.type.split('/')[1].replace('jpeg', 'jpg');
    path = `${conversationId}/${crypto.randomUUID()}.${ext}`;
    const up = await supabase.storage.from(ATTACHMENT_BUCKET).upload(path, file, { contentType: file.type, upsert: false });
    if (up.error) throw up.error;
  }
  const { error } = await rpc('send_message', {
    _conversation_id: conversationId, _body: body, _attachment_path: path,
    _attachment_mime: file?.type ?? null, _attachment_size: file?.size ?? null,
  });
  if (error) throw error;
}
export async function voidMessage(id: string) {
  const { error } = await rpc('void_message', { _message_id: id });
  if (error) throw error;
}
export async function markRead(conversationId: string) {
  await rpc('mark_conversation_read', { _conversation_id: conversationId });
}
export const openAttachment = (messageId: string) => signPrivateFile('message', messageId);

/** Real unread counter, refreshed live from Realtime (RLS limits events to my conversations). */
export function useUnreadMessages(enabled: boolean) {
  const [count, setCount] = useState(0);
  const load = useCallback(async () => {
    if (!enabled) { setCount(0); return; }
    const { data } = await rpc('my_unread_messages');
    setCount(typeof data === 'number' ? data : 0);
  }, [enabled]);
  useEffect(() => {
    void load();
    if (!enabled) return;
    const ch = supabase.channel(`unread-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => { void load(); })
      .subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, [enabled, load]);
  return count;
}
