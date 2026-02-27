import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class QueueGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinClinicRoom')
  handleJoinRoom(@MessageBody() data: { tenantId: string, clinicId: string }, @ConnectedSocket() client: Socket) {
    const roomName = `tenant:${data.tenantId}:clinic:${data.clinicId}`;
    client.join(roomName);
    return { event: 'joined', room: roomName };
  }

  broadcastTokenCreated(clinicId: string, token: any) {
    // We assume the caller service can provide tenant structure if we want strict multi-tenant socket rooms
    // For simplicity, we broadcast to the clinic room directly
    const roomName = `tenant:${token.tenant_id}:clinic:${clinicId}`;
    this.server.to(roomName).emit('queue.tokenCreated', { token });
  }

  broadcastTokenCalled(clinicId: string, token: any) {
    const roomName = `tenant:${token.tenant_id}:clinic:${clinicId}`;
    this.server.to(roomName).emit('queue.tokenCalled', {
      tokenId: token.id,
      tokenNumber: token.token_number,
      doctorId: token.doctor_user_id
    });
  }

  broadcastTokenUpdated(clinicId: string, token: any) {
    const roomName = `tenant:${token.tenant_id}:clinic:${clinicId}`;
    this.server.to(roomName).emit('queue.tokenUpdated', {
      tokenId: token.id,
      status: token.status,
      timestamps: { called_at: token.called_at, served_at: token.served_at, ended_at: token.ended_at }
    });
  }
}
