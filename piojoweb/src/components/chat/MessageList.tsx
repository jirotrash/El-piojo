import React, { useEffect, useRef } from 'react';

export type ChatMessage = {
  id?: string | number;
  text: string;
  from?: 'user' | 'seller' | string;
  senderId?: number | string | null;
  senderName?: string | null;
  createdAt?: string | null;
};

type Props = {
  messages: ChatMessage[];
  currentUserId?: string | number | null;
  sellerName?: string | null;
};

function timeAgo(date?: string | null) {
  if (!date) return '';
  const d = new Date(date).getTime();
  const now = Date.now();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 10) return 'Ahora';
  if (diff < 60) return `Hace ${diff} seg`;
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `Hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `Hace ${days} d`;
}

export default function MessageList({ messages = [], currentUserId, sellerName }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight + 200, behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto px-3 py-4">
      <div className="flex flex-col gap-3">
        {messages.map((m, i) => {
          const prev = messages[i - 1];
          const next = messages[i + 1];
          const currentSender = m.senderId ?? m.from;
          const prevSender = prev ? (prev.senderId ?? prev.from) : null;
          const nextSender = next ? (next.senderId ?? next.from) : null;
          const showAvatar = String(currentSender) !== String(prevSender);
          const isMe = (m.senderId != null && String(m.senderId) === String(currentUserId)) || m.from === 'user';

          return (
            <div key={m.id ?? i} className={`flex items-end ${isMe ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-2' : 'mt-0'}`}>
              {!isMe && (
                <div className="mr-3 flex-shrink-0">
                  {showAvatar ? (
                    <div className="w-9 h-9 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground font-bold">{String(m.senderName ?? sellerName ?? '?')?.[0] ?? '?'}</div>
                  ) : (
                    <div className="w-9 h-9" />
                  )}
                </div>
              )}

              <div className="max-w-[78%]">
                {showAvatar && !isMe && (
                  <div className="text-xs text-muted-foreground mb-1">{m.senderName ?? sellerName}</div>
                )}

                <div className="relative">
                  <div className={`px-4 py-2 rounded-2xl break-words text-sm shadow-sm ${isMe ? 'bg-gradient-to-br from-primary/90 to-primary/70 text-primary-foreground rounded-br-md' : 'bg-muted text-foreground rounded-bl-md'}`}>
                    {m.text}
                  </div>

                  {/* tail */}
                  <div
                    className={`absolute bottom-0 ${isMe ? 'right-[-6px]' : 'left-[-6px]'} w-3 h-3 transform rotate-45 ${isMe ? 'bg-primary/90' : 'bg-muted'}`}
                    style={{
                      borderRadius: 2,
                      marginBottom: -6,
                    }}
                  />
                </div>

                <div className={`text-[11px] mt-1 ${isMe ? 'text-right text-muted-foreground' : 'text-left text-muted-foreground'}`}>
                  {timeAgo(m.createdAt)}
                </div>
              </div>

              {isMe && <div className="ml-3" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
