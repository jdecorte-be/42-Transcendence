import { useQuery, useLazyQuery } from '@apollo/client';
import { ActionIcon, Alert, Button, Card, Center, PasswordInput, TextInput } from '@mantine/core';
import { useRef, useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import { CHECK_PASSWORD } from '../query/query';
import { ToastContainer, toast } from 'react-toastify';



export const AskPassword = ({ togglePassword, toggleShowMessages, uuid }: any) => {
  const inputRef = useRef<HTMLInputElement>();

  const [check_password] = useLazyQuery(CHECK_PASSWORD, {
    fetchPolicy: 'network-only',
    onCompleted: async (data) => {
      if (data && data.checkChatPassword === true) {
        toggleShowMessages();
        togglePassword();
        toast.success('Password is correct', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        })
      } else {
        toast.error('Wrong password', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        })
      }
    }
  });


  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      checkPassword();
    }
  };

  const checkPassword = () => {
    check_password({ variables: { uuid: uuid, pass: inputRef.current.value }})
  };

  return (
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
        onClick={() => togglePassword()}
        style={{
          position: 'absolute',
          top: 5,
          right: 5,
        }}
      ><IoMdClose size={15}></IoMdClose>
      </ActionIcon>

      <PasswordInput
        label="Password :"
        placeholder="your password.."
        ref={inputRef}
        onKeyPress={(e) => handleKeyPress(e)}
      />
      <Button
        onClick={() => checkPassword()}
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
  )
}