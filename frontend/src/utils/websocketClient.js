// Real-time WebSocket Telemetry Stream Client

class DisasterWebSocketClient {
  constructor() {
    this.socket = null;
    this.listeners = [];
  }

  connect() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) return;

    try {
      const wsUrl = `ws://${window.location.hostname}:8000/ws/telemetry`;
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log("🟢 [WEBSOCKET TELEMETRY] Real-time stream connected.");
      };

      this.socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          this.listeners.forEach(fn => fn(payload));
        } catch (e) {
          console.error(e);
        }
      };

      this.socket.onclose = () => {
        console.log("🔴 [WEBSOCKET TELEMETRY] Disconnected. Reconnecting in 3s...");
        setTimeout(() => this.connect(), 3000);
      };
    } catch (err) {
      console.error("⚠️ WebSocket Connection Error:", err);
    }
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(fn => fn !== callback);
    };
  }
}

export const telemetryWebSocket = new DisasterWebSocketClient();
