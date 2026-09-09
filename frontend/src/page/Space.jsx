import {
    Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './web.css';
import Logo from '../assets/logo.png';
import Home from '../assets/home.png';
import star from '../assets/star.png';
import PlannedIcon from '../assets/plan.png';
import Space from '../assets/space.png';
import Plus from '../assets/plus.png';
import Celebrate from '../assets/celebration.png';
import Calendar from '../assets/calendar.png';
import Search from '../assets/search.png';
import Document from '../assets/documentation.png';


function Planned() {
    const navigate = useNavigate();
    const [userPlan, setUserPlan] = useState("Free");
    const [userTasks, setUserTasks] = useState([]);
    const [userSpaces, setUserSpaces] = useState([]);

    useEffect(() => {


    }, []);
    const handlePlanClick = () => {
        navigate('/planned');
    };

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

    {/*Render Space list* panel*/ }
    function renderSpacePanel() {
        return userSpaces.map((space) => {
            const taskCount = space.tasks.length;
            const completedTaskCount = space.tasks.filter((task) =>
                task.completed === true
            ).length;
            const completionPercent = taskCount === 0
                ? 0
                : Math.round((completedTaskCount / taskCount) * 100);

            return (
            <div key={space.name} className="space-item-card">
                <div className="space-icon" aria-hidden="true">
                    {space.icon ? <img src={space.icon} alt="" /> : <span className="folder-icon" />}
                </div>
                <div className="space-details">
                    <Typography variant="h6" sx={{ fontFamily: 'Iosevka Charon, monospace', fontSize: "18px", fontWeight: "bold" }}>{space.name}</Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'Iosevka Charon, monospace', fontSize: "12px" }}>{space.description}</Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'Iosevka Charon, monospace', fontSize: "12px", fontWeight: "bold", marginTop: "10px" }}>
                        {completionPercent}% completed
                    </Typography>
                    <div className="progress-bar">
                        <div className="progress" style={{ width: `${completionPercent}%` }}></div>
                    </div>
                </div>
                {/*Nút view tasks*/}
                <button
                    type="button"
                    className="view-tasks-button"
                    onClick={() => navigate(`/tasks?space=${encodeURIComponent(space.name)}`)}
                    aria-label={`View tasks in ${space.name}`}
                >
                    <Typography variant="body1" sx={{ fontFamily: 'Iosevka Charon, monospace', fontSize: "12px" }}>View</Typography>
                </button>
            </div>
            );
        });
    }

    return (
        <>
            {/* Phần sidebar*/}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <img src={Logo} alt="" style={{ scale: 0.5 }} />
                </div>
                <div className="sidebar-content">
                    {/*Phần search bar*/}
                    <div className="sidebar-search">
                        <input type="text" placeholder="Search..." className="sidebar-search-input" />
                        <button className="sidebar-search-button">
                            <img src={Search} alt="Search" style={{ width: "18px", height: "18px" }} />
                        </button>
                    </div>
                </div>

                {/*Các nút bấm*/}
                <div className="sidebar-buttons">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
                        <img src={Home} alt="" />
                        <Typography variant="h6" sx={{ fontFamily: 'Iosevka Charon, monospace', fontSize: "18px" }}>Tasks</Typography>
                        <button className="sidebar-button-icon" type="button" onClick={() => navigate('/add-task', { state: { returnTo: '/tasks', title: 'Add task' } })} aria-label="Add task">
                            <img src={Plus} alt="Plus" />
                        </button>
                    </div>
                </div>
                <div className="sidebar-buttons" onClick={handlePlanClick}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
                            <img src={PlannedIcon} alt="" />
                        <Typography variant="h6" sx={{ fontFamily: 'Iosevka Charon, monospace', fontSize: "18px" }}>Planned</Typography>
                        <button className="sidebar-button-icon" type="button" onClick={() => navigate('/add-task', { state: { returnTo: '/planned', title: 'Add planned task' } })} aria-label="Add planned task">
                            <img src={Plus} alt="Plus" />
                        </button>
                    </div>
                </div>
                <div className="sidebar-buttons">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
                        <img src={star} alt="" />
                        <Typography variant="h6" sx={{ fontFamily: 'Iosevka Charon, monospace', fontSize: "18px" }}>Important</Typography>
                        <button className="sidebar-button-icon" type="button" onClick={() => navigate('/add-task', { state: { returnTo: '/important', title: 'Add important task', defaultImportant: true } })} aria-label="Add important task">
                            <img src={Plus} alt="Plus" />
                        </button>
                    </div>
                </div>
                <div className="sidebar-buttons">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
                        <img src={Space} alt="Space" />
                        <Typography variant="h6" sx={{ fontFamily: 'Iosevka Charon, monospace', fontSize: "18px" }}>Spaces</Typography>
                        <button className="sidebar-button-icon" type="button" onClick={() => navigate('/add-task', { state: { returnTo: '/spaces', title: 'Add task to a space' } })} aria-label="Add task to a space">
                            <img src={Plus} alt="Plus" />
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

            <main className="main-content">
                <div className="search-bar">
                    <input type="text" placeholder="Search your work ..." className="search-input" />
                    <button className="search-button">
                        <img src={Search} alt="Search" style={{ width: "18px", height: "18px" }} />
                    </button>
                </div>

                <div className="space-panel">
                    <img src={Document} alt="Document" style={{width: "80px", height: "80px", marginRight: "20px" }} />
                    <div className="space-panel-content">
                        <h1 sx={{ fontFamily: 'Iosevka Charon, monospace', fontSize: "24px", fontWeight: "bold" }}>Your Space</h1>
                        <p sx={{ fontFamily: 'Iosevka Charon, monospace', fontSize: "14px" }}>Manage your tasks and projects in one place</p>
                    </div>
                    <img src={PlannedIcon} alt="Planned" style={{width: "80px", height: "80px", marginRight: "20px" }} />
                </div>

                <div className="space-panel-grid">
                    {renderSpacePanel()}
                </div>


            </main>
        </>
    )
}

export default Planned;
