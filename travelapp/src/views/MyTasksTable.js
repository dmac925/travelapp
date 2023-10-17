import React, { useState, useEffect, useContext } from 'react'
import { Table, Column, AutoSizer } from 'react-virtualized';
import 'react-virtualized/styles.css';
import axios from "axios"
import { URL } from "../config";
import UserContext from '../UserContext';




function MyTasksTable() {

  const [tasks, setTasks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('')
  const [searchWord, setSearchWord] = useState('');
  const [sortDirection, setSortDirection] = useState('ASC');
const [sortBy, setSortBy] = useState('title');
const userID = useContext(UserContext);

  
  const fetchMyTasks = async () => {
    try {
      const response = await axios.post(`${URL}/tasks/userTasks`, { user_id: userID.userID });
        setTasks(response.data);
        console.log(response.data)
    } catch (error) {
        console.log(error);
    }
}

const markComplete = async (taskId, currentStatus) => {
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

  const sortedTasks = tasks.sort((a, b) => {
    if (a[sortBy] < b[sortBy]) return sortDirection === 'ASC' ? -1 : 1;
    if (a[sortBy] > b[sortBy]) return sortDirection === 'ASC' ? 1 : -1;
    return 0;
  });

  return (

    <div>
        <div className="tableContainer">

        <Table
             class="table table-hover"
              width={1000}
              height={400}
              headerHeight={40}
              rowHeight={40}
              rowCount={sortedTasks.length}
              rowGetter={({ index }) => sortedTasks[index]}
              sortDirection={sortDirection}
              sortBy={sortBy}
              sort={({ sortBy, sortDirection }) => {
                setSortBy(sortBy);
                setSortDirection(sortDirection);
              }}
          >
          <Column label="Title" dataKey="title" width={200} />
          <Column label="Description" dataKey="description" width={300} />
          <Column label="Status" dataKey="status" width={150} />
          <Column label="Category" dataKey="category" width={175} />
          <Column label="Due Date" dataKey="due" width={120} cellRenderer={({ cellData }) => new Date(cellData).toLocaleDateString()} />
          <Column 
        label="Update" 
        width={250} 
        cellRenderer={({ rowData }) => (
            <button className="btn btn-outline-primary" onClick={() => markComplete(rowData._id, rowData.status)}>
                {rowData.status === 'Complete' ? 'Mark as In Progress' : 'Mark as Complete'}
            </button>
        )}
    />
    <Column 
        label="Delete" 
        width={250} 
        cellRenderer={({ rowData }) => (
            <button className="btn btn-outline-primary" onClick={() => deleteTask(rowData._id)}>
                Delete
            </button>
        )}
    />
        </Table>
        </div>
  </div>
);
          }

export default MyTasksTable;