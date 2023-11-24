
// need chat here too !!!
import PewPew from '../assets/Pewpew.mp3';
import DiscordSound from '../assets/Discord.mp3';
import RohSound from '../assets/Rooooh.mp3';
import Nav from "../components/NavBar";
import { useEffect } from 'react';
import { Socket } from "socket.io-client";
import { SocketGameContext } from "../socketManager";
import { useContext } from "react";

function Pew() {
    const audio = new Audio(PewPew);
    audio.play();
}

function Discord() {
    const audio = new Audio(DiscordSound);
    audio.play();
}

function Roh() {
    const audio = new Audio(RohSound);
    audio.play();
}



function RoomWaiting () {

    const socket: Socket = useContext(SocketGameContext);
    useEffect(() => {
        return () => {
            socket.emit('isWaiting');
        }
    }, []);

    return (
    <div>
        <Nav/>
        <div className='text-center'>
            <h1> Waiting : You will be redirect when a player will be found, until that, you can chat :)</h1>
        </div>
        <div className='flex-container'>
            <div className='mc-menu'>
                <div className='mc-button full'>
                    <button className="mc-button full" onClick={Pew}> PewPew </button>
                </div>
                <div className='mc-button full'>
                    <button className="mc-button full" onClick={Discord}> Discord ? </button>
                </div>
                <div className='mc-button full'>
                    <button className="mc-button full" onClick={Roh}> Thinkge ? PLEASE CLICK ONLY 1 TIMES </button>
                </div>
            </div>
        </div>
    </div>);
}

export default RoomWaiting