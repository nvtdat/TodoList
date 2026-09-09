import { useState } from "react";
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

const SPACE_COLORS = [
    { value: "cyan", hex: "#06B6D4", label: "Cyan" },
    { value: "blue", hex: "#3B82F6", label: "Blue" },
    { value: "indigo", hex: "#6366F1", label: "Indigo" },
    { value: "orange", hex: "#FB923C", label: "Orange" },
    { value: "pink", hex: "#EC4899", label: "Pink" },
    { value: "green", hex: "#22C55E", label: "Green" },
];

const SPACE_ICONS = [
    { value: "folder", symbol: "📁", label: "Folder" },
    { value: "briefcase", symbol: "💼", label: "Briefcase" },
    { value: "book", symbol: "▤", label: "Book" },
    { value: "code", symbol: "<> ", label: "Code" },
    { value: "palette", symbol: "🎨", label: "Palette" },
];

function AddNewSpace() {
    const navigate = useNavigate();
    const location = useLocation();
    const { returnTo = "/spaces", title = "Add new space" } = location.state || {};
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [color, setColor] = useState(SPACE_COLORS[0].value);
    const [icon, setIcon] = useState(SPACE_ICONS[0].value);
    const [nameError, setNameError] = useState("");

    const [userSpaces] = useState([
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



    const openAddSpace = (returnTo, title) => {
        navigate("/add-space", { state: { returnTo, title } });
    };

    const openAddTask = (target, targetTitle, targetImportant = false) => {
        navigate("/add-task", {
            state: { returnTo: target, title: targetTitle, defaultImportant: targetImportant },
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const trimmedName = name.trim();

        if (!trimmedName) {
            setNameError("Space name is required.");
            return;
        }

        const newSpace = {
            name: trimmedName,
            description: description.trim(),
            color,
            icon,
            tasks: [],
        };
        const savedSpaces = JSON.parse(localStorage.getItem("todo-list:spaces") || "[]");
        localStorage.setItem("todo-list:spaces", JSON.stringify([...savedSpaces, newSpace]));
        navigate(returnTo);
    };

    const handleCancel = () => navigate(returnTo);
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
                        {renderSpaceList()}
                    </div>
    
                    {/*Tên tác giả */}
                    <Typography variant="h6" sx={{ fontFamily: 'Iosevka Charon, monospace', fontSize: "14px", color: "#1D4ED8", fontStyle: "italic", display: "flex", marginTop: "auto" }}>@Made by Dante<br />Nguyen Van Tien Dat</Typography>
    
                </aside>
                <main className="main-content">
                    <div className="search-bar">
                        <input type="text" placeholder="Search your planned work ..." className="search-input" />
                        <button className="search-button" type="button">
                            <img src={Search} alt="Search" style={{ width: "18px", height: "18px" }} />
                        </button>
                    </div>
                    
                    {/*Khung thêm Space*/}
                    <div className="add-new-space-container">
                        
                        <form className="add-new-space-form" onSubmit={handleSubmit}>
                            <div className="add-new-space-header">
                                <Typography variant="h4" sx={{ fontFamily: 'Iosevka Charon, monospace', fontSize: "24px" }}>Create new Space</Typography>
                                <Typography variant="h6" sx={{ fontFamily: 'Iosevka Charon, monospace', fontSize: "14px", color: "#6B7280"}}>Set up a new workspace to organize your tasks</Typography>
                            </div>
                            {/* Đường kẻ */}
                            <div className="add-space-divider"></div>
                            <div className="form-group">
                                <label htmlFor="name">Space name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter space name"
                                    id="name"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        if (nameError) setNameError("");
                                    }}
                                    required
                                />
                                {nameError && <span className="form-error">{nameError}</span>}
                            </div>

                            <fieldset className="form-group choice-group">
                                <legend>Choose color</legend>
                                <div className="space-color-options">
                                    {SPACE_COLORS.map((spaceColor) => (
                                        <button
                                            key={spaceColor.value}
                                            type="button"
                                            className={`space-color-option ${color === spaceColor.value ? "is-selected" : ""}`}
                                            style={{ "--space-color": spaceColor.hex }}
                                            onClick={() => setColor(spaceColor.value)}
                                            aria-label={spaceColor.label}
                                            aria-pressed={color === spaceColor.value}
                                        />
                                    ))}
                                </div>
                            </fieldset>

                            <fieldset className="form-group choice-group">
                                <legend>Choose icon</legend>
                                <div className="space-icon-options">
                                    {SPACE_ICONS.map((spaceIcon) => (
                                        <button
                                            key={spaceIcon.value}
                                            type="button"
                                            className={`space-icon-option ${icon === spaceIcon.value ? "is-selected" : ""}`}
                                            onClick={() => setIcon(spaceIcon.value)}
                                            aria-label={spaceIcon.label}
                                            aria-pressed={icon === spaceIcon.value}
                                        >
                                            <span aria-hidden="true">{spaceIcon.symbol}</span>
                                        </button>
                                    ))}
                                </div>
                            </fieldset>

                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    className="form-control"
                                    placeholder="Add a description (optional)..."
                                    rows="4"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                            <div className="add-space-form-actions">
                                <button className="cancel-button" type="button" onClick={handleCancel}>Cancel</button>
                                <button className="submit-button" type="submit">Create Space</button>
                            </div>
                        </form>
                    </div>
                </main>
        </>
    )
}

export default AddNewSpace;