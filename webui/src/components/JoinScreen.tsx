import { useState, useRef, useEffect, useCallback } from 'react';
import type { ThemeTokens, AccentTokens } from '../types';

interface Props {
  onJoin: (callsign: string) => void;
  t: ThemeTokens;
  accent: AccentTokens;
}

function validate(val: string): string {
  if (!val.trim()) return 'Callsign is required';
  if (!/^[a-zA-Z0-9_]{1,20}$/.test(val.trim())) return 'Letters, numbers, underscores · max 20 chars';
  return '';
}

export default function JoinScreen({ onJoin, t, accent }: Props) {
  const [val,    setVal]    = useState('');
  const [err,    setErr]    = useState('');
  const [status, setStatus] = useState<'idle' | 'connecting'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const attempt = useCallback(() => {
    const e = validate(val);
    if (e) { setErr(e); return; }
    setErr('');
    setStatus('connecting');
    setTimeout(() => { setStatus('idle'); onJoin(val.trim()); }, 800);
  }, [val, onJoin]);

  const onKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter') attempt(); };

  return (
    <div style={{
      minHeight: '100dvh', background: t.bg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px',
    }}>
      {/* Subtle grid background */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `linear-gradient(${t.borderSoft} 1px, transparent 1px), linear-gradient(90deg, ${t.borderSoft} 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
        opacity: 0.4,
      }} />

      <div style={{ width: '100%', maxWidth: 380, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ marginBottom: 52, textAlign: 'center' }}>
          <div style={{
            fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600,
            fontSize: 52, color: accent.c, letterSpacing: '-0.03em',
            lineHeight: 1, marginBottom: 14,
          }}>
            FREQ
          </div>
          <div style={{
            fontSize: 11, color: t.textSub,
            fontFamily: 'IBM Plex Mono, monospace',
            letterSpacing: '0.14em', textTransform: 'uppercase',
          }}>
            Anonymous · Real-time · No account
          </div>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label htmlFor="callsign-input" style={{
            fontSize: 10, fontFamily: 'IBM Plex Mono, monospace',
            color: t.textSub, letterSpacing: '0.12em', textTransform: 'uppercase',
          }}>
            Your callsign
          </label>

          <input
            id="callsign-input"
            ref={inputRef}
            type="text"
            value={val}
            onChange={e => { setVal(e.target.value); setErr(''); }}
            onKeyDown={onKey}
            maxLength={20}
            placeholder="e.g. Ghost42"
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="off"
            aria-label="Callsign"
            aria-describedby={err ? 'callsign-error' : undefined}
            style={{
              background: t.surface,
              border: `1.5px solid ${err ? t.errorColor : t.border}`,
              borderRadius: 7,
              padding: '14px 16px',
              fontSize: 16,
              fontFamily: 'IBM Plex Mono, monospace',
              color: t.text,
              outline: 'none',
              width: '100%',
              transition: 'border-color 0.15s',
              caretColor: accent.c,
            }}
            onFocus={e => { if (!err) e.target.style.borderColor = accent.c; }}
            onBlur={e  => { if (!err) e.target.style.borderColor = t.border; }}
          />

          {err && (
            <div id="callsign-error" role="alert" style={{
              fontSize: 11, color: t.errorColor,
              fontFamily: 'IBM Plex Mono, monospace', marginTop: -2,
            }}>
              ↑ {err}
            </div>
          )}

          <button
            onClick={attempt}
            disabled={status === 'connecting'}
            style={{
              background:    status === 'connecting' ? accent.dim : accent.c,
              border:        `1.5px solid ${status === 'connecting' ? accent.dimBorder : accent.c}`,
              borderRadius:  7,
              padding:       '13px 24px',
              fontSize:      13,
              fontFamily:    'IBM Plex Mono, monospace',
              fontWeight:    600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color:         status === 'connecting' ? accent.c : t.ownText,
              cursor:        status === 'connecting' ? 'not-allowed' : 'pointer',
              marginTop:     6,
              minHeight:     48,
              transition:    'all 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {status === 'connecting'
              ? <><span style={{ animation: 'blink 0.9s step-start infinite' }}>_</span> Connecting</>
              : 'Join Frequency'
            }
          </button>
        </div>

        <div style={{
          marginTop: 48, textAlign: 'center',
          fontSize: 11, color: t.textMuted,
          fontFamily: 'IBM Plex Mono, monospace',
          lineHeight: 1.8, letterSpacing: '0.02em',
        }}>
          Messages are ephemeral — no history, no logs.
        </div>
      </div>
    </div>
  );
}
