import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DisplayErrors } from './DisplayErrors';
import { ReactNotifications, Store } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';
import { NotifyError } from '../App';

export const SignIn = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState();

  const navigate = useNavigate();
  const handleSubmit = async (event: any) => {
    event.preventDefault();
    console.log();
    const formData = new FormData(event.currentTarget);
    const form = {
      login: formData.get('login'),
      password: formData.get('password'),
    };
    
    axios
      .post('http://localhost:3001/app/auth/signin', form, {
        headers: {},
      })
      .then((response) => {
        console.log('response = ', response);
        document.cookie = response.data.cookie;
        console.log('token = ', response.data.cookie);
        sessionStorage.setItem('currentUser', response.data.user.id);
        console.log(response.data.fLog);
        if (response.data.user.has2fa) navigate('/Code2FA');
        else if (response.data.fLog) navigate('/FirstLog');
        else navigate('/CoPage');
        window.location.reload();
      })
      .catch((err) => {
        NotifyError('Invalid credentials');
      });
  };

  return (
    <div>
      <ReactNotifications />
      <div className="flex-container">
        <div>
          <h1 className="text-center">SIGNIN</h1>
          <form onSubmit={handleSubmit}>
            <div className="mc-menu">
              <input
                className="mc-button full"
                required
                type="text"
                name="login"
                placeholder="login"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
              />
              <input
                className="mc-button full"
                required
                type="password"
                name="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button className="mc-button test">SUBMIT</button>
            </div>
            <div className="text-center">
              <DisplayErrors errors={errors} />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
