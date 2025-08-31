import React, { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const FormContainer = styled.div`
  width: 300px;
  padding: 20px;
  background: #f7f7f7;
  border-radius: 8px;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.2);
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border-radius: 4px;
  border: 1px solid #ccc;
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const RegisterLink = styled(Link)`
  display: block;
  text-align: center;
  margin-top: 10px;
  color: #007bff;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState(""); // To store user's phone number
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sessionOtp, setSessionOtp] = useState(null);

  // Function to handle login and send OTP
  const handleLogin = async () => {
    const response = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (data.success) {
      setPhone(data.phone); // Get user's phone number from backend
      sendOtp(data.phone);
    } else {
      alert("Invalid credentials");
    }
  };

  // Function to send OTP
  const sendOtp = async (phone) => {
    const response = await fetch("http://localhost:5000/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });

    const data = await response.json();
    if (data.success) {
      setSessionOtp(data.otp); // Store OTP for verification
      setOtpSent(true);
      alert("OTP sent to your phone.");
    } else {
      alert("Error sending OTP.");
    }
  };

  // Function to verify OTP
  const verifyOtp = () => {
    if (parseInt(otp) === sessionOtp) {
      alert("OTP verified! Login successful.");
    } else {
      alert("Invalid OTP.");
    }
  };

  return (
    <FormContainer>
      <h3>Login</h3>
      {!otpSent ? (
        <>
          <Input
            type="email"
            placeholder="Email ID"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button onClick={handleLogin}>Login</Button>
        </>
      ) : (
        <>
          <Input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <Button onClick={verifyOtp}>Verify OTP</Button>
        </>
      )}
      {/* <RegisterLink to="/register">Register now</RegisterLink> */}
    </FormContainer>
  );
};

export default LoginForm;
