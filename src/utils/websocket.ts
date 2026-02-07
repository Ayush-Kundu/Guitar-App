export interface WebSocketMessage {
  type: 'message' | 'friend_request' | 'friend_accept' | 'community_post' | 'user_online' | 'user_offline' | 'chat_created';
  data: any;
  timestamp: string;
  userId?: string;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers: ((message: WebSocketMessage) => void)[] = [];
  private connectionHandlers: ((connected: boolean) => void)[] = [];
  private isConnected = false;
  private userId: string | null = null;

  constructor(private serverUrl: string = 'wss://echo.websocket.org') {
    // You can replace this with your actual WebSocket server URL
  }

  connect(userId: string): Promise<boolean> {
    this.userId = userId;
    
    // DISABLED: WebSocket connection to echo.websocket.org causes issues with multiple users
    // The app works fine using Supabase directly for all functionality
    // To enable real-time features, migrate to Supabase Realtime subscriptions
    console.debug('WebSocket disabled - using Supabase for all communication');
    this.isConnected = false;
    this.notifyConnectionHandlers(false);
    return Promise.resolve(false);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  send(message: WebSocketMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        const jsonString = JSON.stringify(message);
        this.ws.send(jsonString);
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
      }
    } else {
      console.debug('WebSocket not connected, message not sent');
    }
  }

  onMessage(handler: (message: WebSocketMessage) => void) {
    this.messageHandlers.push(handler);
    
    return () => {
      const index = this.messageHandlers.indexOf(handler);
      if (index > -1) {
        this.messageHandlers.splice(index, 1);
      }
    };
  }

  onConnectionChange(handler: (connected: boolean) => void) {
    this.connectionHandlers.push(handler);
    
    return () => {
      const index = this.connectionHandlers.indexOf(handler);
      if (index > -1) {
        this.connectionHandlers.splice(index, 1);
      }
    };
  }

  private notifyMessageHandlers(message: WebSocketMessage) {
    this.messageHandlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    });
  }

  private notifyConnectionHandlers(connected: boolean) {
    this.connectionHandlers.forEach(handler => {
      try {
        handler(connected);
      } catch (error) {
        console.error('Error in connection handler:', error);
      }
    });
  }

  private attemptReconnect() {
    // Disable auto-reconnect to prevent connection flooding on echo.websocket.org
    // The app works fine in offline mode using Supabase directly
    console.debug('WebSocket disconnected, continuing in offline mode');
    return;
    
    // Original reconnect logic (disabled):
    // if (this.reconnectAttempts < this.maxReconnectAttempts && this.userId) {
    //   this.reconnectAttempts++;
    //   console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    //   
    //   setTimeout(() => {
    //     if (this.userId) {
    //       this.connect(this.userId);
    //     }
    //   }, this.reconnectDelay * this.reconnectAttempts);
    // }
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

// Singleton instance
export const websocketService = new WebSocketService();