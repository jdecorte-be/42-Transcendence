import React, {useContext, useEffect, useRef} from 'react';
import io from "socket.io-client";
import Canvas from 'react-responsive-canvas';
import '../index.css';
import {SocketGameContext} from '../socketManager';
import {socketGame} from '../socketManager';
import {Socket} from 'socket.io-client';
import { Disc } from 'tabler-icons-react';
import { Disconnected } from '../pages/GameResult';

class Player
{
    x:number;
    y:number;
    width:number;
    height:number;
    color:string;
    score:number;
    min:number;
    max:number;
    speed:number;
    moveUp:boolean;
    moveDown:boolean;
    constructor(x:number, y:number, width:number, height:number, color:string, score:number, min:number, max:number, speed:number) {
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
    PaddleUp()
    {
        if (this.y - this.speed >= -10)
            this.y -= this.speed;
    }
    PaddleDown()
    {
        if (this.y + this.speed + this.height <= this.max + 10)
            this.y += this.speed;
    }
}

class Ball
{
    x:number;
    y:number;
    radius:number;
    speed:number;
    velocityX:number;
    velocityY:number;
    color:string;
    constructor(x:number, y:number, radius:number, speed:number, velocityX:number, velocityY:number, color:string) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed = speed;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.color = color;
    }
}

export class gameInfo{
    Balling:Ball;
    Player1:Player;
    Player2:Player;
    Connected:string[];
    Running:boolean;
    CDimension:any = {width: 0, height: 0};
    Lead: [string, Player];
    Loser: [string, Player];
    constructor(widths:number, heights:number){
        this.Running = false;
        this.Connected = [];
        this.CDimension = {width: widths, height: heights};
        this.Balling = new Ball((widths / 2), (heights / 2), 10, 10, 5, 0, 'red');
        this.Player1 = new Player(0, this.CDimension.height / 2, 50, 200, '#1542d3', 0, 0, heights, 10);
        this.Player2 = new Player(widths - 50, (heights / 2), 50, 200, '#05f315', 0, 0, heights, 10);
        this.CDimension = {width: widths, height: heights};
    }
    resetCanvas()
    {    
        this.Running = false;
        this.Connected = [];
        this.Balling = new Ball((this.CDimension.width / 2), (this.CDimension.height / 2), 10, 10, 5, 10, 'red');
        this.Player1 = new Player(0, this.CDimension.height / 2, 50, 200, '#0d35ca', 0, 0, this.CDimension.height, 10);
        this.Player2 = new Player(this.CDimension.width - 50, (this.CDimension.height / 2),  50, 200, '#05f315', 0, 0, this.CDimension.height, 10);
    }
    copy(other:gameInfo)
    {
        this.Balling = other.Balling;
        this.Player1 = other.Player1;
        this.Player2 = other.Player2;
        this.CDimension = {width: other.CDimension.width, height: other.CDimension.height};
    }
}

export function Gaming () {
    let Info:gameInfo;
    const socket: Socket = useContext(SocketGameContext);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const graph = new gameInfo(1920, 1080);
    let boxDimen:any = {width: 1920, height: 1080};
    const [disco, setDisco] = React.useState(false);

    console.log('Gaming');

    function copy(cp:gameInfo) {
        Info = cp;
    }
    useEffect(() => {
            let canvas: HTMLCanvasElement | null;
            let context: CanvasRenderingContext2D | null;
            let animationFrameId: number;

            socket.on('Ping', (data:gameInfo) => {
                copy(data);
            });
            socket.on('GameEnd', () => {
                console.log('Disconnected');
                setDisco(true);
            });

            socket.emit('Ping', (co:boolean) => {
                if (!co)
                    setDisco(true);
            });

            function Draw (inf:gameInfo, boxDimen:any) {
                ResetBall();
                DrawScore(boxDimen.width / 4, boxDimen.height / 4, '#ffffff', inf.Player1.score.toString());
                DrawScore(3 * boxDimen.width / 4, boxDimen.height / 4, '#ffffff',inf.Player2.score.toString());
                DrawRec(inf.Player1.x, inf.Player1.y, inf.Player1.width, inf.Player1.height, inf.Player1.color);
                DrawRec(inf.Player2.x, inf.Player2.y, inf.Player2.width, inf.Player2.height, inf.Player2.color);
                DrawBall(inf.Balling.x, inf.Balling.y, inf.Balling.radius, inf.Balling.color);
            }
            function DrawScore(x:number, y:number, color:string, text:string)
            {
                context.fillStyle = color;
                context.font = '45px Arial';
                context.fillText(text, x, y)
            }

            function DrawRec(x: number, y: number, w: number, h: number, color:string)
            {
                context.fillStyle = color;
                context.fillRect(x, y, w , h);
            }

            function DrawBall(x: number, y: number, r: number, color:string)
            {
                context.fillStyle = color;
                context.beginPath();
                context.arc(x, y, r, 0, Math.PI*2, false);
                context.closePath();
                context.fill();
            }

            function ResetBall()
            {
                context.fillStyle = '#000000';
                context.fillRect(0, 0, context.canvas.width, context.canvas.height);
            }
            function render()
            {
                if (Info && Info.Running === false)
                    return;
                if (!Info && !disco)
                    Draw(graph, boxDimen);
                if (Info)
                    Draw(Info, boxDimen);
                requestAnimationFrame(render);
            }
            if (canvasRef.current) {
                canvas = canvasRef.current;
                canvas.width = 1920;
                canvas.height = 1080;
                context = canvas.getContext('2d');
                if (context) {
                    context.beginPath();
                    context.fillStyle = '#000000';
                    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
                }
                canvas.tabIndex = 1;
                window.addEventListener('keydown', (e) => {
                    if (e.repeat)
                        return;
                    if ('ArrowUp' === e.key)
                        socket.emit('PaddleUp', true);
                    if ('ArrowDown' === e.key)
                        socket.emit('PaddleDown', true)
                });
                window.addEventListener('keyup', (e) => {
                    if (e.repeat)
                        return;
                    if ('ArrowUp' === e.key)
                        socket.emit('PaddleUp', false);
                    if ('ArrowDown' === e.key)
                        socket.emit('PaddleDown', false)
                });
            }
            render();
            if (Info && Info.Running === false)
                console.log('Game not running');
            return () => {
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                }
                socket.off('Ping');
                socket.off('GameEnd');
            }
    }, [disco]);

    console.log(disco);

    return (
        <div>
            {!disco && <canvas ref={canvasRef} id="responsive-canvas"/>}
            {disco && <Disconnected/>}
        </div>);
}
