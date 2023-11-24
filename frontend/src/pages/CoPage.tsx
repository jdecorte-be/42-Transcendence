import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import HomePage from './HomePage';
import { ReactNotifications, Store } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';
//import {game} from '../App';
import { Socket } from 'socket.io-client';
import { SocketGameContext } from '../socketManager';
import { useContext } from 'react';
import { Gaming } from '../components/Canvas';
import axios from 'axios';

function connected() {
  Store.addNotification({
    title: 'Error',
    message: 'Invalid credentials',
    type: 'success',
    insert: 'top',
    container: 'top-right',
    animationIn: ['animated', 'fadeIn'],
    animationOut: ['animated', 'fadeOut'],
    dismiss: {
      duration: 3000,
      onScreen: true,
    },
  });
}

function CoPage() {
  const socket: Socket = useContext(SocketGameContext);
  const Navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const userId = searchParams.get('id');

  async function getUser42() {
    if (userId && !localStorage.getItem('loaded')) {
      sessionStorage.setItem('currentUser', userId);
      localStorage.setItem('loaded', 'true');
      await axios
        .get(`http://localhost:3001/app/auth/jwt/${userId}`)
        .then((res) => {
          document.cookie = res.data;
          window.location.reload();
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }
  getUser42();

  return (
    <div>
      <ReactNotifications />
      <HomePage />
    </div>
  );
}

export default CoPage;
