import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Navbar, Nav } from 'react-bootstrap';

const MyNavbar = ({ isLoggedIn, isAdmin, logout }) => {

    let navigate = useNavigate();

    return (
      <Navbar className="custNav" bg="light" expand="lg">
        <Navbar.Brand></Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            {!isLoggedIn && (
              <>
                <Nav.Link><NavLink to="/home">Home</NavLink></Nav.Link>
                <Nav.Link><NavLink to="/register">Register</NavLink></Nav.Link>
          
              </>
            )}
            {isLoggedIn && (
              <>
                <Nav.Link><NavLink to="/hotelResults">Hotels</NavLink></Nav.Link>
                <Nav.Link><NavLink to="/hotelListPage">Hotels</NavLink></Nav.Link>
              </>
            )}
            {isLoggedIn && isAdmin && (
              <>
                <Nav.Link><NavLink to="/allTasks">All Tasks</NavLink></Nav.Link>
                <Nav.Link><NavLink to="/allUsers">All Users</NavLink></Nav.Link>
              </>
            )}
          </Nav>
          <Nav className="ml-auto">
            {isLoggedIn ? (
              <Nav.Link onClick={() => { logout(); navigate("/home"); }}>Logout</Nav.Link>
            ) : (
              <Nav.Link><NavLink to="/login">Login</NavLink></Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  };


export default MyNavbar;
