import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtVerify } from "jose";
import Sidebar from "./sidebar";
import "./global.css";
import styled from 'styled-components';
import TopMenu from "./TopMenu";
const FormContainer = styled.div`
  width: 700px;
  padding: 20px;
  background: #f7f7f7;
  border-radius: 8px;
  margin: 50px auto;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.2);
`;

const Input = styled.input`
  width: 90%;
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

  th, td {
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

    th, td {
      padding: 10px;
    }
  }

  @media (max-width: 480px) {
    font-size: 12px;

    th, td {
      padding: 8px;
    }
  }
`;
function LogsPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  // Search filters
  const [searchName, setSearchName] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;

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

    const fetchLogs = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/logs");
        const data = await response.json();

        if (data.success) {
          setLogs(data.logs);
        } else {
          console.error("Error fetching logs:", data.message);
        }
      } catch (error) {
        console.error("Network error:", error);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
    fetchLogs();
  }, [navigate]);

  // Filter logs based on search inputs
  const filteredLogs = logs.filter((log) => {
    const logDate = new Date(log.created_at);
    const matchesName = searchName ? log.name.toLowerCase().includes(searchName.toLowerCase()) : true;
    const matchesDate = (!fromDate || logDate >= new Date(fromDate)) && (!toDate || logDate <= new Date(toDate));
    return matchesName && matchesDate;
  });

  // Pagination logic
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (!userData) {
    return <p>Loading...</p>;
  }

  return (
    <div className="profile-page">
      <Sidebar isAdmin={userData.isAdmin} />
      <div className="profile-container">
      <TopMenu userName={userData.name} />
        {/* Breadcrumb Navigation */}
        {/* <nav className="breadcrumb">
          <span className="breadcrumb-item" onClick={() => navigate("/profile")}>
            Profile
          </span>
          <span className="breadcrumb-separator"> → </span>
          <span className="breadcrumb-active">Attendance Logs</span>
        </nav> */}

        <h1>Attendance Logs</h1>

        {/* Search & Filter UI */}
        <div className="filter-container">
          <input type="text" placeholder="Search by Name" value={searchName} onChange={(e) => setSearchName(e.target.value)} />
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </div>

        <StyledTable>
          <thead>
            <tr>
              <th>User</th>
              <th>Phone Number</th>
              {/* <th>OTP</th> */}
              <th>Status</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {currentLogs.length > 0 ? (
              currentLogs.map((log) => (
                <tr key={log.id}>
                  <td>{log.name}</td>
                  <td>{log.phone_number}</td>
                  {/* <td>{log.otp}</td> */}
                  <td className={log.status === "SUCCESS" ? "success" : "failed"}>{log.status}</td>
                  <td>{new Date(log.created_at).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", color: "gray" }}>No matching logs found.</td>
              </tr>
            )}
          </tbody>
        </StyledTable>
        {/* Pagination Controls */}
        <div className="pagination">
          {Array.from({ length: Math.ceil(filteredLogs.length / logsPerPage) }, (_, index) => (
            <button key={index + 1} onClick={() => paginate(index + 1)} className={currentPage === index + 1 ? "active" : ""}>
              {index + 1}
            </button>
          ))}
        </div>
       
      </div>
    </div>
  );
}

export default LogsPage;
