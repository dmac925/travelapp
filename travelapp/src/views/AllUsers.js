import React, { useState, useEffect } from 'react'
import axios from "axios"
import { URL } from "../config";


function AllUsers() {

  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `${URL}/users/`
        );
        setUsers(response);

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUsers()
  }, [] )


  return (

    <div>
      <h3>All Users</h3>

      <div>
  {users?.data?.map((user, index) => (
    <div key={index} className="user-card">
      <h4>{user.email}</h4>
    </div>
  ))}
</div>
</div>
  )

}

export default AllUsers