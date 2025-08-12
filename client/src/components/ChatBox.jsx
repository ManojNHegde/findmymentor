import { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const BACKEND_URL = 'https://findmymentor.onrender.com';

export default function ChatBox({ userId, partnerId, partnerName }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);

  const socket = useRef(null);
  const messagesEndRef = useRef(null);

  // Always generate consistent conversationId (sorted)
  const conversationId = useMemo(() => {
    if (!userId || !partnerId) return null;
    return [userId, partnerId].sort().join('_');
  }, [userId, partnerId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Join WebSocket room and handle incoming messages
  useEffect(() => {
    if (!conversationId) return;

    socket.current = io(BACKEND_URL);
    socket.current.emit('join_conversation', conversationId);
    console.log('[Socket] Joined conversation:', conversationId);

    socket.current.on('receive_message', (message) => {
      if (message.conversationId === conversationId) {
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === message._id);
          return exists ? prev : [...prev, message];
        });
      }
    });

    return () => {
      socket.current?.emit('leave_conversation', conversationId);
      socket.current?.disconnect();
      socket.current = null;
      console.log('[Socket] Left conversation:', conversationId);
    };
  }, [conversationId]);

  // Fetch previous messages
  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/messages/${conversationId}`);
        setMessages(res.data);
      } catch (err) {
        console.error('[Axios] Failed to fetch messages:', err);
      }
    };

    fetchMessages();
  }, [conversationId]);

  // Send a new message
  const sendMessage = async () => {
    console.log('➡️ userId:', userId);
    console.log('➡️ partnerId:', partnerId);
    console.log('🧠 conversationId (sorted):', conversationId);

    const trimmed = newMsg.trim();
    if (!trimmed || sending || !userId || !partnerId || !conversationId) return;

    const payload = {
      senderId: userId,
      receiverId: partnerId,
      text: trimmed,
      conversationId,
    };

    try {
      setSending(true);
      const res = await axios.post(`${BACKEND_URL}/api/messages`, payload);
      const msg = res.data.data;

      socket.current?.emit('send_message', msg);
      setMessages((prev) => [...prev, msg]);
      setNewMsg('');
    } catch (err) {
      console.error('[Axios] Message send error:', err);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (!userId || !partnerId) {
    return <div className="text-gray-500 italic">Loading chat...</div>;
  }

  return (
    <div className="h-full flex flex-col p-4">
      <h2 className="text-lg font-semibold mb-2 border-b pb-2">
        Chat with {partnerName || 'User'}
      </h2>

      <div className="flex-1 overflow-y-auto border rounded p-3 space-y-2 bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-gray-400 italic text-center">No messages yet.</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`max-w-xs px-3 py-2 rounded-lg text-sm break-words ${
                msg.senderId === userId
                  ? 'bg-blue-500 text-white self-end ml-auto'
                  : 'bg-gray-200 text-black self-start mr-auto'
              }`}
            >
              {msg.text}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-3 flex">
        <input
          type="text"
          className="flex-1 border rounded-l px-3 py-2 outline-none"
          placeholder="Type your message..."
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          disabled={sending}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 rounded-r"
          disabled={sending}
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
