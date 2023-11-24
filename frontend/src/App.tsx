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
            <Particles
              className='particles'
              id="tsparticles"
              init={particlesInit}
              options={
                {
                  "fullScreen": {
                    "enable": true,
                    "zIndex": 1
                  },
                  "particles": {
                    "number": {
                      "value": 15,
                      "density": {
                        "enable": true,
                        "value_area": 800
                      }
                    },
                    "color": {
                      "value": "#fff"
                    },
                    "opacity": {
                      "value": 0.2,
                      "random": true,
                      "anim": {
                        "enable": true,
                        "speed": 1,
                        "opacity_min": 0.1,
                        "sync": true
                      }
                    },
                    "size": {
                      "value": 4,
                      "random": false,
                      "anim": {
                        "enable": false,
                        "speed": 80,
                        "size_min": 0.1,
                        "sync": false
                      }
                    },
                    "rotate": {
                      "value": 0,
                      "random": true,
                      "direction": "clockwise",
                      "animation": {
                        "enable": true,
                        "speed": 5,
                        "sync": false
                      }
                    },
                    "line_linked": {
                      "enable": true,
                      "distance": 500,
                      "color": "#ffffff",
                      "opacity": 0.4,
                      "width": 2
                    },
                    "move": {
                      "enable": true,
                      "speed": 2,
                      "direction": "none",
                      "random": false,
                      "straight": false,
                      "out_mode": "out",
                      "attract": {
                        "enable": false,
                        "rotateX": 600,
                        "rotateY": 1200
                      }
                    }
                  },
                  "interactivity": {
                    "detect_on": "window",
                    "events": {
                      "onhover": {
                        "enable": true,
                        "mode": ["grab"]
                      },
                      "onclick": {
                        "enable": false,
                        "mode": "bubble"
                      },
                      "resize": true
                    },
                    "modes": {
                      "grab": {
                        "distance": 400,
                        "line_linked": {
                          "opacity": 1
                        }
                      },
                      "bubble": {
                        "distance": 400,
                        "size": 40,
                        "duration": 2,
                        "opacity": 8,
                        "speed": 3
                      },
                      "repulse": {
                        "distance": 200
                      },
                      "push": {
                        "particles_nb": 4
                      },
                      "remove": {
                        "particles_nb": 2
                      }
                    }
                  },
                  "background": {
                    "color": "#111",
                    "repeat": "no-repeat",
                    "size": "cover"
                  }
                }
              }
            />
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




