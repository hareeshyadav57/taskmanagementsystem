import React, { useState, useEffect } from 'react';
import './todo.css';
import { callApi, errorResponse, getSession } from './main';
import binImage from './images/bin.png';
import rightIcon from './images/righticon.png';

const tableStyle = { "width": "100%" };

function addTodo() {
    var todo = document.getElementById('todo');
    var deadline = document.getElementById('deadline');

    todo.style.border = "";
    deadline.style.border = "";

    if (todo.value === "") {
        todo.style.border = "1px solid red";
        todo.focus();
        return;
    }

    // Ensure deadline is not empty
    if (deadline.value === "") {
        deadline.style.border = "1px solid red";
        deadline.focus();
        return;
    }
    var selectedDeadline = new Date(deadline.value);

    // Get current date and time
    var currentDate = new Date();

    // Check if the selected deadline is in the future
    if (selectedDeadline <= currentDate) {
        alert("Please select a future date and time for the deadline.");
        deadline.style.border = "1px solid red";
        deadline.focus();
        return;
    }
    var emailId = getSession("sid");
    var url = `http://localhost:5000/todo/add`;
    var data = JSON.stringify({
        emailid: emailId,
        todoList: [[todo.value, deadline.value]]
    });
    callApi("POST", url, data, todoAddedSuccess, errorResponse);

    todo.value = "";
    deadline.value = "";
}

function todoAddedSuccess(res) {
    window.location.reload();
    var data = JSON.parse(res);
    alert(data);
}

async function deleteTodo(index, setTodoList) {
    try {
        const sid = getSession("sid");
        const emailId = sid; // Assuming sid is the email ID
        const url = `http://localhost:5000/todo/delete/${emailId}/${index}`;
        const response = await callApi("DELETE", url, null, deletedSuccess, errorResponse);

        if (response.status === 200) {
            setTodoList(prevTodoList => prevTodoList.filter((_, i) => i !== index));
        } else {
            throw new Error("Failed to delete todo item");
        }
    } catch (error) {
        console.error("Error deleting todo item:", error);
        // Handle error as needed, such as displaying an error message to the user
    }
}


function deletedSuccess(res) {
    window.location.reload();
    var data = JSON.parse(res);
    alert(data);
}

function displayTodoList(emailId, setTodoList) {
    var url = `http://localhost:5000/todo/${emailId}`;
    callApi("GET", url, null, (res) => {
        var data = JSON.parse(res);
        setTodoList(data || []); // Ensure todoList is initialized properly
    }, errorResponse);
}

function moveTaskToDoing(task, deadline, index, setTodoList, setDoingList) {
    deleteTodo(index, setTodoList); // Delete task from Todo
    addTaskToDoing(task, deadline, setDoingList); // Add task to Doing
}

async function addTaskToDoing(task, deadline, setDoingList) {
    try {
        const sid = getSession("sid");
        const emailId = sid; // Assuming sid is the email ID
        const url = `http://localhost:5000/doing/add`;
        const data = JSON.stringify({
            emailid: emailId,
            doingList: [[ task, deadline ]] // Include the deadline in the task object
        });
        const response = await callApi("POST", url, data, doingAddedSuccess, errorResponse);

        if (response.status !== 200) {
            throw new Error("Failed to add task to Doing");
        }
    } catch (error) {
        console.error("Error adding task to Doing:", error);
        // Handle error as needed, such as displaying an error message to the user
    }
}


function doingAddedSuccess(res) {
    window.location.reload();
    var data = JSON.parse(res);
    alert(data);
}

function Todo({ setDoingList }) {
    const [todoList, setTodoList] = useState([]); // Initialize todoList state with an empty array
    const sid = getSession("sid");

    useEffect(() => {
        if (sid) {
            displayTodoList(sid, setTodoList);
        }
    }, [sid]);

    return (
        <div className='full-height'>
            <div className='todocontent'>
                <h3>Add New Todo</h3>
                <table style={tableStyle}>
                    <tbody>
                        <tr>
                            <td>Todo* <input type='text' id='todo' className='txtbox' /></td>
                            <td>Deadline <input type='datetime-local' id='deadline' className='txtbox' /></td>
                            <td><button className='button' onClick={addTodo}>Add Todo</button></td>
                        </tr>
                    </tbody>
                </table>
                <div>
                    <h3>Todo List</h3>
                    <table style={tableStyle}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Todo</th>
                                <th>Deadline</th>
                                <th>Action</th>
                                <th>Move to Doing</th> {/* New column */}
                            </tr>
                        </thead>
                        <tbody>
                            {todoList.map((todo, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{todo.task}</td> {/* Accessing task property */}
                                    <td>{new Date(todo.deadline).toLocaleString()}</td> {/* Accessing deadline property */}
                                    <td><img className="bin-icon" src={binImage} alt="Delete" onClick={() => deleteTodo(index, setTodoList)} /></td>
                                    <td><img className="bin-icon" src={rightIcon} alt="Move" onClick={() => moveTaskToDoing(todo.task, todo.deadline, index, setTodoList, setDoingList)} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Todo;
