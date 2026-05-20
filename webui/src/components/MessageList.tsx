import { useEffect, useRef } from 'react';
import type { ServerMessage, ThemeTokens, AccentTokens, MsgStyle } from '../types';
import MessageItem from './MessageItem';

interface Props {
  messages: ServerMessage[];
  ownCallsign: string;
  t: ThemeTokens;
  accent: AccentTokens;
  msgStyle: MsgStyle;
}

export default function MessageList({ messages, ownCallsign, t, accent, msgStyle }: Props) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={listRef}
      style={{
        flex: 1, overflowY: 'auto',
        display: 'flex', flexDirection: 'column',
        gap: 2, padding: '14px 0 8px',
      }}
    >
      {messages.map((msg, i) => (
        <MessageItem
          key={i}
          msg={msg}
          ownCallsign={ownCallsign}
          t={t}
          accent={accent}
          msgStyle={msgStyle}
        />
      ))}
    </div>
  );
}
