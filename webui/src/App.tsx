import { useState } from 'react';
import type { ThemeKey, AccentKey, MsgStyle } from './types';
import { THEMES, ACCENTS } from './theme';
import JoinScreen from './components/JoinScreen';
import ChatScreen from './components/ChatScreen';

export default function App() {
  const [screen,   setScreen]   = useState<'join' | 'chat'>('join');
  const [callsign, setCallsign] = useState('');
  const [themeKey, setThemeKey] = useState<ThemeKey>('dark');
  const [accentKey, setAccentKey] = useState<AccentKey>('cyan');
  const [msgStyle, setMsgStyle] = useState<MsgStyle>('modern');

  const t      = THEMES[themeKey];
  const accent = ACCENTS[accentKey];

  return (
    <>
      <style>{`
        html, body, #root { background: ${t.bg}; height: 100%; }
        input, textarea, button { font-family: inherit; }
        input::placeholder, textarea::placeholder { color: ${t.textMuted}; }
        textarea { scrollbar-width: none; }
        textarea::-webkit-scrollbar { display: none; }
      `}</style>

      {screen === 'join' ? (
        <JoinScreen
          onJoin={cs => { setCallsign(cs); setScreen('chat'); }}
          t={t}
          accent={accent}
        />
      ) : (
        <ChatScreen
          callsign={callsign}
          t={t}
          accent={accent}
          msgStyle={msgStyle}
          themeKey={themeKey}
          accentKey={accentKey}
          onThemeChange={setThemeKey}
          onAccentChange={setAccentKey}
          onMsgStyleChange={setMsgStyle}
        />
      )}
    </>
  );
}
