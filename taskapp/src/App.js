import './App.css';
import React, { useState, useEffect, createContext } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { URL } from "./config";
import * as jose from "jose";
import Navbar from "./components/Navbar.js";
import Home from "./views/Home";
import AllTasks from './views/AllTasks';
import AddTask from './views/AddTask';
import AddItem from './views/AddItem';
import AllUsers from './views/AllUsers';
import Register from './views/Register';
import Login from './views/Login';
import MyTasks from './views/MyTasks';
import MyItems from './views/MyItems';
import UserInput from './views/UserInput';
import MyTasksTable from './views/MyTasksTable';
import UserContext from './UserContext';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [isAdmin, setIsAdmin] = useState(null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [token, setToken] = useState(JSON.parse(localStorage.getItem("token")));
  const [userID, setUserID] = useState(null);

  useEffect(() => {
    const verify_token = async () => {
      try {
        if (!token) {
          setIsLoggedIn(false);
          setUserID(null);
        } else {
          axios.defaults.headers.common["Authorization"] = token;
          const response = await axios.post(`${URL}/users/verify_token`);
          if (response.data.ok) {
            let decodedToken = jose.decodeJwt(token);
            setUserID(decodedToken?.userId);
            login(token);
          } else {
            logout();
          }
        }
      } catch (error) {
        console.log(error);
      }
    };
    verify_token();
  }, [token]);

  const login = (token) => {
    let decodedToken = jose.decodeJwt(token);
    let user = {
      email: decodedToken.userEmail,
      admin: decodedToken.userAdmin
    };
    localStorage.setItem("token", JSON.stringify(token));
    localStorage.setItem("user", JSON.stringify(user));
    setIsLoggedIn(true);
    setIsAdmin(decodedToken.userAdmin);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserID(null);
  };



  return (
    <div className="App">
  <UserContext.Provider value={{ userID }}>
<Router>
<Navbar isLoggedIn={isLoggedIn} isAdmin={isAdmin} logout={logout} />
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/myTasks" />
            ) : (
              <Login login={login} />
            )
          }
        />
        <Route
          path="/register"
          element={isLoggedIn ? <Navigate to="/myTasks" /> : <Register />}
        />

        <Route path ="/addTask" element={<AddTask />} />
        <Route path ="/addItem" element={<AddItem />} />
        <Route path ="/userInput" element={<UserInput />} />
          <Route path ="/allTasks" element={<AllTasks />} />
          <Route path ="/myTasks" element={<MyTasks />} />
          <Route path ="/myItems" element={<MyItems />} />
          <Route path ="/myTasksTable" element={<MyTasksTable />} />
          <Route path ="/register" element={<Register />} />
          <Route path ="/login" element={<Login />} />
          <Route path="/allUsers" element={isAdmin ? <AllUsers /> : <Navigate to="/login" />} />
      
      </Routes>
    </Router>
    </UserContext.Provider>
    </div>
  );
}

export default App;
