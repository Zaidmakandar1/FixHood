import { useState } from 'react';
import { X, Send } from 'lucide-react';

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
      setMessages((prev) => [...prev, { 
        role: 'bot', 
        content: data.content || data.response || 'I apologize, but I could not process your request.'
      }]);
      setInput('');
    } catch (err: any) {
      setError(err.message || 'Failed to get response');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8 relative transform transition-all duration-300 animate-fade-in-up">
        <button 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transform transition-all hover:scale-110"
          onClick={onClose}
        >
          <X size={24} />
        </button>
        
        <h2 className="text-xl font-bold mb-6 animate-fade-in">Chat with AI Assistant</h2>
        
        <div className="h-[32rem] overflow-y-auto border rounded-lg p-4 mb-6 bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-gray-400 text-center mt-16 animate-fade-in">
              Start a conversation with the AI assistant...
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div 
                    className={`rounded-lg px-4 py-2 max-w-[80%] transform transition-all duration-300 hover:scale-[1.02] ${
                      msg.role === 'user' 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <form onSubmit={handleSend} className="flex gap-3">
            <input
              className="input flex-1 transition-all duration-200 hover:shadow-md focus:shadow-lg"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={loading}
            />
            <button 
              className="btn btn-primary px-6 transform transition-all duration-200 hover:scale-105 flex items-center"
              type="submit" 
              disabled={loading || !input.trim()}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <Send size={18} />
              )}
            </button>
          </form>

          {error && (
            <div className="text-red-500 mt-3 text-sm animate-fade-in flex items-center">
              <span className="mr-2">⚠️</span>
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
