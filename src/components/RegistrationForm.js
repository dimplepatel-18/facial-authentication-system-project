import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import { jwtVerify } from "jose";
import Sidebar from "./sidebar"; // Import Sidebar
import TopMenu from "./TopMenu"; // Import TopMenu

const FormContainer = styled.div`
  width: 600px;
  padding: 20px;
  background: #f7f7f7;
  border-radius: 8px;
  margin: 50px auto;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.2);
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr; /* Two equal columns */
  gap: 20px; /* Space between columns and rows */

  @media (max-width: 768px) {
    grid-template-columns: 1fr; /* Single column for smaller screens */
  }
`;

const FileInputContainer = styled.div`
  grid-column: span 2; /* Make the file input span both columns */
  display: flex;
  align-items: center;
  gap: 10px; /* Space between the file input and the image preview */
`;

const Input = styled.input`
  width: 90%;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
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
  margin-top: 10px;

  &:hover {
    background-color: #0056b3;
  }
`;

const BackButton = styled(Button)`
  background-color: #6c757d; /* Gray color for back button */
  margin-top: 20px;

  &:hover {
    background-color: #5a6268; /* Darker gray on hover */
  }
`;

const ImagePreview = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
`;

const RegistrationForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userToEdit = location.state?.user; // Retrieve user data from state

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    designation: '',
    photo: null,
    isAdmin: 0, // Default to User
  });

  const [isEditMode, setIsEditMode] = useState(false); // Track if it's edit mode
  const [message, setMessage] = useState('');
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

    // If userToEdit exists, populate the form and set edit mode
    if (userToEdit) {
      setFormData({
        fullName: userToEdit.name,
        email: userToEdit.email,
        phone: userToEdit.phone_number,
        designation: userToEdit.designation,
        photo: null, // Photo cannot be pre-filled
        isAdmin: userToEdit.isAdmin || 0, // Default to User if not provided
      });
      setIsEditMode(true);
    }
  }, [navigate, userToEdit]);

  if (!userData) {
    return <p>Loading...</p>;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      photo: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append('fullName', formData.fullName);
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    data.append('designation', formData.designation);
    data.append('isAdmin', formData.isAdmin); // Include isAdmin
    if (formData.photo) {
      data.append('photo', formData.photo);
    }

    try {
      if (isEditMode) {
        // Update user if in edit mode
        await axios.post(`http://localhost:5000/api/users/${userToEdit.id}`, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        navigate('/users', { state: { successMessage: 'User updated successfully!' } });
      } else {
        // Create new user if not in edit mode
        await axios.post('http://localhost:5000/register', data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        navigate('/users', { state: { successMessage: 'User registered successfully!' } });
      }
    } catch (error) {
      setMessage('Error submitting the form. Please try again.');
      console.error("Error:", error);
    }
  };

  const handleBack = () => {
    navigate('/users'); // Redirect to Users page
  };

  return (
    <div className="profile-page">
      <Sidebar isAdmin={userData.isAdmin} /> {/* Use Sidebar */}
      <div className="profile-container"> 
        <TopMenu userName={userData.name} /> {/* Add TopMenu */}
        <FormContainer>
          <h3>{isEditMode ? "Edit User" : "Register User"}</h3>
          {message && <p>{message}</p>}
          <form onSubmit={handleSubmit}>
            <FormGrid>
              <Input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
              <Input
                type="email"
                name="email"
                placeholder="Email ID"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <Input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              <Input
                type="text"
                name="designation"
                placeholder="Company Designation"
                value={formData.designation}
                onChange={handleChange}
                required
              />
               <div style={{ gridColumn: "span 2" }}>
                {/* <label htmlFor="isAdmin">Role:</label> */}
                <Select
                  id="isAdmin"
                  name="isAdmin"
                  value={formData.isAdmin}
                  onChange={handleChange}
                  required
                >
                  <option value={0}>User</option>
                  <option value={1}>Admin</option>
                </Select>
              </div>
              <FileInputContainer>
                <Input
                  type="file"
                  name="photo"
                  onChange={handleFileChange}
                />
                {isEditMode && userToEdit.photo && (
                  <ImagePreview
                    src={`http://localhost:9000/uploads/${userToEdit.photo}`} // Adjusted path
                    alt="User Photo"
                  />
                )}
              </FileInputContainer>
             
            </FormGrid>
            <Button type="submit">{isEditMode ? "Update" : "Register"}</Button>
          </form>
          <BackButton onClick={handleBack}>Back</BackButton>
        </FormContainer>
      </div>
    </div>
  );
};

export default RegistrationForm;