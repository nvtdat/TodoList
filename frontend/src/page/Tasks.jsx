import {
    Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './web.css';
import Logo from '../assets/logo.png';
import Home from '../assets/home.png';
import star from '../assets/star.png';
import Planned from '../assets/planned.png';
import Space from '../assets/space.png';
import Plus from '../assets/plus.png';
import Celebrate from '../assets/celebration.png';
import Calendar from '../assets/calendar.png';
import Search from '../assets/search.png';
import ThreeDots from '../assets/three-dots 3.png';
import SpaceList from "./SpaceList";

function Tasks() {
    const [userTasks, setUserTasks] = useState([]);
    const [openTaskMenu, setOpenTaskMenu] = useState(null);
    const [userSpaces, setUserSpaces] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all');
    const navigate = useNavigate();
    const handlePlanClick = () => {
        // Navigate to the Planned page
        navigate('/planned');
    }

    const handleImportantClick = () => {
        navigate('/important');
    }

    const handleSpacesClick = () => {
        navigate('/spaces');
    }

    const toggleCompleted = (taskId) => {
        setUserTasks((prevTasks) =>
            prevTasks.map((task, index) =>
                index === taskId ? { ...task, status: task.status === "Done" ? "To do" : "Done" } : task
            )
        );
    }

    const toggleImportant = (taskId) => {
        setUserTasks((prevTasks) =>
            prevTasks.map((task, index) =>
                index === taskId ? { ...task, important: !task.important } : task
            )
        );
    }

    useEffect(() => {
        setUserTasks([
            {
                name: "Finish the project",
                description: "Complete the project by the end of the week",
                dueDate: "2024-06-30",
                status: "Done",
                important: true
            },
            {
                name: "Buy groceries",
                description: "Milk, eggs, bread, and fruits",
                dueDate: "2024-06-28",
                status: "To do",
                important: false
            },

            {
                name: "Do Chores",
                description: "Finish the household chores",
                dueDate: "2024-06-29",
                status: "To do",
                important: false
            }
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

    function renderStatusBadge(status) {
        let badgeColor;
        switch (status) {
            case "To do":
                badgeColor = "#F59E0B"; // Yellow
                break;
            case "In Progress":
                badgeColor = "#3B82F6";
                break;
            case "Done":
                badgeColor = "#10B981";
                break;
            default:
                badgeColor = "#6B7280"; // Gray for unknown status
        }
        return (
            <span
                style={{
                    backgroundColor: badgeColor,
                    color: "#FFFFFF",
                    padding: "4px 8px",
                    borderRadius: "10px",
                    fontSize: "12px",
                    fontFamily: 'Iosevka Charon, monospace',
                }}
            >
                {status}
            </span>
        )
    }

    {/*Star icon to mark important tasks*/ }
    function StarIcon({ filled, size = 20 }) {
        return (
            <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill={filled ? '#FBBF24' : 'none'}
                stroke={filled ? '#FBBF24' : '#9CA3AF'}
                strokeWidth="2"
            >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
        );
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


    function renderTasks() {
        const filteredTasks = userTasks
            .map((task, originalIndex) => ({ task, originalIndex }))
            .filter(({ task }) => {
            if (activeFilter === 'all') {
                return true;
            }

            if (activeFilter === 'todo') {
                return task.status !== 'Done';
            }

            if (activeFilter === 'done') {
                return task.status === 'Done';
            }
            return false;
        });

        if (filteredTasks.length === 0) {
            return <p className="empty-filter-message">No tasks in this filter.</p>;
        }

        return filteredTasks.map(({ task, originalIndex }) => (
            <div key={originalIndex} className="task-card standard-task-card">
                {/*Ô check để đánh dấu hoàn thành*/}
                <input
                    type="checkbox"
                    checked={task.status === "Done"}
                    className="task-checkbox"
                    onChange={() => toggleCompleted(originalIndex)}
                />
                {/*Tên task và mô tả*/}
                <Typography className="standard-task-title" variant="h6" sx={{ fontFamily: 'Iosevka Charon, monospace', fontSize: "18px", fontWeight: "bold" }}>{task.name}</Typography>
                <Typography className="standard-task-description" variant="body1" sx={{ fontFamily: 'Iosevka Charon, monospace', fontSize: "14px" }}>{task.description}</Typography>
                {/*Icon ngôi sao để đánh dấu công việc quan trọng*/}
                <button className={`important-btn ${task.important ? 'active' : ''}`} onClick={() => toggleImportant(originalIndex)}>
                    <StarIcon filled={task.important} />
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
                {/*Hiển thị ngày hết hạn và trạng thái công việc*/}
                <div className="task-meta">
                    <div className="task-due-date">
                        <img src={Calendar} alt="Calendar" style={{ width: "16px", height: "16px", marginRight: "4px" }} />
                        <Typography variant="body2" sx={{ fontFamily: 'Iosevka Charon, monospace', fontSize: "12px" }}>Due: {task.dueDate}</Typography>
                    </div>
                    {renderStatusBadge(task.status)}
                </div>
            </div>
        ));
    }

    {/*Hàm vẽ vòng tròn hiển thị số lượng công việc đã hoàn thành*/ }
    function ProcessRing({ userTasks, countCompletedTasks }) {
        const radius = 36;
        const circumference = 2 * Math.PI * radius; // ~226.19
        const completed = countCompletedTasks();
        const total = userTasks.length;
        const percent = total > 0 ? completed / total : 0;
        const offset = circumference - percent * circumference;

        return (
            <div className="process-ring">
                <svg className="progress-ring" width="130" height="130" viewBox="0 0 80 80" aria-hidden="true">
                    {/* Vòng tròn nền (màu xám nhạt) */}
                    <circle
                        stroke="#E5E7EB"
                        strokeWidth="10"
                        fill="transparent"
                        r={radius}
                        cx="40"
                        cy="40"
                    />
                    {/* Vòng tròn hiển thị tiến độ */}
                    <circle
                        className="progress-ring__circle"
                        stroke="#3B82F6"
                        strokeWidth="10"
                        fill="transparent"
                        r={radius}
                        cx="40"
                        cy="40"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        transform="rotate(-90 40 40)"
                        style={{ transition: "stroke-dashoffset 0.4s ease" }}
                    />
                </svg>
                <div className="progress-text">{completed}/{total}</div>
            </div>
        );
    }

    function countCompletedTasks() {
        return userTasks.filter(task => task.status === "Done").length;
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
                        <button className="sidebar-search-button" type="button">
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
                        <img src={Planned} alt="" />
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
                    <SpaceList />
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

                {/*Nút filter tasks*/}
                <div className="filter-buttons">
                    <FilterTabs />
                </div>

                <div className="static-panel">
                    <ProcessRing
                        userTasks={userTasks}
                        countCompletedTasks={countCompletedTasks}
                    />

                    <div className="static-panel-content">
                        <h1 className="static-panel-header">You have finished {countCompletedTasks()}/{userTasks.length}</h1>
                        <p className="static-panel-subtitle">Keep up the good work! You're making great progress.</p>
                    </div>
                    <img src={Celebrate} alt="Celebrate" className="static-panel-image" style={{ width: "80px", height: "80px", marginRight: "20px" }} />
                </div>
                <div className="task-list">
                    {renderTasks()}
                </div>
            </main>
        </>
    )
}

export default Tasks;