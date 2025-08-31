import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtVerify } from "jose";
import Sidebar from "./sidebar";
import "./global.css";
import styled from "styled-components";
import TopMenu from "./TopMenu";
import DataTable from "react-data-table-component"; // Import DataTable

// Styled container for consistent design
const StyledContainer = styled.div`
  width: 90%;
  max-width: 800px;
  margin: 50px auto;
  padding: 20px;
  background: #f7f7f7;
  border-radius: 8px;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.2);
`;

const FilterContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;

  input,
  select {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 30%;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;

    input,
    select {
      width: 100%;
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
  const [statusFilter, setStatusFilter] = useState(""); // New status filter

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

    // Ensure fromDate starts at 00:00
    const fromDateTime = fromDate ? new Date(fromDate + "T00:00:00") : null;

    // Ensure toDate ends at 23:59
    const toDateTime = toDate ? new Date(toDate + "T23:59:59") : null;

    const matchesName = searchName
      ? log.name.toLowerCase().includes(searchName.toLowerCase())
      : true;

    const matchesDate =
      (!fromDateTime || logDate >= fromDateTime) &&
      (!toDateTime || logDate <= toDateTime);

    const matchesStatus = statusFilter
      ? log.status.toLowerCase() === statusFilter.toLowerCase()
      : true;

    return matchesName && matchesDate && matchesStatus;
  });

  // Define columns for the DataTable
  const columns = [
    {
      name: "USER",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "PHONE NUMBER",
      selector: (row) => row.phone_number,
      sortable: true,
    },
    {
      name: "STATUS",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <span className={row.status === "SUCCESS" ? "success" : "failed"}>
          {row.status}
        </span>
      ),
    },
    {
      name: "TIMESTAMP",
      selector: (row) => new Date(row.created_at).toLocaleString(),
      sortable: true,
    },
  ];

  if (!userData) {
    return <p>Loading...</p>;
  }

  return (
    <div className="profile-page">
      <Sidebar isAdmin={userData.isAdmin} />
      <div className="profile-container">
        <TopMenu userName={userData.name} />

     
          <h1>Attendance Logs</h1>

          {/* Search & Filter UI */}
          <FilterContainer>
            <input
              type="text"
              placeholder="Search by Name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="FAILED">FAILED</option>
            </select>
          </FilterContainer>

          {/* DataTable Component */}
          <DataTable
            title=""
            columns={columns}
            data={filteredLogs}
            pagination
            highlightOnHover
            progressPending={loading}
            customStyles={{
              header: {
                style: {
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#333",
                },
              },
              rows: {
                style: {
                  fontSize: "16px",
                  color: "#555",
                },
              },
              headCells: {
                style: {
                  backgroundColor: "#007bff", // Match RegistrationForm header color
                  color: "#fff", // White text for contrast
                  fontWeight: "bold",
                },
              },
            }}
          />
        
      </div>
    </div>
  );
}

export default LogsPage;