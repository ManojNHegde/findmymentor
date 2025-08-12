import { useState } from 'react';
import axios from 'axios';

const MentorProfileForm = () => {
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [availability, setAvailability] = useState('');

  const handleSubmit = async (e) => {
  e.preventDefault();

  const parsedSkills = skills
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean); // Remove empty strings

  if (!parsedSkills.length || !experience || !availability) {
    alert('Please fill in all fields');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to update profile');
      return;
    }

    const response = await axios.put(
      'http://localhost:5000/api/update-mentor-profile',
      {
        skills: parsedSkills,
        experience,
        availability,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert('Profile updated successfully!');
    console.log('Updated user:', response.data.user);
  } catch (err) {
    console.error('Update failed:', err.response?.data || err.message);
    alert('Profile update failed: ' + (err.response?.data?.message || 'Server error'));
  }
};



  return (
    <div className="max-w-md mx-auto mt-10 bg-white shadow-md rounded-lg p-8">
      <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">Update Mentor Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Skills (comma separated)</label>
          <input
            type="text"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="e.g. JavaScript, React, Node.js"
          />
        </div>

        <div>
  <label className="block text-gray-700 font-medium mb-1">Experience</label>
  <select
    value={experience}
    onChange={(e) => setExperience(e.target.value)}
    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
  >
    <option value="">Select experience level</option>
    <option value="Junior">Junior</option>
    <option value="Mid">Mid</option>
    <option value="Senior">Senior</option>
  </select>
</div>


        <div>
          <label className="block text-gray-700 font-medium mb-1">Availability</label>
          <input
            type="text"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="e.g. Weekends, evenings"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200"
        >
          Update Profile
        </button>
      </form>
    </div>
  );
};

export default MentorProfileForm;
