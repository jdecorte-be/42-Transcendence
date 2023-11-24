import React, { useState, useEffect } from 'react';
import axios from 'axios';

export const Switch2fa = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [has2FA, setHas2FA] = useState(false);
  useEffect(() => {
    const fetchUser = async () => {
      await axios
        .get(`http://localhost:3001/app/auth/fetchUser`, {
          headers: { Authorization: `${document.cookie}` },
        })
        .then((res) => {
          console.log(res);
          console.log(res.data.has2fa, typeof res.data.has2fa);
          if (res.data.has2fa === true) {
            setHas2FA(true);
          }
          sessionStorage.setItem('currentUser', res.data.id);
        });
      console.log('NOW: ', sessionStorage.getItem('currentUser'));
    };
    fetchUser();
  }, []);

  const handleClick = async (event: any) => {
    event.preventDefault();
    await axios
      .get(
        `http://localhost:3001/app/users/switch2fa/${sessionStorage.getItem(
          'currentUser',
        )}`,
      )
      .then((res) => {
        console.log(res.data);
        setIsEnabled(!isEnabled);
        window.location.reload();
      })
      .catch((err) => {
        console.error(err.response.data);
      });
  };

  if (!has2FA) {
    return (
      <div className="center">
        <div style={{ color: 'white' }}>
          <button className="mc-button fa" onClick={handleClick}>
            {'Enable 2FA'}
          </button>
        </div>
      </div>
    );
  } else {
    return (
      <div className="center">
        <div style={{ color: 'white' }}>
          <button className="mc-button fa" onClick={handleClick}>
            {'Disable 2FA'}
          </button>
        </div>
      </div>
    );
  }
};
