import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtVerify } from "jose";
import Sidebar from "./sidebar"; // Import Sidebar
import "./ProfilePage.css"; // Import styles
import TopMenu from "./TopMenu"; // Import TopMenu

function ProfilePage() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("authToken");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const secret = new TextEncoder().encode("mykey");
        const { payload } = await jwtVerify(token, secret);
        const user = payload?.token?.userData || null;

        if (!user) {
          throw new Error("Invalid token structure");
        }

        setUserData(user);
      } catch (error) {
        console.error("Invalid Token:", error);
        localStorage.removeItem("authToken");
        navigate("/login");
      }
    };

    verifyToken();
  }, [navigate]);

  if (!userData) {
    return <p>Loading...</p>;
  }

  return (
    
    <div className="profile-page">
    
      <Sidebar isAdmin={userData.isAdmin} /> {/* Use Sidebar */}
    
      {/* Profile Section */}
      <div className="profile-container">
      <TopMenu userName={userData.name} /> {/* Integrate TopMenu */}
        <div className="profile-image">
          <img
            src={userData.photo ? `http://localhost:9000/uploads/${userData.photo}` : "/path/to/placeholder.png"}
            alt="Profile"
          />
        </div>
        <div className="profile-details">
          <h1>{userData.name}</h1>
          <p><strong>Phone Number:</strong> {userData.phone_number}</p>
          <p><strong>Email:</strong> {userData.email}</p>
          <p><strong>Designation:</strong> {userData.designation}</p>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
