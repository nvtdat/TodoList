import {
    Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './web.css';
import Logo from '../assets/logo.png';
import Home from '../assets/home.png';
import star from '../assets/star.png';
import PlannedIcon from '../assets/planned.png';
import Space from '../assets/space.png';
import Plus from '../assets/plus.png';
import Glow from '../assets/glow.png';
import PlannedImage from '../assets/planned.png';
import Calendar from '../assets/calendar.png';
import Search from '../assets/search.png';
import ThreeDots from '../assets/three-dots 3.png';

function Important() {
    const navigate = useNavigate();
    const [openTaskMenu, setOpenTaskMenu] = useState(null);
    const [userTasks, setUserTasks] = useState([]);
    const [userSpaces, setUserSpaces] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all');

    const handlePlanClick = () => {
        navigate('/planned');
    };

    const handleImportantClick = () => {
        navigate('/important');
    };


    const handleSpacesClick = () => {
        navigate('/spaces');
    }
    
    const handleTaskClick = () => {
        navigate('/tasks');
    };

    useEffect(() => {
        setUserTasks([
            {
                name: "Finish the project",
                description: "Complete the project by the end of the week",
                dueDate: "2024-06-30",
                status: "Done",
                important: true,
            },
            {
                name: "Buy groceries",
                description: "Milk, eggs, bread, and fruits",
                dueDate: "2024-06-28",
                status: "To do",
                important: false,
            },
            {
                name: "Do Chores",
                description: "Finish the household chores",
                dueDate: "2024-06-29",
                status: "To do",
                important: true,
            },
        ]);
    }, []);

    useEffect(() => {
        setUserSpaces([
            {
                name: "Study Plan",
                icon: "",
                description: "Focus on your academic goals",
                tasks: []
            },
            {
                name: "Work Progress",
                icon: "",
                description: "Focus on your career goals",
                tasks: []
            },
            {
                name: "Event Plan",
                icon: "",
                description: "Focus on your event goals",
                tasks: []
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

    const toggleCompleted = (taskId) => {
        setUserTasks((prevTasks) =>
            prevTasks.map((task, index) =>
                index === taskId
                    ? { ...task, status: task.status === "Done" ? "To do" : "Done" }
                    : task
            )
        );
    };

    function renderStatusBadge(status) {
        const badgeColor = status === "Done" ? "#10B981" : "#F59E0B";

        return (
            <span
                style={{
                    backgroundColor: badgeColor,
                    color: "#FFFFFF",
                    padding: "4px 8px",
                    borderRadius: "10px",
                    fontSize: "12px",
                }}
            >
                {status}
            </span>
        );
    }

    function renderImportantTasks() {
        const importantTasks = userTasks
            .map((task, originalIndex) => ({ task, originalIndex }))
            .filter(({ task }) => {
                if (!task.important) {
                    return false;
                }

                if (activeFilter === 'todo') {
                    return task.status !== 'Done';
                }

                if (activeFilter === 'done') {
                    return task.status === 'Done';
                }

                return true;
            });

        if (importantTasks.length === 0) {
            return <p className="empty-filter-message">No important tasks in this filter.</p>;
        }

        return importantTasks.map(({ task, originalIndex }) => (
            <div key={originalIndex} className="task-card standard-task-card">
                <input
                    type="checkbox"
                    checked={task.status === "Done"}
                    className="task-checkbox"
                    onChange={() => toggleCompleted(originalIndex)}
                />
                <Typography className="standard-task-title" variant="h6" sx={{ fontSize: "18px", fontWeight: "bold" }}>
                    {task.name}
                </Typography>
                <Typography className="standard-task-description" variant="body1" sx={{ fontSize: "14px" }}>
                    {task.description}
                </Typography>
                <button className="important-btn active" type="button" aria-label={`Important task: ${task.name}`}>
                    <img src={star} alt="Important" />
                </button>
                <div className="task-actions">
                    <button
                        className="task-actions-button"
                        type="button"
                        aria-label={`Open actions for ${task.name}`}
                        aria-expanded={openTaskMenu === originalIndex}
                        onClick={() => setOpenTaskMenu(openTaskMenu === originalIndex ? null : originalIndex)}
                    >
                        <img src={ThreeDots} alt="" />
                    </button>
                    {openTaskMenu === originalIndex && (
                        <div className="task-actions-menu">
                            <button type="button" onClick={() => setOpenTaskMenu(null)}>Edit task</button>
                            <button className="delete-action" type="button" onClick={() => setOpenTaskMenu(null)}>Delete task</button>
                        </div>
                    )}
                </div>
                <div className="task-meta">
                    <div className="task-due-date">
                        <img src={Calendar} alt="Calendar" style={{ width: "16px", height: "16px", marginRight: "4px" }} />
                        <Typography variant="body2" sx={{ fontSize: "12px" }}>Due: {task.dueDate}</Typography>
                    </div>
                    {renderStatusBadge(task.status)}
                </div>
            </div>
        ));
    }

    function FilterTabs() {
        const filters = [
            { key: 'all', label: 'All' },
            { key: 'todo', label: 'To do' },
            { key: 'done', label: 'Done' },
        ];

        return (
            <div className="filter-container">
                {filters.map((filter) => (
                    <button
                        key={filter.key}
                        className={`filter-btn ${activeFilter === filter.key ? 'active' : ''}`}
                        onClick={() => setActiveFilter(filter.key)}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>
        );
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
                <div className="sidebar-buttons" onClick={handleTaskClick}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
                        <img src={Home} alt="" />
                        <Typography variant="h6" sx={{ fontFamily: 'Iosevka Charon, monospace', fontSize: "18px" }}>Tasks</Typography>
                        <button className="sidebar-button-icon" type="button" onClick={(event) => { event.stopPropagation(); navigate('/add-task', { state: { returnTo: '/tasks', title: 'Add task' } }); }} aria-label="Add task">
                            <img src={Plus} alt="Plus" />
                        </button>
                    </div>
                </div>
                <div className="sidebar-buttons" onClick={handlePlanClick}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
                            <img src={PlannedIcon} alt="" />
                        <Typography variant="h6" sx={{ fontFamily: 'Iosevka Charon, monospace', fontSize: "18px" }}>Planned</Typography>
                        <button className="sidebar-button-icon" type="button" onClick={(event) => { event.stopPropagation(); navigate('/add-task', { state: { returnTo: '/planned', title: 'Add planned task' } }); }} aria-label="Add planned task">
                            <img src={Plus} alt="Plus" />
                        </button>
                    </div>
                </div>
                <div className="sidebar-buttons" onClick={handleImportantClick}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
                        <img src={star} alt="" />
                        <Typography variant="h6" sx={{ fontFamily: 'Iosevka Charon, monospace', fontSize: "18px" }}>Important</Typography>
                        <button className="sidebar-button-icon" type="button" onClick={(event) => { event.stopPropagation(); navigate('/add-task', { state: { returnTo: '/important', title: 'Add important task', defaultImportant: true } }); }} aria-label="Add important task">
                            <img src={Plus} alt="Plus" />
                        </button>
                    </div>
                </div>
                <div className="sidebar-buttons" onClick={handleSpacesClick}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
                        <img src={Space} alt="Space" />
                        <Typography variant="h6" sx={{ fontFamily: 'Iosevka Charon, monospace', fontSize: "18px" }}>Spaces</Typography>
                        <button className="sidebar-button-icon" type="button" onClick={(event) => { event.stopPropagation(); navigate('/add-task', { state: { returnTo: '/spaces', title: 'Add task to a space' } }); }} aria-label="Add task to a space">
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
                    <input type="text" placeholder="Search your important work ..." className="search-input" />
                    <button className="search-button" type="button" aria-label="Search">
                        <img src={Search} alt="" style={{ width: "18px", height: "18px" }} />
                    </button>
                </div>
                <div className="filter-buttons">
                    <FilterTabs />
                </div>
                <div className="static-panel important-static-panel">
                    <img src={Glow} alt="Glow" className="important-panel-left-image" />
                    <div className="static-panel-content">
                        <h1 className="static-panel-header">You have {userTasks.filter((task) => task.important).length} Important Tasks</h1>
                        <p className="static-panel-subtitle">Focus on what matters most</p>
                    </div>
                    <img src={PlannedImage} alt="Planned" className="static-panel-image" />
                </div>
                <div className="task-list">
                    {renderImportantTasks()}
                </div>
            </main>
        </>
    )
}

export default Important;
