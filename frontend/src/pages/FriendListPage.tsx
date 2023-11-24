import { Card } from '@mantine/core';
import Nav from '../components/NavBar';
import '../assets/Leadb.css';
import { FriendList } from '../components/FriendList';

function FriendListPage() {
  return (
    <div>
      <Nav />
      <Card shadow="sm" p="lg" radius="md" className="card" withBorder>
        <h1 className="card-title text-center">Friends</h1>
        <FriendList />
      </Card>
    </div>
  );
}

export default FriendListPage;
