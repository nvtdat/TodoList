import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Typography } from "@mui/material";
import TrashIcon from "../assets/trash.png";
import toast from "react-hot-toast";
import { deleteSpace, getSpaces as fetchSpaces } from "../services/authApi";
import "./web.css";

export const DEFAULT_SPACES = [
    {
        name: "Study Plan",
        icon: "",
        description: "Focus on your academic goals",
        tasks: [
            { id: 1, title: "Read Chapter 1", status: "Done", dueDate: "2023-07-05" },
            { id: 2, title: "Complete Assignment 1", status: "To do", dueDate: "2023-07-10" },
            { id: 3, title: "Prepare for Quiz", status: "To do", dueDate: "2023-07-12" },
        ],
    },
    {
        name: "Work Progress",
        icon: "",
        description: "Focus on your career goals",
        tasks: [
            { id: 1, title: "Finish Project Report", status: "To do", dueDate: "2023-07-15" },
            { id: 2, title: "Attend Team Meeting", status: "Done", dueDate: "2023-07-10" },
            { id: 3, title: "Submit Timesheet", status: "To do", dueDate: "2023-07-20" },
        ],
    },
    {
        name: "Event Plan",
        icon: "",
        description: "Focus on your event goals",
        tasks: [
            { id: 1, title: "Plan Birthday Party", status: "To do", dueDate: "2023-08-01" },
            { id: 2, title: "Send Invitations", status: "Done", dueDate: "2023-07-25" },
            { id: 3, title: "Prepare Gifts", status: "To do", dueDate: "2023-07-30" },
        ],
    },
];

export const SPACE_ICON_SYMBOLS = {
    folder: "📁",
    briefcase: "💼",
    book: "▤",
    code: "<>",
    palette: "🎨",
};

function readSavedSpaces() {
    try {
        const savedSpaces = JSON.parse(localStorage.getItem("todo-list:spaces") || "[]");
        return Array.isArray(savedSpaces) ? savedSpaces : [];
    } catch {
        return [];
    }
}

export function getSpaces() {
    return [...DEFAULT_SPACES, ...readSavedSpaces()];
}

function SpaceList({searchQuery = ""}) {
    const navigate = useNavigate();
    
    const [spaces, setSpaces] = useState([]);

    useEffect(() => {
        fetchSpaces()
            .then(setSpaces)
            .catch((error) => toast.error(error.message));
    }, []);

    async function handleDelete(space) {
        const confirmed = window.confirm(`Are you sure you want to delete the space "${space.name}"?`);
        if (!confirmed) {
            return;
        }

        try {
            await deleteSpace(space.id);
            setSpaces((currentSpaces) => currentSpaces.filter((currentSpace) => currentSpace.id !== space.id));
        } catch (error) {
            toast.error(error.message);
        }
    }

    const filteredSpaces = spaces.filter((space) =>
        space.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filteredSpaces.map((space, index) => (
        <div
            key={`${space.name}-${index}`}
            className="space-card"
            onClick={() => navigate(`/space?id=${space.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    navigate(`/space?id=${space.id}`);
                }
            }}
        >
            <span
                className="space-icon"
                aria-hidden="true"
                style={{
                    backgroundColor: space.color_hex ? `${space.color_hex}25` : "transparent",
                    borderRadius: "6px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "22px",
                    height: "22px",
                }}
            >
                <span className="space-symbol" style={{ fontSize: "14px", lineHeight: 1 }}>
                    {SPACE_ICON_SYMBOLS[space.icon] || space.icon || "📁"}
                </span>
            </span>
            <span className="space-details">
                <Typography variant="h6">{space.name}</Typography>
                <Typography variant="body1">{space.description || "No description"}</Typography>
            </span>
            <button
                type="button"
                className="space-delete-button"
                aria-label={`Delete ${space.name}`}
                onClick={(event) => {
                    event.stopPropagation();
                    handleDelete(space);
                }}
            >
                <img className="space-delete-icon" src={TrashIcon} alt="" aria-hidden="true" />
            </button>
            
        </div>
    ));
}

export default SpaceList;
