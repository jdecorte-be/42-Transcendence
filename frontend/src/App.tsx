/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import './App.css';
import './index.css';
import Pathing from './components/Path';
import { WebsocketProvider, socket } from './contexts/WebsocketContext';
import { ApolloProvider } from '@apollo/client';
import { client } from './apollo/apolloProvider';
import { MantineProvider, createEmotionCache } from '@mantine/core';
import Particles from 'react-particles';
import { loadFull } from 'tsparticles';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { InviteModal } from './assets/modal';
import { ToastContainer, toast } from 'react-toastify';
import { Gaming } from './components/Canvas';
import { socketGame } from './socketManager';
import { SocketGameContext } from './socketManager';
import { Cookie } from 'tabler-icons-react';

export function NotifySuccess(success: string) {
  toast.success(success, {
    position: 'top-center',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: 'colored',
  });
}

export function NotifyError(err: string) {
  toast.error(err, {
    position: 'top-center',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: 'colored',
  });
}

function App() {
  const particlesInit = async (main) => {
    console.log(main);
    await loadFull(main);
  };

  const myCache = createEmotionCache({
    key: 'mantine',
    prepend: false,
  });

  return (
    <div>
      <SocketGameContext.Provider value={socketGame}>
        <MantineProvider emotionCache={myCache}>
          <ApolloProvider client={client}>
            <WebsocketProvider value={socket}>
              <ToastContainer />
              <Pathing />
              <InviteModal />
            </WebsocketProvider>
          </ApolloProvider>
        </MantineProvider>
      </SocketGameContext.Provider>
    </div>
  );
}

export default App;
