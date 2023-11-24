import { Card } from '@mantine/core';
import Nav from './NavBar';
import "../assets/Leadb.css"
import { useState } from 'react';
import axios from 'axios';
import { useEffect } from 'react';
import { MatchHistoryDto } from '../dto/dto';


export const MatchHistory = () => {

    const [MatchHistory, setMatchHistory] = useState(null);

    useEffect(() => {
      async function fetchData() {
        const result = await axios.get(
          `http://localhost:3001/app/users/matchHistory/${sessionStorage.getItem('currentUser')}`,
        );
        setMatchHistory(result.data);
      }
      fetchData();
    }, []);


    return (
        <div className="leaderboard">
            <ol>
                {MatchHistory && MatchHistory.map((item, i) => (
                <li className="match-list" key={i}>
                  <span className="team-name">{item.Winner}</span>
                  <span className='team-score win'>{item.scoreX}</span>
                  <span className="vs">vs</span>
                  <span className='team-score lose'>{item.scoreY}</span>
                  <span className="team-name">{item.Loser}</span>
                </li>
                ))}
            </ol>
        </div>
    )
  }