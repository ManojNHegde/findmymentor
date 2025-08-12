const http = require('http');
const { Server } = require('socket.io');

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const Booking = require('./models/Bokking'); // or wherever your model is
const Message = require('./models/Message'); // Add this at the top


const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Store securely in .env

const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: [
    'http://localhost:3000',
    'https://findmymentor-ki8y.vercel.app',

  ], // adjust to match your frontend port
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('✅ New client connected');

  socket.on('join_conversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`📥 Joined room: ${conversationId}`);
  });

  socket.on('leave_conversation', (conversationId) => {
    socket.leave(conversationId);
    console.log(`📤 Left room: ${conversationId}`);
  });

  socket.on('send_message', (message) => {
    console.log('📨 Broadcasting message to room:', message.conversationId);
    io.to(message.conversationId).emit('receive_message', message);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected');
  });
});


// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://findmymentor-ki8y.vercel.app'],
  credentials: true
}));
app.use(express.json());

// Session setup
app.use(session({
  secret: 'naran_ujan',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true,
    sameSite: 'lax'
  }
}));

// Root route
app.get("/", (req, res) => {
  res.send("FindMyMentor API is running!");
});




app.get('/api/bookings/:mentorId', async (req, res) => {
  const { mentorId } = req.params;

  try {
    // Populate student info (assuming Booking has studentId referencing User)
    const bookings = await Booking.find({ mentorId })
      .populate('studentId', 'name email') // fetch name and email of the student
      .exec();

    res.json(bookings);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ error: 'Server error fetching bookings' });
  }
});

app.post('/api/bookings/:bookingId/accept', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.bookingId, { status: 'accepted' }, { new: true });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json({ message: 'Booking accepted', booking });
  } catch (err) {
    res.status(500).json({ error: 'Error accepting booking' });
  }
});

app.post('/api/bookings/:bookingId/reject', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.bookingId, { status: 'rejected' }, { new: true });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json({ message: 'Booking rejected', booking });
  } catch (err) {
    res.status(500).json({ error: 'Error rejecting booking' });
  }
});

// Register route
app.post('/api/register', async (req, res) => {
  try {
    let { name, email, password, role } = req.body;

    name = name?.trim();
    email = email?.trim().toLowerCase();
    password = password?.trim();

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!['learner', 'mentor'].includes(role)) {
      return res.status(400).json({ error: "Invalid role selected" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();

    const token = jwt.sign({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }, JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      message: "User registered",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

// Login route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }, JWT_SECRET, { expiresIn: '1h' });

    res.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout route
app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

// Get mentor profile (no auth needed, userId passed as query)
app.get('/api/mentor-profile', async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId in request.' });
    }

    const user = await User.findById(userId);

    if (!user || user.role !== 'mentor') {
      return res.status(404).json({ error: 'Mentor profile not found.' });
    }

    // Return profile fields only
    const profile = {
      skills: user.skills || [],
      experience: user.experience || '',
      availability: user.availability || '',
      name: user.name || '',
      email: user.email || ''
    };

    res.json(profile);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Server error while fetching profile.' });
  }
});

app.get('/api/mentors/:id', async (req, res) => {
  try {
    const mentorId = req.params.id;
    const user = await User.findById(mentorId);

    if (!user || user.role !== 'mentor') {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('Error fetching mentor:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Disconnect route
app.delete('/api/bookings/:bookingId/disconnect', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status !== 'accepted') {
      return res.status(400).json({ error: 'Only accepted bookings can be disconnected' });
    }

    await Booking.findByIdAndDelete(req.params.bookingId);

    res.json({ message: 'Disconnected successfully' });
  } catch (err) {
    console.error('Error disconnecting:', err);
    res.status(500).json({ error: 'Server error while disconnecting' });
  }
});



// 
app.post('/api/book-mentor', async (req, res) => {
  const { studentId, mentorId, message } = req.body;

  if (!studentId || !mentorId) {
    return res.status(400).json({ error: 'studentId and mentorId are required' });
  }

  try {
    // Check if mentor exists and has the role
    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.role !== 'mentor') {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    // Save booking
    const booking = new Booking({ studentId, mentorId, message });
    await booking.save();

    res.status(201).json({ message: 'Booking request sent', booking });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ error: 'Server error while booking mentor' });
  }
});


// Update mentor profile (auth required)
app.put('/api/update-mentor-profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Invalid token format' });

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const userId = decoded._id;
    if (!userId) return res.status(401).json({ message: 'User ID missing, please login again.' });

    const { skills, experience, availability } = req.body;

    // Validation
    if (!Array.isArray(skills) || typeof experience !== 'string' || typeof availability !== 'string') {
      return res.status(400).json({ message: 'Invalid or missing fields' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { skills, experience, availability },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({
      message: 'Profile updated',
      user: {
        _id: updatedUser._id,
        skills: updatedUser.skills,
        experience: updatedUser.experience,
        availability: updatedUser.availability,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Profile update failed', error: error.message });
  }
});


app.get('/api/mentors', async (req, res) => {
  try {
    const mentors = await User.find({ role: 'mentor' }).select('name skills experience availability');
    res.json(mentors);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching mentors' });
  }
});
// app.get('/api/my-mentors', async (req, res) => {
//   try {
//     const studentId = req.user?.id; // or wherever you get studentId from

//     // Defensive check
//     if (!studentId || studentId === 'null') {
//       return res.status(400).json({ error: 'Invalid studentId' });
//     }

//     const bookings = await Booking.find({ studentId }).populate('mentorId', 'name skills experience availability');

//     res.json(bookings);
//   } catch (err) {
//     console.error('Error fetching learner mentors:', err);
//     res.status(500).json({ error: 'Server error fetching learner mentors' });
//   }
// });



app.get('/api/my-mentors/:studentId', async (req, res) => {
  const { studentId } = req.params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    return res.status(400).json({ error: 'Invalid studentId format' });
  }

  try {
    const bookings = await Booking.find({ studentId, status: 'accepted' })
      .populate('mentorId', 'name email skills experience availability')
      .exec();

    res.json(bookings);
  } catch (err) {
    console.error('Error fetching learner mentors:', err);
    res.status(500).json({ error: 'Server error fetching learner mentors' });
  }
});


app.put('/api/bookings/:id', async (req, res) => {
  const bookingId = req.params.id;
  const { status } = req.body;

  if (!['accepted', 'declined'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ message: 'Booking updated', booking });
  } catch (err) {
    console.error('Error updating booking:', err);
    res.status(500).json({ error: 'Server error updating booking' });
  }
});

app.put('/api/bookings/:bookingId/accept', async (req, res) => {
  const { bookingId } = req.params;

  try {
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: 'accepted' },
      { new: true }
    );
    if (!updatedBooking) return res.status(404).json({ error: 'Booking not found' });

    res.json(updatedBooking);
  } catch (err) {
    console.error('Error updating booking status:', err);
    res.status(500).json({ error: 'Server error updating booking status' });
  }
});



app.delete('/api/bookings/:bookingId/cancel', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status !== 'pending') return res.status(400).json({ error: 'Only pending requests can be canceled' });

    await Booking.findByIdAndDelete(req.params.bookingId);

    res.json({ message: 'Booking request canceled' });
  } catch (err) {
    console.error('Error canceling booking:', err);
    res.status(500).json({ error: 'Server error while canceling booking' });
  }
});

app.post('/api/bookings/:bookingId/disconnect', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status !== 'accepted') return res.status(400).json({ error: 'Can only disconnect accepted bookings' });

    booking.status = 'disconnected';
    await booking.save();

    res.json({ message: 'Disconnected from mentor', booking });
  } catch (err) {
    res.status(500).json({ error: 'Server error while disconnecting' });
  }
});

// GET /api/learners/:mentorId
app.get('/api/learners/:mentorId', async (req, res) => {
  try {
    const bookings = await Booking.find({
      mentorId: req.params.mentorId,
      status: 'accepted'
    }).populate('studentId');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch learners' });
  }
});

// POST: Send a new message
app.post('/api/messages', async (req, res) => {
  const { senderId, receiverId, text } = req.body;

  if (!senderId || !receiverId || !text) {
    return res.status(400).json({ error: 'senderId, receiverId, and text are required' });
  }

  const participants = [senderId, receiverId].sort(); // consistent conversation ID
  const conversationId = participants.join('_');

  try {
    const message = new Message({
      conversationId,
      senderId,
      receiverId,
      text
    });

    await message.save();
    res.status(201).json({ message: 'Message sent', data: message });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'Server error sending message' });
  }
});


// GET: Fetch all messages for a conversation
app.get('/api/messages/:conversationId', async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.conversationId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Server error fetching messages' });
  }
});

app.get('/api/conversations/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const messages = await Message.find({ $or: [{ sender: userId }, { receiver: userId }] });

    const conversations = {};

    messages.forEach(msg => {
      if (!conversations[msg.conversationId]) {
        conversations[msg.conversationId] = {
          conversationId: msg.conversationId,
          participants: msg.conversationId.split('_'),
          lastMessage: msg
        };
      } else if (msg.timestamp > conversations[msg.conversationId].lastMessage.timestamp) {
        conversations[msg.conversationId].lastMessage = msg;
      }
    });

    res.json(Object.values(conversations));
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ error: 'Server error fetching conversations' });
  }
});



mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    server.listen(PORT, () => {
      console.log(`🚀 Server with Socket.IO running on http://localhost:${PORT}`);
    });
  })
  .catch(err => console.error("MongoDB connection error:", err));

