import React from 'react';
import { useRef } from 'react';
import { Container } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Route, Routes, Link, Router } from 'react-router-dom';
import SignIn from './SignInPage';

const Search = () => {
  return (
    <div className="mc-menu">
      <div className="mc-button full">
        <Nav.Link as={Link} to="/SignIn" className="title">
          Login
        </Nav.Link>
      </div>
      <div className="mc-button full">
        <Nav.Link as={Link} to="/SignUp" className="title">
          SignUp
        </Nav.Link>
      </div>
      <div className="mc-button full">
        <Nav.Link href="http://localhost:3001/app/auth" className="title">
          Login with 42
        </Nav.Link>
      </div>
    </div>
  );
};

export default Search;
