import { Card } from '@mantine/core';
import React, { useEffect } from 'react';
import Nav from '../components/NavBar';
import axios from 'axios';
import "../assets/Leadb.css"
import { MatchHistory } from '../components/MatchHistory';

function MatchHistoryPage() {
  return (
    <div>
        <Nav/>
        <Card shadow="sm" p="lg" radius="md" className='card' withBorder>
          <h1 className="card-title text-center">Match History</h1>
          <MatchHistory/>
        </Card>
    </div>
  )
}

export default MatchHistoryPage;