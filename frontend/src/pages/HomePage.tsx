import { Link, useLocation, useNavigate } from 'react-router-dom';
import React, { useEffect } from 'react';
import Navb from '../components/NavBar';
import Nav from 'react-bootstrap/Nav';
//import {game} from '../App';
import { InviteModal } from '../assets/modal';
import axios from 'axios';

const HomePage = () => {
  return (
    <div>
      <Navb />
      <div className="flex-container">
        <div className="mc-menu">
          <div className="mc-button full">
            <Nav.Link as={Link} to="/Lobby" className="title">
              Play
            </Nav.Link>
          </div>
          <div className="mc-button full">
            <Nav.Link as={Link} to="/Profile" className="title">
              Profile
            </Nav.Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
