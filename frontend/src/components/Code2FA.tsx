import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DisplayErrors } from './DisplayErrors';
import { NotifyError } from '../App';

export const Code2FA = () => {
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState();
  const navigate = useNavigate();

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const form = {
      code: formData.get('code'),
    };
    axios
      .post(
        `http://localhost:3001/app/auth/code/${sessionStorage.getItem(
          'currentUser',
        )}`,
        form,
        {
          headers: { Authorization: document.cookie },
        },
      )
      .then((res) => {
        console.log(res);
        navigate('/CoPage');
      })
      .catch((err) => {
        console.log(err);
        navigate('/Code2FA');
        NotifyError('Invalid code');
      });
  };

  return (
    <div>
      <div className="flex-container">
        <div>
          <h1 className="text-center">2FA CHECK</h1>
            <form onSubmit={handleSubmit}>
            <div className="mc-menu">
                <input
                  className="mc-button full"
                  type="text"
                  name="code"
                  placeholder="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
              <button className="mc-button full " type="submit">SUBMIT</button>
              <div className="text-center">
                <DisplayErrors errors={errors} />
              </div>
            </form>
          </div>
        </div>
      </div>
  );
};
