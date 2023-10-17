import React, { useState } from 'react';
import { URL } from "../config";


export const TaskCard = ({ task, taskStatus, deleteTask }) => {
    const [isTitleEditable, setTitleEditable] = useState(false);
    const [isDescEditable, setDescEditable] = useState(false);
    const [editableTitle, setEditableTitle] = useState(task.title);
    const [editableDesc, setEditableDesc] = useState(task.description);

  return (
    <div className="card" style={{ width: '18rem' }}>
      <div className="card-body">

      {isTitleEditable ? (
    <input 
      value={editableTitle} 
      onChange={e => setEditableTitle(e.target.value)}
      onBlur={() => setTitleEditable(false)} 
    />
  ) : (
    <h5 onClick={() => setTitleEditable(true)}>{editableTitle}</h5>
  )}
        
        {isDescEditable ? (
          <input 
              value={editableDesc} 
              onChange={e => setEditableDesc(e.target.value)} 
              onBlur={() => setDescEditable(false)} 
          />
        ) : (
          <p onClick={() => setDescEditable(true)}>Description: {editableDesc}</p>
        )}

        <p>Status: {task.status}</p>
        <p>Category: {task.category}</p>
        <p>Due Date: {new Date(task.due).toLocaleDateString()}</p>
        <button class="btn btn-primary" onClick={() => taskStatus(task._id, task.status)}>
          {task.status === 'Complete' ? 'Mark as In Progress' : 'Mark as Complete'}
        </button>
        <button class="btn btn-primary" onClick={() => deleteTask(task._id)}>Remove</button>
      </div>
    </div>
  );
};
