import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const MentorProfileView = () => {
  const { id } = useParams(); // mentor ID from URL
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(''); // 'learner' or 'mentor'
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingStatus, setBookingStatus] = useState(null); // success/fail feedback

  useEffect(() => {
    const fetchMentor = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/mentors/${id}`);
        setMentor(res.data);
      } catch (err) {
        console.error('Error fetching mentor:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserRole = () => {
      const role = localStorage.getItem('role');
      setUserRole(role || '');
    };

    fetchMentor();
    fetchUserRole();
  }, [id]);

  const handleBooking = async () => {
    const studentId = localStorage.getItem('userId');
    if (!studentId) {
      alert('You must be logged in to book a mentor.');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/book-mentor', {
        studentId,
        mentorId: id,
        message: bookingMessage,
      });

      setBookingStatus('success');
      setBookingMessage('');
      alert('Booking request sent successfully!');
    } catch (err) {
      console.error('Booking failed:', err);
      setBookingStatus('fail');
      alert('Failed to book mentor. Try again later.');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!mentor) return <p>Mentor not found</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h1 className="text-3xl font-bold mb-4">{mentor.name}</h1>
      <p><strong>Skills:</strong> {mentor.skills?.join(', ')}</p>
      <p><strong>Experience:</strong> {mentor.experience}</p>
      <p><strong>Availability:</strong> {mentor.availability}</p>

      {userRole === 'learner' && (
        <div className="mt-6">
          <textarea
            value={bookingMessage}
            onChange={(e) => setBookingMessage(e.target.value)}
            placeholder="Optional message to mentor"
            className="w-full p-2 border rounded mb-2"
            rows={3}
          />
          <button
            onClick={handleBooking}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Book This Mentor
          </button>
          {bookingStatus === 'success' && (
            <p className="text-green-600 mt-2">Booking request sent!</p>
          )}
          {bookingStatus === 'fail' && (
            <p className="text-red-600 mt-2">Booking failed. Please try again.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MentorProfileView;
