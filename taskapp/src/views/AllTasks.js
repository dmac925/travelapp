import React, { useState, useEffect } from 'react'
import axios from "axios"
import { URL } from "../config";


function AllTasks() {

  const [tasks, setTasks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchWord, setSearchWord] = useState('');

  const fetchTasks = async () => {
    try {
      const response = await axios.get(
        `${URL}/tasks/`
        );
        setTasks(response.data);

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchTasks()
  }, [] )

  const categories = [...new Set(tasks.map((task) => task.category))];

  return (

    <div>
      <h3>All Tasks</h3>

      <input
        type="text"
        placeholder="Search by title"
        value={searchWord}
        onChange={(e) => setSearchWord(e.target.value)}
      />

      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
      >
        <option value="">All Categories</option>
        {categories.map((category, index) => (
          <option key={index} value={category}>
            {category}
          </option>
        ))}
      </select>

      <div className="taskContainer"> 
        {tasks.filter((task) => {
              const categoryMatch =
                selectedCategory === '' || task.category === selectedCategory;
              const titleMatch =
                searchWord === '' ||
                task.title.toLowerCase().includes(searchWord.toLowerCase());
  
              return categoryMatch && titleMatch;
            })

          .map((task, index) => (
            <div key={index} className="task-card">
              <h4>{task.title}</h4>
              <p>Description: {task.description}</p>
              <p>Status: {task.status}</p>
              <p>Category: {task.category}</p>
              <p>Due Date: {new Date(task.due).toLocaleDateString()}</p>
            </div>
          ))}
      </div>
    </div>
  );
}

export default AllTasks;