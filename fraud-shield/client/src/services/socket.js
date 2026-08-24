import { io } from 'socket.io-client';

const SOCKET_SERVER_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : 'http://localhost:5000');

let socket = null;
let currentToken = null;

/**
 * Initialize and return the authenticated Socket.IO connection
 */
export const initSocketClient = (token) => {
  const authToken = token || localStorage.getItem('fraudShieldToken') || localStorage.getItem('token');
  if (!authToken) {
    if (socket) {
      socket.disconnect();
      socket = null;
      currentToken = null;
    }
    return null;
  }

  // Reuse existing socket if connected or connecting with the same token
  if (socket && currentToken === authToken) {
    if (!socket.connected && !socket.active) {
      socket.connect();
    }
    return socket;
  }

  if (socket) {
    socket.disconnect();
  }

  currentToken = authToken;
  socket = io(SOCKET_SERVER_URL, {
    auth: {
      token: authToken
    },
    transports: ['polling', 'websocket'], // Reliable handshake with automatic websocket upgrade
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000
  });

  return socket;
};

/**
 * Get current socket instance
 */
export const getSocket = () => socket;

/**
 * Disconnect socket cleanly
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentToken = null;
  }
};
