import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Typography } from "@mui/material";
import "./web.css";
import Logo from "../assets/logo.png";
import Home from "../assets/home.png";
import Star from "../assets/star.png";
import Planned from "../assets/planned.png";
import Space from "../assets/space.png";
import Plus from "../assets/plus.png";
import Search from "../assets/search.png";

function AddNewTask() {
    const navigate = useNavigate();
    const location = useLocation();
    const { returnTo = "/tasks", defaultImportant = false, title = "Add new task" } = location.state || {};
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [status, setStatus] = useState("To do");
    const [important, setImportant] = useState(defaultImportant);

    const [userSpaces, setUserSpaces] = useState([]);
    useEffect(() => {
        setUserSpaces([
            {
                name: "Study Plan",
                icon: "",
                description: "Focus on your academic goals",
                tasks: [
                    { id: 1, title: "Read Chapter 1", completed: true },
                    { id: 2, title: "Complete Assignment 1", completed: false },
                    { id: 3, title: "Prepare for Quiz", completed: false }
                ]
            },
            {
                name: "Work Progress",
                icon: "",
                description: "Focus on your career goals",
                tasks: [
                    { id: 1, title: "Finish Project Report", completed: false },
                    { id: 2, title: "Attend Team Meeting", completed: true },
                    { id: 3, title: "Submit Timesheet", completed: false }
                ]
            },
            {
                name: "Event Plan",
                icon: "",
                description: "Focus on your event goals",
                tasks: [
                    { id: 1, title: "Plan Birthday Party", completed: false },
                    { id: 2, title: "Send Invitations", completed: true },
                    { id: 3, title: "Prepare Gifts", completed: false }
                ]
            }
        ]);
    }, []);


    const handleSubmit = (event) => {
        event.preventDefault();
        const newTask = { name: name.trim(), description: description.trim(), dueDate, status, important };
        localStorage.setItem("todo-list:new-task", JSON.stringify(newTask));
        navigate(returnTo);
    };

    const openAddTask = (target, targetTitle, targetImportant = false) => {
        navigate("/add-task", {
            state: { returnTo: target, title: targetTitle, defaultImportant: targetImportant },
        });
    };

    {/*Render space list*/ }
    function renderSpaceList() {
        return userSpaces.map((space, index) => (
            <div key={index} className="space-card">
                <div className="space-icon" aria-hidden="true">
                    {space.icon ? <img src={space.icon} alt="" /> : <span className="folder-icon" />}
                </div>
                <div className="space-details">
                    <Typography variant="h6" sx={{ fontFamily: 'Iosevka Charon, monospace', fontSize: "18px", fontWeight: "bold" }}>{space.name}</Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'Iosevka Charon, monospace', fontSize: "12px" }}>{space.description}</Typography>
                </div>
            </div>
        ));
    }

    return (
        <>
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <img src={Logo} alt="Todo list" style={{ scale: 0.5 }} />
                </div>
                <div className="sidebar-content">
                    <div className="sidebar-search">
                        <input type="text" placeholder="Search..." className="sidebar-search-input" />
                        <button className="sidebar-search-button" type="button" aria-label="Search">
                            <img src={Search} alt="" style={{ width: "18px", height: "18px" }} />
                        </button>
                    </div>
                </div>

                <div className="sidebar-buttons" onClick={() => navigate("/tasks")}>
                    <div className="sidebar-row">
                        <img src={Home} alt="" />
                        <Typography variant="h6">Tasks</Typography>
                        <button className="sidebar-button-icon" type="button" onClick={(event) => { event.stopPropagation(); openAddTask("/tasks", "Add task"); }} aria-label="Add task">
                            <img src={Plus} alt="" />
                        </button>
                    </div>
                </div>
                <div className="sidebar-buttons" onClick={() => navigate("/planned")}>
                    <div className="sidebar-row">
                        <img src={Planned} alt="" />
                        <Typography variant="h6">Planned</Typography>
                        <button className="sidebar-button-icon" type="button" onClick={(event) => { event.stopPropagation(); openAddTask("/planned", "Add planned task"); }} aria-label="Add planned task">
                            <img src={Plus} alt="" />
                        </button>
                    </div>
                </div>
                <div className="sidebar-buttons" onClick={() => navigate("/important")}>
                    <div className="sidebar-row">
                        <img src={Star} alt="" />
                        <Typography variant="h6">Important</Typography>
                        <button className="sidebar-button-icon" type="button" onClick={(event) => { event.stopPropagation(); openAddTask("/important", "Add important task", true); }} aria-label="Add important task">
                            <img src={Plus} alt="" />
                        </button>
                    </div>
                </div>
                <div className="sidebar-buttons" onClick={() => navigate("/spaces")}>
                    <div className="sidebar-row">
                        <img src={Space} alt="" />
                        <Typography variant="h6">Spaces</Typography>
                        <button className="sidebar-button-icon" type="button" onClick={(event) => { event.stopPropagation(); openAddTask("/spaces", "Add task to a space"); }} aria-label="Add task to a space">
                            <img src={Plus} alt="" />
                        </button>
                    </div>
                </div>

                {/* Đường kẻ */}
                <div className="sidebar-line"></div>
                <div className="space-list">
                    <Typography className="space-header">My Space</Typography>
                    {/*Render space list*/}
                    {renderSpaceList()}
                </div>

                {/*Tên tác giả */}
                <Typography variant="h6" sx={{ fontFamily: 'Iosevka Charon, monospace', fontSize: "14px", color: "#1D4ED8", fontStyle: "italic", display: "flex", marginTop: "auto" }}>@Made by Dante<br />Nguyen Van Tien Dat</Typography>

            </aside>

            <main className="add-task-page">
                <section className="add-task-panel" aria-label={title}>
            <form className="add-task-form" onSubmit={handleSubmit}>
                <div className="add-task-form-header">
                    <h2>{title}</h2>
                    <button type="button" className="modal-close-button" onClick={() => navigate(returnTo)} aria-label="Close form">&times;</button>
                </div>
                <label htmlFor="task-name">Task name</label>
                <input id="task-name" type="text" value={name} onChange={(event) => setName(event.target.value)} required autoFocus />
                <label htmlFor="task-description">Description</label>
                <textarea id="task-description" value={description} onChange={(event) => setDescription(event.target.value)} rows="3" />
                <label htmlFor="task-due-date">Due date</label>
                <input id="task-due-date" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
                <label htmlFor="task-status">Status</label>
                <select id="task-status" value={status} onChange={(event) => setStatus(event.target.value)}>
                    <option value="To do">To do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                </select>
                <label className="task-important-field">
                    <input type="checkbox" checked={important} onChange={(event) => setImportant(event.target.checked)} />
                    Important
                </label>
                <div className="add-task-form-actions">
                    <button type="button" className="modal-cancel-button" onClick={() => navigate(returnTo)}>Cancel</button>
                    <button type="submit" className="modal-submit-button">Add task</button>
                </div>
            </form>
                </section>
            </main>
        </>
    );
}

export default AddNewTask;