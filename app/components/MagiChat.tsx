"use client";

import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: number;
  sender: 'system' | 'user';
  text: string;
  time: string;
}

export default function MagiChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentBotMessageIdRef = useRef<number | null>(null);
  const lastActiveSenderRef = useRef<string | null>(null);


  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMsg: Message = {
      id: Date.now(),
      sender: 'user',
      text: inputValue,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    currentBotMessageIdRef.current = null;
    lastActiveSenderRef.current = 'user';

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setInputValue('');

    try {
      const response = await fetch('http://localhost:8000/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
        body: JSON.stringify({ role: "user", content: inputValue }),
      });


      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

        for (const line of lines) {
          const jsonStr = line.replace('data: ', '').trim();
          try {
            const data = JSON.parse(jsonStr);

            if (currentBotMessageIdRef.current === null || data.sender !== lastActiveSenderRef.current) {
              const newBotMessageId = Date.now() + Math.random();
              currentBotMessageIdRef.current = newBotMessageId;
              lastActiveSenderRef.current = data.sender;

              setMessages((prev) => [...prev, {
                id: newBotMessageId,
                sender: data.sender,
                text: data.text,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              }]);

            } else {

              setMessages((prev) =>
                prev.map((m) =>
                  m.id === currentBotMessageIdRef.current
                    ? { ...m, text: m.text + data.text }
                    : m
                )
              );
            }
          } catch (err) {
            console.error("Error parsing streaming chunk JSON", err);
          }
        }
      }
    } catch (err) {
      console.error("Failed to send message to Python backend", err);
    }
  };


  useEffect(() => {
    const initStandby = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: "user", content: "" })
        });


        if (!response.body) return;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        const { value } = await reader.read();
        const chunk = decoder.decode(value);
        const line = chunk.split('\n').find(l => l.startsWith('data: '));

        if (line) {
          const jsonStr = line.replace('data: ', '').trim();
          const data = JSON.parse(jsonStr);

          setMessages([{
            id: Date.now(),
            sender: data.sender,
            text: data.text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }]);
        }
      } catch (err) {
        console.error("Impossible de récupérer le message de veille MAGI", err);
      }
    };
    initStandby();
  }, []);

  return (
    <div className="flex justify-center items-center p-4">

      <div className="ascii-chat-container text-orange-500">

        <div className="text-center font-bold border-b border-dashed border-orange-500 py-2 text-xs tracking-widest bg-black">
          MAGI // API
        </div>

        <div className="ascii-chat-messages bg-black/40">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[85%] ${isUser ? 'self-end items-end' : 'self-start items-start'}`}
              >
                <span className="text-[10px] opacity-60 tracking-wider mb-1 font-bold style={{ textShadow: '0 0 2px currentColor' }}">
                  {msg.sender} [{msg.time}]
                </span>

                <div
                  className={`p-2 text-sm border font-mono ${isUser
                    ? 'bg-orange-950/40 border-orange-500 text-orange-200'
                    : msg.sender === 'system'
                      ? 'bg-zinc-900 border-red-500 text-red-400'
                      : 'bg-zinc-900 border-orange-600 text-orange-300'
                    }`}
                  style={{ textShadow: 'none' }}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="ascii-chat-input-zone">
          <input
            type="text"
            className="ascii-input"
            placeholder="Enter command or message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button type="submit" className="ascii-btn">
            SEND
          </button>
        </form>

      </div>

    </div>
  );
}
