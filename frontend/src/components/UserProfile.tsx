import React from 'react';
import { useState } from 'react';
import axios from 'axios';
import { useEffect } from 'react';
import { useLocation } from "react-router-dom";
import { Card} from '@mantine/core';
import { FcCheckmark} from 'react-icons/fc';
import { RxCross1 } from 'react-icons/rx';
import { useNavigate } from 'react-router-dom';


export const UserProfile = () => {

    const [avatar, setAvatar] = useState<string>();
    const [playerData, setPlayerData] = useState<any>();
    const Navigate = useNavigate();

    const location = useLocation();
    const log = location.state.login;

    useEffect(() => {
        const fetchAvatar = async () => {
            await axios
                .get(
                    `http://localhost:3001/app/users/userprofile/${log}`,
                )
                .then((res) => {
                    setPlayerData(res.data);
                }
                )
                .catch((err) => {
                  if (err.response.status === 401 || err.response.status === 403) {
                    sessionStorage.clear();
                    console.log(2);
                    Navigate('/Disconnected');
                    window.location.reload();
                  }
                }
                );
        };
        if (!avatar)
            fetchAvatar();
    }, [avatar, playerData, log]);
    if (playerData === undefined)
        return <div>Loading...</div>;
    return (
        <Card shadow="sm" p="lg" radius="md" className='card' withBorder>
          <h1 className="card-title text-center">Profile</h1>
          <div className='card-profile'>
            <div className="profile-pic">
            <div className="-label">
              <img src={`data:image/jpeg;base64,${playerData.avatar}`} id="output" width="200" />
            </div>
            </div>
            <div className="user-info">
              <h2>{playerData.pseudo} {playerData.status === 'online' ? <FcCheckmark> Online </FcCheckmark> : <RxCross1 color='red'> Offline </RxCross1>}</h2>
            </div>
          </div>
          </Card>)
}