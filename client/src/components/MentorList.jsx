import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // ✅ Import Link for proper routing
import axios from 'axios';

const MentorListing = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');

  useEffect(() => {
    async function fetchMentors() {
      try {
        const res = await axios.get('https://findmymentor.onrender.com/api/mentors');
        setMentors(res.data);
      } catch (err) {
        setError('Failed to load mentors');
      } finally {
        setLoading(false);
      }
    }
    fetchMentors();
  }, []);

  // Extract unique skill categories
  const allSkills = mentors.reduce((acc, mentor) => {
    mentor.skills?.forEach(skill => {
      if (!acc.includes(skill)) acc.push(skill);
    });
    return acc;
  }, []);

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch =
      mentor.name.toLowerCase().includes(searchText.toLowerCase()) ||
      mentor.skills?.some(skill => skill.toLowerCase().includes(searchText.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' || mentor.skills?.includes(categoryFilter);
    const matchesExperience =
      experienceFilter === 'all' ||
      mentor.experience?.toLowerCase() === experienceFilter.toLowerCase();

    return matchesSearch && matchesCategory && matchesExperience;
  });

  if (loading) return <div>Loading mentors...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Mentors Available</h1>

      {/* Search input */}
      <input
        type="text"
        placeholder="Search by name or skill"
        className="border p-2 mb-4 w-full rounded"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />

      {/* Filters */}
      <div className="flex space-x-4 mb-6">
        {/* Skill filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border p-2 rounded flex-grow"
        >
          <option value="all">All Categories</option>
          {allSkills.map(skill => (
            <option key={skill} value={skill}>{skill}</option>
          ))}
        </select>

        {/* Experience filter */}
        <select
          value={experienceFilter}
          onChange={(e) => setExperienceFilter(e.target.value)}
          className="border p-2 rounded flex-grow"
        >
          <option value="all">All Experience Levels</option>
          <option value="junior">Junior</option>
          <option value="mid">Mid</option>
          <option value="senior">Senior</option>
        </select>
      </div>

      {/* Mentor cards */}
      {filteredMentors.map((mentor) => (
        <div key={mentor._id} className="border p-4 rounded mb-4 shadow">
          <h2 className="text-xl font-semibold">{mentor.name}</h2>
          <p><strong>Skills:</strong> {mentor.skills?.join(', ') || 'N/A'}</p>
          <p><strong>Experience:</strong> {mentor.experience || 'N/A'}</p>
          <p><strong>Availability:</strong> {mentor.availability || 'N/A'}</p>

          <Link to={`/mentors/${mentor._id}`}>
            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              View Profile
            </button>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default MentorListing;
