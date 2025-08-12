import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/login', form, {
        withCredentials: true, // Keep if your backend uses sessions/cookies
      });

      const { token, user } = res.data;

      if (token) {
        localStorage.setItem('token', token);
      }

      if (user?._id) {
        localStorage.setItem('userId', user._id); // Store userId for fetching profile later
      }
      if (user?.role) {
        localStorage.setItem('role', user.role);
      }
      if (user?.name) {
        localStorage.setItem('name', user.name);
      }

      setMessage("Login successful!");
      setMessageType('success');

      // Navigate based on role
      if (user.role === 'mentor') navigate('/mentor-dashboard');
      else if (user.role === 'learner') navigate('/learner-dashboard');
      else navigate('/');
      
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || "Login failed";
      setMessage(errorMsg);
      setMessageType('error');
    }
  };

  return (
    <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8 mx-auto">
      <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">Login to Your Account</h2>
      <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            autoComplete="username"
            required
            className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            name="password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
            className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-400"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-200"
        >
          Login
        </button>
      </form>
      {message && (
        <p className={`mt-4 text-center text-sm ${messageType === 'error' ? 'text-red-500' : 'text-green-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default Login;
