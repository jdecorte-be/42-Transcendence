import React from 'react';
import { Route, Routes } from 'react-router-dom';
import ConnectionPage from '../pages/ConnectionPage';
import LeaderboardPage from '../pages/LeaderboardPage';
import LobbyPage from '../pages/LobbyPage';
import GamePage from '../pages/GamePage';
import RoomWaiting from '../pages/RoomWaiting';
import SpectatePage from '../pages/SpectatePage';
import { GameWon } from '../pages/GameResult';
import { GameLost } from '../pages/GameResult';
import HomePage from '../pages/HomePage';
import ProfilePage from '../pages/ProfilePage';
import SignUpPage from '../pages/SignUpPage';
import SignInPage from '../pages/SignInPage';
import CreateLobbyPage from '../pages/CreateLobby';
import CoPage from '../pages/CoPage';
import SettingsPage from '../pages/SettingsPage';
import { SpectateResult } from '../pages/GameResult';
import { Disconnected } from '../pages/GameResult';
import MatchHistoryPage from '../pages/MatchHistoryPage';
import FirstLogPage from "../pages/FirstLogPage";
import UserProfilePage from '../pages/UserProfilePage';
import FriendListPage from '../pages/FriendListPage';
import Code2FAPage from '../pages/Code2FAPage';


function Pathing(){
    return (
        <Routes>
            <Route path='/Game' element={<GamePage/>}/>
            <Route path='/CoPage' element={<CoPage/>}/>
            {/* <Route path='/' element={<ConnectionPage/>}/> */}
            <Route path='/Lobby' element={<LobbyPage/>}/>
            <Route path='/GameWon' element={<GameWon Winner={''} Loser={''} scoreX={0} scoreY={0} date={undefined}/>}/>
            <Route path='/HomePage' element={<HomePage/>}/>
            <Route path='/GameLost' element={<GameLost Winner={''} Loser={''} scoreX={0} scoreY={0} date={undefined}/>}/>
            <Route path='/SignUp' element={<SignUpPage/>}/>
            <Route path='/SignIn' element={<SignInPage/>}/>
            <Route path='/Profile' element={<ProfilePage/>}/>
            <Route path='/Spectate' element={<SpectatePage/>}/>
            <Route path='/Settings' element={<SettingsPage/>}/>
            <Route path='/RoomWaiting' element={<RoomWaiting/>}/>
            <Route path='/Leaderboard' element={<LeaderboardPage/>}/>
            <Route path='/CreateLobby' element={<CreateLobbyPage/>}/>
            <Route path='/SpectateResult' element={<SpectateResult Winner={''} Loser={''} scoreX={0} scoreY={0} date={undefined}/>}/>
            <Route path='/Disconnected' element={<Disconnected/>}/>
            <Route path='/MatchHistory' element={<MatchHistoryPage/>}/>
            <Route path='/FirstLog' element={<FirstLogPage/>}/>
            <Route path='/UserProfile' element={<UserProfilePage name={""}/>}/>
            <Route path='/FriendList' element={<FriendListPage/>}/>
            <Route path='/Code2FA' element={<Code2FAPage/>}/>
        </Routes>
    )
}
export default Pathing;
