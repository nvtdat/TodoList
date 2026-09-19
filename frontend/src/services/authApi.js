const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const ACCESS_TOKEN_KEY = "todo-list:access-token";

function getToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function saveToken(accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
}

export function clearToken() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export async function loginWithGoogle(accessToken) {
    const result = await request("/google-login", {
        method: "POST",
        body: JSON.stringify({ token: accessToken }),
    });
    saveToken(result.access_token);
    return result;
}

async function request(url, options = {}) {
    const headers = new Headers(options.headers);
    headers.set("Accept", "application/json");

    if (options.body) {
        headers.set("Content-Type", "application/json");
    }

    const token = getToken();
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${API_URL}${url}`, { ...options, headers });
    const body = await response.json().catch(() => null);
    if (!response.ok) {
        if (response.status === 401) {
            clearToken();
        }
        throw new Error(body?.detail || body?.details || `HTTP error! status: ${response.status}`);
    }
    return body;
}

export async function login(email, password) {
    const result = await request("/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
    saveToken(result.access_token);
    return result;
}

export async function verifyEmail(token) {
    const result = await request(`/verify?token=${token}`);
    return result;
}

export async function resendVerification(email) {
    const result = await request("/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email }),
    });
    return result;
}

export function register(name, email, password) {
    return request("/users", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
    });
}

export function getTasks() {
    return request("/tasks");
}

export function getImportantTasks() {
    return request("/task/filter/important");
}

export function getPlannedTasks() {
    return request("/task/filter/planned");
}

export function completeTask(taskId) {
    return request(`/task/${taskId}/complete`, { method: "PATCH" });
}

export function deleteTask(taskId) {
    return request(`/task/${taskId}`, { method: "DELETE" });
}

export function createTask(title, description, options = {}) {
    return request("/tasks", {
        method: "POST",
        body: JSON.stringify({ title, description, ...options }),
    });
}

export function updateTask(taskId, title, description, options = {}) {
    return request(`/task/${taskId}`, {
        method: "PUT",
        body: JSON.stringify({ title, description, ...options }),
    });
}

export function getSpaces() {
    return request("/spaces");
}

export function createSpace(name, description = "", color_hex = "", icon = "") {
    return request("/spaces", {
        method: "POST",
        body: JSON.stringify({ name, description, color_hex, icon }),
    });
}

export function updateSpace() {
    throw new Error("The backend does not provide a space update endpoint.");
}

export function deleteSpace(spaceId) {
    return request(`/spaces/${spaceId}`, { method: "DELETE" });
}

export function getSpace(spaceId) {
    return request(`/spaces/${spaceId}`);
}

export function getTasksBySpace(spaceId) {
    return request(`/spaces/${spaceId}/tasks`);
}

export function createTaskInSpace(spaceId, title, description) {
    return request(`/spaces/${spaceId}/tasks`, {
        method: "POST",
        body: JSON.stringify({ title, description }),
    });
}
