import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Typography } from "@mui/material";
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

function SpaceList() {
    const navigate = useNavigate();
    const spaces = useMemo(getSpaces, []);

    return spaces.map((space, index) => (
        <button
            key={`${space.name}-${index}`}
            type="button"
            className="space-card"
            onClick={() => navigate(`/space?space=${encodeURIComponent(space.name)}`)}
        >
            <span className="space-icon" aria-hidden="true">
                {space.icon
                    ? <span className="space-symbol">{SPACE_ICON_SYMBOLS[space.icon] || "📁"}</span>
                    : <span className="folder-icon" />}
            </span>
            <span className="space-details">
                <Typography variant="h6">{space.name}</Typography>
                <Typography variant="body1">{space.description || "No description"}</Typography>
            </span>
        </button>
    ));
}

export default SpaceList;
