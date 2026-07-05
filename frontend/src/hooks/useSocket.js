import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true
    });
  }
  return socket;
}

export function useSocket() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const s = getSocket();

    s.on('connect', () => setConnected(true));
    s.on('disconnect', () => setConnected(false));

    if (s.connected) setConnected(true);

    return () => {
      s.off('connect');
      s.off('disconnect');
    };
  }, []);

  return { socket: getSocket(), connected };
}

/**
 * Listen to a specific event
 */
export function useSocketEvent(eventName, handler) {
  useEffect(() => {
    const s = getSocket();
    s.on(eventName, handler);
    return () => s.off(eventName, handler);
  }, [eventName, handler]);
}