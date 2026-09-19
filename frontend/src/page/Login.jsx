import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { login, register, verifyEmail, resendVerification, loginWithGoogle } from "../services/authApi";
import { useGoogleLogin } from "@react-oauth/google";
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
    const [isRegistering, setIsRegistering] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const [needVerification, setNeedVerification] = useState(false);
    const [isResending, setIsResending] = useState(false); 
    

    async function handleGoogleLoginSuccess(credentialResponse) {
        setIsLoading(true);
        try {
            await loginWithGoogle(credentialResponse.access_token);
            toast.success("Logged in with Google successfully");
            //Chuyển huớng người dùng đến trang tasks sau khi đăng nhập thành công
            navigate("/tasks");
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    }

    const googleLogin = useGoogleLogin({
        onSuccess: handleGoogleLoginSuccess,
        onError: () => {
            toast.error("Google login failed");
        },
    });

    async function handleSubmit(event) {
        event.preventDefault();
        setIsLoading(true);
        setNeedVerification(false);

        try {
            if (isRegistering) {
                await register(name.trim(), email.trim(), password);
                await login(email.trim(), password);
                toast.success("Account created successfully");
            } else {
                await login(email.trim(), password);
            }
            navigate("/tasks");
        } catch (error) {
            if (error.message.includes("Please verify your email")) {
                setNeedVerification(true);
            }
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleVerifyEmail(token) {
        setIsResending(true);
        try {
            const response = await verifyEmail(token);
            toast.success(response.message);
            setNeedVerification(false);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsResending(false);
        }
    }

    async function handleResendVerification() {
        setIsResending(true);
        try {
            const response = await resendVerification(email.trim());   // ← dùng email, không phải token
            toast.success(response.message);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsResending(false);
        }
    }

    return (
        <>
            {/* Phần sidebar*/}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <img src={Logo} alt="" style={{ scale: 0.5 }} />
                </div>
                <div className="sidebar-content">
                    <p className="sidebar-header">Welcome back!</p>
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
                        <h2 style={{ fontWeight: "bold" }}>{isRegistering ? "Create your account" : "Login to Manage your works"}</h2>
                    </div>

                    {/*Phần nhập liệu*/}
                    <form className="login-input-panel" onSubmit={handleSubmit}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "14px", width: "100%", justifyContent: "center", alignItems: "center" }}>
                            {isRegistering && (
                                <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <Typography variant="h6" sx={{ fontFamily: 'Iosevka Charon, monospace', fontSize: "16px", fontWeight: "bold" }}>Name</Typography>
                                    <TextField
                                        placeholder="Your name"
                                        type="text"
                                        variant="outlined"
                                        className="login-input-field"
                                        value={name}
                                        onChange={(event) => setName(event.target.value)}
                                        required
                                    />
                                </div>
                            )}
                            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "6px" }}>
                                <Typography variant="h6" sx={{ fontFamily: 'Iosevka Charon, monospace', fontSize: "16px", fontWeight: "bold" }}>Email</Typography>
                                <TextField
                                    placeholder="Email"
                                    type="email"
                                    variant="outlined"
                                    className="login-input-field"
                                    value={email}
                                    required
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
                                    required
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
                            <Button className="login-button" style={{ marginTop: "10px" }} type="submit" disabled={isLoading}>
                                <Typography variant="h6" sx={{ fontFamily: 'Iosevka Charon, monospace', fontSize: "18px" }}>
                                    {isRegistering ? "Sign up" : "Login"}
                                </Typography>
                            </Button>

                            {needVerification && (
                                <div style={{
                                    width: "100%",
                                    textAlign: "center",
                                    padding: "10px",
                                    background: "#FEF2F2",
                                    borderRadius: "8px",
                                    border: "1px solid #FCA5A5"
                                }}>
                                    <Typography variant="body2" sx={{ color: "#DC2626", fontFamily: 'Iosevka Charon, monospace' }}>
                                        Your email is not verified yet.
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "#DC2626", fontFamily: 'Iosevka Charon, monospace' }}>
                                        Please check your email for a verification link.
                                    </Typography>
                                    <button
                                        type="button"
                                        onClick={handleResendVerification}
                                        disabled={isResending}
                                        style={{
                                            color: "#2563EB",
                                            background: "none",
                                            border: "none",
                                            padding: 0,
                                            marginTop: "4px",
                                            cursor: "pointer",
                                            font: "inherit",
                                            fontWeight: "bold",
                                            textDecoration: "underline"
                                        }}
                                    >
                                        {isResending ? "Sending..." : "Resend verification email"}
                                    </button>
                                </div>
                            )}

                            <div style={{ fontFamily: 'Iosevka Charon, monospace', fontSize: "14px" }}>
                                <span>{isRegistering ? "Already have an account? " : "Don't have an account? "}</span>
                                <button
                                    type="button"
                                    onClick={() => setIsRegistering((currentValue) => !currentValue)}
                                    style={{ color: "#2563EB", background: "none", border: "none", padding: 0, cursor: "pointer", font: "inherit", fontWeight: "bold" }}
                                >
                                    {isRegistering ? "Login" : "Sign up"}
                                </button>
                            </div>

                            {/*Dòng chữ or */}
                            <div style={{ display: 'flex', alignItems: 'center', width: '220px', margin: '10px 0' }}>
                                <div style={{ flex: 1, height: '1px', background: '#94A3B8' }}></div>
                                <span style={{ margin: '0 10px', color: '#0284c7', fontSize: '14px' }}>or</span>
                                <div style={{ flex: 1, height: '1px', background: '#94A3B8' }}></div>
                            </div>

                            {/*Nút dăng nhập bằng Google*/}
                            <Button className="google-button" style={{ marginTop: "10px" }} onClick={() => googleLogin()} disabled={isLoading}>
                                <img src={Google} alt="Google" style={{ marginRight: "8px" }} />
                                <Typography variant="h6" sx={{ fontFamily: 'Iosevka Charon, monospace', fontSize: "18px" }}>
                                    Google
                                </Typography>
                            </Button>
            
                        </div>
                    </form>
                </div>
            </main>
        </>
    )
}

export default Login;
