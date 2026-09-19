import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Typography } from "@mui/material";
import "./web.css";
import SpaceList, { SPACE_ICON_SYMBOLS } from "./SpaceList";
import toast from "react-hot-toast";
import { completeTask, getSpace, getTasksBySpace } from "../services/authApi";
import Logo from "../assets/logo.png";
import Home from "../assets/home.png";
import Star from "../assets/star.png";
import Planned from "../assets/planned.png";
import SpaceIcon from "../assets/space.png";
import Plus from "../assets/plus.png";
import Search from "../assets/search.png";
import Plan from "../assets/plan.png";

const TASK_FILTERS = [
    { key: "all", label: "All" },
    { key: "todo", label: "To do" },
    { key: "done", label: "Done" },
];

function FilterTabs({ activeFilter, onFilterChange }) {
    return (
        <div className="filter-container">
            {TASK_FILTERS.map((filter) => (
                <button
                    key={filter.key}
                    type="button"
                    className={`filter-btn ${activeFilter === filter.key ? "active" : ""}`}
                    onClick={() => onFilterChange(filter.key)}
                    aria-pressed={activeFilter === filter.key}
                >
                    {filter.label}
                </button>
            ))}
        </div>
    );
}

function SpaceView() {
    const location = useLocation();
    const navigate = useNavigate();
    const spaceId = new URLSearchParams(location.search).get("id");
    const [space, setSpace] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        async function loadSpace() {
            try {
                const [spaceData, taskData] = await Promise.all([
                    getSpace(spaceId),
                    getTasksBySpace(spaceId),
                ]);
                setSpace(spaceData);
                setTasks(taskData);
            } catch (error) {
                toast.error(error.message);
            }
        }

        if (spaceId) {
            loadSpace();
        }
    }, [spaceId]);

    const openAddSpace = (returnTo, title) => {
        navigate("/add-space", { state: { returnTo, title } });
    };

    const openAddTask = (target, targetTitle, targetImportant = false) => {
        navigate("/add-task", {
            state: { returnTo: target, title: targetTitle, defaultImportant: targetImportant },
        });
    };

    if (!space) {
        return (
            <main className="main-content space-view-container">
                <Typography variant="h5">Space not found</Typography>
                <Typography variant="body1">
                    Open this page from the View button in Spaces.
                </Typography>
                <button type="button" className="space-back-button" onClick={() => navigate("/spaces")}>
                    Back to spaces
                </button>
            </main>
        );
    }

    const getTaskKey = (task) => `${spaceId}:${task.id}`;
    const toggleCompleted = async (task) => {
        if (task.is_completed) {
            return;
        }

        try {
            const updatedTask = await completeTask(task.id);
            setTasks((previousTasks) => previousTasks.map((currentTask) => (
                currentTask.id === task.id ? updatedTask : currentTask
            )));
        } catch (error) {
            toast.error(error.message);
        }
    };
    const taskEntries = tasks.map((task) => ({
        task,
        status: task.is_completed ? "Done" : "To do",
    }));
    const completedTasks = taskEntries.filter(({ status }) => status === "Done").length;
    const completionPercent = tasks.length === 0
        ? 0
        : Math.round((completedTasks / tasks.length) * 100);
    const filteredTasks = taskEntries.filter(({ status }) => {
        const isCompleted = status === "Done";

        if (activeFilter === "done") {
            return isCompleted;
        }

        if (activeFilter === "todo") {
            return !isCompleted;
        }

        return true;
    });

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
                        <img src={SpaceIcon} alt="" />
                        <Typography variant="h6">Spaces</Typography>
                        <button className="sidebar-button-icon" type="button" onClick={(event) => { event.stopPropagation(); openAddSpace("/spaces", "Add space"); }} aria-label="Add space">
                            <img src={Plus} alt="" />
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
            <main className="main-content space-view-container">

                <header className="space-view-header">
                    <span
                        className="space-icon"
                        aria-hidden="true"
                        style={{
                            backgroundColor: space.color_hex ? `${space.color_hex}25` : "transparent",
                            borderRadius: "8px",
                            width: "36px",
                            height: "36px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <span className="space-symbol" style={{ fontSize: "20px" }}>
                            {SPACE_ICON_SYMBOLS[space.icon] || space.icon || "📁"}
                        </span>
                    </span>
                    <div>
                        <Typography variant="h5" className="space-view-title">{space.name}</Typography>
                        <Typography variant="body1" className="space-view-description">{space.description || "No description"}</Typography>
                    </div>
                    <img src={Plan} alt="" className="space-view-icon" />
                </header>
                <section className="space-progress" aria-label={`Progress in ${space.name}`}>
                    <div className="space-progress-header">
                        <Typography variant="body1">Progress</Typography>
                        <Typography variant="body2">{completedTasks}/{tasks.length} completed</Typography>
                    </div>
                    <div
                        className="space-progress-track"
                        role="progressbar"
                        aria-valuemin="0"
                        aria-valuemax="100"
                        aria-valuenow={completionPercent}
                        aria-label={`${completionPercent}% completed`}
                    >
                        <div className="space-progress-fill" style={{ width: `${completionPercent}%` }} />
                    </div>
                </section>
                {/*Nút filter tasks*/}
                <div className="filter-buttons">
                    <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />
                </div>
                <section className="space-tasks" aria-label={`Tasks in ${space.name}`}>
                    {filteredTasks.length === 0 ? (
                        <Typography className="space-empty-message">No tasks in this space yet.</Typography>
                    ) : filteredTasks.map(({ task, status }) => (
                        <article key={getTaskKey(task)} className="task-card space-task-card">
                            {/*Ô check để đánh dấu hoàn thành*/}
                            <input
                                type="checkbox"
                                checked={status === "Done"}
                                className="space-task-checkbox"
                                onChange={() => toggleCompleted(task)}
                            />
                            <div style={{ flex: 1, marginLeft: "10px" }}>
                                <Typography variant="body1" className="space-task-title">{task.title || task.name}</Typography>
                                {task.due_date && <Typography variant="caption">Due: {task.due_date}</Typography>}
                            </div>
                            {/*Trạng thái task*/}
                            <Typography variant="body2" className={`space-task-status ${status === "Done" ? "completed" : "not-completed"}`}>
                                {status === "Done" ? "Done" : "To do"}
                            </Typography>
                        </article>
                    ))}
                    {/*Nút thêm task vào space*/}
                    <button type="button" className="add-task-to-space-button" onClick={() => openAddTask(`/space?id=${space.id}`, `Add task to ${space.name}`)}>
                        <img src={Plus} alt="" />
                        <Typography variant="body1">Add new task</Typography>
                    </button>
                </section>
            </main>
        </>
    );
}

export default SpaceView;