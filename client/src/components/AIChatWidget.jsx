import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: 'Hello! 👋 I\'m your OJT AI UPLINK Assistant.\n\nJust type your tasks for today (Tagalog or English is fine!), and I\'ll turn them into a professional report paragraph ready for submission.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setLoading(true);

    try {
      const response = await api.post('/chat.php', { message: text });
      
      if (response.data && response.data.reply) {
        setMessages(prev => [...prev, { role: 'model', text: response.data.reply }]);
      } else {
        throw new Error('No response from AI Uplink.');
      }
    } catch (err) {
      console.error('AI error:', err);
      const msg = err.response?.data?.message || err?.message || 'Connection fragmented.';
      setMessages(prev => [...prev, { role: 'model', text: `⚠️ Error: ${msg}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-[90px] right-4 w-[320px] z-[100] flex flex-col rounded-2xl overflow-hidden border border-primary/30 shadow-[0_0_30px_rgba(0,242,255,0.15)] bg-[#0a1628]/95 backdrop-blur-md">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-primary/20 bg-primary/5">
            <div className="flex items-center gap-2">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-matrix-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-matrix-green"></span>
              </div>
              <span className="text-xs font-mono text-primary font-bold tracking-wider">OJT AI ASSISTANT</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 min-h-[280px] max-h-[280px]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs font-mono leading-relaxed whitespace-pre-wrap break-words ${
                  msg.role === 'user'
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'bg-[#1c2a2b]/80 text-slate-300 border border-white/5'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#1c2a2b]/80 border border-white/5 px-3 py-2 rounded-xl">
                  <span className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <span key={i} className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}></span>
                    ))}
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-2 border-t border-primary/20 bg-primary/5">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
              placeholder="Ask anything..."
              className="flex-1 bg-transparent text-white text-xs font-mono placeholder-slate-500 outline-none resize-none leading-5 max-h-16 overflow-y-auto"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-base">send</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Toggle Button — only shown when chat is closed */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-[88px] right-4 z-[100] w-12 h-12 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.3)] border border-primary/40 bg-[#0a1628]/90 text-primary hover:bg-primary/20 hover:border-primary transition-all duration-300"
          title="AI Assistant"
        >
          <span className="material-symbols-outlined text-xl">smart_toy</span>
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-matrix-green rounded-full border-2 border-[#0a1628] animate-pulse"></span>
        </button>
      )}
    </>
  );
};

export default ChatWidget;
