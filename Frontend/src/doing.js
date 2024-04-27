import React, { useState, useEffect } from 'react';
import './doing.css';
import { callApi, errorResponse, getSession } from './main';
import binImage from './images/bin.png';
import rightIcon from './images/righticon.png';


const tableStyle = { "width": "100%" };

function addDoing() {
    var doing = document.getElementById('doing');
    var deadline = document.getElementById('deadline');

    doing.style.border = "";
    deadline.style.border = "";

    if (doing.value === "") {
        doing.style.border = "1px solid red";
        doing.focus();
        return;
    }
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

    var emailId = getSession("sid"); // Retrieving email ID from session
    var url = `http://localhost:5000/doing/add`;
    var data = JSON.stringify({
        emailid: emailId,
        doingList: [[doing.value, deadline.value]]
    });
    callApi("POST", url, data, doingAddedSuccess, errorResponse);

    // Clear input field after adding doing task
    doing.value = "";
    deadline.value = "";

}

function doingAddedSuccess(res) {
    window.location.reload();
    var data = JSON.parse(res);
    alert(data);
}

async function deleteDoing(index, setDoingList) {
    try {
        const sid = getSession("sid");
        const emailId = sid; // Assuming sid is the email ID
        const url = `http://localhost:5000/doing/delete/${emailId}/${index}`;
        const response = await callApi("DELETE", url, null, deletedSuccess, errorResponse);

        if (response.status === 200) {
            setDoingList(prevDoingList => prevDoingList.filter((_, i) => i !== index));
        } else {
            throw new Error("Failed to delete doing item");
        }
    } catch (error) {
        console.error("Error deleting doing item:", error);
        // Handle error as needed, such as displaying an error message to the user
    }
}

function deletedSuccess(res) {
    window.location.reload();
    var data = JSON.parse(res);
    alert(data);
}

async function moveTaskToDone(task, deadline,  index, setDoingList, setDoneList) {
    try {
         deleteDoing(index, setDoingList); // Delete task from Doing
         addTaskToDone(task, deadline, setDoneList); // Add task to Done
    } catch (error) {
        console.error("Error moving task to Done:", error);
        // Handle error as needed
    }
}

async function addTaskToDone(task, deadline, setDoneList) {
    try {
        const sid = getSession("sid");
        const emailId = sid; // Assuming sid is the email ID
        const url = `http://localhost:5000/done/add`;
        const data = JSON.stringify({
            emailid: emailId,
            doneList: [[task, deadline]]
        });
        const response = await callApi("POST", url, data, doneAddedSuccess, errorResponse);

        if (response.status !== 200) {
            throw new Error("Failed to add task to Done");
        }
    } catch (error) {
        console.error("Error adding task to Done:", error);
        // Handle error as needed
    }
}

function doneAddedSuccess(res) {
    window.location.reload();
    var data = JSON.parse(res);
    alert(data);
}

function displayDoingList(emailId, setDoingList) {
    var url = `http://localhost:5000/doing/${emailId}`;
    callApi("GET", url, null, (res) => {
        var data = JSON.parse(res);
        setDoingList(data || []); // Ensure doingList is initialized properly
    }, errorResponse);
}

function Doing({ setDoneList }) {
    const [doingList, setDoingList] = useState([]); // Initialize doingList state with an empty array
    const sid = getSession("sid");

    useEffect(() => {
        if (sid) {
            displayDoingList(sid, setDoingList);
        }
    }, [sid]);

    return (
        <div className='full-height'>
            <div className='todocontent'>
                <h3>Add New Task in Progress</h3>
                <table style={tableStyle}>
                    <tbody>
                        <tr>
                            <td>Task* <input type='text' id='doing' className='txtbox' /></td>
                            <td>Deadline <input type='datetime-local' id='deadline' className='txtbox' /></td>
                            <td><button className='button' onClick={addDoing}>Add To Doing</button></td>
                        </tr>
                    </tbody>
                </table>
                <div>
                    <h3>Task in Progress</h3>
                    <table style={tableStyle}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Task</th>
                                <th>Deadline</th>
                                <th>Action</th>
                                <th>Move to Done</th> {/* New column */}
                            </tr>
                        </thead>
                        <tbody>
                            {doingList.map((doing, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{doing.task}</td>
                                    <td>{new Date(doing.deadline).toLocaleString()}</td> {/* Accessing deadline property */}
                                    <td><img className="bin-icon" src={binImage} alt="Delete" onClick={() => deleteDoing(index, setDoingList)} /></td>
                                    <td><img className="bin-icon" src={rightIcon} alt="Move" onClick={() => moveTaskToDone(doing.task, doing.deadline,  index, setDoingList, setDoneList)} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Doing;
