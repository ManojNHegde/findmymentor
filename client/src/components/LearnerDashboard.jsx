import { Link } from 'react-router-dom';

const LearnerDashboard = () => {
  return (
    <div className="p-8 text-gray-700 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Welcome, Learner! 🎓</h1>

      <p className="text-lg mb-8">
        Find mentors who can guide you to success.
      </p>

      <Link
        to="/mentors"
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded shadow transition duration-300"
      >
        Find Mentors
      </Link>
    </div>
  );
};

export default LearnerDashboard;
