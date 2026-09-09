import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
    Button,
    TextField,
    Typography,
    InputAdornment,
} from "@mui/material";
import './web.css';
import Logo from '../assets/logo.png';
import Home from '../assets/home.png';
import Star from '../assets/star.png';
import Planned from '../assets/planned.png';
import Space from '../assets/space.png';
import Plus from '../assets/plus.png';
import Google from '../assets/google.png'
import Email from '../assets/mail.png';
import Password from '../assets/lock.png'

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    async function handleLogin(event) {
        //Để trống để sau này thêm backend
        navigate("/tasks")
    }
    return (
        <>
            {/* Phần sidebar*/}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <img src={Logo} alt="" style={{ scale: 0.5 }} />
                </div>
                <div className="sidebar-content">
                    <p className="sidebar-header">Welcome back</p>
                </div>

                {/*Các nút bấm*/}
                <div className="sidebar-buttons">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
                        <img src={Home} alt="" />
                        <Typography variant="h6" sx={{ fontFamily: 'Iosevka Charon, monospace', fontSize: "18px" }}>Tasks</Typography>
                        <button className="sidebar-button-icon">
                            <img src={Plus} alt="Plus" />
                        </button>
                    </div>
                </div>
                <div className="sidebar-buttons">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
                        <img src={Planned} alt="" />
                        <Typography variant="h6" sx={{ fontFamily: 'Iosevka Charon, monospace', fontSize: "18px" }}>Planned</Typography>
                        <button className="sidebar-button-icon">
                            <img src={Plus} alt="Plus" />
                        </button>
                    </div>
                </div>
                <div className="sidebar-buttons">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
                        <img src={Star} alt="" />
                        <Typography variant="h6" sx={{ fontFamily: 'Iosevka Charon, monospace', fontSize: "18px" }}>Important</Typography>
                        <button className="sidebar-button-icon">
                            <img src={Plus} alt="Plus" />
                        </button>
                    </div>
                </div>
                <div className="sidebar-buttons">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
                        <img src={Space} alt="Space" />
                        <Typography variant="h6" sx={{ fontFamily: 'Iosevka Charon, monospace', fontSize: "18px" }}>Spaces</Typography>
                        <button className="sidebar-button-icon">
                            <img src={Plus} alt="Plus" />
                        </button>
                    </div>
                </div>

                {/* Đường kẻ */}
                <div className="sidebar-line"></div>

                {/*Tên tác giả */}
                <Typography variant="h6" sx={{ fontFamily: 'Iosevka Charon, monospace', fontSize: "14px", color: "#1D4ED8", fontStyle: "italic", display: "flex", marginTop: "auto" }}>@Made by Dante<br />Nguyen Van Tien Dat</Typography>
            </aside>
            {/* Phần nội dung*/}
            <main className="main-content">
                <div className="login-panel">
                    <div className="main-content-header">
                        <img src={Logo} alt="" style={{}} />
                        <h2 style={{ fontWeight: "bold" }}>Login to Manage your works</h2>
                    </div>

                    {/*Phần nhập liệu*/}
                    <form className="login-input-panel" onSubmit={handleLogin}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "14px", width: "100%", justifyContent: "center", alignItems: "center" }}>
                            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "6px" }}>
                                <Typography variant="h6" sx={{ fontFamily: 'Iosevka Charon, monospace', fontSize: "16px", fontWeight: "bold" }}>Email</Typography>
                                <TextField
                                    placeholder="Email"
                                    type="email"
                                    variant="outlined"
                                    className="login-input-field"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <img src={Email} alt="Email" />
                                                </InputAdornment>
                                            )
                                        }
                                    }}
                                />
                            </div>
                            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "6px" }}>
                                <Typography variant="h6" sx={{ fontFamily: 'Iosevka Charon, monospace', fontSize: "16px", fontWeight: "bold" }}>Password</Typography>
                                <TextField
                                    placeholder="password123@"
                                    type="password"
                                    variant="outlined"
                                    className="login-input-field"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <img src={Password} alt="Password" />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </div>
                            <Button className="login-button" style={{ marginTop: "10px" }} type="submit" disabled={isLoading} onClick={handleLogin}>
                                <Typography variant="h6" sx={{ fontFamily: 'Iosevka Charon, monospace', fontSize: "18px" }}>
                                    Login
                                </Typography>
                            </Button>

                            {/*Dòng chữ or */}
                            <div style={{ display: 'flex', alignItems: 'center', width: '220px', margin: '10px 0' }}>
                                <div style={{ flex: 1, height: '1px', background: '#94A3B8' }}></div>
                                <span style={{ margin: '0 10px', color: '#0284c7', fontSize: '14px' }}>or</span>
                                <div style={{ flex: 1, height: '1px', background: '#94A3B8' }}></div>
                            </div>

                            {/*Nút đăng nhập băng Google*/}
                            <Button className="google-button" variant="outlined">
                                <img src={Google} alt="Google" style={{ width: "22px", height: "22px", objectFit: "contain", marginRight: "8px" }} />
                                <Typography variant="h6" sx={{ fontFamily: 'Iosevka Charon, monospace', fontSize: "18px" }}>Google</Typography>
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
        </>
    )
}

export default Login;