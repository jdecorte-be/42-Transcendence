import { gql, useMutation, useQuery } from '@apollo/client';
import { TextInput, Checkbox, Button, Group, Box, SegmentedControl, PasswordInput, Loader, ActionIcon, Card } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { IoMdClose } from 'react-icons/io';


import { ToastContainer, toast } from 'react-toastify';

export const AddDm = ({ toggleShow }: any) => {



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
        // onChange={e => setGroupName(e.target.value)}
      />

      <Button
        style={{
          marginLeft: 10,
        }}>Add
        </Button>

      {/* <ToastContainer
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
      /> */}
    </Card>
  );
}