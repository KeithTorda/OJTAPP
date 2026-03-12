import React, { useEffect, useRef, useState } from 'react';
import api from '../services/api';

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: "Hello. I'm your OJT AI assistant.\n\nType your tasks for today in Tagalog or English and I'll turn them into a clean report paragraph.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setLoading(true);

    try {
      const response = await api.post('/chat.php', { message: text });

      if (response.data?.reply) {
        setMessages((prev) => [...prev, { role: 'model', text: response.data.reply }]);
      } else {
        throw new Error('No response from AI assistant.');
      }
    } catch (err) {
      console.error('AI error:', err);
      const msg = err.response?.data?.message || err?.message || 'Connection fragmented.';
      setMessages((prev) => [...prev, { role: 'model', text: `Error: ${msg}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+6.5rem)] right-4 z-[100] flex w-[min(320px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-primary/20 bg-[#0a1628]/96 shadow-[0_0_30px_rgba(0,242,255,0.12)] backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-primary/20 bg-primary/5 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-matrix-green"></div>
              <span className="text-xs font-mono font-bold tracking-wider text-primary">OJT AI ASSISTANT</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-400 transition-colors hover:text-white">
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>

          <div className="flex max-h-[280px] min-h-[280px] flex-1 flex-col gap-2 overflow-y-auto p-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap break-words rounded-xl border px-3 py-2 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'border-primary/30 bg-primary/20 text-primary'
                      : 'border-white/5 bg-[#1c2a2b]/80 text-slate-300'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-xl border border-white/5 bg-[#1c2a2b]/80 px-3 py-2">
                  <span className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/60"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      ></span>
                    ))}
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex items-center gap-2 border-t border-primary/20 bg-primary/5 px-3 py-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
              placeholder="Ask anything..."
              className="max-h-16 flex-1 resize-none overflow-y-auto bg-transparent text-xs text-white outline-none placeholder:text-slate-500"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/20 text-primary transition-colors hover:bg-primary/30 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <span className="material-symbols-outlined text-base">send</span>
            </button>
          </div>
        </div>
      )}

      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-[calc(env(safe-area-inset-bottom)+6rem)] right-4 z-[100] flex h-11 items-center justify-center rounded-full border border-primary/30 bg-[#0a1628]/92 px-3 text-primary shadow-[0_0_20px_rgba(0,242,255,0.2)] transition-all duration-300 hover:border-primary hover:bg-primary/10"
          title="AI Assistant"
        >
          <span className="material-symbols-outlined text-lg">smart_toy</span>
          <span className="ml-2 text-[11px] font-mono tracking-wide">AI Help</span>
        </button>
      )}
    </>
  );
};

export default ChatWidget;
