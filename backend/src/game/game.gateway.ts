import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  ConnectedSocket,
} from '@nestjs/websockets';
import {
  Body,
  CACHE_MANAGER,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { gameInfo, Gaming } from '../Canvas';
import { LobbyManager } from '../lobby/lobby';
import {
  JwtAuthenticationGuard,
  LocalAuthGuard,
} from '../authentication/authentication.guard';
import { AuthenticationService } from '../authentication/authentication.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { JwtStrategy } from '../authentication/jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { DISCONNECT_EVENT } from '@nestjs/websockets/constants';
import * as jwt from 'jsonwebtoken';
import { createNoSubstitutionTemplateLiteral } from 'typescript';

@WebSocketGateway(3002, { cors: { origin: true, credentials: true } })
export class GameGateway {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthenticationService,
    private readonly userService: UsersService,
    private readonly jwtStrategy: JwtStrategy,
    PlayerConnected: any,
  ) {}
  LobbyManager = new LobbyManager(this.userService);
  Moving = false;
  private ListOfPlayers: Map<string, Socket> = new Map<string, Socket>();

  afterInit(server: Server) {
    console.log('Game server initialized');
    this.LobbyManager.Room = server;
  }
  getListOfPlayers() {
    return this.ListOfPlayers;
  }

  @UseGuards(JwtAuthenticationGuard)
  async handleConnection(client: Socket) {
    if (!client || client === undefined) {
      console.log('No client provided');
    }
    if (
      client.handshake.headers.authorization === undefined ||
      !client.handshake.headers.authorization
    ) {
      console.log('No token provided');
      return;
    }
    const token = client.handshake.headers.authorization.split(' ')[1];
    const secret = this.configService.get('JWT_SECRET');
    try {
      console.log('tokne ' + token);
      const info = jwt.verify(token, Buffer.from(secret, 'base64'));
      if (this.ListOfPlayers.get(Object.values(info)[0])) {
        this.ListOfPlayers.get(Object.values(info)[0])?.emit(
          'AlreadyConnected',
        );
        this.ListOfPlayers.get(Object.values(info)[0])?.disconnect();
        this.ListOfPlayers.delete(Object.values(info)[0]);
      }
      client.data.username = Object.values(info)[0];
      console.log(`${client.data.username} connected`);
      this.ListOfPlayers.set(client.data.username, client);
      this.userService.updateStatus(client.data.username, 'online');
      console.log('Token provided');
    } catch (err) {
      console.log(err);
      return;
    }
  }
  @SubscribeMessage('PlayerReady')
  handlePlayerReady(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): any {
    if (
      this.LobbyManager.isInLobby(client.data.username) &&
      this.LobbyManager.getUserLobby(client.data.username).Ready.length === 1 &&
      this.LobbyManager.getUserLobby(client.data.username).Ready[0] ===
        client.data.username
    )
      throw new Error('You are already ready');
    console.log(`${client.data.username} is ready to play`);
    if (this.LobbyManager.isInLobby(client.data.username))
      this.LobbyManager.getUserLobby(client.data.username).Ready.push(
        client.data.username,
      );
    if (
      this.LobbyManager.getUserLobby(client.data.username).Ready.length === 2
    ) {
      this.LobbyManager.getUserLobby(
        client.data.username,
      ).Instance.Info.Connected.push(
        this.LobbyManager.getUserLobby(client.data.username).Ready[0],
      );
      this.LobbyManager.getUserLobby(
        client.data.username,
      ).Instance.Info.Connected.push(
        this.LobbyManager.getUserLobby(client.data.username).Ready[1],
      );
      this.LobbyManager.getUserLobby(
        client.data.username,
      ).Instance.Info.Player1.name = this.LobbyManager.getUserLobby(
        client.data.username,
      ).Players[0];
      this.LobbyManager.getUserLobby(
        client.data.username,
      ).Instance.Info.Player2.name = this.LobbyManager.getUserLobby(
        client.data.username,
      ).Players[1];
      this.LobbyManager.getUserLobby(client.data.username).Instance.rendering(
        client,
      );
    }
  }
  @SubscribeMessage('CreateLobby')
  handleCreateLobby(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): any {
    console.log('Attempting to create a lobby');
    this.LobbyManager.createLobby('Classic');
    console.log(this.LobbyManager.LobbyList.length);
    return 'You have create a Classic lobby';
  }

  @SubscribeMessage('CreateRainbowLobby')
  handleCreateRainbowLobby(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): any {
    console.log('Attempting to create A Rainbow lobby');
    this.LobbyManager.createLobby('Rainbow');
    console.log(this.LobbyManager.LobbyList.length);
    return 'You have create a Rainbow lobby';
  }
  @SubscribeMessage('JoinLobby')
  handleJoinLobby(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): any {
    console.log(`Player ${client.data.username} is joining a lobby`);
    this.LobbyManager.JoinLobby(client.data.username, client, 0);
    return 'Lobby joined';
  }

  @SubscribeMessage('Ping')
  handlePing(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): any {
    console.log('Ping received');
    if (
      this.LobbyManager.isInLobby(client.data.username) ||
      this.LobbyManager.isSpectating(client.data.username)
    )
      return true;
    return false;
  }
  @SubscribeMessage('GameInvite')
  handleGameInvite(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): any {
    console.log('Attempting to invite ' + data);
    const user = this.ListOfPlayers.get(data);
    if (user === undefined || user === null) {
      client.emit('NoUser', "The user you're trying to invite isn't online");
      return;
    }
    let lobby_id = this.LobbyManager.createLobby('Classic').id;
    this.LobbyManager.JoinLobby(client.data.username, client, lobby_id);

    if (this.ListOfPlayers.get(data) !== undefined) {
      console.log('You are trying to invite ' + data);
      this.userService.getByLogin(client.data.username).then((user) => {
        this.ListOfPlayers.get(data)?.emit('InviteToGame', user.pseudo);
      });
    }
  }

  @SubscribeMessage('RefuseInvite')
  async handleRefuseInvite(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ) {
    const me = await this.userService.getByLogin(client.data.username);

    console.log('You have refused the invite from ' + data);
    this.userService.getByPseudo(data).then((user) => {
      if (user) {
        this.ListOfPlayers.get(user.login)?.emit('RefuseToGame', me.pseudo);
        let tLobby = this.LobbyManager.FindPlayerWaitingInLobby(data, 0);
        if (tLobby) this.LobbyManager.DeleteLobby(tLobby.Lobby_ID);
      }
    });
  }
  @SubscribeMessage('AcceptInvite')
  async handleAcceptInvite(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ) {
    console.log('You have accepted the invite to play by ' + data);
    const user = await this.userService.getByPseudo(data);
    let lobby = this.LobbyManager.FindPlayerWaitingInLobby(user.login, 0);
    if (lobby) {
      this.LobbyManager.JoinLobby(client.data.username, client, lobby.id);
    }
  }

  @SubscribeMessage('LeaveLobby')
  handleLeaveLobby(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): any {
    this.LobbyManager.LeaveLobby(client.data.username);
  }

  async handleDisconnect(client: Socket) {
    if (!client || client === undefined) return;
    if (this.LobbyManager.isSpectating(client.data.username))
      this.LobbyManager.LeaveSpectating(client.data.username);
    if (this.LobbyManager.isInLobby(client.data.username)) {
      this.LobbyManager.Disconnecting(client.data.username, client);
    }
    this.userService.updateStatus(client.data.username, 'offline');
    client.emit('RemovePlayer', client.data.username);
    console.log(
      `${client.data.username} has been disconnected :  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! + reason`,
    );
  }

  @SubscribeMessage('EndGame')
  handleEndGame(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): any {
    if (!client || client === undefined) return;
    console.log(`${client.data.username} has ended the game`);
    this.LobbyManager.EndGame(client.data.username);
  }

  @SubscribeMessage('LobbyInfo')
  handleLobbyInfo(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): any {
    if (!client || client === undefined) return;
    console.log(client.handshake.headers.authorization);
    console.log(`${client.data.username}' - asking for lobby info`);
    this.LobbyManager.printLobby();
  }

  @SubscribeMessage('isWaiting')
  handlePlayerInfo(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): any {
    if (!client || client === undefined) return;
    if (this.LobbyManager.isWaiting(client.data.username))
      this.LobbyManager.LeaveWaitingRoom(client.data.username, client);
  }

  @SubscribeMessage('Spec')
  handleSpec(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): any {
    if (!client || client === undefined) return;
    console.log(`${client.data.username} is trying to spectating ` + data);
    if (this.ListOfPlayers.get(data) === undefined) {
      client.emit(
        'NoUserSpec',
        "The user you're trying to spectate isn't online",
      );
      return;
    }
    if (!this.LobbyManager.isInLobby(data)) {
      client.emit(
        'NoUserSpec',
        "The user you're trying to spectate isn't in a lobby",
      );
      return;
    }
    console.log(`${client.data.username} is spectating ` + data);
    this.LobbyManager.SpectatorJoin(client.data.username, data, client);
    client.emit('SpectateReady');
  }

  @SubscribeMessage('isPlaying')
  handlePlayerPlaying(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): any {
    try {
      if (!client || client === undefined) return;
      let tLobby = this.LobbyManager.getUserLobby(client.data.username);
      if (!tLobby) client.emit('isPlaying', false);
      else if (
        tLobby.Instance.Info.Player1.name === client.data.username ||
        tLobby.Instance.Info.Player2.name === client.data.username
      )
        client.emit('isPlaying', true);
    } catch (e) {
      client.emit('isPlaying', false);
    }
    return false;
  }

  @SubscribeMessage('PaddleUp')
  async handlePaddleUp(client: Socket, state: boolean) {
    if (
      !this.LobbyManager.getUserLobby(
        client.data.username,
      )?.Instance.Info.CheckMove(client.data.username)
    )
      return;
    if (
      this.LobbyManager.getUserLobby(
        client.data.username,
      )?.Instance.Info.CheckMove(client.data.username)?.moveUp !== undefined
    )
      this.LobbyManager.getUserLobby(
        client.data.username,
      )?.Instance.Info.setMove(client.data.username, 'UP', state);
  }

  @SubscribeMessage('PaddleDown')
  async handlePaddleDown(client: Socket, state: boolean) {
    if (
      !this.LobbyManager.getUserLobby(
        client.data.username,
      )?.Instance.Info.CheckMove(client.data.username)
    )
      return;
    if (
      this.LobbyManager.getUserLobby(
        client.data.username,
      )?.Instance.Info.CheckMove(client.data.username)?.moveUp !== undefined
    )
      this.LobbyManager.getUserLobby(
        client.data.username,
      )?.Instance.Info.setMove(client.data.username, 'DOWN', state);
  }
}
