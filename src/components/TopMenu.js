import React from "react";
import "./topmenu.css"; // Import styles for TopMenu

function TopMenu({ userName }) {
  return (
    <div className="top-menu">
      <h2>Welcome, {userName}!</h2>
    </div>
  );
}

export default TopMenu;
