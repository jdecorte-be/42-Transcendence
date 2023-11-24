import { useContext, useEffect, useState } from "react";
import { MatchHistoryDto } from "../dto/dto";
import { SpectateResult } from "./GameResult";
import Nav from "../components/NavBar";
import { useNavigate } from "react-router-dom";
import { Socket } from "socket.io-client";
import { SocketGameContext } from "../socketManager";
import { Gaming } from "../components/Canvas";

function GameRender(){
    return(
        <div>
            <Nav/>
            <Gaming/>
        </div>);
}

function SpectatePage () {
    
    const socket: Socket = useContext(SocketGameContext);
    const [end, setEnd] = useState(false);
    const [Info, setInfo] = useState<MatchHistoryDto>(null);

    useEffect(() => {

        socket.on('SpectateResult', (info:MatchHistoryDto) => {
            console.log("end");
            setEnd(true);
            setInfo(info);
            console.log(info);
        })
        return () => {
            socket.off('SpectateResult');
        }
    }, [end, Info]);

    return (
        <div>
            {!end && <GameRender/>}
            {end && <SpectateResult Winner={Info.Winner} Loser={Info.Loser} scoreX={Info.scoreX} scoreY={Info.scoreY} date={Info.date}/>}
        </div>
    )
}

export default SpectatePage;