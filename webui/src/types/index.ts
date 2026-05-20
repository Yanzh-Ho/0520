export interface ChatMessage {
  type: 'message';
  callsign: string;
  text: string;
  timestamp: string;
}

export interface SystemEvent {
  type: 'system';
  event: 'user_joined' | 'user_left';
  callsign: string;
  timestamp: string;
}

export type ServerMessage = ChatMessage | SystemEvent;

export type Screen = 'join' | 'chat';
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';
export type ThemeKey = 'dark' | 'light';
export type AccentKey = 'cyan' | 'amber' | 'violet';
export type MsgStyle = 'modern' | 'terminal';

export interface ThemeTokens {
  bg: string;
  bgOuter: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  borderSoft: string;
  text: string;
  textSub: string;
  textMuted: string;
  ownText: string;
  systemText: string;
  errorColor: string;
  successColor: string;
  warnColor: string;
}

export interface AccentTokens {
  c: string;
  dim: string;
  dimBorder: string;
  label: string;
}
