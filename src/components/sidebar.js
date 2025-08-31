import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const SidebarContainer = styled.div`
  width: 250px;
  // height: 100vh;
  background: #2c3e50; /* Modern dark background */
  color: #ecf0f1; /* Light text color */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
  `;

const SidebarHeader = styled.h2`
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  color: #1abc9c; /* Highlight color */
  margin-bottom: 20px;
  text-shadow: 1px 1px 2px #000, -1px -1px 2px #1abc9c; /* Bevel effect */
 border-radius: 5px;
   box-shadow: inset 2px 2px 5px #ffffff, /* top-left highlight */
              inset -2px -2px 5px #a3a3a3; /* bottom-right shadow */

  `;
const SidebarMenu = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
`;

const MenuItem = styled.li`
  margin: 15px 0;
  font-size: 16px;
  font-weight: bold;

  a {
    text-decoration: none;
    color: #ecf0f1;
    background: none;
    border: none;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: color 0.3s;

    &:hover {
      color: #1abc9c; /* Highlight on hover */
    }
  }
`;

const Footer = styled.footer`
  margin-top: 100px; /* Push footer to the bottom */
  text-align: center;
  padding: 10px;
  background: #34495e; /* Slightly darker footer background */
  color: #ecf0f1;
  font-size: 14px;
  border-top: 1px solid #1abc9c;

  p {
    margin: 5px 0;
  }

  strong {
    color: #1abc9c;
  }
`;

function Sidebar({ isAdmin }) {
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  return (
    <SidebarContainer>
      <div>
        <SidebarHeader>LookLogin</SidebarHeader>
        <SidebarMenu>
          {(isAdmin == 1 || isAdmin == 2) && (
            <MenuItem>
              <a href="/users">Users</a>
            </MenuItem>
          )}
          <MenuItem>
            <a href="/logs">Attendance Logs</a>
          </MenuItem>
          <MenuItem>
            <a href="/login" onClick={handleLogout}>Logout</a>
          </MenuItem>
        </SidebarMenu>
        <Footer>
        <p> <strong>  Syeda Fariyal  </strong> </p>
        <p> <strong> Amulya H A</strong>  </p>
        <p> <strong> Dimple Patel P  </strong>  </p>
        <p>Guide : <b> Priya V N</b> </p><p> Department of BCA </p>
        <p>SBRR MAHAJANA FIRST GRADE  COLLEGE,Mysuru</p>
      </Footer>
      </div>
    
    </SidebarContainer>
  );
}

export default Sidebar;