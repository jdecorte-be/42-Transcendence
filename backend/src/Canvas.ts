/* eslint-disable prettier/prettier */
import io from 'socket.io-client';
import { Socket, Server } from 'socket.io';

let canvas: any;
let context: any;

class Player {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    score: number;
    min: number;
    max: number;
    speed: number;
    name: string;
    moveUp: boolean;
    moveDown: boolean
    constructor(x: number, y: number, width: number, height: number, color: string, score: number, min: number, max: number, speed: number) {
        this.x = x;
        this.y = y - height / 2;
        this.width = width;
        this.height = height;
        this.color = color;
        this.score = score;
        this.min = min;
        this.max = max;
        this.speed = speed;
        this.moveDown = false;
        this.moveUp = false;
    }
    PaddleUp() {
        if (this.y - this.speed >= - 20)
            this.y -= this.speed;
    }
    PaddleDown() {
        if (this.y + this.speed + this.height <= this.max + 20)
            this.y += this.speed;
    }
    RandomColor() {
        this.color = '#' + Math.floor(Math.random() * 16777215).toString(16);
    }
}

class Ball {
    x: number;
    y: number;
    radius: number;
    speed: number;
    velocityX: number;
    velocityY: number;
    color: string;
    custom = false;
    constructor(x: number, y: number, radius: number, speed: number, velocityX: number, velocityY: number, color: string) {
        this.x = x / 2;
        this.y = y / 2;
        this.radius = radius;
        this.speed = speed;
        this.velocityX = velocityX;
        this.velocityY = Math.random() * 3;
        this.color = color;
    }
    RandomColor() {
        this.color = '#' + Math.floor(Math.random() * 16777215).toString(16);
    }
}


export class gameInfo {
    Balling:Ball;
    Player1:Player;
    Player2:Player;
    Connected:string[];
    Running:boolean;
    CDimension:any = {width: 0, height: 0};
    Lead: [string, Player];
    Loser: [string, Player];
    constructor(widths: number, heights: number) {
        this.Running = false;
        this.Connected = [];
        this.CDimension = { width: widths, height: heights };
        this.Balling = new Ball((widths), (heights), 10, 10, 5, 0, 'red');
        this.Player1 = new Player(0, heights / 2, 50, 200, '#1542d3', 0, 0, heights, 10);
        this.Player2 = new Player(widths - 50, (heights / 2), 50, 200, '#05f315', 0, 0, heights, 10);

    }
    resetCanvas() {
        this.Running = false;
        this.Connected = [];
        this.Balling = new Ball((this.CDimension.width / 2), (this.CDimension.height / 2), 10, 10, 5, 0, 'red');
        this.Player1 = new Player(0, this.CDimension.height / 2, 50, 150, '#1542d3', 0, 0, this.CDimension.height, 10);
        this.Player2 = new Player(this.CDimension.width - 50, (this.CDimension.height / 2), 50, 200, '#05f315', 0, 0, this.CDimension.height, 10);
    }
    CheckMove(id: string) {
        if (this.Player1.name === id)
            return this.Player1;
        else if (this.Player2.name === id)
            return this.Player2;
    }
    MoveHandler() {
        if (this.Player1.moveUp === true)
            this.Player1.PaddleUp();
        if (this.Player1.moveDown === true)
            this.Player1.PaddleDown();
        if (this.Player2.moveUp === true)
            this.Player2.PaddleUp();
        if (this.Player2.moveDown === true)
            this.Player2.PaddleDown();
    }
    setMove(id: string, move: string, state: boolean) {
        if (move === "UP") {
            if (this.Player1.name === id)
                this.Player1.moveUp = state;
            else if (this.Player2.name === id)
                this.Player2.moveUp = state;
        }
        else if (move === "DOWN") {
            if (this.Player1.name === id)
                this.Player1.moveDown = state;
            else if (this.Player2.name === id)
                this.Player2.moveDown = state;
        }
    }
}


export class Gaming {
    id = "";
    intID: any;
    Info: gameInfo;
    Room: Server;

    constructor(width: number, height: number,) {
        this.Info = new gameInfo(width, height);
        this.Room = new Server();
    }
    setRoom(Room: Server) {
        this.Room = Room;
    }
    getInfo(): gameInfo {
        return this.Info;
    }
    stopGame() {
        clearInterval(this.intID);
        this.Info.Running = false;
        //this.Info.resetCanvas();
    }
    rendering(Client: Socket) {
        console.log(this.Info.Connected.length);
        console.log("Rendering...");
        if (this.Info.Running === true)
            return 1;
        if (this.Info.Connected.length === 2 || this.Info.Player1.score < 7 || this.Info.Player2.score < 7) {
            this.Info.Running = true;
            this.intID = setInterval(() => {
                this.UpdateBall();
            }, 1000 / 60);
        }
        if (this.Info.Player1.score >= 7 || this.Info.Player2.score >= 7)
            return 0;
        else
            return -1;
    }
    Disconnect(id: string) {
        const index = this.getInfo().Connected.indexOf(id);
        if (this.getInfo().Running === false) {

            if (index > -1) {
                this.getInfo().Connected.splice(index, 1);
            }
            return "CONTINUE";
        }
        else if (index > -1) {
            this.getInfo().Running = false;
            return "STOP";
        }
        return "CONTINUE";
    }
    collision(b: any, p: any) {
        b.top = this.Info.Balling.y - this.Info.Balling.radius;
        b.bottom = this.Info.Balling.y + this.Info.Balling.radius;
        b.left = this.Info.Balling.x - b.radius;
        b.right = this.Info.Balling.x + b.radius;

        p.top = p.y;
        p.bottom = p.y + p.height;
        p.left = p.x;
        p.right = p.x + p.width;
        return (b.right > p.left && b.bottom > p.top && b.left < p.right && b.top < p.bottom);
    }

    public UpdateBall() {
        this.Room.to(this.id).emit('Ping', this.Info);
        this.Info.MoveHandler();
        this.Info.Balling.x += this.Info.Balling.velocityX;
        this.Info.Balling.y += this.Info.Balling.velocityY;
        if (this.Info.Balling.x - this.Info.Balling.radius < 0) {
            this.Info.Player2.score++;
            this.ReplaceBall(1);
            return;
        }
        else if (this.Info.Balling.x + this.Info.Balling.radius > this.Info.CDimension.width) {
            this.Info.Player1.score++;
            this.ReplaceBall(0);
            return;
        }

        if (this.Info.Player1.score === 7 || this.Info.Player2.score === 7) {
            console.log(this.id);
            this.Room.to(this.id).emit('EndGame', this.Info);
            this.stopGame();
            return;
        }
        if (this.Info.Balling.y + this.Info.Balling.radius > this.Info.CDimension.height || this.Info.Balling.y - this.Info.Balling.radius < 0)
            this.Info.Balling.velocityY = -this.Info.Balling.velocityY;
        const player: string = this.Info.Balling.x < this.Info.CDimension.width / 2 ? 'u1' : 'u2';
        if (player === 'u1' && this.collision(this.Info.Balling, this.Info.Player1)) {
            console.log('u1');
            console.log(this.Info.Balling);
            if (this.getInfo().Balling.custom === true) {
                this.getInfo().Balling.RandomColor();
                this.getInfo().Player1.RandomColor();
            }
            let colPoint: number = this.Info.Balling.y - (this.Info.Player1.y + (this.Info.Player1.height / 2));
            colPoint = colPoint / (this.Info.Player1.height / 2);
            const angleRad: number = (colPoint * Math.PI) / 4;
            const direction: number = this.Info.Balling.x < this.Info.CDimension.width / 2 ? 1 : -1;

            this.Info.Balling.velocityX = direction * this.Info.Balling.speed * Math.cos(angleRad);
            this.Info.Balling.velocityY = this.Info.Balling.speed * Math.sin(angleRad);
            if (this.Info.Balling.speed < 20)
                this.Info.Balling.speed += 1;
        }
        else if (player === 'u2' && this.collision(this.Info.Balling, this.Info.Player2)) {
            console.log('u2');
            console.log(this.Info.Balling);
            if (this.getInfo().Balling.custom === true) {
                this.getInfo().Balling.RandomColor();
                this.getInfo().Player2.RandomColor();
            }
            let colPoint: number = this.Info.Balling.y - (this.Info.Player2.y + (this.Info.Player2.height / 2));
            colPoint = colPoint / (this.Info.Player2.height / 2);
            const angleRad: number = (colPoint * Math.PI) / 4;
            const direction: number = this.Info.Balling.x < this.Info.CDimension.width / 2 ? 1 : -1;

            this.Info.Balling.velocityX = direction * this.Info.Balling.speed * Math.cos(angleRad);
            this.Info.Balling.velocityY = this.Info.Balling.speed * Math.sin(angleRad);
            if (this.Info.Balling.speed < 20)
                this.Info.Balling.speed += 1;
        }

    }
    ReplaceBall(i: number) {
        this.Info.Balling.x = this.Info.CDimension.width / 2;
        this.Info.Balling.y = this.Info.CDimension.height / 2;

        this.Info.Balling.speed = 10;
        this.Info.Balling.velocityY = Math.random() * 3;
        this.Info.Balling.velocityX = -5;
        if (i === 0) {
            this.Info.Balling.velocityX = 5;
            this.Info.Balling.velocityY = Math.random() * 3;
        }
    }
}