import React, { useState, useEffect, useContext } from 'react';
import axios from "axios";
import { TaskCard } from './TaskCard';
import { URL } from "../config";
import UserContext from '../UserContext';



function MyTasks() {

  const [tasks, setTasks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('')
  const [searchWord, setSearchWord] = useState('');
  const [editableTitle, setEditableTitle] = useState(null);
  const userID = useContext(UserContext);
  console.log("UserID from Context:", userID);


  
  const fetchMyTasks = async () => {
    try {
      const response = await axios.post(`${URL}/tasks/userTasks`, { user_id: userID.userID });
      setTasks(Array.isArray(response.data) ? response.data : []);
        console.log(response.data)
    } catch (error) {
        console.log(error);
    }
}

const taskStatus = async (taskId, currentStatus) => {
  const newStatus = currentStatus === 'Complete' ? 'In Progress' : 'Complete';
  try {
    await axios.post(`${URL}/tasks/taskStatus`, { taskId, newStatus });
    fetchMyTasks();
  } catch (error) {
    console.log(error);
  }
};

const deleteTask = async (taskId) => {
    try {
      await axios.post(`${URL}/tasks/delete`, { taskId });
      fetchMyTasks();
    } catch (error) {
      console.log(error);
    }
  };

useEffect(() => {
    fetchMyTasks()
  }, [] )

  const categories = [...new Set(tasks.map((task) => task.category))];

  const statuses = [...new Set(tasks.map((task) => task.status))];

  return (

    <div>
   

      <div className="filterbox">

      <h3>My Tasks</h3>


      <div class="d-flex justify-content-center">

      <input
      class="form-control"
        type="text"
        placeholder="Search tasks"
        value={searchWord}
        onChange={(e) => setSearchWord(e.target.value)}
      />
      </div>

      <div>

      <span>Category: </span>
  <a href="#" onClick={() => setSelectedCategory('')}>
    All
  </a>
  {' '}
  {categories.map((category, index) => (
    <span key={index}>
      <a href="#" onClick={() => setSelectedCategory(category)}>
        {category}
      </a>
      {' '}
    </span>
  ))}


      </div>

      <div>
  <span>Status: </span>
  <a href="#" onClick={() => setSelectedStatus('')}>
    All
  </a>
  {' '}
  {statuses.map((status, index) => (
    <span key={index}>
      <a href="#" onClick={() => setSelectedStatus(status)}>
        {status}
      </a>
      {' '}
    </span>
  ))}
</div>
</div>


      <div className="taskContainer"> 
        {tasks.filter((task) => {
              const categoryMatch =
                selectedCategory === '' || task.category === selectedCategory;
              const titleMatch =
                searchWord === '' ||
                task.title.toLowerCase().includes(searchWord.toLowerCase());
                const statusMatch =
                selectedStatus === "" || task.status === selectedStatus;
  
              return categoryMatch && statusMatch && titleMatch;
            })

            .map((task, index) => (
              <TaskCard 
                key={index} 
                task={task}
                taskStatus={taskStatus}
                deleteTask={deleteTask}
              />
        ))}
      </div>
    </div>
  );
            }

export default MyTasks;