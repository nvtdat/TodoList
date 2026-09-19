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
import Plan from '../assets/planned.png';
import SpaceIcon from '../assets/space.png';
import Plus from '../assets/plus.png';
import Celebrate from '../assets/celebration.png';
import Calendar from '../assets/calendar.png';
import Search from '../assets/search.png';
import Document from '../assets/documentation.png';
import SpaceList from "./SpaceList";
import WhitePlus from "../assets/white-plus.png";
import toast from "react-hot-toast";
import { getSpaces, getTasksBySpace } from "../services/authApi";

const SPACE_ICON_SYMBOLS = {
    folder: "📁",
    briefcase: "💼",
    book: "▤",
    code: "<>",
    palette: "🎨",
};

function Space() {
    const navigate = useNavigate();
    const [userPlan, setUserPlan] = useState("Free");
    const [userTasks, setUserTasks] = useState([]);
    const [userSpaces, setUserSpaces] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeButton, setActiveButton] = useState('spaces');

    const handleTaskClick = () => {
        navigate('/tasks');
    }

    const handlePlanClick = () => {
        navigate('/planned');
    };

    const handleImportantClick = () => {
        navigate('/important');
    };

    useEffect(() => {
        async function loadSpaces() {
            try {
                const spaces = await getSpaces();
                const spacesWithTasks = await Promise.all(spaces.map(async (space) => ({
                    ...space,
                    tasks: await getTasksBySpace(space.id),
                })));
                setUserSpaces(spacesWithTasks);
            } catch (error) {
                toast.error(error.message);
            }
        }

        loadSpaces();
    }, []);

    {/*Render space list*/ }
    function renderSpaceList() {
        return userSpaces.map((space, index) => (
            <div key={index} className="space-card">
                <div className="space-icon" aria-hidden="true">
                    {space.icon
                        ? <span className="space-symbol" aria-label={space.icon}>{SPACE_ICON_SYMBOLS[space.icon] || "📁"}</span>
                        : <span className="folder-icon" />}
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
        const q = searchQuery.toLowerCase().trim();
        const filteredSpaces = userSpaces.filter((space) => {
            return (
                !q ||
                space.name?.toLowerCase().includes(q) ||
                space.description?.toLowerCase().includes(q)
            );
        });

        if (filteredSpaces.length === 0) {
            return (
                <p className="empty-filter-message" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "20px" }}>
                    No spaces found.
                </p>
            );
        }

        return filteredSpaces.map((space) => {
            const tasks = Array.isArray(space.tasks) ? space.tasks : [];
            const taskCount = tasks.length;
            const completedTaskCount = tasks.filter((task) => task.is_completed).length;
            const completionPercent = taskCount === 0
                ? 0
                : Math.round((completedTaskCount / taskCount) * 100);

            return (
                <div key={space.name} className="space-item-card">
                    <div
                        className="space-icon"
                        aria-hidden="true"
                        style={{
                            backgroundColor: space.color_hex ? `${space.color_hex}25` : "transparent",
                            borderRadius: "8px",
                            width: "25px",
                            height: "25px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "5px",
                        }}
                    >
                        <span className="space-symbol" aria-label={space.icon || "space-icon"} style={{ fontSize: "20px" }}>
                            {SPACE_ICON_SYMBOLS[space.icon] || space.icon || "📁"}
                        </span>
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
                        onClick={() => navigate(`/space?id=${space.id}`)}
                        aria-label={`View tasks in ${space.name}`}
                    >
                        <Typography className="view-tasks-label" variant="body1" sx={{ fontFamily: 'Iosevka Charon, monospace', fontSize: "12px", fontWeight: 600 }}>View</Typography>
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
                        <img src={Plan} alt="" />
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
                <div
                    className={`sidebar-buttons ${activeButton === 'spaces' ? 'active' : ''}`}
                    onClick={() => setActiveButton('spaces')}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
                        <img src={SpaceIcon} alt="Space" />
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
                        placeholder="Search your spaces ..."
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="search-button" type="button" aria-label="Search">
                        <img src={Search} alt="Search" style={{ width: "18px", height: "18px" }} />
                    </button>
                </div>

                <div className="space-panel">
                    <img src={Document} alt="Document" style={{ width: "80px", height: "80px", marginRight: "20px" }} />
                    <div className="space-panel-content">
                        <h1 sx={{ fontFamily: 'Iosevka Charon, monospace', fontSize: "24px", fontWeight: "bold" }}>Your Space</h1>
                        <p sx={{ fontFamily: 'Iosevka Charon, monospace', fontSize: "14px" }}>Manage your tasks and projects in one place</p>
                    </div>
                    <img src={PlannedIcon} alt="Planned" style={{ width: "80px", height: "80px", marginRight: "20px" }} />
                </div>

                {/*Nút Tạo không gian mới*/}
                <div className="create-space-button-container">
                    <button type="button" className="create-space-button" onClick={() => navigate('/add-space', { state: { returnTo: '/spaces', title: 'Add new space' } })}>
                        <img src={WhitePlus} alt="" />
                        <Typography variant="body1">New</Typography>
                    </button>
                </div>

                <div className="space-panel-grid">
                    {renderSpacePanel()}
                </div>


            </main>
        </>
    )
}

export default Space;
