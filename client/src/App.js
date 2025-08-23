import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import MentorDashboard from './components/MentorDashboard';
import LearnerDashboard from './components/LearnerDashboard';
import MentorProfileForm from './components/MentorProfileForm';
import MentorListing from './components/MentorList';
import PrivateRoute from './components/PrivateRoute';
import MentorProfileView from './components/MentorProfileView';
import MyMentors from './components/MyMentor';

// Import your Learners list and Chat components
import MentorLearnersList from './components/MentorLearners'; // Your learners list component
import ChatBox from './components/ChatBox'; // Your chat component

// Wrapper component for the split layout on /my-learners
function MentorLearners() {
  return (
    <div className="h-[80vh] max-w-5xl mx-auto bg-white rounded shadow p-4">
      {/* Only the learners list with scroll */}
      <div className="h-full overflow-y-auto">
        <MentorLearnersList />
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Navbar />
      <div className="min-h-screen bg-gray-100 px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/mentors" element={<MentorListing />} />
            <Route path="/my-mentors" element={<MyMentors />} />
            {/* Use the custom split layout MentorLearners here */}
            <Route path="/my-learners" element={<MentorLearners />} />

            {/* Protected routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/mentor-dashboard" element={<MentorDashboard />} />
              <Route path="/learner-dashboard" element={<LearnerDashboard />} />
              <Route path="/mentor-profile" element={<MentorProfileForm />} />
              <Route path="/mentors/:id" element={<MentorProfileView />} />
            </Route>
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
