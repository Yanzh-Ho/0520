import { useState, useEffect, useRef, useCallback } from 'react';
import type { ServerMessage, ConnectionStatus } from '../types';
import { WS_ENDPOINT } from '../config';

const MAX_RETRIES = 5;
const BASE_DELAY  = 2000;
const MAX_DELAY   = 30000;

export interface UseWebSocketResult {
  status: ConnectionStatus;
  messages: ServerMessage[];
  send: (text: string) => void;
  reconnect: () => void;
  showManualReconnect: boolean;
}

export function useWebSocket(callsign: string): UseWebSocketResult {
  const [status,             setStatus]             = useState<ConnectionStatus>('connecting');
  const [messages,           setMessages]           = useState<ServerMessage[]>([]);
  const [showManualReconnect, setShowManualReconnect] = useState(false);

  const wsRef          = useRef<WebSocket | null>(null);
  const retriesRef     = useRef(0);
  const timerRef       = useRef<ReturnType<typeof setTimeout> | null>(null);
  const aliveRef       = useRef(true);
  const doConnectRef   = useRef<(() => void) | null>(null);

  const send = useCallback((text: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'sendMessage', text }));
    }
  }, []);

  const reconnect = useCallback(() => {
    retriesRef.current = 0;
    setShowManualReconnect(false);
    doConnectRef.current?.();
  }, []);

  useEffect(() => {
    aliveRef.current = true;
    retriesRef.current = 0;

    const clearTimer = () => {
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    };

    const doConnect = () => {
      if (!aliveRef.current) return;
      clearTimer();

      const url = `${WS_ENDPOINT}?callsign=${encodeURIComponent(callsign)}`;
      const ws  = new WebSocket(url);
      wsRef.current = ws;
      setStatus('connecting');

      ws.onopen = () => {
        if (!aliveRef.current) { ws.close(); return; }
        retriesRef.current = 0;
        setShowManualReconnect(false);
        setStatus('connected');
      };

      ws.onmessage = (ev: MessageEvent) => {
        if (!aliveRef.current) return;
        try {
          const data = JSON.parse(ev.data as string) as ServerMessage;
          setMessages(prev => [...prev, data]);
        } catch { /* ignore malformed */ }
      };

      ws.onclose = () => {
        if (!aliveRef.current) return;

        if (retriesRef.current >= MAX_RETRIES) {
          setStatus('disconnected');
          setShowManualReconnect(true);
          return;
        }

        const delay = Math.min(BASE_DELAY * Math.pow(2, retriesRef.current), MAX_DELAY);
        retriesRef.current++;
        setStatus('reconnecting');
        timerRef.current = setTimeout(doConnect, delay);
      };

      ws.onerror = () => { /* onclose fires afterward */ };
    };

    doConnectRef.current = doConnect;
    doConnect();

    return () => {
      aliveRef.current    = false;
      doConnectRef.current = null;
      clearTimer();
      wsRef.current?.close();
    };
  }, [callsign]);

  return { status, messages, send, reconnect, showManualReconnect };
}
