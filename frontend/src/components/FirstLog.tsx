import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { NotifyError } from '../App';
import { Switch2fa } from './Switch2fa';

export function FirstLog() {
  const [pseudo, setPseudo] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    const urlParams = new URLSearchParams(location.search);
    const userId = urlParams.get('id');
    if (userId) {
      sessionStorage.setItem('currentUser', userId);
      axios
        .get(`http://localhost:3001/app/auth/jwt/${userId}`)
        .then((res) => {
          document.cookie = res.data;
        })
        .catch((err) => {
          console.log(err);
        });
    }
    const formData = new FormData(event.currentTarget);
    const form = {
      pseudo: formData.get('pseudo'),
      id: sessionStorage.getItem('currentUser'),
    };
    axios
      .post('http://localhost:3001/app/auth/firstlog', form, {
        headers: {},
      })
      .then((response) => {
        navigate('/CoPage');
        window.location.reload();
      })
      .catch((err) => {
        NotifyError('Pseudo already taken or invalid');
      });
  };

  return (
    <div>
      <div className="flex-container">
        <div>
          <h1 className="text-center">First Log</h1>
          <form onSubmit={handleSubmit}>
            <div className="mc-menu">
              <input
                className="mc-button full"
                required
                type="text"
                name="pseudo"
                maxLength={15}
                placeholder="Choose your username (visible to other users)"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
              />
            </div>
            <button className="mc-button test">SUBMIT</button>
          </form>
        </div>
      </div>
    </div>
  );
}
