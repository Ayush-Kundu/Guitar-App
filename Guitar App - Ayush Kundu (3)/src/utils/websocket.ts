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
    
    return new Promise((resolve) => {
      try {
        // For demo purposes, we'll simulate a WebSocket connection
        // Note: echo.websocket.org just echoes back what you send, which may not be suitable for this use case
        // In a real implementation, you'd connect to your own WebSocket server
        this.ws = new WebSocket(this.serverUrl);
        
        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          
          // Send user identification
          this.send({
            type: 'user_online',
            data: { userId },
            timestamp: new Date().toISOString()
          });
          
          this.notifyConnectionHandlers(true);
          resolve(true);
        };

        this.ws.onmessage = (event) => {
          try {
            // Only try to parse if the data looks like JSON
            const data = event.data;
            if (typeof data === 'string' && data.trim().length > 0) {
              // Check if it's likely JSON before parsing
              const trimmed = data.trim();
              
              // More strict JSON validation
              if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || 
                  (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
                
                // Additional check for common non-JSON responses
                if (trimmed.toLowerCase().includes('request') || 
                    trimmed.toLowerCase().includes('error') ||
                    trimmed.toLowerCase().includes('<!doctype') ||
                    trimmed.toLowerCase().includes('<html')) {
                  // Ignore HTML responses or error messages
                  return;
                }
                
                try {
                  const message: WebSocketMessage = JSON.parse(data);
                  // Strict validation of message structure
                  if (message && 
                      typeof message === 'object' && 
                      typeof message.type === 'string' &&
                      message.data !== undefined && 
                      typeof message.timestamp === 'string' &&
                      ['message', 'friend_request', 'friend_accept', 'community_post', 'user_online', 'user_offline', 'chat_created'].includes(message.type)) {
                    this.notifyMessageHandlers(message);
                  }
                } catch (parseError) {
                  // Don't log anything for parse errors to avoid console spam
                  return;
                }
              }
            }
          } catch (error) {
            // Don't log anything for general errors to avoid console spam
            return;
          }
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.isConnected = false;
          this.notifyConnectionHandlers(false);
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnected = false;
          resolve(false);
        };

      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        this.isConnected = false;
        resolve(false);
      }
    });
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
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.userId) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        if (this.userId) {
          this.connect(this.userId);
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

// Singleton instance
export const websocketService = new WebSocketService();