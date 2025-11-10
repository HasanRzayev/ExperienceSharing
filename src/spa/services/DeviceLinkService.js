import * as signalR from '@microsoft/signalr';
import Cookies from 'js-cookie';

class DeviceLinkService {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.eventHandlers = new Map();
  }

  // Initialize SignalR connection
  async initialize() {
    try {
      const token = Cookies.get("token");
      if (!token) {
        console.warn('No token found for SignalR connection');
        return;
      }

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`${process.env.REACT_APP_API_BASE_URL}/deviceLinkHub`, {
          accessTokenFactory: () => token,
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Connection event handlers
      this.connection.onclose((error) => {
        console.log('SignalR connection closed:', error);
        this.isConnected = false;
        this.emit('connectionClosed', error);
      });

      this.connection.onreconnecting((error) => {
        console.log('SignalR reconnecting:', error);
        this.isConnected = false;
        this.emit('reconnecting', error);
      });

      this.connection.onreconnected((connectionId) => {
        console.log('SignalR reconnected:', connectionId);
        this.isConnected = true;
        this.emit('reconnected', connectionId);
      });

      // Device linking event handlers
      this.connection.on('DeviceLinkConfirmed', (data) => {
        console.log('Device link confirmed:', data);
        this.emit('deviceLinkConfirmed', data);
      });

      this.connection.on('DeviceLinkError', (error) => {
        console.error('Device link error:', error);
        this.emit('deviceLinkError', error);
      });

      this.connection.on('QRDataGenerated', (data) => {
        console.log('QR data generated:', data);
        this.emit('qrDataGenerated', data);
      });

      this.connection.on('SessionExpired', () => {
        console.log('Session expired');
        this.emit('sessionExpired');
      });

      this.connection.on('DeviceLinkStatus', (status) => {
        console.log('Device link status:', status);
        this.emit('deviceLinkStatus', status);
      });

      // Start connection
      await this.connection.start();
      this.isConnected = true;
      console.log('SignalR connected successfully');
      this.emit('connected');

    } catch (error) {
      console.error('Error initializing SignalR:', error);
      this.emit('connectionError', error);
    }
  }

  // Join a device linking session
  async joinSession(sessionId) {
    if (!this.isConnected) {
      console.warn('SignalR not connected');
      return;
    }

    try {
      await this.connection.invoke('JoinSession', sessionId);
      console.log('Joined session:', sessionId);
    } catch (error) {
      console.error('Error joining session:', error);
      throw error;
    }
  }

  // Leave a device linking session
  async leaveSession(sessionId) {
    if (!this.isConnected) {
      console.warn('SignalR not connected');
      return;
    }

    try {
      await this.connection.invoke('LeaveSession', sessionId);
      console.log('Left session:', sessionId);
    } catch (error) {
      console.error('Error leaving session:', error);
      throw error;
    }
  }

  // Confirm device link from QR scan
  async confirmDeviceLink(sessionId, userId, deviceName, deviceType) {
    if (!this.isConnected) {
      console.warn('SignalR not connected');
      return;
    }

    try {
      await this.connection.invoke('ConfirmDeviceLink', sessionId, userId, deviceName, deviceType);
      console.log('Device link confirmation sent');
    } catch (error) {
      console.error('Error confirming device link:', error);
      throw error;
    }
  }

  // Send QR code data to session
  async sendQRData(sessionId, qrData) {
    if (!this.isConnected) {
      console.warn('SignalR not connected');
      return;
    }

    try {
      await this.connection.invoke('SendQRData', sessionId, qrData);
      console.log('QR data sent to session');
    } catch (error) {
      console.error('Error sending QR data:', error);
      throw error;
    }
  }

  // Get device linking status
  async getDeviceLinkStatus(sessionId) {
    if (!this.isConnected) {
      console.warn('SignalR not connected');
      return;
    }

    try {
      await this.connection.invoke('GetDeviceLinkStatus', sessionId);
      console.log('Device link status requested');
    } catch (error) {
      console.error('Error getting device link status:', error);
      throw error;
    }
  }

  // Event handling
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }

  off(event, handler) {
    if (this.eventHandlers.has(event)) {
      const handlers = this.eventHandlers.get(event);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error('Error in event handler:', error);
        }
      });
    }
  }

  // Disconnect
  async disconnect() {
    if (this.connection) {
      await this.connection.stop();
      this.isConnected = false;
      console.log('SignalR disconnected');
    }
  }

  // Get connection state
  getConnectionState() {
    return this.connection ? this.connection.state : signalR.HubConnectionState.Disconnected;
  }
}

// Create singleton instance
const deviceLinkService = new DeviceLinkService();

export default deviceLinkService;
