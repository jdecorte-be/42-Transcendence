import { gql, useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { TextInput, Checkbox, Button, Group, Box, SegmentedControl, PasswordInput, Loader, ActionIcon, Card } from '@mantine/core';
import { IoMdClose } from 'react-icons/io';
import { ToastContainer, toast } from 'react-toastify';
import { ADDTOCHAT } from '../../query/query';
import axios from 'axios';
import { currentChatVar } from '../../../../apollo/apolloProvider';
import { useState } from 'react';

export const AddUser = ({ toggleShow, chat, refetch }: any) => {

    const currentChat = useReactiveVar(currentChatVar);
    const [add, setAdd] = useState('');


    const [addToChat] = useMutation(ADDTOCHAT, {
        onCompleted: async (data) => {
          refetch();
        }
      });

    function addUser(login: string) {
        if (chat.userID.includes(login)) {
          toast.error('User is already added!', {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
          });
          return;
        }
        axios.get(`http://localhost:3001/app/users/avatar/${login}`).then(response => {
          addToChat({
            variables: {
              uuid: currentChat.uuid,
              userID: login,
            }
          }).then(() => {
            toast.success('User has been added to chat', {
              position: 'top-center',
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: 'colored',
            });
            toggleShow();
          }).catch((error) => {
            toast.error('User can\'t be add', {
              position: 'top-center',
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: 'colored',
            });
          })
        }).catch((error) => {
          toast.error('User don\'t exist', {
            position: 'top-center',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'colored',
          });
        })
      }

  return (
    <Card
      withBorder
      sx={{
        borderRadius: 15,
      }}
      style={{
        padding: 15,
        position: 'absolute',
        width: 250
      }}
    >
      <ActionIcon
        onClick={() => toggleShow()}
        style={{
          position: 'absolute',
          top: 5,
          right: 5,
        }}
      ><IoMdClose size={15}></IoMdClose>
      </ActionIcon>

      <TextInput
        withAsterisk
        label="Username"
        placeholder="username to add.."
        onChange={e => setAdd(e.target.value)}
      />

      <Button
        style={{
          marginLeft: 10,
        }}
        onClick={() => addUser(add)}
        >Add
        </Button>

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
    </Card>
  );
}