import io from 'socket.io-client';
import { Gaming } from '../Canvas';
import { Server, Socket } from 'socket.io';
import { MatchResultDto, UserIdDto, MatchHistoryDto } from '../users/users.dto';
import { ConsoleLogger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '../users/users.service';
import { User } from 'src/users/users.entity';
import { isThisTypeNode } from 'typescript';
import { number } from 'joi';



class Lobby {

  id: number;
  Lobby_ID: string = uuidv4();
  Waiting: string[];
  Players: string[];
  Instance: Gaming;
  Ready: string[];
  Spectators: string[];
  Rainbow: boolean;
  socketing: Map<string, Socket> = new Map<string, Socket>();

  constructor(id: string) {
    this.Waiting = [];
    this.Instance = new Gaming(1920, 1080);
    this.Instance.intID = id;
    this.id;
    this.Players = [];
    this.Ready = [];
    this.Spectators = [];
    this.Rainbow = false;
  }
}

export class LobbyManager {
  LobbyList: Lobby[];
  Room: Server;


  constructor(private readonly userService: UsersService) {
    this.LobbyList = [];

  }
  createLobby(Mode: 'Rainbow' | 'Classic'): Lobby {
    const lobby = new Lobby(this.LobbyList.length.toString());
    this.LobbyList.push(lobby);
    if (Mode === 'Rainbow') lobby.Rainbow = true;
    lobby.Instance.getInfo().Balling.custom = lobby.Rainbow;
    lobby.id = Math.random() * 1000;

    return lobby;
  }

  getLobby(id: number) {
    let index = 0;
    let tLobby;
    if (this.LobbyList.length === 0) throw new Error('No lobby available');
    tLobby = this.LobbyList.at(index);
    while (tLobby)
    {
      if (tLobby && tLobby.id === id) 
        return tLobby;
      index++;
      tLobby = this.LobbyList.at(index);
    }
  }

  JoinLobby(login: string, client: Socket, id: number) {
    let index = 0;
    console.log(`${login} is trying to join a lobby`);
    if (this.isInLobby(login))
    { 
      client.emit('Berror', 'You are already in a lobby');
      throw new Error('Player already in lobby');
    }
    if (this.LobbyList.length === 0){
      client.emit('Berror', 'No Lobby available');
      throw new Error('No lobby available');
    }
    let tLobby = this.LobbyList.at(index);
    if (tLobby) {
      if (tLobby && tLobby.Waiting.length < 2) {
        if (tLobby.Waiting.push(login)) {
          tLobby.socketing.set(login, client);
          client.join(tLobby.id.toString());
          tLobby.Instance.id = tLobby.id.toString();
          tLobby.Instance.setRoom(this.Room);

          console.log(`${client.data.username}  joined lobby ` + tLobby.id.toString());
          if (tLobby.Waiting.length === 2) {
            console.log('Starting game in lobby ' + tLobby.id.toString());
            tLobby.Instance.setRoom(this.Room);
            tLobby.socketing.get(tLobby.Waiting[0])?.emit('Ready');
            tLobby.socketing.get(tLobby.Waiting[1])?.emit('Ready');
            tLobby.Players.push(tLobby.Waiting[0]);
            tLobby.Players.push(tLobby.Waiting[1]);
            tLobby.Waiting.splice(0, 2);
            tLobby.Instance.Info.Player1.name = tLobby.Players[0];
            tLobby.Instance.Info.Player2.name = tLobby.Players[1];
            return;
          }
          client.emit('Waiting Room');
          return tLobby;
        }
      }
    }
    throw new Error('Lobby not found or full');
  }
  FindPlayerWaitingInLobby(login: string, id: number) {
    let index = 0;
    let tLobby = this.LobbyList.at(index);
    while (tLobby) {
      if (tLobby.Waiting.indexOf(login) > -1) return tLobby;
      id++;
      tLobby = this.LobbyList.at(id);
    }
    return null;
  }
  CreateMatchResult(History: MatchHistoryDto) {
    const matchHistory = new MatchHistoryDto();
    matchHistory.Winner = History.Winner;
    matchHistory.Loser = History.Loser;
    matchHistory.scoreX = History.scoreX;
    matchHistory.scoreY = History.scoreY;
    matchHistory.date = History.date;
    return matchHistory;
  }

  LeaveWaitingRoom(login: string, client: Socket) {
    let id = 0;
    let tLobby = this.LobbyList.at(id);
    while (tLobby) {
      const index = tLobby.Waiting.indexOf(login);
      if (index > -1) {
        tLobby.Waiting.splice(index, 1);
        tLobby.socketing.delete(login);
        client.leave(tLobby.id.toString());
        console.log('Player left lobby ' + tLobby.id.toString());
        tLobby.Instance.Info.Connected.splice(0, 2);
        return;
      }
      id++;
      tLobby = this.LobbyList.at(id);
    }
    throw new Error('Player not found in lobby');
  }


  Findlobby(id: number) {
    let index = 0;
    let tLobby = this.LobbyList.at(index);
    while (tLobby) {
      let id = tLobby.id;
      if (id === tLobby.id) return tLobby.Lobby_ID;
      index++;
      tLobby = this.LobbyList.at(index);
    }
    return;
  }


  DeleteLobby(lobby_ID: string) {
    let index = 0;
    let tLobby = this.LobbyList.at(index);
    while (tLobby) {
      if (tLobby.Lobby_ID === lobby_ID) {
        this.LobbyList.splice(index, 1);
        return;
      }
      index++;
      tLobby = this.LobbyList.at(index);
    }
    return;
  }
  Disconnecting(login: string, client: Socket) {
    let id = 0;
    let you: string, opponent: string, scoreX: number, scoreY: number, date: Date;
    let tLobby = this.LobbyList.at(id);
    while (tLobby) {
      const index = tLobby.Players.indexOf(login);
      if (index > -1) {
        console.log(tLobby);
        if (index === 0) {
          opponent = tLobby.Instance.getInfo().Player2.name;
          scoreX = tLobby.Instance.getInfo().Player2.score;
          scoreY = tLobby.Instance.getInfo().Player1.score;
          you = tLobby.Instance.getInfo().Player1.name;
          let MatchResult = this.CreateMatchResult({ Winner: opponent, Loser: you, scoreX, scoreY, date: new Date() })

          if (tLobby != undefined && (scoreX != 0 || scoreY != 0)) {
            this.userService.getByLogin(tLobby.Instance.getInfo().Player1.name).then((user) => {
              if (opponent != undefined && scoreX != undefined && scoreY != undefined) {
                this.userService.addToMatchHistory(you, MatchResult);
                this.userService.addToMatchHistory(opponent, MatchResult);
              }
            });
          }
          tLobby.socketing.get(tLobby.Players[index])?.emit('Disconnected');
          tLobby.socketing.delete(login);
          tLobby.Players.splice(index, 1);
          tLobby.socketing.get(tLobby.Players[0])?.emit(
            'GameWon', MatchResult);
          tLobby.socketing.get(tLobby.Players[0])?.emit("GameEnd");
          while(tLobby.Spectators.length > 0){
            tLobby.socketing.get(tLobby.Spectators[0])?.emit("SpectateResult", MatchResult);
            tLobby.Spectators.splice(0, 1);
          }
          tLobby.Instance.stopGame();
          this.DeleteLobby(tLobby.Lobby_ID);
          return;
        }
        else {
          opponent = tLobby.Instance.getInfo().Player1.name;
          scoreX = tLobby.Instance.getInfo().Player1.score;
          scoreY = tLobby.Instance.getInfo().Player2.score;
          you = tLobby.Instance.getInfo().Player2.name;
          let MatchResult = this.CreateMatchResult({ Winner: opponent, Loser: you, scoreX, scoreY, date: new Date() })
          if (tLobby != undefined && (scoreX != 0 || scoreY != 0)) {
            this.userService.getByLogin(tLobby.Instance.getInfo().Player2.name).then((user) => {
              if (opponent != undefined && scoreX != undefined && scoreY != undefined) {
                this.userService.addToMatchHistory(you, MatchResult);
                this.userService.addToMatchHistory(opponent, MatchResult);
              }
            });
          }
          tLobby.socketing.get(tLobby.Players[index])?.emit('Disconnected');
          tLobby.socketing.delete(login);
          tLobby.Players.splice(index, 1);
          tLobby.socketing.get(tLobby.Players[0])?.emit(
            'GameWon', MatchResult);
            tLobby.socketing.get(tLobby.Players[0])?.emit("GameEnd");
            while(tLobby.Spectators.length > 0){
              tLobby.socketing.get(tLobby.Spectators[0])?.emit("SpectateResult", MatchResult);
              tLobby.Spectators.splice(0, 1);
            }
          tLobby.Instance.stopGame();
          this.DeleteLobby(tLobby.Lobby_ID);
          return;
        }
      }
      id++;
      tLobby = this.LobbyList.at(id);
    }
    console.log("lobbylist after delete : ", this.LobbyList);
  }

  LeaveLobby(login: string) {
    console.log("Trying to leave lobby...");
    let id = 0;
    let tLobby = this.LobbyList.at(id);
    while (tLobby) {
      const index = tLobby.Players.indexOf(login);
      if (index > -1) {
        if (tLobby.Instance.getInfo().Player1.name === login) {
          if (tLobby.Instance.Disconnect(login) === 'STOP') {
            console.log('Found player to disconnect ' + tLobby.id.toString());
            tLobby.socketing
              .get(tLobby.Instance.getInfo().Player1.name)
              ?.emit('Disconnected');
          }
          else {
            tLobby.socketing.get(tLobby.Instance.getInfo().Player1.name)?.emit('GameLost', this.CreateMatchResult({ Winner: tLobby.Instance.getInfo().Player2.name, Loser: tLobby.Instance.getInfo().Player1.name, scoreX: tLobby.Instance.getInfo().Player2.score, scoreY: tLobby.Instance.getInfo().Player1.score, date: new Date() }));
            tLobby.socketing.get(tLobby.Instance.getInfo().Player2.name)?.emit('GameWon', this.CreateMatchResult({ Winner: tLobby.Instance.getInfo().Player2.name, Loser: tLobby.Instance.getInfo().Player1.name, scoreX: tLobby.Instance.getInfo().Player2.score, scoreY: tLobby.Instance.getInfo().Player1.score, date: new Date() }));
            for (let i = 0; i < tLobby.Spectators.length; i++) {
              tLobby.socketing.get(tLobby.Spectators[i])?.emit('SpectateResult', this.CreateMatchResult({ Winner: tLobby.Instance.getInfo().Player2.name, Loser: tLobby.Instance.getInfo().Player1.name, scoreX: tLobby.Instance.getInfo().Player2.score, scoreY: tLobby.Instance.getInfo().Player1.score, date: new Date() }));
            }
          }
        }
        else if (tLobby.Instance.getInfo().Player2.name === login) {
          tLobby.socketing.get(tLobby.Instance.getInfo().Player2.name)?.emit('GameLost', this.CreateMatchResult({ Winner: tLobby.Instance.getInfo().Player1.name, Loser: tLobby.Instance.getInfo().Player2.name, scoreX: tLobby.Instance.getInfo().Player1.score, scoreY: tLobby.Instance.getInfo().Player2.score, date: new Date() }));
          tLobby.socketing.get(tLobby.Instance.getInfo().Player1.name)?.emit('GameWon', this.CreateMatchResult({ Winner: tLobby.Instance.getInfo().Player1.name, Loser: tLobby.Instance.getInfo().Player2.name, scoreX: tLobby.Instance.getInfo().Player1.score, scoreY: tLobby.Instance.getInfo().Player2.score, date: new Date() }));
          for (let i = 0; i < tLobby.Spectators.length; i++) {
            tLobby.socketing.get(tLobby.Spectators[i])?.emit('SpectateResult', this.CreateMatchResult({ Winner: tLobby.Instance.getInfo().Player1.name, Loser: tLobby.Instance.getInfo().Player2.name, scoreX: tLobby.Instance.getInfo().Player1.score, scoreY: tLobby.Instance.getInfo().Player2.score, date: new Date() }));
          }
      }
      tLobby.Players.splice(index, 1);
      tLobby.socketing.delete(login);
      tLobby.Instance.getInfo().Connected.splice(index, 1);
      if (tLobby.Ready.includes(login)) tLobby.Ready.splice(index, 1);
      this.LobbyList.splice(this.LobbyList.indexOf(tLobby), 1);
      id++;
      tLobby = this.LobbyList.at(id);
    }
  }
}

  EndGame(login: string) {
    let id = 0;
    let tLobby = this.LobbyList.at(id);
    let you: string, opponent: string, scoreX: number, scoreY: number, date: Date;

    while (tLobby) {
      if (tLobby.Instance.getInfo().Player1.score === 7 && tLobby.Instance.getInfo().Player1.name === login) {
        tLobby.socketing.get(tLobby.Instance.getInfo().Player1.name)?.emit('GameWon', this.CreateMatchResult({ Winner: tLobby.Instance.getInfo().Player1.name, Loser: tLobby.Instance.getInfo().Player2.name, scoreX: tLobby.Instance.getInfo().Player1.score, scoreY: tLobby.Instance.getInfo().Player2.score, date: new Date() }));
        tLobby.socketing.get(tLobby.Instance.getInfo().Player2.name)?.emit('GameLost', this.CreateMatchResult({ Winner: tLobby.Instance.getInfo().Player1.name, Loser: tLobby.Instance.getInfo().Player2.name, scoreX: tLobby.Instance.getInfo().Player1.score, scoreY: tLobby.Instance.getInfo().Player2.score, date: new Date() }));
        for (let i = 0; i < tLobby.Spectators.length; i++) {
          tLobby.socketing.get(tLobby.Spectators[i])?.emit('SpectateResult', this.CreateMatchResult({ Winner: tLobby.Instance.getInfo().Player1.name, Loser: tLobby.Instance.getInfo().Player2.name, scoreX: tLobby.Instance.getInfo().Player1.score, scoreY: tLobby.Instance.getInfo().Player2.score, date: new Date() }));
        }
        you = tLobby.Instance.getInfo().Player1.name;
        opponent = tLobby.Instance.getInfo().Player2.name;
        scoreX = tLobby.Instance.getInfo().Player1.score;
        scoreY = tLobby.Instance.getInfo().Player2.score;
        date = new Date();
        let MatchResult = this.CreateMatchResult({ Winner: you, Loser: opponent, scoreX, scoreY, date: new Date() })
        if (tLobby != undefined) {
          this.userService.getByLogin(you).then((user) => {
            this.userService.addToMatchHistory(you, MatchResult);
            this.userService.addToMatchHistory(opponent, MatchResult);
        });
        }
        while(tLobby.Spectators.length > 0){
          tLobby.socketing.get(tLobby.Spectators[0])?.emit("SpectateResult", MatchResult);
          tLobby.Spectators.splice(0, 1);
        }
        this.DeleteLobby(tLobby.Lobby_ID);
        return;
      }
      else if (tLobby.Instance.getInfo().Player2.score === 7 && tLobby.Instance.getInfo().Player2.name === login) {
        tLobby.socketing.get(tLobby.Instance.getInfo().Player2.name)?.emit('GameWon', this.CreateMatchResult({ Winner: tLobby.Instance.getInfo().Player2.name, Loser: tLobby.Instance.getInfo().Player1.name, scoreX: tLobby.Instance.getInfo().Player2.score, scoreY: tLobby.Instance.getInfo().Player1.score, date: new Date() }));
        tLobby.socketing.get(tLobby.Instance.getInfo().Player1.name)?.emit('GameLost', this.CreateMatchResult({ Winner: tLobby.Instance.getInfo().Player2.name, Loser: tLobby.Instance.getInfo().Player1.name, scoreX: tLobby.Instance.getInfo().Player2.score, scoreY: tLobby.Instance.getInfo().Player1.score, date: new Date() }));
        for (let i = 0; i < tLobby.Spectators.length; i++) {
          tLobby.socketing.get(tLobby.Spectators[i])?.emit('SpectateResult', this.CreateMatchResult({ Winner: tLobby.Instance.getInfo().Player2.name, Loser: tLobby.Instance.getInfo().Player1.name, scoreX: tLobby.Instance.getInfo().Player2.score, scoreY: tLobby.Instance.getInfo().Player1.score, date: new Date() }));
        }
        you = tLobby.Instance.getInfo().Player2.name;
        opponent = tLobby.Instance.getInfo().Player1.name;
        scoreX = tLobby.Instance.getInfo().Player2.score;
        scoreY = tLobby.Instance.getInfo().Player1.score;
        date = new Date();
        let MatchResult = this.CreateMatchResult({ Winner: you, Loser: opponent, scoreX, scoreY, date: new Date() })
        if (tLobby != undefined) {
          this.userService.getByLogin(you).then((user) => {
            this.userService.addToMatchHistory(you, MatchResult);
            this.userService.addToMatchHistory(opponent, MatchResult);
        });
        }
        while(tLobby.Spectators.length > 0){
          tLobby.socketing.get(tLobby.Spectators[0])?.emit("SpectateResult", MatchResult);
          tLobby.Spectators.splice(0, 1);
        }
        this.DeleteLobby(tLobby.Lobby_ID);
        return;
      }
      id++;
      tLobby = this.LobbyList.at(id);
    }
  }

  printLobby() {
    console.log(this.LobbyList);
  }

  getLobbyInstance(id: number) {
    const tLobby = this.LobbyList.find((lobby) => lobby.id === id);
    if (tLobby) return tLobby.Instance;
    else console.log('Lobby/Instance not found');
    return undefined;
  }

  isWaiting(login: string) {
    const tLobby = this.LobbyList.find((lobby) =>
      lobby.Waiting.includes(login),
    );
    if (tLobby) {
      if (tLobby.Waiting.includes(login)) return true;
      else return false;
    }
  }

  isInLobby(login: string) {
    const tLobby = this.LobbyList.find((lobby) =>
      lobby.Players.includes(login),
    );
    if (tLobby) return true;
    else return false;
  }

  getUserLobby(login: string) {
    const tLobbySpec = this.LobbyList.find((lobby) =>
      lobby.Spectators.includes(login),
    );
    const tLobby = this.LobbyList.find((lobby) =>
      lobby.Players.includes(login),
    );
    if (tLobbySpec) return tLobbySpec;
    if (tLobby) return tLobby;
    else throw new Error('Player not in a lobby');
  }


  SpectatorJoin(login: string, target:string, client: Socket) {
    if (this.isInLobby(login))
      throw new Error('Player already in lobby');
    let id = 0;
    let tLobby;
    tLobby = this.LobbyList.at(id);
    while (tLobby) {
      if (tLobby.Players.includes(target)) {
        if (tLobby.Spectators.push(login)) {
          tLobby.socketing.set(login, client);
          client.join(tLobby.id.toString());
          tLobby.Instance.setRoom(this.Room);
          return tLobby;
        }
      }
      id++;
      tLobby = this.LobbyList.at(id);
    }
    throw new Error('Lobby not found or full');
  }

  isSpectating(login: string) {
    const tLobby = this.LobbyList.find((lobby) =>
      lobby.Spectators.includes(login),
    );
    if (tLobby) return true;
    else return false;
  }

  LeaveSpectating(login: string) {
    const tLobby = this.LobbyList.find((lobby) =>
      lobby.Spectators.includes(login),
    );
    if (tLobby) {
      const index = tLobby.Spectators.indexOf(login);
      if (index > -1) tLobby.Spectators.splice(index, 1);
    }
  }
}
