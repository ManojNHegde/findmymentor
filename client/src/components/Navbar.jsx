import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const name = localStorage.getItem('name');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <nav className="bg-gray-900 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo + App Name */}
        <div className="flex items-center gap-3">
          <img 
            src="https://res.cloudinary.com/dpdagzfud/image/upload/v1747996052/FindMy_Mentor_Logo_Design_dz2vgn.png" 
            alt="Logo"
            className="h-8 w-8"
          />
          <Link to="/" className="text-xl font-bold tracking-wide text-white hover:text-blue-400 transition">
            FindMyMentor
          </Link>
        </div>

        {/* Right side nav */}
        <div className="flex items-center gap-6">
          {role === 'mentor' && (
            <>
              <Link to="/mentor-dashboard" className="hover:text-blue-400 transition">Dashboard</Link>
              <Link to="/mentor-profile" className="hover:text-blue-400 transition">Edit Profile</Link>
              <Link to="/my-learners" className="hover:text-blue-400 transition">Learners</Link>
            </>
          )}
          {role === 'learner' && (
  <>
    <Link to="/learner-dashboard" className="hover:text-blue-400 transition">Dashboard</Link>
    <Link to="/my-mentors" className="hover:text-blue-400 transition ml-4">My Mentors</Link>
  </>
)}

          {name && (
            <span className="text-sm italic">Hello, {name}</span>
          )}
          {!role ? (
            <>
              <Link to="/login" className="hover:text-blue-400 transition">Login</Link>
              <Link to="/register" className="hover:text-blue-400 transition">Register</Link>
            </>
          ) : (
            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-4 py-1 rounded">
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
