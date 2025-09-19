
import React, { useState, useRef, useEffect } from 'react';
import { Chat } from '@google/genai';
import { getChatInstance } from '../services/geminiService';
import Card from './ui/Card';
import Button from './ui/Button';
import { ChatMessage } from '../types';
import { SendIcon } from './icons/Icons';

const ConversationPractice: React.FC = () => {
  const [chat] = useState<Chat>(getChatInstance());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: userInput };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
        const result = await chat.sendMessage({ message: userInput });
        const modelMessage: ChatMessage = { role: 'model', text: result.text };
        setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
        console.error("Error sending message:", error);
        const errorMessage: ChatMessage = { role: 'model', text: 'Sorry, I encountered an error. Please try again.' };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[75vh]">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-1 text-slate-700">Conversation Practice</h2>
        <p className="text-slate-500">Chat with an AI tutor to improve your conversational English.</p>
      </div>

      <div className="flex-grow bg-slate-50 rounded-lg p-4 overflow-y-auto mb-4">
        {messages.length === 0 ? (
           <div className="flex items-center justify-center h-full text-slate-500">
             <p>Start the conversation by saying hello!</p>
           </div>
        ) : (
            <div className="space-y-4">
            {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-md p-3 rounded-xl ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white text-slate-800 shadow-sm'}`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
                </div>
            ))}
            {isLoading && (
                 <div className="flex justify-start">
                    <div className="max-w-md p-3 rounded-xl bg-white text-slate-800 shadow-sm">
                        <div className="flex items-center gap-2">
                           <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                           <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                           <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
            </div>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
          disabled={isLoading}
        />
        <Button type="submit" isLoading={isLoading} disabled={!userInput.trim()}>
          <SendIcon />
        </Button>
      </form>
    </Card>
  );
};

export default ConversationPractice;
