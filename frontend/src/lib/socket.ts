import { io, Socket } from 'socket.io-client';
import { useAuthStore } from './store';

let socket: Socket | null = null;

export const initSocket = () => {
    if (socket) return socket;

    const url = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    socket = io(url, {
        autoConnect: false,
    });

    return socket;
};

export const getSocket = () => {
    if (!socket) {
        return initSocket();
    }
    return socket;
};

export const joinClinicRoom = (clinicId: string) => {
    const { user } = useAuthStore.getState();
    if (!socket || !user?.tenantId) return;

    socket.emit('joinClinicRoom', { tenantId: user.tenantId, clinicId });
};
