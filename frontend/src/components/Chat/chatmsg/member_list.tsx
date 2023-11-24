import {
  gql,
  useLazyQuery,
  useMutation,
  useReactiveVar,
  useSubscription,
} from '@apollo/client';
import { useQuery } from '@apollo/react-hooks';
import {
  Alert,
  Avatar,
  Divider,
  Group,
  UnstyledButton,
  Text,
  ScrollArea,
  ActionIcon,
  Button,
  TextInput,
  Loader,
  Navbar,
  Card,
  Popover,
  Input,
} from '@mantine/core';
import { useState, useEffect } from 'react';
import { BiBlock, BiGame, BiUserCircle } from 'react-icons/bi';
import { RiVipCrownFill } from 'react-icons/ri';
import {
  MdGrade,
  MdOutlineAdminPanelSettings,
  MdVolumeMute,
} from 'react-icons/md';
import Popup from 'reactjs-popup';
import {
  MUTE,
  UPDATE_CHAT,
  KICK,
  ADMIN,
  ADDTOCHAT,
  GET_USERS,
  BLOCK_USER,
  GET_USER,
} from '../query/query';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
// import { game } from '../../../App';
import { AiOutlineUserAdd } from 'react-icons/ai';
import { BsFillVolumeMuteFill } from 'react-icons/bs';
import {
  currentChatVar,
  currentLoginVar,
} from '../../../apollo/apolloProvider';
import { CgProfile } from 'react-icons/cg';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { NotifyError } from '../../../App';
import { socketGame, SocketGameContext } from '../../../socketManager';
import { Socket } from 'socket.io-client';
import { useContext } from 'react';
import { IoMdClose, IoMdExit } from 'react-icons/io';
import { IoEyeSharp } from 'react-icons/io5';
import { AddUser } from './popup/addUser';

export const MemberList = ({ ...props }) => {
  const { subscribeToNewMessage, chat, refetch } = props;

  const [usersInfo, setUsersInfo] = useState([]);
  const [timer, setTimer] = useState(0);
  const [userTo, setUserTo] = useState("");
  const [showTimer, setShowTimer] = useState(false);
  const [context, setContext] = useState("");
  

  const [showAdd, setShowAdd] = useState(false);
  const currentChat = useReactiveVar(currentChatVar);
  const currentLogin = useReactiveVar(currentLoginVar);
  const navigate = useNavigate();
  const socket: Socket = useContext(SocketGameContext);

  function toggleShowTimer() {
    setShowTimer(!showTimer);
  }

  function toggleShowAdd() {
    setShowAdd(!showAdd);
  }

  /* -------------------------------------------------------------------------- */
  /*                             Mutation and query                             */
  /* -------------------------------------------------------------------------- */

  const { loading, error } = useQuery(GET_USERS, {
    onCompleted: async (data) => {
      const users = data.user;
      const usersInfo = [];

      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const userInfo = {
          login: user.login,
          avatar: null,
          pseudo: user.pseudo,
        };

        try {
          const response = await axios.get(
            `http://localhost:3001/app/users/avatar/${user.login}`,
          );
          userInfo.avatar = response.data.avatar;
        } catch (error) {
          console.log(error);
        }
        usersInfo.push(userInfo);
      }
      setUsersInfo(usersInfo);
    },
  });

  const { data: infoUser, refetch: refetchInfoUser } = useQuery(GET_USER, {
    variables: {
      userID: currentLogin,
    },
  });


  const [addToChat] = useMutation(ADDTOCHAT, {
    onCompleted: async (data) => {
      refetch();
    },
  });
  const [promote] = useMutation(ADMIN, {
    onCompleted: async (data) => {
      refetch();
    },
  });
  const [mute] = useMutation(MUTE, {
    onCompleted: async (data) => {
      refetch();
    },
  });
  const [kick] = useMutation(KICK, {
    onCompleted: async (data) => {
      refetch();
    },
  });
  const [block] = useMutation(BLOCK_USER, {
    onCompleted: async (data) => {
      refetchInfoUser();
    },
  });

  // -------------------------------------------------------------------------- */

  if (loading) {
    return <>Loading...</>;
  }
  if (error) {
    return <>ERROR</>;
  }

  /* -------------------------------------------------------------------------- */

  function muteUser(login: string) {
    mute({
      variables: {
        uuid: currentChat.uuid,
        userID: login,
        duration: timer,
      },
    }).then(() => {
      toast.success('User has been muted', {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
      });
    }).catch((error) => {
      refetch();
    })
  }

  function kickUser(login: string) {
    kick({
      variables: {
        uuid: currentChat.uuid,
        userID: login,
        duration: timer,
      },
    }).then(() => {
      toast.success('User has been kicked', {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
      });
    }).catch((error) => {
      refetch();
    })
  }

  /* -------------------------------------------------------------------------- */


  function promoteUser(login: string) {
    promote({
      variables: {
        uuid: currentChat.uuid,
        userID: login,
      },
    }).then(() => {
      if (chat.adminID.includes(login)) {
        toast.success('User has been demoted', {
          position: 'top-center',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'colored',
        });
      } else {
        toast.success('User has been promoted', {
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
    });
  }

  function blockUser(login: string) {
    block({
      variables: {
        from: currentLogin,
        userID: login,
      },
    }).then(() => {
      if (infoUser.getByLogin.blackList.includes(login)) {
        toast.success('User has been unblocked', {
          position: 'top-center',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'colored',
        });
      } else {
        toast.success('User has been blocked', {
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
    });
  }

  /* -------------------------------------------------------------------------- */


  return (
    <>
      <Popup
        open={showTimer}
        onClose={() => setShowTimer(false)}
        position="top center"
        modal
        nested
      >
        <Card
          withBorder
          sx={{
            borderRadius: 15,
          }}
          style={{
            padding: 15,
            position: 'absolute',
            height: 120,
            width: 250,
          }}
        >
          <ActionIcon
            onClick={() => toggleShowTimer()}
            style={{
              position: 'absolute',
              top: 5,
              right: 5,
            }}
          ><IoMdClose size={15}></IoMdClose>
          </ActionIcon>

          <TextInput
            label="Time :"
            placeholder="in minutes.."
            onChange={(e) => setTimer(Number(e.target.value))}
          />
          <Button
            onClick={() => {
              if(context === "MUTE") {
                muteUser(userTo)
              } else {
                kickUser(userTo);
              }
            }
            }
          >Confirm</Button>
          <ToastContainer
            position='top-center'
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme='colored'
          />
        </Card>
      </Popup>

      <Popup
        open={showAdd}
        onClose={() => setShowAdd(false)}
        position="top center"
        modal
        nested
      >
        <AddUser toggleShow={toggleShowAdd} chat={chat} refetch={refetch}></AddUser>
      </Popup>

      <ScrollArea style={{ height: 450 }} scrollbarSize={8}>
        {usersInfo &&
          usersInfo
            .filter((userInfo) =>
              chat.type === 'private'
                ? chat.userID.includes(userInfo.login)
                : userInfo,
            )
            .map((userInfo, index) => (
              <Group key={index} id={'id' + index} style={{ padding: '5px' }}>
                <Popover position="bottom" withArrow shadow="md">
                  <Popover.Target>
                    <Group>
                      <Avatar
                        src={`data:image/jpeg;base64,${userInfo.avatar}`}
                      ></Avatar>
                      <Text>{userInfo.login}</Text>
                      {userInfo.login === chat.ownerID && (
                        <RiVipCrownFill color="orange"></RiVipCrownFill>
                      )}
                      {chat.adminID.includes(userInfo.login) && (
                        <MdGrade color="blue"></MdGrade>
                      )}
                    </Group>
                  </Popover.Target>

                  {userInfo.login !== currentLogin && (
                    <Popover.Dropdown>
                      {
                        chat.type !== 'dm' &&
                        userInfo.login !== chat.ownerID &&
                        (currentLogin === chat.ownerID ||
                          chat.adminID.includes(currentLogin)) && (
                          <>
                            <Group>
                              <ActionIcon
                                onClick={() => promoteUser(userInfo.login)}
                              >
                                <MdOutlineAdminPanelSettings
                                  size={20}
                                  color="blue"
                                ></MdOutlineAdminPanelSettings>
                              </ActionIcon>
                              {chat.adminID.includes(userInfo.login) ? (
                                <Text>Demote</Text>
                              ) : (
                                <Text>Promote</Text>
                              )}
                            </Group>

                            <Group>
                              <ActionIcon
                                onClick={() => {
                                  setContext("MUTE");
                                  setUserTo(userInfo.login);
                                  toggleShowTimer();
                                }}
                              >
                                {chat.getMute.find((elem) => elem.login === userInfo.login) ? (
                                  <MdVolumeMute size={20}></MdVolumeMute>
                                ) : (
                                  <BsFillVolumeMuteFill
                                    size={20}
                                    color="red"
                                  ></BsFillVolumeMuteFill>
                                )}
                              </ActionIcon>
                              {chat.getMute.find((elem) => elem.login === userInfo.login) ? (
                                <Text>Unmute</Text>
                              ) : (
                                <Text>Mute</Text>
                              )}
                            </Group>
                            <Group>
                              <ActionIcon
                                onClick={() => {
                                  setContext("BAN");
                                  setUserTo(userInfo.login);
                                  toggleShowTimer();
                                }}
                              >
                                <IoMdExit size={20} color="red"></IoMdExit>
                              </ActionIcon>
                              {chat.getBan.find((elem) => elem.login === userInfo.login) ? (
                                <Text>Unban</Text>
                              ) : (
                                <Text>Ban</Text>
                              )}
                            </Group>
                          </>
                        )}
                      <Group>
                        <ActionIcon
                          onClick={() => {
                            navigate('/UserProfile', {
                              state: { login: userInfo.login },
                            });
                          }}
                        >
                          <CgProfile size={20} color="Purple"></CgProfile>
                        </ActionIcon>
                        <Text>Profile</Text>
                      </Group>
                      <Group>
                        <ActionIcon
                          onClick={() => {
                            blockUser(userInfo.login);
                          }}
                        >
                          {infoUser.getByLogin.blackList.includes(
                            userInfo.login,
                          ) ? (
                            <BiBlock size={20}></BiBlock>
                          ) : (
                            <BiBlock size={20} color="red"></BiBlock>
                          )}
                        </ActionIcon>
                        {infoUser.getByLogin.blackList.includes(
                          userInfo.login,
                        ) ? (
                          <Text>Unblock</Text>
                        ) : (
                          <Text>Block</Text>
                        )}
                      </Group>
                      <Group>
                        <ActionIcon
                          onClick={() => {
                            socket.emit('Spec', userInfo.login);
                            socket.on('NoUserSpec', (data: string) => {
                              NotifyError(data);
                            });
                          }}
                        >
                          <IoEyeSharp size={20} color="Blue"></IoEyeSharp>
                        </ActionIcon>
                        <Text>Spectate</Text>
                      </Group>
                      <Group>
                        <ActionIcon
                          onClick={() => {
                            socket.emit('GameInvite', userInfo.login);
                            toast.success('User has been invited', {
                              position: 'top-center',
                              autoClose: 5000,
                              hideProgressBar: false,
                              closeOnClick: true,
                              pauseOnHover: true,
                              draggable: true,
                              progress: undefined,
                              theme: 'colored',
                            });
                            socket.on('NoUser', (data: string) => {
                              NotifyError(data);
                            });
                          }}
                        >
                          <BiGame size={20} color="Green"></BiGame>
                        </ActionIcon>
                        <Text>Invite to Game</Text>
                      </Group>
                      {!infoUser.getByLogin.friendList.includes(
                        userInfo.login,
                      ) && (
                          <Group>
                            <ActionIcon
                              onClick={() => {
                                toast.success(
                                  'User has been invited to be your friend',
                                  {
                                    position: 'top-center',
                                    autoClose: 5000,
                                    hideProgressBar: false,
                                    closeOnClick: true,
                                    pauseOnHover: true,
                                    draggable: true,
                                    progress: undefined,
                                    theme: 'colored',
                                  },
                                );
                                const target = userInfo.login;
                                const id = sessionStorage.getItem('currentUser');
                                console.log(
                                  `Sending invite from player ${id} to ${target}`,
                                );
                                axios.get(
                                  `http://localhost:3001/app/users/invite/${id}/${target}`,
                                );
                              }}
                            >
                              <AiOutlineUserAdd
                                size={20}
                                color="Green"
                              ></AiOutlineUserAdd>
                            </ActionIcon>
                            <Text>Add to friend</Text>
                          </Group>
                        )}
                    </Popover.Dropdown>
                  )}
                </Popover>
              </Group>
            ))}
      </ScrollArea>

      {currentChat.type === 'private' && (
        <Button
          style={{
            marginLeft: 10,
          }}
          onClick={() => {
            setShowAdd(true);
          }}
        >
          Add user
        </Button>
      )}

      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
};
