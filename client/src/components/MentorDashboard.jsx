import { useEffect, useState } from 'react';
import axios from 'axios';

const MentorDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        if (!userId || !token) {
          setError('User ID or token missing, please login again.');
          setLoading(false);
          return;
        }

        // Fetch profile
        const profileRes = await axios.get(`http://localhost:5000/api/mentor-profile?userId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(profileRes.data);

        // Fetch bookings for this mentor
        const bookingsRes = await axios.get(`http://localhost:5000/api/bookings/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(bookingsRes.data);

        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data.');
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleBookingAction = async (bookingId, action) => {
    try {
      const token = localStorage.getItem('token');
      const statusToUpdate = action === 'accept' ? 'accepted' : 'declined';

      // PUT request to update booking status
      await axios.put(
        `http://localhost:5000/api/bookings/${bookingId}`,
        { status: statusToUpdate },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update local state to reflect new status
      setBookings(bookings.map(b =>
        b._id === bookingId ? { ...b, status: statusToUpdate } : b
      ));
    } catch (err) {
      console.error(`Failed to ${action} booking`, err);
      alert(`Failed to ${action} booking`);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!profile) return <div>No profile data found.</div>;

  return (
    <div className="max-w-3xl mx-auto mt-12 p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
      <h1 className="text-4xl font-extrabold mb-6 text-indigo-600 drop-shadow-sm flex items-center">
        Mentor Dashboard
        {bookings.length > 0 && (
          <span className="ml-4 bg-red-600 text-white rounded-full px-3 py-1 text-sm font-semibold">
            {bookings.length} Booking{bookings.length > 1 ? 's' : ''}
          </span>
        )}
      </h1>

      <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b-2 border-indigo-400 pb-2">
        Your Profile
      </h2>

      {/* Profile info example */}
      <p><strong>Name:</strong> {profile.name}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Skills:</strong> {profile.skills?.join(', ') || 'No skills listed'}</p>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-gray-800 border-b-2 border-indigo-400 pb-2">
        Booking Requests
      </h2>

      {bookings.length === 0 ? (
        <p className="italic text-gray-500">No booking requests yet.</p>
      ) : (
        <ul className="space-y-4">
          {bookings.map(({ _id, studentId, message, status }) => (
            <li
              key={_id}
              className="p-4 border rounded-md flex flex-col sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p><strong>From:</strong> {studentId?.name || 'Unknown'}</p>
                <p><strong>Email:</strong> {studentId?.email || 'N/A'}</p>
                <p><strong>Message:</strong> {message || 'No message provided'}</p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span
                    className={`font-semibold ${
                      status === 'accepted'
                        ? 'text-green-600'
                        : status === 'declined'
                        ? 'text-red-600'
                        : 'text-yellow-600'
                    }`}
                  >
                    {status}
                  </span>
                </p>
              </div>

              {/* Show buttons only if pending */}
              {status === 'pending' && (
                <div className="mt-3 sm:mt-0 space-x-2">
                  <button
                    onClick={() => handleBookingAction(_id, 'accept')}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleBookingAction(_id, 'reject')}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MentorDashboard;
