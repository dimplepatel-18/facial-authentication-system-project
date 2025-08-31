import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import styled from "styled-components";
import { SignJWT } from "jose";
import { Link, useLocation } from "react-router-dom";

const FormContainer = styled.div`
  width: 400px;
  padding: 10px;
  background: #f7f7f7;
  border-radius: 8px;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.2);
  text-align: center;
  @media (max-width: 768px) {
    width: 90%;
    padding: 15px;
  }
  @media (max-width: 480px) {
    width: 100%;
    padding: 10px;
  }
`;
const Input = styled.input`
  width: 50%;
  padding: 10px;
  margin: 10px 0 0;
  border-radius: 4px;
  border: 1px solid #ccc;
  @media (max-width: 768px) {
    padding: 8px;
  }
  @media (max-width: 480px) {
    padding: 6px;
  }
`;
const Button = styled.button`
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
  &:hover {
    background-color: #0056b3;
  }
  @media (max-width: 768px) {
    padding: 8px;
  }
  @media (max-width: 480px) {
    padding: 6px;
  }
`;
const Video = styled.video`
  width: 320px;
  height: 140px;
  @media (max-width: 768px) {
    width: 100%;
    height: auto;
  }
`;
const OtpContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
  gap: 10px;
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;
const OtpInput = styled(Input)`
  flex: 1;
  margin: 0;
`;
const OtpButton = styled(Button)`
  margin: 0px;
  flex-shrink: 0;
  width: auto;
  padding: 10px 20px;
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

function CameraView() {
  const location = useLocation();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const motionCanvasRef = useRef(null); // for hand motion detection
  const [message, setMessage] = useState("Click 'Login' and wave your hand in front of the camera.");
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [userData, setUserData] = useState(null);
  const [gestureDetected, setGestureDetected] = useState(false);
  const [prevFrameData, setPrevFrameData] = useState(null);
  const successMessage = location.state?.successMessage;

  useEffect(() => {
    startCamera();
  }, []);

  const startCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        videoRef.current.srcObject = stream;
      })
      .catch(err => {
        console.error("Error accessing camera: ", err);
        setMessage("Camera access error");
      });
  };

  // Simple motion detection in a fixed area for hand wave gesture
  const detectMotion = () => {
    const video = videoRef.current;
    const canvas = motionCanvasRef.current;
    if (!video || !canvas) return false;
    const ctx = canvas.getContext('2d');

    if (video.readyState !== 4) return false;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Sample fixed rectangle area (e.g., right side) - adjust as needed
    const x = canvas.width - 100;
    const y = 50;
    const width = 80;
    const height = 100;

    const currentFrame = ctx.getImageData(x, y, width, height);

    if (!prevFrameData) {
      setPrevFrameData(currentFrame);
      return false;
    }

    // Calculate pixel difference between current frame and previous frame
    let diff = 0;
    for (let i = 0; i < currentFrame.data.length; i += 4) {
      const rDiff = Math.abs(currentFrame.data[i] - prevFrameData.data[i]);
      const gDiff = Math.abs(currentFrame.data[i + 1] - prevFrameData.data[i + 1]);
      const bDiff = Math.abs(currentFrame.data[i + 2] - prevFrameData.data[i + 2]);
      diff += rDiff + gDiff + bDiff;
    }

    // Average diff per pixel
    const avgDiff = diff / (currentFrame.data.length / 4);

    setPrevFrameData(currentFrame);

    // If average difference exceeds threshold, motion detected
    return avgDiff > 30;
  };

  const onLoginClick = () => {
    setMessage("Please wave your hand in front of the camera within 5 seconds...");

    let motionDetected = false;
    const startTime = Date.now();

    const intervalId = setInterval(() => {
      if (detectMotion()) {
        motionDetected = true;
      }

      if (motionDetected) {
        clearInterval(intervalId);
        setGestureDetected(true);
        setMessage("Hand gesture detected! Proceeding with face recognition...");
        captureImage();
      } else if (Date.now() - startTime > 5000) {
        clearInterval(intervalId);
        if (!motionDetected) {
          setMessage("No hand motion detected. Please try again.");
        }
      }
    }, 200);
  };

  const captureImage = () => {
    const context = canvasRef.current.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    const dataURL = canvasRef.current.toDataURL('image/png');

    setMessage("Checking if you're a registered user...");
    axios.post('http://localhost:9000/compare-image', { image: dataURL })
      .then(response => {
        if (response.data.success) {
          setMessage("Face recognized! Sending OTP...");
          setUserData(response.data);
          sendOtp(response.data.phone_number);
        } else {
          setMessage("Face not recognized. Please register.");
        }
      })
      .catch(error => {
        console.error("Error checking profile:", error);
        setMessage("Invalid User, try again");
      });
  };

  const sendOtp = (phone) => {
    axios.post('http://localhost:5000/send-otp', { phone })
      .then(response => {
        if (response.data.success) {
          setMessage("OTP sent to your registered phone number. Please enter it below.");
          setShowOtpInput(true);
        } else {
          setMessage("Failed to send OTP. Try again.");
        }
      })
      .catch(error => {
        console.error("Error sending OTP:", error);
        setMessage("An error occurred while sending OTP.");
      });
  };

  const verifyOtp = async () => {
    try {
      const response = await axios.post('http://localhost:5000/verify-otp', { id: userData.id, phone: userData.phone_number, otp });

      if (response.data.success) {
        const token = await generateToken({ userData });
        localStorage.setItem("authToken", token);
        setMessage("OTP verified! Redirecting to your profile...");
        setTimeout(() => {
          window.location.href = `/profile`;
        }, 1000);
      } else {
        setMessage("Incorrect OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setMessage("An error occurred while verifying OTP.");
    }
  };

  async function generateToken(UserData) {
    const secret = new TextEncoder().encode("mykey");
    const jwt = await new SignJWT({ token: UserData })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(secret);
    return jwt;
  }

  return (
    <FormContainer>
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}

      <h3>Login</h3>
      <Video ref={videoRef} autoPlay muted playsInline width="320" height="240" />
      <canvas ref={canvasRef} style={{ display: 'none' }} width="320" height="240" />
      <canvas ref={motionCanvasRef} style={{ display: 'none' }} width="320" height="240" />

      <p>{message}</p>
      <Button onClick={onLoginClick}>Login</Button>

      {showOtpInput && (
        <OtpContainer>
          <OtpInput
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
          />
          <OtpButton onClick={verifyOtp}>Verify OTP</OtpButton>
        </OtpContainer>
      )}

      <RegisterLink to="/register">New User? Register here</RegisterLink>
    </FormContainer>
  );
}

export default CameraView;
<?php
// Parent class
class Animal {
    public $name;

    public function __construct($name) {
        $this->name = $name;
    }

    public function speak() {
        echo $this->name . " makes a sound.";
    }
}

// Child class inherits from Animal
class Dog extends Animal {
    public function speak() {
        echo $this->name . " barks.";
    }
}

// Create an object of the Dog class
$dog = new Dog("Buddy");
$dog->speak();  // Output: Buddy barks.
?>

