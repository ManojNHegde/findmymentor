import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const role = localStorage.getItem('role');
  const name = localStorage.getItem('name');

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Define main navigation links for bottom nav (adjust as per your app)
  const bottomNavLinks = role === 'mentor'
    ? [
        { name: 'Dashboard', to: '/mentor-dashboard' },
        { name: 'Profile', to: '/mentor-profile' },
        { name: 'Learners', to: '/my-learners' },
      ]
    : role === 'learner'
    ? [
        { name: 'Dashboard', to: '/learner-dashboard' },
        { name: 'My Mentors', to: '/my-mentors' },
      ]
    : [];

  return (
    <>
      {/* Top Navbar */}
      <nav className="bg-gray-900 text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          {/* Logo + App Name */}
          <div className="flex items-center gap-3">
            <img
              src="https://res.cloudinary.com/dpdagzfud/image/upload/v1747996052/FindMy_Mentor_Logo_Design_dz2vgn.png"
              alt="Logo"
              className="h-8 w-8"
            />
            <Link
              to="/"
              className="text-xl font-bold tracking-wide text-white hover:text-blue-400 transition"
            >
              FindMyMentor
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {role === 'mentor' && (
              <>
                <Link to="/mentor-dashboard" className="hover:text-blue-400 transition">
                  Dashboard
                </Link>
                <Link to="/mentor-profile" className="hover:text-blue-400 transition">
                  Edit Profile
                </Link>
                <Link to="/my-learners" className="hover:text-blue-400 transition">
                  Learners
                </Link>
              </>
            )}
            {role === 'learner' && (
              <>
                <Link to="/learner-dashboard" className="hover:text-blue-400 transition">
                  Dashboard
                </Link>
                <Link to="/my-mentors" className="hover:text-blue-400 transition ml-4">
                  My Mentors
                </Link>
              </>
            )}

            {name && <span className="text-sm italic">Hello, {name}</span>}

            {!role ? (
              <>
                <Link to="/login" className="hover:text-blue-400 transition">
                  Login
                </Link>
                <Link to="/register" className="hover:text-blue-400 transition">
                  Register
                </Link>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-4 py-1 rounded"
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile Hamburger / 3-dot menu icon */}
          <div className="md:hidden flex items-center gap-4">
            {name && <span className="text-sm italic ">Hello, {name}</span>}

            <button
              onClick={toggleMobileMenu}
              aria-label="Toggle Menu"
              className="focus:outline-none"
            >
              {/* 3 dots icon */}
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="5" cy="12" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="19" cy="12" r="2" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-800 text-white px-4 py-3 space-y-3 border-t border-gray-700">
            {role === 'mentor' && (
              <>
                <Link
                  to="/mentor-dashboard"
                  className="block hover:text-blue-400 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/mentor-profile"
                  className="block hover:text-blue-400 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Edit Profile
                </Link>
                <Link
                  to="/my-learners"
                  className="block hover:text-blue-400 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Learners
                </Link>
              </>
            )}
            {role === 'learner' && (
              <>
                <Link
                  to="/learner-dashboard"
                  className="block hover:text-blue-400 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/my-mentors"
                  className="block hover:text-blue-400 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Mentors
                </Link>
              </>
            )}

            {!role ? (
              <>
                <Link
                  to="/login"
                  className="block hover:text-blue-400 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block hover:text-blue-400 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            ) : (
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="bg-red-500 hover:bg-red-600 w-full py-1 rounded"
              >
                Logout
              </button>
            )}
          </div>
        )}
      </nav>

      {/* Bottom Navigation Bar for Mobile */}
      {role && (
        <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white flex justify-around items-center py-2 shadow-t md:hidden z-50">
          {bottomNavLinks.map((link) => (
            <button
              key={link.to}
              onClick={() => navigate(link.to)}
              className={`flex flex-col items-center text-xs ${
                location.pathname === link.to ? 'text-blue-400' : 'text-white'
              }`}
              aria-current={location.pathname === link.to ? 'page' : undefined}
            >
              {/* Simple icons (can replace with SVG icons for better UI) */}
             <span className="mb-1 inline-block bg-white rounded-full p-1">
  {link.name === 'Dashboard' && '🏠'}
  {link.name === 'Profile' && '👤'}
  {link.name === 'Learners' && '🎓'}
  {link.name === 'My Mentors' && '🤝'}
</span>

              {link.name}
            </button>
          ))}
        </nav>
      )}
    </>
  );
};

export default Navbar;
