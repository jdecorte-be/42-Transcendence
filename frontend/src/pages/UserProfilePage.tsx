import Nav from '../components/NavBar';
import { UserProfile } from '../components/UserProfile';

function UserProfilePage(props:any) {

  return (
    <div>
        <Nav />
        <UserProfile />
    </div>
  )
}

export default UserProfilePage;