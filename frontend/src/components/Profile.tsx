import { useEffect, useState } from 'react';
import axios from 'axios';
import { DisplayErrors } from './DisplayErrors';
import { Card, Progress } from '@mantine/core';
import { AiFillEdit } from 'react-icons/ai';
import { MatchHistory } from './MatchHistory';
import { Switch2fa } from './Switch2fa';
import { useNavigate } from 'react-router-dom';

export const Profile = () => {
  const [avatar, setAvatar] = useState<string>();
  const [login, setLogin] = useState<string>();
  const [file, setFile] = useState<any>();
  const [errors, setErrors] = useState();
  const [playerData, setPlayerData] = useState<any>();
  const Navigate = useNavigate();

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
          setAvatar(res.data.avatar);
        })
        .catch((err) => {
          console.log(err);
        });
    };
    const handleProfile = async () => {
      const data = {
        id: Number.parseInt(sessionStorage.getItem('currentUser')),
        login: login,
      };
      await axios
        .post('http://localhost:3001/app/users/profile', data)
        .then((res) => {
          setErrors(null);
          setAvatar(res.data.avatar);
          console.log('this is player data', res.data);
          setPlayerData(res.data);
        })
        .catch((err) => {
          if (err) console.log(err);
        });
    };
    if (!sessionStorage.getItem('currentUser')) fetchUser();
    if (!avatar) fetchAvatar();
    if (!playerData) handleProfile();
  }, []);

  const handleChange = async (event: any) => {
    const file = event.target.files?.[0];
    setFile(file);
    const formData = new FormData();
    formData.append('user', sessionStorage.getItem('currentUser'));
    formData.append('file', file);
    await axios
      .post('http://localhost:3001/app/users/avatar', formData)
      .then((res) => {
        setAvatar(res.data?.avatar);
        window.location.reload();
      })
      .catch((err) => {
        console.log(err.response.data);
        setErrors(err.response.data);
      });
  };

  if (playerData === undefined) return <div>Loading...</div>;
  return (
    <Card shadow="sm" p="lg" radius="md" className="card" withBorder>
      <h1 className="card-title text-center">Profile</h1>
      <div className="card-profile">
        <div className="profile-pic">
          <label className="-label" htmlFor="file">
            <AiFillEdit className="edit-icon-react"></AiFillEdit>
          </label>
          <input id="file" type="file" onChange={handleChange} />
          <img
            alt="avatar"
            src={`data:image/jpeg;base64,${playerData.avatar}`}
            id="output"
            width="200"
          />
        </div>
        <div className="user-info">
          <h2>{playerData.pseudo}</h2>
        </div>
      </div>

      <ul className="match-list">
        <MatchHistory />
      </ul>
      <div>
        <Switch2fa />
      </div>
      <DisplayErrors errors={errors} />
    </Card>
  );
};
