import { useState, useCallback } from 'react';
import type { ThemeTokens, AccentTokens, MsgStyle, ThemeKey, AccentKey } from '../types';
import { ACCENTS } from '../theme';
import { useWebSocket } from '../hooks/useWebSocket';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import StatusIndicator from './StatusIndicator';

interface Props {
  callsign: string;
  t: ThemeTokens;
  accent: AccentTokens;
  msgStyle: MsgStyle;
  themeKey: ThemeKey;
  accentKey: AccentKey;
  onThemeChange: (k: ThemeKey) => void;
  onAccentChange: (k: AccentKey) => void;
  onMsgStyleChange: (k: MsgStyle) => void;
}

export default function ChatScreen({
  callsign, t, accent, msgStyle, themeKey, accentKey,
  onThemeChange, onAccentChange, onMsgStyleChange,
}: Props) {
  const { status, messages, send, reconnect, showManualReconnect } = useWebSocket(callsign);
  const [inputText,    setInputText]    = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text || status !== 'connected') return;
    send(text);
    setInputText('');
  }, [inputText, status, send]);

  const showBanner = status === 'disconnected' || status === 'reconnecting';

  return (
    <div style={{ height: '100dvh', background: t.bg, display: 'flex', flexDirection: 'column' }}>
      {/* Desktop centering wrapper */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        maxWidth: 800, width: '100%', margin: '0 auto',
        borderLeft:  `1px solid ${t.borderSoft}`,
        borderRight: `1px solid ${t.borderSoft}`,
        background: t.bg, overflow: 'hidden',
      }}>

        {/* ── Header ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', height: 52,
          borderBottom: `1px solid ${t.border}`,
          flexShrink: 0, background: t.bg,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600,
              fontSize: 17, color: accent.c, letterSpacing: '-0.01em',
            }}>
              FREQ
            </span>
            <div style={{ width: 1, height: 14, background: t.border }} />
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: t.textSub }}>
              {callsign}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <StatusIndicator status={status} t={t} accent={accent} />
            <button
              onClick={() => setShowSettings(s => !s)}
              aria-label="Settings"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: showSettings ? accent.c : t.textSub,
                padding: '4px', display: 'flex', alignItems: 'center',
                transition: 'color 0.15s',
              }}
            >
              {/* Gear icon */}
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <circle cx="7.5" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.3" />
                <path d="M7.5 1v1.5M7.5 12.5V14M1 7.5h1.5M12.5 7.5H14M2.93 2.93l1.06 1.06M11.01 11.01l1.06 1.06M11.07 2.93l-1.06 1.06M3.99 11.01l-1.06 1.06" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Reconnect banner ── */}
        {showBanner && !showManualReconnect && (
          <div role="status" aria-live="polite" style={{
            background:    status === 'disconnected' ? t.errorColor + '22' : t.warnColor + '22',
            borderBottom:  `1px solid ${status === 'disconnected' ? t.errorColor + '44' : t.warnColor + '44'}`,
            padding:       '8px 16px',
            fontSize:      11, fontFamily: 'IBM Plex Mono, monospace',
            color:         status === 'disconnected' ? t.errorColor : t.warnColor,
            letterSpacing: '0.05em',
          }}>
            {status === 'disconnected'
              ? '⚠ Connection lost — attempting to reconnect…'
              : '↺ Reconnecting…'}
          </div>
        )}

        {/* ── Manual reconnect ── */}
        {showManualReconnect && (
          <div role="alert" style={{
            background:   t.errorColor + '18',
            borderBottom: `1px solid ${t.errorColor}44`,
            padding:      '10px 16px',
            display:      'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          }}>
            <span style={{ fontSize: 11, fontFamily: 'IBM Plex Mono, monospace', color: t.errorColor, letterSpacing: '0.05em' }}>
              Connection lost after multiple attempts.
            </span>
            <button
              onClick={reconnect}
              style={{
                background:    t.errorColor,
                border:        'none', borderRadius: 5,
                padding:       '5px 12px',
                fontSize:      11, fontFamily: 'IBM Plex Mono, monospace',
                color:         t.ownText, cursor: 'pointer', flexShrink: 0,
              }}
            >
              Reconnect
            </button>
          </div>
        )}

        {/* ── Settings panel ── */}
        {showSettings && (
          <SettingsPanel
            themeKey={themeKey} accentKey={accentKey} msgStyle={msgStyle}
            onThemeChange={onThemeChange}
            onAccentChange={onAccentChange}
            onMsgStyleChange={onMsgStyleChange}
            t={t} accent={accent}
          />
        )}

        {/* ── Message list ── */}
        <MessageList
          messages={messages}
          ownCallsign={callsign}
          t={t} accent={accent} msgStyle={msgStyle}
        />

        {/* ── Input bar ── */}
        <MessageInput
          value={inputText}
          onChange={setInputText}
          onSend={handleSend}
          status={status}
          t={t} accent={accent}
        />

      </div>
    </div>
  );
}

/* ── Settings panel (inline) ── */
interface SettingsPanelProps {
  themeKey: ThemeKey;
  accentKey: AccentKey;
  msgStyle: MsgStyle;
  onThemeChange: (k: ThemeKey) => void;
  onAccentChange: (k: AccentKey) => void;
  onMsgStyleChange: (k: MsgStyle) => void;
  t: ThemeTokens;
  accent: AccentTokens;
}

function SettingsPanel({
  themeKey, accentKey, msgStyle,
  onThemeChange, onAccentChange, onMsgStyleChange,
  t, accent,
}: SettingsPanelProps) {
  const seg = (active: boolean) => ({
    background:    active ? accent.c : t.surface,
    border:        `1px solid ${active ? accent.c : t.border}`,
    borderRadius:  5,
    padding:       '4px 10px',
    fontSize:      11,
    fontFamily:    'IBM Plex Mono, monospace',
    color:         active ? t.ownText : t.textSub,
    cursor:        'pointer',
    transition:    'all 0.12s',
  });

  const label = {
    fontSize: 10, fontFamily: 'IBM Plex Mono, monospace',
    color: t.textMuted, letterSpacing: '0.1em', textTransform: 'uppercase' as const,
  };

  return (
    <div style={{
      borderBottom: `1px solid ${t.border}`,
      padding:      '10px 16px',
      background:   t.surfaceAlt,
      display:      'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={label}>Theme</span>
        <button style={seg(themeKey === 'dark')}  onClick={() => onThemeChange('dark')}>Dark</button>
        <button style={seg(themeKey === 'light')} onClick={() => onThemeChange('light')}>Light</button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={label}>Accent</span>
        {(Object.keys(ACCENTS) as AccentKey[]).map(k => (
          <div
            key={k}
            onClick={() => onAccentChange(k)}
            title={ACCENTS[k].label}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onAccentChange(k); }}
            aria-label={`Accent ${ACCENTS[k].label}`}
            style={{
              width: 18, height: 18, borderRadius: '50%',
              background: ACCENTS[k].c, cursor: 'pointer',
              outline:       accentKey === k ? `2px solid ${ACCENTS[k].c}` : '2px solid transparent',
              outlineOffset: 2,
            }}
          />
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={label}>Style</span>
        <button style={seg(msgStyle === 'modern')}   onClick={() => onMsgStyleChange('modern')}>Modern</button>
        <button style={seg(msgStyle === 'terminal')} onClick={() => onMsgStyleChange('terminal')}>Terminal</button>
      </div>
    </div>
  );
}
