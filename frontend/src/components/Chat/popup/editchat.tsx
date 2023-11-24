
import { useQuery, useLazyQuery, useMutation, useReactiveVar } from '@apollo/client';
import { ActionIcon, Alert, Button, Card, Center, PasswordInput, TextInput, Text, SegmentedControl } from '@mantine/core';
import { height } from '@mui/system';
import { useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import { ADD_MESSAGE, CHECK_PASSWORD, UPDATE_CHAT } from '../query/query';
import { currentChatVar } from '../../../apollo/apolloProvider';
import { ToastContainer, toast } from 'react-toastify';



export const EditChat = ({ toggleEdit, refetch }: any) => {
  const [enterPassword, setEnterPassword] = useState('');
  const currentChat = useReactiveVar(currentChatVar);

  const [enterName, setEnterName] = useState(currentChat.name);
  const [type, setType] = useState(currentChat.type);

  /* -------------------------------------------------------------------------- */
  /*                             Mutation and query                             */
  /* -------------------------------------------------------------------------- */
  const [update_chat] = useMutation(UPDATE_CHAT, {
    onCompleted: () => {
      refetch()
    },
  });



  return (
    <Card
      withBorder
      sx={{
        borderRadius: 15,
      }}
      style={{
        padding: 15,
        position: 'absolute',
        width: 250,
      }}
    >
      <ActionIcon
        onClick={() => toggleEdit()}
        style={{
          position: 'absolute',
          top: 5,
          right: 5,
        }}
      ><IoMdClose size={15}></IoMdClose>
      </ActionIcon>
      <TextInput
        placeholder="group name.."
        label="Group name"
        variant="filled"
        onChange={e => setEnterName(e.target.value)}
        defaultValue={currentChat.name}
      />
      <PasswordInput
        label="Password :"
        placeholder="your password.."
        onChange={e => setEnterPassword(e.target.value)}
      />
      <SegmentedControl
        style={{
          marginTop: 10
        }}
        value={type}
        onChange={setType}
        data={[
          { label: 'Public', value: 'public' },
          { label: 'Private', value: 'private' },
        ]}
      />

      <Button
        style={{
          marginLeft: 10
        }}
        onClick={() => {
          if(enterName.length > 15) {
            toast.error('Group name is too long', {
              position: 'top-center',
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: 'colored',
            });
            return;
          }
          update_chat({
            variables: {
              newinfo: {
                uuid: currentChat.uuid,
                name: enterName,
                type: type,
                password: enterPassword
              }
            }
          }).then(() => {
            toggleEdit();
          }).catch((error) => {
            console.log(error);
          })
        }
        }
      >Edit</Button>
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
  )
}