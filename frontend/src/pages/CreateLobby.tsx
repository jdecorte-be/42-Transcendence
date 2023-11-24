import Nav from 'react-bootstrap/Nav';
import Navb from "../components/NavBar";
import { ReactNotifications} from 'react-notifications-component'
import 'react-notifications-component/dist/theme.css'
import {NotifySuccess } from "../App";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Socket } from "socket.io-client";
import { SocketGameContext } from "../socketManager";
import { useContext } from "react";


function CreateLobbyPage(){
    
    const socket: Socket = useContext(SocketGameContext);
    const Navigate = useNavigate();

    const addLobby = () => {
        socket.emit('CreateLobby', (response: any) => {
            console.log(response);
            NotifySuccess(response);
        });
    }

    const addRainbowLobby = () => {
        socket.emit('CreateRainbowLobby', (response: any) =>{
            NotifySuccess(response);
        });
    }
    const printLobby = () => {
        socket.emit('LobbyInfo');
    }
    

        return (
            <div>
                <ReactNotifications />
                <Navb/>
                <div className="flex-container">
                    <div className="mc-menu">
                        <div className="mc-button full">
                            <Nav.Link onClick={addLobby} className="title">Create classic Lobby</Nav.Link>
                        </div>
                        <div className="mc-button full">
                            <Nav.Link onClick={addRainbowLobby} className="title">Create Rainbow Day Lobby</Nav.Link>
                        </div>
                        <div className="mc-button full">
                            <Nav.Link onClick={printLobby} className="title">Print Lobby</Nav.Link>
                        </div>
                    </div>
                </div>
            </div>);
}

export default CreateLobbyPage;