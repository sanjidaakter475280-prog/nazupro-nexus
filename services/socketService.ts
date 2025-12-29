import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

class SocketService {
    public socket: Socket;

    constructor() {
        this.socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            autoConnect: true,
        });

        this.socket.on('connect', () => {
            console.log('✅ [SOCKET] Connected to backend');
        });

        this.socket.on('disconnect', () => {
            console.log('❌ [SOCKET] Disconnected from backend');
        });
    }

    public onSignal(callback: (signal: any) => void) {
        this.socket.on('new_signal', callback);
    }

    public onPayoutUpdate(callback: (data: any) => void) {
        this.socket.on('payout_update', callback);
    }

    public onBotStatusUpdate(callback: (data: any) => void) {
        this.socket.on('bot_status_update', callback);
    }

    // 🔧 NEW: Bot initialization event (like Telegram success message)
    public onBotInitialized(callback: (data: any) => void) {
        this.socket.on('bot_initialized', callback);
    }

    // 🔧 NEW: Command response handler
    public onCommandResponse(callback: (data: any) => void) {
        this.socket.on('command_response', callback);
    }

    // 🔧 NEW: Trading status updates
    public onTradingStarted(callback: (data: any) => void) {
        this.socket.on('trading_started', callback);
    }

    // 🔧 NEW: Error events from bot
    public onError(callback: (data: any) => void) {
        this.socket.on('error', callback);
    }

    // 🔧 NEW: Status update events
    public onStatusUpdate(callback: (data: any) => void) {
        this.socket.on('status_update', callback);
    }

    // 🔧 NEW: Pair selection events
    public onPairSelected(callback: (data: any) => void) {
        this.socket.on('pair_selected', callback);
    }

    public off(event: string) {
        this.socket.off(event);
    }
}

export const socketService = new SocketService();
