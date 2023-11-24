import { gql, useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { TextInput, Checkbox, Button, Group, Box, SegmentedControl, PasswordInput, Loader, ActionIcon, Card } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { CREATE_CHAT, GET_CHATS } from '../query/query';
import { IoMdClose } from 'react-icons/io';


import { ToastContainer, toast } from 'react-toastify';
import { currentLoginVar } from '../../../apollo/apolloProvider';

export const CreateChat = ({ toggleShowCreate, refetch }: any) => {

  const [groupname, setGroupName] = useState('');
  const [type, setType] = useState('public');
  const [password, setPassword] = useState('');
  const currentLogin = useReactiveVar(currentLoginVar);

  const [createChat] = useMutation(CREATE_CHAT, {
    onCompleted: () => {
      refetch();
    }
  });


  const onClickCreateChat = () => {
    if (groupname.length >= 15) {
      toast.error('Group name is too long!', {
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
    createChat({
      variables: {
        newChat: { name: groupname, type: type, password: password, ownerID: currentLogin, userID: [currentLogin] },
      }
    }).then(({ data }) => {
      toast.success('Group as been created', {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        });
      toggleShowCreate()
    })
      .catch(e => {
        console.log(e);
        if (groupname === "") {
          toast.error('Missing group name!', {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
            });
        }
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
        onClick={() => toggleShowCreate()}
        style={{
          position: 'absolute',
          top: 5,
          right: 5,
        }}
      ><IoMdClose size={15}></IoMdClose>
      </ActionIcon>

      <TextInput
        withAsterisk
        label="Chat name"
        placeholder="my chat name.."
        onChange={e => setGroupName(e.target.value)}
      />
      <PasswordInput
        value={password}
        onChange={e => setPassword(e.target.value)}
        label="Password"
        placeholder="password.."
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
          marginLeft: 10,
        }}
        onClick={() => onClickCreateChat()}>Add</Button>

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