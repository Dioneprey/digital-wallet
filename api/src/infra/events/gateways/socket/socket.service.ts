import { Injectable } from '@nestjs/common'
import { Socket } from 'socket.io'

@Injectable()
export class SocketService {
  private readonly connectedClients: Map<string, Socket> = new Map()
  private readonly joinedUsers: Map<string, Socket> = new Map()

  handleConnection(socket: Socket): void {
    const clientId = socket.id
    this.connectedClients.set(clientId, socket)

    socket.on('disconnect', () => {
      this.connectedClients.delete(clientId)

      for (const [userId, s] of this.joinedUsers.entries()) {
        if (s.id === socket.id) this.joinedUsers.delete(userId)
      }
    })
  }

  handleJoin(userId: string, socket: Socket): void {
    this.joinedUsers.set(userId, socket)
  }

  getSocketByUserId(userId: string): Socket | undefined {
    return this.joinedUsers.get(userId)
  }

  getAllJoinedSockets(): Map<string, Socket> {
    return this.joinedUsers
  }
}
