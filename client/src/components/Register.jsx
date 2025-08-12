import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = ({ setUser }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'learner',
  });

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/register', form, {
        withCredentials: true,
      });

      const { token, user } = res.data;

      if (!token) throw new Error('Token not found in response');

      // Store token and user info
      localStorage.setItem('token', token);
      localStorage.setItem('role', user.role);
      localStorage.setItem('name', user.name);

      if (setUser) {
        setUser(user);
      }

      setMessage('Registration successful!');
      setMessageType('success');

      // Redirect to dashboard
      navigate(user.role === 'mentor' ? '/mentor-dashboard' : '/learner-dashboard');
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Registration failed. Please try again.';
      setMessage(errorMsg);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8 mx-auto">
      <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
        Create an Account
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            name="name"
            type="text"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
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
            required
            className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            required
            className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-400"
          >
            <option value="learner">Learner</option>
            <option value="mentor">Mentor</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-200 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      {message && (
        <p
          className={`mt-4 text-center text-sm ${
            messageType === 'error' ? 'text-red-500' : 'text-green-600'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default Register;
