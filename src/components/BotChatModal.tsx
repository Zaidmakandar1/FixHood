import { useState } from 'react';

export default function BotChatModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setMessages((prev) => [...prev, { role: 'user', content: input }]);
    try {
      const res = await fetch('/api/ollama/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });
      const data = await res.json();
      if (data.message) throw new Error(data.message);
      setMessages((prev) => [...prev, { role: 'bot', content: data.message?.content || data.message || data.response || data.choices?.[0]?.message?.content || data?.content || JSON.stringify(data) }]);
      setInput('');
    } catch (err: any) {
      setError(err.message || 'Failed to get response');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-8 relative"> {/* Increased max-w and padding */}
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h2 className="text-lg font-bold mb-4">Chat with Bot</h2>
        <div className="h-[32rem] overflow-y-auto border rounded p-4 mb-4 bg-gray-50"> {/* Increased height and padding */}
          {messages.length === 0 && <div className="text-gray-400 text-center mt-16">Start a conversation with the bot...</div>}
          {messages.map((msg, i) => (
            <div key={i} className={`mb-2 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`rounded px-3 py-2 max-w-[80%] ${msg.role === 'user' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-900'}`}>{msg.content}</div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            className="input flex-1"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={loading}
          />
          <button className="btn btn-primary" type="submit" disabled={loading || !input.trim()}>{loading ? '...' : 'Send'}</button>
        </form>
        {error && <div className="text-red-500 mt-2 text-sm">{error}</div>}
      </div>
    </div>
  );
}
