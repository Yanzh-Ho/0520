import type { ConnectionStatus, ThemeTokens, AccentTokens } from '../types';

interface Props {
  status: ConnectionStatus;
  t: ThemeTokens;
  accent: AccentTokens;
}

export default function StatusIndicator({ status, t, accent }: Props) {
  const map: Record<ConnectionStatus, { color: string; label: string }> = {
    connected:    { color: t.successColor, label: 'Connected'      },
    connecting:   { color: accent.c,       label: 'Connecting…'    },
    reconnecting: { color: t.warnColor,    label: 'Reconnecting…'  },
    disconnected: { color: t.errorColor,   label: 'Disconnected'   },
  };
  const s    = map[status];
  const anim = status === 'connecting' || status === 'reconnecting';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <div style={{
        width: 7, height: 7, borderRadius: '50%',
        background: s.color, flexShrink: 0,
        animation: anim ? 'pulse-dot 1.3s ease-in-out infinite' : 'none',
      }} />
      <span style={{
        fontSize: 11, fontFamily: 'IBM Plex Mono, monospace',
        color: t.textSub, letterSpacing: '0.04em',
      }}>
        {s.label}
      </span>
    </div>
  );
}
