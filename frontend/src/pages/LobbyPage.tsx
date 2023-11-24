//import {game} from '../App';
import axios from "axios";
import { useNavigate} from "react-router-dom";
import Nav from 'react-bootstrap/Nav';
import Navb from "../components/NavBar";
import {Route, Routes, Link, Router} from "react-router-dom";
import { Socket } from "socket.io-client";
import { SocketGameContext } from "../socketManager";
import {useContext} from "react";


function LobbyPage() {
    
    const socket: Socket = useContext(SocketGameContext);
    const Navigate = useNavigate();
    const click = () => {
        axios.get('http://localhost:3001/app/auth/who', {
            headers: { Authorization: document.cookie },
        }).then((response) => {
            console.log('Login -> ',response.data.login);
        }).catch((error) => {
            console.log(error);
        });
    }

    const joinLobby = () => {
        socket.emit('JoinLobby')
    }
    const leaveLobby = () => {
        socket.emit('LeaveLobby')
    }
    const SpectateLobby = () => {
        socket.emit('Spectate');
    }
    if (socket)
    { 
        socket.on('Test', () => {
            console.log(4);
            Navigate('/Disconnected');
        });
    }

    return (
        <div>
            <Navb/>
            <div className="flex-container">
                <div className="mc-menu">
                    <div className="mc-button full">
                        <Nav.Link as={Link} to="/CreateLobby" className="title">Create Lobby</Nav.Link>
                    </div>
                    <div className="mc-button full">
                        <Nav.Link onClick={joinLobby} className="title">Find Lobby</Nav.Link>
                    </div>
                    <div className="mc-button full">
                        <Nav.Link onClick={SpectateLobby} className="title">Spectate Lobby</Nav.Link>
                    </div>
                </div>
            </div>
        </div>);
}

export default LobbyPage;