import type { ServerMessage, ThemeTokens, AccentTokens, MsgStyle } from '../types';

interface Props {
  msg: ServerMessage;
  ownCallsign: string;
  t: ThemeTokens;
  accent: AccentTokens;
  msgStyle: MsgStyle;
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

export default function MessageItem({ msg, ownCallsign, t, accent, msgStyle }: Props) {
  if (msg.type === 'system') {
    const verb = msg.event === 'user_joined' ? 'joined' : 'left';
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 20px' }}>
        <div style={{ flex: 1, height: 1, background: t.borderSoft }} />
        <span style={{
          fontSize: 11, fontFamily: 'IBM Plex Mono, monospace',
          color: t.systemText, letterSpacing: '0.05em',
          whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          {msg.callsign} {verb} · {fmtTime(msg.timestamp)}
        </span>
        <div style={{ flex: 1, height: 1, background: t.borderSoft }} />
      </div>
    );
  }

  const isOwn       = msg.callsign === ownCallsign;
  const bubbleRadius = msgStyle === 'modern'
    ? (isOwn ? '16px 16px 3px 16px' : '16px 16px 16px 3px')
    : '4px';

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: isOwn ? 'flex-end' : 'flex-start',
      padding: '3px 16px',
      animation: 'fade-up 0.2s ease-out both',
    }}>
      {!isOwn && msgStyle === 'modern' && (
        <span style={{
          fontSize: 11, fontFamily: 'IBM Plex Mono, monospace',
          color: accent.c, marginBottom: 4, marginLeft: 4, letterSpacing: '0.04em',
        }}>
          {msg.callsign}
        </span>
      )}

      <div style={{
        display: 'flex',
        flexDirection: isOwn ? 'row-reverse' : 'row',
        alignItems: 'flex-end', gap: 6,
        maxWidth: 'min(72%, 480px)',
      }}>
        {msgStyle === 'terminal' && (
          <span style={{
            fontSize: 12, fontFamily: 'IBM Plex Mono, monospace',
            color: isOwn ? accent.c : t.textMuted,
            flexShrink: 0, marginBottom: 2,
          }}>
            {isOwn ? '>' : msg.callsign}
          </span>
        )}

        <div style={{
          background:    isOwn ? accent.c : t.surface,
          color:         isOwn ? t.ownText : t.text,
          padding:       msgStyle === 'modern' ? '9px 13px' : '6px 10px',
          borderRadius:  bubbleRadius,
          fontSize:      14,
          lineHeight:    1.55,
          fontFamily:    msgStyle === 'terminal' ? 'IBM Plex Mono, monospace' : 'IBM Plex Sans, sans-serif',
          border:        msgStyle === 'terminal' ? `1px solid ${isOwn ? accent.dimBorder : t.border}` : 'none',
          wordBreak:     'break-word',
        }}>
          {msg.text}
        </div>

        <span style={{
          fontSize: 10, color: t.textMuted,
          flexShrink: 0, marginBottom: 3,
          fontFamily: 'IBM Plex Mono, monospace',
        }}>
          {fmtTime(msg.timestamp)}
        </span>
      </div>
    </div>
  );
}
