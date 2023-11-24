import React, { useState, useEffect } from 'react';
import axios from 'axios';

export const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const result = await axios.get(
        'http://localhost:3001/app/users/leaderboard',
      );
      setLeaderboard(result.data);
    }
    fetchData();
  }, []);

  return (
    <div className="leaderboard">
        <ol>
          {leaderboard && leaderboard.map((item) => (
            <li key={item[0]}><span>{item[2]} {item[0]}</span>
                Victories : {item[1]} l Loses : {item[3]} 
            </li>
          ))}
        </ol>
    </div>
  );
};