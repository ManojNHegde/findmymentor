import { useEffect, useState } from 'react';
import axios from 'axios';
import ChatBox from './ChatBox'; // Make sure this path is correct

const MentorLearners = () => {
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChatUser, setSelectedChatUser] = useState(null);

  const mentorId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchLearners = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/learners/${mentorId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLearners(res.data);
      } catch (err) {
        console.error('Failed to load learners:', err);
      } finally {
        setLoading(false);
      }
    };

    if (mentorId && token) {
      fetchLearners();
    } else {
      setLoading(false);
      console.warn('Mentor ID or token missing');
    }
  }, [mentorId, token]);

 const handleDisconnect = async (bookingId, status) => {
  try {
    const endpoint =
      status === 'pending'
        ? `http://localhost:5000/api/bookings/${bookingId}/cancel`
        : `http://localhost:5000/api/bookings/${bookingId}/disconnect`;

    await axios.delete(endpoint);
    
    setLearners(prev => prev.filter(b => b._id !== bookingId));

    if (selectedChatUser?.bookingId === bookingId) {
      setSelectedChatUser(null);
    }
  } catch (err) {
    console.error('Disconnect error:', err?.response?.data || err.message);
    alert('Failed to disconnect');
  }
};

  if (loading) return <div>Loading learners...</div>;

  return (
    <div
      className="p-6 max-w-6xl mx-auto h-[600px] bg-white rounded shadow grid transition-all duration-300"
      style={{
        gridTemplateColumns: selectedChatUser ? 'minmax(300px, 1fr) 400px' : '1fr',
        gap: '1.5rem',
      }}
    >
      {/* Learners list */}
      <div className="overflow-y-auto border rounded p-4">
        <h1 className="text-3xl font-bold mb-6">Your Learners</h1>
        {learners.length === 0 ? (
          <p className="text-gray-500">No connected learners yet.</p>
        ) : (
          learners.map(({ _id: bookingId, studentId }) => (
            <div key={bookingId} className="border p-4 mb-4 rounded shadow">
              <p><strong>Name:</strong> {studentId?.name}</p>
              <p><strong>Email:</strong> {studentId?.email}</p>
              <div className="mt-2 space-x-2">
                <button
                  onClick={() =>
                    setSelectedChatUser({ ...studentId, bookingId })
                  }
                  className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700 transition"
                  aria-label={`Message ${studentId?.name}`}
                >
                  💬 Message
                </button>

                <button
                  onClick={() => handleDisconnect(bookingId)}
                  className="bg-red-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-red-700 transition"
                  aria-label={`Disconnect from ${studentId?.name}`}
                >
                  Disconnect
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Chat window */}
      {selectedChatUser && (
        <div className="border rounded p-4 shadow flex flex-col" style={{ height: '100%' }}>
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="text-xl font-semibold">
              Chat with {selectedChatUser.name}
            </h2>
            <button
              onClick={() => setSelectedChatUser(null)}
              className="text-gray-600 hover:text-gray-900 cursor-pointer transition"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <ChatBox
              userId={mentorId}
              partnerId={selectedChatUser._id} // ✅ This is the real userId
              partnerName={selectedChatUser.name}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorLearners;
