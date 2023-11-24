import {
  ActionIcon,
  Box,
  Card,
  CloseButton,
  Switch,
  Text,
} from '@mantine/core';
import { CreateChat } from './popup/createChat';
import { ListChat } from './listChat';
import { useEffect, useRef, useState } from 'react';
import { useQuery, useReactiveVar } from '@apollo/client';
import { GET_CHATS, MESSAGE_ADDED_SUBSCRIPTION } from './query/query';
import { AskPassword } from './popup/askPassword';
import { MoodHappy, Send } from 'tabler-icons-react';
import { Fade, FormControlLabel, Modal } from '@mui/material';
import Popup from 'reactjs-popup';
import axios from 'axios';
import {
  currentAvatarVar,
  currentChatVar,
  currentLoginVar,
  currentUsernameVar,
} from '../../apollo/apolloProvider';
import { useNavigate } from 'react-router-dom';
import { socket } from '../../contexts/WebsocketContext';

export const Chat = () => {
  const [showCreateChat, setShowCreateChat] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [errors, setErrors] = useState();
  const currentLogin = useReactiveVar(currentLoginVar);
  const currentAvatar = useReactiveVar(currentAvatarVar);
  const Navigate = useNavigate();

  console.warn = () => {};

  useEffect(() => {
    const fetchUser = async () => {
      await axios
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
          currentAvatarVar(res.data.avatar);
          currentLoginVar(res.data.login);
          currentUsernameVar(res.data.pseudo);
        })
        .catch((err) => {
          console.log(err);
        });
    };
    if (!sessionStorage.getItem('currentUser')) fetchUser();
    if (!currentAvatar) {
      fetchAvatar();
    }
  }, []);

  function toggleShowChat() {
    if (showChat) setShowChat(false);
    else setShowChat(true);
  }

  function toggleShowCreate() {
    if (showCreateChat) setShowCreateChat(false);
    else setShowCreateChat(true);
  }

  const { data: chat_list, refetch } = useQuery(GET_CHATS, {
    variables: {
      userID: currentLogin,
      type: 'public',
    },
    fetchPolicy: 'network-only',
  });

  return (
    <>
      {showChat ? (
        <Fade in={showChat}>
          <Card
            withBorder
            sx={(theme) => ({
              minWidth: 300,
              maxWidth: 500,
              height: 600,
              backgroundColor:
                theme.colorScheme === 'dark'
                  ? theme.colors.dark[6]
                  : theme.colors.gray[0],
              borderRadius: 15,
              position: 'absolute',
              bottom: 40,
              right: 40,
              zIndex: 10,
            })}
          >
            <CloseButton
              size={20}
              onClick={() => toggleShowChat()}
              style={{
                top: 15,
                right: 15,
                position: 'absolute',
              }}
            />

            <div>
              <Popup
                open={showCreateChat}
                onClose={() => setShowCreateChat(false)}
                position="top center"
                nested
                modal
              >
                <CreateChat
                  toggleShowCreate={toggleShowCreate}
                  refetch={refetch}
                ></CreateChat>
              </Popup>

              <ListChat
                toggleShowCreate={toggleShowCreate}
                chat_list={chat_list}
                refetch={refetch}
              >
                <AskPassword></AskPassword>
              </ListChat>
            </div>
          </Card>
        </Fade>
      ) : (
        <ActionIcon
          onClick={() => toggleShowChat()}
          style={{
            height: 80,
            width: 80,
            position: 'absolute',
            alignItems: 'center',
            bottom: 40,
            right: 40,
          }}
          color="teal"
          radius="xl"
          variant="filled"
        >
          <Send size={30} />
        </ActionIcon>
      )}
    </>
  );
};
