import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./sidebar";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { jwtVerify } from "jose";
import TopMenu from "./TopMenu";

const ActionButton = styled.button`
  padding: 8px 16px;
  margin-right: 8px;
  border: none;
  border-radius: 20px;
  background-color: ${(props) => (props.disabled ? "#ccc" : props.danger ? "#dc3545" : "#007bff")};
  color: ${(props) => (props.disabled ? "#666" : "white")};
  font-weight: 500;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${(props) =>
      props.disabled ? "#ccc" : props.danger ? "#c82333" : "#0056b3"};
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  font-size: 16px;
  text-align: left;
  background-color: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);

  thead {
    background-color: #007bff;
    color: white;
  }

  th,
  td {
    padding: 12px 15px;
    border: 1px solid #ddd;
  }

  th {
    text-transform: uppercase;
    font-weight: bold;
  }

  tbody tr:nth-child(even) {
    background-color: #f2f2f2;
  }

  tbody tr:hover {
    background-color: #e9ecef;
  }

  @media (max-width: 768px) {
    font-size: 14px;

    th,
    td {
      padding: 10px;
    }
  }

  @media (max-width: 480px) {
    font-size: 12px;

    th,
    td {
      padding: 8px;
    }
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;

  button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 8px 12px;
    margin: 0 5px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
      background-color: #0056b3;
    }

    &:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
  }
`;

const RegisterLinkWrapper = styled.div`
  text-align: right;
  margin-top: 10px;
`;

const RegisterLink = styled(Link)`
  display: inline-block;
  padding: 10px 20px;
  color: white;
  background-color: #007bff;
  text-decoration: none;
  border-radius: 25px;
  font-weight: 500;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0056b3;
  }
`;

function UsersPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  const [userData, setUserData] = useState(null);

  const successMessage = location.state?.successMessage;

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
        console.log("User Data:", user); // Log the user data for debugging
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
    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/users");
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
      } else {
        console.error("Error fetching users:", data.message);
      }
    } catch (error) {
      console.error("Network error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        setUsers(users.filter((user) => user.id !== id));
      } else {
        console.error("Error deleting user:", data.message);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

 
  const handleEdit = (id) => {
    const userToEdit = users.find((user) => user.id === id); // Find the user by ID
    navigate("/register", { state: { user: userToEdit } }); // Pass user data to RegistrationForm
  };
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  if (!userData) {
    return <p>Loading...</p>;
  }

  return (
    <div className="profile-page">
      <Sidebar isAdmin={userData.isAdmin} />
      <div className="profile-container">
        <TopMenu userName={userData.name} />
        <h1>Users Management</h1>

        {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}

        <RegisterLinkWrapper>
          <RegisterLink to="/register">Register</RegisterLink>
        </RegisterLinkWrapper>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <StyledTable>
              <thead>
                <tr>
                
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>User Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user) => (
                  <tr key={user.id}>
                   
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.designation}</td>
                    <td>
                    {user.isAdmin == 0
                      ? "User"
                      : user.isAdmin == 1
                      ? "Admin"
                      : user.isAdmin == 2
                      ? "Super Admin"
                      : "Unknown"}
                  </td>
                    <td>
                      
                      <ActionButton
                        onClick={() => handleEdit(user.id)}
                        disabled={user.isAdmin ==2} 
                      >
                        Edit
                      </ActionButton>
                      <ActionButton
                        onClick={() => handleDelete(user.id)}
                        disabled={user.isAdmin ==2} 
                        danger
                      >
                        Delete
                      </ActionButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </StyledTable>
            <Pagination>
              {Array.from({ length: Math.ceil(users.length / usersPerPage) }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  disabled={currentPage === i + 1}
                >
                  {i + 1}
                </button>
              ))}
            </Pagination>
          </>
        )}
      </div>
    </div>
  );
}

export default UsersPage;