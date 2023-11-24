import io from "socket.io-client";
import React from 'react';
import axios from "axios";


function authHeader () {
    const response = sessionStorage.getItem('currentUser');
    console.log("Res = " + response);
    if (response)
        return { Authorization: document.cookie };     
    else
        return {};
}

const config = {
   extraHeaders: authHeader(),
}
export const socketGame = io('http://localhost:3002', config);
export const SocketGameContext = React.createContext(undefined);