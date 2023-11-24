import { useDisclosure, useCounter } from '@mantine/hooks';
import { Modal, Button, Group, Text, Badge, Title, Center } from '@mantine/core';
import { useEffect } from 'react';
import { useState } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
// import {game} from '../App';
import { ReactNotifications, Store } from 'react-notifications-component'
import 'react-notifications-component/dist/theme.css'
import { ToastContainer, toast } from 'react-toastify';
import { NotifyError } from '../App';
import { Socket } from "socket.io-client";
import { SocketGameContext } from "../socketManager";
import { useContext } from "react";


function InviteModal () {

  const [opened, { open, close }] = useDisclosure(false);
  const [Name , setName] = React.useState('');
  const [Invite, setInvite] = React.useState(false);
  const Navigate = useNavigate();
  const socket: Socket = useContext(SocketGameContext);

  function Yes() {
    close();
    socket.emit('AcceptInvite', Name);
  }

  function No() {
    close();
    socket.emit('RefuseInvite', Name);
  }

  useEffect(() => {
      socket.on('Waiting Room', () => {
          Navigate('/RoomWaiting');
      });
      socket.on('AlreadyConnected', () => {
        console.log("Disconnect");
        Navigate("/");
      });
      socket.on('Ready', () => {
        Navigate('/Game');
      });
      socket.on('InviteToGame', (data:any) => {
          setInvite(true);
          setName(data);
          open();
      });
      socket.on('RefuseToGame', (data:any) => {
          setInvite(false);
          setName('');
          NotifyError(`${data} refuse to play with you`);
          Navigate('/HomePage');
      });
      socket.on('SpectateReady', () => {
            Navigate('/Spectate');
      });
      socket.on('RemovePlayer', () => {
        document.cookie = "";
        sessionStorage.removeItem('currentUser');
        Navigate('/');
      });
      socket.on('Berror', (data:any) => {
        NotifyError(data);
      });
      return () => {
        socket.off('Waiting Room');
        socket.off('InviteToGame');
        socket.off('RefuseToGame');
        socket.off('Ready');
        socket.off('SpectateReady');
        socket.off('AlreadyConnected');
      }
  }, []);
  
  return (
    <div>
      <Modal opened={opened} onClose={() => No()} size='auto' title="Invitation" centered closeOnClickOutside={false} closeOnEscape={false} withCloseButton={false}>
        <title>Invite</title>
        <Text >Do you want to play a game with {Name} ?</Text>
        <Group position="center" mt="md">
          <Button variant='outline' onClick={Yes}>Accept</Button>
          <Button variant='outline' onClick={No}>Refuse</Button>
        </Group>
      </Modal>
    </div>
  );
}


export {InviteModal};

