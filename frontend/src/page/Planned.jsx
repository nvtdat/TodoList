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
import Celebrate from '../assets/celebration.png';
import PlanImage from '../assets/plan.png';
import Calendar from '../assets/calendar.png';
import Search from '../assets/search.png';
import ThreeDots from '../assets/three-dots 3.png';
import Crisis from '../assets/crisis.png';
import Rocket from '../assets/rocket.png';
import SpaceList from "./SpaceList";
import toast from "react-hot-toast";
import { completeTask, deleteTask, getPlannedTasks } from "../services/authApi";

function Planned() {
    const navigate = useNavigate();
    const [openTaskMenu, setOpenTaskMenu] = useState(null);
    const [userTasks, setUserTasks] = useState([]);
    const [userSpaces, setUserSpaces] = useState([]);
    const [activeFilter, setActiveFilter] = useState('today');
    const [searchQuery, setSearchQuery] = useState('');

    /*Handle click on Planned button*/
    const handlePlanClick = () => {
        navigate('/planned');
    };

    const handleImportantClick = () => {
        navigate('/important');
    }

    const handleSpacesClick = () => {
        navigate('/spaces');
    }

    const handleTaskClick = () => {
        navigate('/tasks');
    }

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

    const toggleCompleted = async (task) => {
        if (task.is_completed) {
            return;
        }

        try {
            const updatedTask = await completeTask(task.id);
            setUserTasks((previousTasks) => previousTasks.map((currentTask) => (
                currentTask.id === task.id ? updatedTask : currentTask
            )));
        } catch (error) {
            toast.error(error.message);
        }
    };

    const toggleImportant = (taskId) => {
        setUserTasks((prevTasks) =>
            prevTasks.map((task, index) =>
                index === taskId ? { ...task, is_important: !task.is_important } : task
            )
        );
    };

    function renderStatusBadge(task) {
        const deadline = new Date(task.due_date);
        const now = new Date();
        const isToday = deadline.toDateString() === now.toDateString();
        const remainingMilliseconds = deadline.getTime() - now.getTime();
        const remainingMinutes = Math.max(0, Math.ceil(remainingMilliseconds / 60000));
        const remainingHours = Math.floor(remainingMinutes / 60);
        const minutes = remainingMinutes % 60;
        const remainingTime = remainingHours > 0
            ? `${remainingHours}h ${minutes}m left`
            : `${minutes}m left`;
        const badgeText = task.is_completed
            ? "Done"
            : isToday
                ? remainingTime
                : "To do";
        const textColor = task.is_completed ? "#10B981" : "#DC2626";

        return (
            <span
                style={{
                    backgroundColor: "transparent",
                    color: textColor,
                    padding: "4px 8px",
                    borderRadius: "10px",
                    fontSize: "12px",
                }}
            >
                {badgeText}
            </span>
        );
    }

    function getFilteredTasks() {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfTomorrow = new Date(startOfToday);
        startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
        const q = searchQuery.toLowerCase().trim();

        return userTasks.filter((task) => {
            const deadline = new Date(task.due_date);

            if (Number.isNaN(deadline.getTime())) {
                return false;
            }

            const matchesSearch =
                !q ||
                task.title?.toLowerCase().includes(q) ||
                task.description?.toLowerCase().includes(q);

            if (!matchesSearch) {
                return false;
            }

            if (activeFilter === 'today') {
                return deadline >= startOfToday && deadline < startOfTomorrow;
            }

            if (activeFilter === 'overdue') {
                return deadline < startOfToday;
            }

            return deadline >= startOfTomorrow;
        });
    }

    function renderPlanned() {
        const filteredTasks = getFilteredTasks();

        if (filteredTasks.length === 0) {
            return <p className="empty-filter-message">No planned tasks in this filter.</p>;
        }

        return filteredTasks.map((task, index) => (
            <div key={task.id || index} className="task-card planned-task-card">
                <input
                    type="checkbox"
                    checked={task.is_completed === true}
                    className="task-checkbox"
                    onChange={() => toggleCompleted(task)}
                />
                <Typography className="planned-task-title" variant="h6" sx={{ fontSize: "18px", fontWeight: "bold" }}>{task.title}</Typography>
                <Typography className="planned-task-description" variant="body1" sx={{ fontSize: "14px" }}>{task.description}</Typography>

                <div className="task-actions">
                    <button
                        className="task-actions-button"
                        type="button"
                        aria-label={`Open actions for ${task.title}`}
                        aria-expanded={openTaskMenu === task.id}
                        onClick={() => setOpenTaskMenu(openTaskMenu === task.id ? null : task.id)}
                    >
                        <img src={ThreeDots} alt="" />
                    </button>
                    {openTaskMenu === task.id && (
                        <div className="task-actions-menu">
                            <button type="button" onClick={() => setOpenTaskMenu(null)}>Edit task</button>
                            <button className="delete-action" type="button" onClick={async () => {
                                try {
                                    await deleteTask(task.id);
                                    setUserTasks((previousTasks) => previousTasks.filter((currentTask) => currentTask.id !== task.id));
                                    setOpenTaskMenu(null);
                                } catch (error) {
                                    toast.error(error.message);
                                }
                            }}>Delete task</button>
                        </div>
                    )}
                </div>
                <div className="task-meta">
                    <div className="task-due-date">
                        <img src={Calendar} alt="Calendar" style={{ width: "16px", height: "16px", marginRight: "4px" }} />
                        <Typography variant="body2" sx={{ fontSize: "12px" }}>Due: {task.due_date || "No date"}</Typography>
                    </div>
                    {renderStatusBadge(task)}
                </div>
            </div>
        ));
    }

    function renderStatsPanel() {
        const filteredTaskCount = getFilteredTasks().length;
        const statsByFilter = {
            today: {
                icon: Celebrate,
                title: `You have finished ${countCompletedPlanned()}/${userTasks.length} Plan`,
                subtitle: "Finish your deadlines today",
            },
            overdue: {
                icon: Crisis,
                title: `You got ${filteredTaskCount} Overdue tasks`,
                subtitle: "Handle them or reschedule the deadline",
            },
            future: {
                icon: Rocket,
                title: `You have ${filteredTaskCount} upcoming tasks`,
                subtitle: "Plan ahead and stay on track",
            },
        };

        const stats = statsByFilter[activeFilter];

        return (
            <div className={`static-panel stats-panel-${activeFilter}`}>
                <img src={stats.icon} alt="" className="planned-panel-left-image" />
                <div className="static-panel-content">
                    <h1 className="static-panel-header">{stats.title}</h1>
                    <p className="static-panel-subtitle">{stats.subtitle}</p>
                </div>
                <img src={PlanImage} alt="" className="static-panel-image" />
            </div>
        );
    }

    function countCompletedPlanned() {
        return userTasks.filter((task) => task.is_completed).length;
    }

    {/* Render planned tasks list */ }
    useEffect(() => {
        getPlannedTasks()
            .then(setUserTasks)
            .catch((error) => toast.error(error.message));
    }, []);


    {/*Nút filter tasks*/ }

    function FilterTabs() {
        const filters = [
            { key: 'today', label: 'Today' },
            { key: 'overdue', label: 'Overdue' },
            { key: 'future', label: 'Future' },
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
                        <button className="sidebar-button-icon" type="button" onClick={() => navigate('/add-task', { state: { returnTo: '/tasks', title: 'Add task' } })} aria-label="Add task">
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
                        <button className="sidebar-button-icon" type="button" onClick={(event) => { event.stopPropagation(); navigate('/add-space', { state: { returnTo: '/spaces', title: 'Add new space' } }); }} aria-label="Add space">
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

                <div className="sidebar-footer">
                    {/*Nút log out*/}
                    <button className="logout-button" type="button" onClick={() => navigate('/')}>
                        <Typography variant="h6" sx={{ fontFamily: 'Iosevka Charon, monospace', fontSize: "14px", color: "#EF4444", fontWeight: "bold" }}>Log out</Typography>
                    </button>

                    {/*Tên tác giả */}
                    <Typography variant="h6" sx={{ fontFamily: 'Iosevka Charon, monospace', fontSize: "14px", color: "#1D4ED8", fontStyle: "italic" }}>@Made by Dante<br />Nguyen Van Tien Dat</Typography>
                </div>
            </aside>

            <main className="main-content">
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search your planned work ..."
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="search-button" type="button">
                        <img src={Search} alt="Search" style={{ width: "18px", height: "18px" }} />
                    </button>
                </div>

                {/*Nút filter tasks*/}
                <div className="filter-buttons">
                    <FilterTabs />
                </div>

                {renderStatsPanel()}
                <div className="planned-panel">
                    <div className="planned-tasks-list">
                        {renderPlanned()}
                    </div>
                </div>
            </main>
        </>
    )
}

export default Planned;
