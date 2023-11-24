
import {useNavigate} from "react-router-dom";
import Nav from "../components/NavBar";
import { gameInfo } from "../components/Canvas";
import { MatchHistoryDto } from "../dto/dto";
import { useEffect, useState } from "react";
import {GameWon} from "./GameResult";
import {GameLost} from "./GameResult";
import {Disconnected} from "./GameResult";
import { Socket } from "socket.io-client";
import { SocketGameContext } from "../socketManager";
import { useContext } from "react";
import { Gaming } from "../components/Canvas";


function GamePage() {
    
    const socket: Socket = useContext(SocketGameContext);
    const [Won, setWon] = useState<boolean>(false);
    const [Lost, setLost] = useState<boolean>(false);
    const [Info, setInfo] = useState<MatchHistoryDto>(null);
    const [Disco, setDisco] = useState<boolean>(false);

    const Navigate = useNavigate();


    const onReady = () => {
        socket.emit('PlayerReady');
    }

    function GameRender(){
        return (<div>
            <Nav/>
            <Gaming/>
            <div className="flex-item">
                <div className="mc-menu">
                    <div className="mc-button full">
                        <button className="title" onClick={onReady}>IM FUCKING READY</button>
                    </div>
                </div>
            </div>
        </div>)
    }

    useEffect(() => {
            socket.on('GameLost', (info:MatchHistoryDto) => {
                setLost(true);
                setInfo(info);
                setWon(false);
            });

            socket.on('GameWon', (info:MatchHistoryDto) => {
                setLost(false);
                setInfo(info);
                setWon(true);

            });
            socket.on('EndGame', () => {
                socket.emit('EndGame');
            });
            
            return () => {
                socket.off('GameWon');
                socket.off('GameLost');
                socket.off('EndGame');
            }
    }, [Won, Lost, Info, Disco]);

    return (
        <div>
            {!Won && !Lost && !Disco && <GameRender/>}
            {Won && <GameWon Winner={Info.Winner} Loser={Info.Loser} scoreX={Info.scoreX} scoreY={Info.scoreY} date={Info.date}/> }
            {Lost && <GameLost Winner={Info.Winner} Loser={Info.Loser} scoreX={Info.scoreX} scoreY={Info.scoreY} date={Info.date}/>}
        </div>
    );
}

export default GamePage;