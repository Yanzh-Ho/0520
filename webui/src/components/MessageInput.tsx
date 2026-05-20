import { useRef } from 'react';
import type { ConnectionStatus, ThemeTokens, AccentTokens } from '../types';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  status: ConnectionStatus;
  t: ThemeTokens;
  accent: AccentTokens;
}

export default function MessageInput({ value, onChange, onSend, status, t, accent }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSend     = value.trim().length > 0 && status === 'connected';
  const charLeft    = 1000 - value.length;
  const isDisabled  = status !== 'connected';

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const onInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    onChange(el.value);
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  const handleSend = () => {
    onSend();
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  };

  return (
    <div style={{
      padding: '10px 12px',
      borderTop: `1px solid ${t.border}`,
      display: 'flex', gap: 8, alignItems: 'flex-end',
      flexShrink: 0, background: t.bg,
      paddingBottom: 'calc(10px + env(safe-area-inset-bottom, 0px))',
    }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <textarea
          ref={textareaRef}
          value={value}
          onInput={onInput}
          onChange={e => onChange(e.target.value)}
          onKeyDown={onKey}
          maxLength={1000}
          placeholder={isDisabled ? 'Waiting for connection…' : 'Transmit a message…'}
          rows={1}
          aria-label="Message"
          disabled={isDisabled}
          style={{
            width: '100%',
            background: t.surface,
            border: `1.5px solid ${t.border}`,
            borderRadius: 9,
            padding: '10px 13px',
            fontSize: 14,
            fontFamily: 'IBM Plex Sans, sans-serif',
            color: t.text,
            resize: 'none',
            outline: 'none',
            lineHeight: 1.5,
            overflowY: 'hidden',
            transition: 'border-color 0.15s',
            display: 'block',
            caretColor: accent.c,
            opacity: isDisabled ? 0.45 : 1,
          }}
          onFocus={e => { e.target.style.borderColor = accent.c; }}
          onBlur={e  => { e.target.style.borderColor = t.border; }}
        />
        {value.length > 900 && (
          <span style={{
            position: 'absolute', bottom: 8, right: 10,
            fontSize: 10, fontFamily: 'IBM Plex Mono, monospace',
            color: charLeft < 50 ? t.errorColor : t.textMuted,
            pointerEvents: 'none',
          }}>
            {charLeft}
          </span>
        )}
      </div>

      <button
        onClick={handleSend}
        disabled={!canSend}
        aria-label="Send message"
        style={{
          width: 44, height: 44,
          borderRadius: 9, flexShrink: 0,
          background: canSend ? accent.c : t.surface,
          border: `1.5px solid ${canSend ? accent.c : t.border}`,
          cursor: canSend ? 'pointer' : 'not-allowed',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s',
        }}
      >
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <path
            d="M13.5 1.5L7 8M13.5 1.5L9 13.5L7 8M13.5 1.5L1.5 6L7 8"
            stroke={canSend ? t.ownText : t.textMuted}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
