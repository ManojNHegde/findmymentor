import { useEffect, useState } from 'react';
import axios from 'axios';
import ChatBox from './ChatBox'; // ✅ Make sure path is correct

const MyMentors = () => {
  const [myMentors, setMyMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMentor, setSelectedMentor] = useState(null); // ✅ Chat toggle

  const studentId = localStorage.getItem('userId');

  useEffect(() => {
    async function fetchMyMentors() {
      if (!studentId) {
        console.warn('No studentId available yet, skipping fetch');
        return;
      }

      try {
        const res = await axios.get(`https://findmymentor.onrender.com/api/my-mentors/${studentId}`);
        setMyMentors(res.data);
      } catch (err) {
        console.error('Error fetching mentors:', err);
        setError('Failed to load your mentors');
      } finally {
        setLoading(false);
      }
    }
    console.log('Student ID:', studentId);
    console.log('Mentor ID:', selectedMentor?._id);
    fetchMyMentors();
  }, [studentId]);

  const handleCancelOrDisconnect = async (bookingId, status) => {
    try {
      const endpoint =
        status === 'pending'
          ? `https://findmymentor.onrender.com/api/bookings/${bookingId}/cancel`
          : `https://findmymentor.onrender.com/api/bookings/${bookingId}/disconnect`;

      await axios.delete(endpoint);
      setMyMentors(prev => prev.filter(m => m._id !== bookingId));
    } catch (err) {
      console.error('Error canceling/disconnecting:', err?.response?.data || err.message);
      alert('Could not complete the action. Try again.');
    }
  };

  if (loading) return <div>Loading your mentors...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Mentors</h1>

      {selectedMentor && (
        <div className="mb-6 border p-4 rounded shadow">
          <ChatBox userId={studentId} partnerId={selectedMentor._id} partnerName={selectedMentor.name} />
          <button
            onClick={() => setSelectedMentor(null)}
            className="mt-2 text-blue-600 underline"
          >
            Close Chat
          </button>
        </div>
      )}

      {myMentors.length === 0 ? (
        <div className="text-gray-500">You haven't requested any mentors yet.</div>
      ) : (
        myMentors.map((booking) => {
          const mentor = booking.mentorId;
          return (
            <div key={booking._id} className="border p-4 rounded mb-4 shadow">
              <h2 className="text-xl font-semibold">{mentor.name}</h2>
              <p><strong>Skills:</strong> {mentor.skills?.join(', ') || 'N/A'}</p>
              <p><strong>Experience:</strong> {mentor.experience || 'N/A'}</p>
              <p><strong>Availability:</strong> {mentor.availability || 'N/A'}</p>
              <p><strong>Status:</strong> <span className="capitalize">{booking.status}</span></p>

              <div className="mt-4 space-x-2">
                {booking.status === 'pending' && (
                  <button
                    onClick={() => handleCancelOrDisconnect(booking._id, 'pending')}
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                  >
                    Cancel Request
                  </button>
                )}

                {booking.status === 'accepted' && (
                  <>
                    <button
                      onClick={() => setSelectedMentor(mentor)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Message
                    </button>
                    <button
                      onClick={() => handleCancelOrDisconnect(booking._id, 'accepted')}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Disconnect
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default MyMentors;
