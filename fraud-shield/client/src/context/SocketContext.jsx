import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { initSocketClient, disconnectSocket } from '../services/socket';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token, user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('DISCONNECTED'); // 'LIVE' | 'DISCONNECTED' | 'RECONNECTING'
  const [liveEvents, setLiveEvents] = useState([]);
  const [activeAlert, setActiveAlert] = useState(null);
  const seenEventIds = useRef(new Set());

  // Trigger gentle audio chime on high risk if web audio is permitted
  const playAlertSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
      // Audio context might be restricted by browser policy before first interaction
    }
  };

  const handleIncomingEvent = (event) => {
    if (!event || !event.eventId) return;

    // Duplicate event protection
    if (seenEventIds.current.has(event.eventId)) {
      return;
    }
    seenEventIds.current.add(event.eventId);

    // Keep seenEventIds set under 500 items
    if (seenEventIds.current.size > 500) {
      const firstItem = seenEventIds.current.values().next().value;
      seenEventIds.current.delete(firstItem);
    }

    setLiveEvents((prev) => [event, ...prev.slice(0, 99)]);

    // Trigger visual and audio notification for HIGH risk events
    if (event.riskLevel === 'HIGH' || event.eventType === 'HIGH_RISK_TRANSACTION' || event.eventType === 'VOICE_RISK_DETECTED') {
      setActiveAlert(event);
      playAlertSound();
    }
  };

  useEffect(() => {
    if (!token) {
      disconnectSocket();
      setSocket(null);
      setConnectionStatus('DISCONNECTED');
      return;
    }

    const s = initSocketClient(token);
    if (!s) {
      setSocket(null);
      setConnectionStatus('DISCONNECTED');
      return;
    }

    setSocket(s);

    s.on('connect', () => {
      setConnectionStatus('LIVE');
    });

    s.on('disconnect', (reason) => {
      setConnectionStatus(reason === 'io client disconnect' ? 'DISCONNECTED' : 'RECONNECTING');
    });

    s.on('connect_error', () => {
      setConnectionStatus('RECONNECTING');
    });

    s.io?.on('reconnect', () => {
      setConnectionStatus('LIVE');
    });

    // Register all socket event listeners
    const eventTypes = [
      'HIGH_RISK_TRANSACTION',
      'FRAUD_RISK_UPDATED',
      'VOICE_RISK_DETECTED',
      'DEVICE_CHANGE_DETECTED',
      'SECURITY_ALERT',
      'TRANSACTION_STATUS_CHANGED',
      'FRAUD_CASE_CREATED',
      'FRAUD_CASE_UPDATED'
    ];

    eventTypes.forEach((evtName) => {
      s.on(evtName, (payload) => {
        handleIncomingEvent({
          ...payload,
          eventType: payload.eventType || evtName
        });
      });
    });

    return () => {
      eventTypes.forEach((evtName) => s.off(evtName));
      s.off('connect');
      s.off('disconnect');
      s.off('connect_error');
    };
  }, [token]);

  const clearAlert = () => setActiveAlert(null);

  return (
    <SocketContext.Provider value={{
      socket,
      connectionStatus,
      liveEvents,
      activeAlert,
      clearAlert,
      setLiveEvents
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    return { isConnected: false, connectionStatus: 'DISCONNECTED', socket: null, liveEvents: [] };
  }
  return {
    ...context,
    isConnected: context.connectionStatus === 'LIVE'
  };
};

export default SocketContext;

