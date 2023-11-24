import { Card } from '@mantine/core';
import { Leaderboard } from '../components/Leaderboard';
import Nav from '../components/NavBar';
import "../assets/Leadb.css"

function LeaderboardPage() {
      return (
        <div>
        <Nav/>
          <Card shadow="sm" p="lg" radius="md" className='card' withBorder>
            <h1 className="card-title text-center">Leaderboard</h1>
          <Leaderboard />
           </Card>
      </div>
  )
}

export default LeaderboardPage;