import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link } from 'react-router-dom';
import React from 'react';
import { FaUserAlt, FaRunning } from 'react-icons/fa';
import { GiPodium, GiRadarSweep } from 'react-icons/gi';
import { Fragment } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
// import { game } from '../App';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Chat } from './Chat/chat';
import { useNavigate } from 'react-router-dom';
import { currentAvatarVar, currentLoginVar } from '../apollo/apolloProvider';
import { useReactiveVar } from '@apollo/client';
import { Socket } from 'socket.io-client';
import { SocketGameContext } from '../socketManager';
import { useContext } from 'react';
import { resolveReadonlyArrayThunk } from 'graphql';

const navigation = [
  { name: 'Game', href: '/HomePage', current: false },
  { name: 'Lobby', href: '/Lobby', current: false },
  { name: 'LeaderBoard', href: '/leaderboard', current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function ColorSchemesExample() {
  const [errors, setErrors] = useState();
  const Navigate = useNavigate();

  const socket: Socket = useContext(SocketGameContext);
  const currentAvatar = useReactiveVar(currentAvatarVar);

  const Back = () => {
    console.log('Disconnect');
    Navigate('/');
    sessionStorage.clear();
    localStorage.clear();
    window.location.reload();
  };
  const PlayingState = () => {
    socket.emit('isPlaying');
  };
  useEffect(() => {
    const fetchUser = async () => {
      console.log('COOKIE CHAT--->', document.cookie);
      axios
        .get(`http://localhost:3001/app/auth/fetchUser`, {
          headers: { Authorization: `${document.cookie}` },
        })
        .then((res) => {
          console.log(res);
          sessionStorage.setItem('currentUser', res.data.id);
        });
      console.log('NOW: ', sessionStorage.getItem('currentUser'));
    };
    const fetchAvatar = async () => {
      await fetchUser();
      await axios
        .get(
          `http://localhost:3001/app/users/profile/${sessionStorage.getItem(
            'currentUser',
          )}`,
        )
        .then((res) => {
          if (res) currentAvatarVar(res.data.avatar);
        })
        .catch((err) => {
          console.log(err);
        });
    };
    if (!sessionStorage.getItem('currentUser')) fetchUser();
    if (!currentAvatar) {
      fetchAvatar();
    }
    return () => {
      socket.off('isPlaying');
    };
  }, []);

  let style = {
    width: '12 rem',
  };

  return (
    <>
      <Disclosure as="nav" className="navbar">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
              <div className="relative flex h-16 items-center justify-between">
                <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                  {/* Mobile menu button*/}
                </div>
                <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                  <div className="flex flex-shrink-0 items-center">
                    <div>
                      <Nav.Link as={Link} to="/HomePage" className="title">
                        <img
                          className="block h-8 w-auto lg:hidden logo"
                          src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/11a10a01-ac23-4fea-ad5a-b51f53084159/d8opy2w-d1837851-b90d-4702-ab3b-2521d77a58f6.png/v1/fill/w_1219,h_362,strp/pong_logo_by_ringostarr39_d8opy2w-fullview.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MzYyIiwicGF0aCI6IlwvZlwvMTFhMTBhMDEtYWMyMy00ZmVhLWFkNWEtYjUxZjUzMDg0MTU5XC9kOG9weTJ3LWQxODM3ODUxLWI5MGQtNDcwMi1hYjNiLTI1MjFkNzdhNThmNi5wbmciLCJ3aWR0aCI6Ijw9MTIxOSJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.rlfRzGERmwCP7bAyTAykjN-ei1IYDQsFxUCGWKt2ulg"
                          alt="Pong"
                        />
                        <img
                          className="hidden h-8 w-auto lg:block logo"
                          src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/11a10a01-ac23-4fea-ad5a-b51f53084159/d8opy2w-d1837851-b90d-4702-ab3b-2521d77a58f6.png/v1/fill/w_1219,h_362,strp/pong_logo_by_ringostarr39_d8opy2w-fullview.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MzYyIiwicGF0aCI6IlwvZlwvMTFhMTBhMDEtYWMyMy00ZmVhLWFkNWEtYjUxZjUzMDg0MTU5XC9kOG9weTJ3LWQxODM3ODUxLWI5MGQtNDcwMi1hYjNiLTI1MjFkNzdhNThmNi5wbmciLCJ3aWR0aCI6Ijw9MTIxOSJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.rlfRzGERmwCP7bAyTAykjN-ei1IYDQsFxUCGWKt2ulg"
                          alt="Pong"
                        />
                      </Nav.Link>
                    </div>
                  </div>

                  <div className="hidden sm:ml-6 sm:block">
                    <div className="flex space-x-4">
                      <Nav.Link
                        onClick={() => PlayingState()}
                        className="text-gray-300 hover:bg-gray-700 hover:text-white', 'px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Game
                      </Nav.Link>
                      <Nav.Link
                        as={Link}
                        to="/Lobby"
                        className="text-gray-300 hover:bg-gray-700 hover:text-white', 'px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Lobby
                      </Nav.Link>
                      <Nav.Link
                        as={Link}
                        to="/Leaderboard"
                        className="text-gray-300 hover:bg-gray-700 hover:text-white', 'px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Leaderboard
                      </Nav.Link>
                      <Nav.Link
                        as={Link}
                        to="/FriendList"
                        className="text-gray-300 hover:bg-gray-700 hover:text-white', 'px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Friends
                      </Nav.Link>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                  {/* <button
                    type="button"
                    className="rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                  >
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                  </button> */}

                  {/* Profile dropdown */}
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                        <span className="sr-only">Open user menu</span>
                        <img
                          className="h-8 w-8 rounded-full"
                          src={`data:image/jpeg;base64,${currentAvatar}`}
                          alt=""
                        />
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Menu.Item>
                          {({ active }) => (
                            <Nav.Link
                              as={Link}
                              to="/Profile"
                              className={classNames(
                                active ? 'bg-gray-100' : '',
                                'block px-4 py-2 text-sm text-gray-700',
                              )}
                            >
                              Profile
                            </Nav.Link>
                          )}
                        </Menu.Item>
                        {/* <Menu.Item>
                          {({ active }) => (
                              <Nav.Link as={Link} to="/Settings" className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}>Settings</Nav.Link>
                          )}
                        </Menu.Item> */}
                        <Menu.Item>
                          {({ active }) => (
                            <div style={{ cursor: 'pointer' }}>
                              <a
                                id="headlessui-menu-item-:r4:"
                                onClick={() => Back()}
                                className={classNames(
                                  active ? 'bg-gray-100' : '',
                                  'block px-4 py-2 text-sm text-red-700 nav-link',
                                )}
                              >
                                Sign out
                              </a>
                            </div>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="sm:hidden">
              <div className="space-y-1 px-2 pt-2 pb-3">
                {navigation.map((item) => (
                  <Disclosure.Button
                    key={item.name}
                    as="a"
                    href={item.href}
                    className={classNames(
                      item.current
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                      'block px-3 py-2 rounded-md text-base font-medium',
                    )}
                    aria-current={item.current ? 'page' : undefined}
                  >
                    {item.name}
                  </Disclosure.Button>
                ))}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
      <Chat></Chat>
    </>
  );
}

export default ColorSchemesExample;
