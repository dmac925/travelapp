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
                <Nav.Link><NavLink to="/myTasks">My Tasks</NavLink></Nav.Link>
                <Nav.Link><NavLink to="/myItems">My Shopping List</NavLink></Nav.Link>
                <Nav.Link><NavLink to="/myTasksTable">My Tasks Table</NavLink></Nav.Link>
                <Nav.Link><NavLink to="/addTask">Add Task</NavLink></Nav.Link>
                <Nav.Link><NavLink to="/userInput">User Input</NavLink></Nav.Link>
                <Nav.Link><NavLink to="/addItem">Add Item</NavLink></Nav.Link>
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
