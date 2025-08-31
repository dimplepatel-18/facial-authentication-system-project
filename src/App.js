import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import RegistrationForm from './components/RegistrationForm';
import ProfilePage from './components/ProfilePage'; // Import the new ProfilePage component
import LogsPage from "./components/LogsPage"; // Import LogsPage
import UsersPage from "./components/UsersPage"; // Import LogsPage

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/profile" element={<ProfilePage />} /> {/* Add route for ProfilePage */}
        <Route path="*" element={<Navigate to="/home" />} />
        <Route path="/logs" element={<LogsPage />} />
        <Route path="/users" element={<UsersPage />} />      </Routes>
    </Router>
  );
}

export default App;
