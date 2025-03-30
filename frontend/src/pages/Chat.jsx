import { useState } from 'react';
import { chatWithAPI } from '../lib/api';
import Loading from '../components/Loading';
import Error from '../components/Error';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await chatWithAPI(input);
      setMessages([...messages, { type: 'user', text: input }, { type: 'bot', text: response.answer }]);
      setInput('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
       <div className="flex gap-2">

        </div>
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Chat Interface</h1>
          <div className="flex gap-2">

              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold rounded px-4 py-2  text-sm"
                onClick={() => window.location.href = '/quiz'}
              >
                Attempt Quiz
              </button>
            
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold rounded py-2 px-4 text-sm"
                onClick={() => window.location.href = '/summary'}
              >
                View Summary
              </button>

          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4 h-96 overflow-y-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 ${
                message.type === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              <div
                className={`inline-block p-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
          {loading && <Loading />}
          {error && <Error message={error} />}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-2 border rounded"
            placeholder="Type your message..."
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
            disabled={loading}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chat;
