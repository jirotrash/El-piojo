import React, { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Image, Smile } from 'lucide-react';

type Props = {
  placeholder?: string;
  onSend: (text: string) => Promise<void> | void;
  disabled?: boolean;
};

export default function ChatInput({ placeholder = 'Escribe un mensaje...', onSend, disabled = false }: Props) {
  const [value, setValue] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const rootRef = useRef<HTMLFormElement | null>(null);

  const emojis = ['😊','👍','😂','❤️','🔥','🙌','😉','😅','🤝','🎉'];

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const t = value.trim();
    if (!t) return;
    try {
      await onSend(t);
      setValue('');
    } catch (err) {
      // ignore; parent may handle errors
    }
  };

  return (
    <form ref={rootRef} onSubmit={handleSubmit} className="relative flex items-center gap-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowEmoji((s) => !s)}
          className="p-2 rounded-full bg-muted text-muted-foreground hover:bg-muted/80"
          aria-label="Emoji"
        >
          <Smile size={16} />
        </button>

        <button type="button" className="p-2 rounded-full bg-muted text-muted-foreground hover:bg-muted/80">
          <Image size={16} />
        </button>
      </div>

      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="rounded-full flex-1"
        disabled={disabled}
      />
      <Button type="submit" size="icon" className="rounded-full" disabled={disabled || !value.trim()}>
        <Send size={16} />
      </Button>

      {showEmoji && (
        <div className="absolute bottom-12 left-2 z-40 w-44 bg-card border border-border rounded-lg p-2 shadow-lg">
          <div className="grid grid-cols-5 gap-2">
            {emojis.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => {
                  setValue((v) => v + e);
                  setShowEmoji(false);
                }}
                className="p-2 rounded-md hover:bg-muted/60"
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
