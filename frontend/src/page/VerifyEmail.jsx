import {useEffect, useState} from "react";
import {useSearchParams} from "react-router-dom";
import logo from "../assets/logo.png";
import axios from "axios";
import './web.css'

function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState("loading");

    useEffect(() => {
        const token = searchParams.get("token");
        if (token) {
            axios
                .get(`http://localhost:8000/verify?token=${token}`)
                .then((response) => {
                    setMessage(response.data.message);
                    setStatus("success");
                })
                .catch((error) => {
                    setMessage(error.response.data.detail || "An error occurred");
                    setStatus("error");
                });
        } else {
            setMessage("No token provided");
            setStatus("error");
        }
    }, [searchParams]);

    {/* Render trạng thái xác minh email */}
    return (
        <div className="verify-email-container">
            <div className="verify-email-box">
                <img src={logo} alt="Logo" className="logo" />
                <h2>Email Verification</h2>
                {status === "loading" && <p>Verifying your email...</p>}
                {status === "success" && <p>{message}</p>}
                {status === "error" && <p style={{color: "red"}}>{message}</p>}
            </div>
        </div>
    );
}

export default VerifyEmail;