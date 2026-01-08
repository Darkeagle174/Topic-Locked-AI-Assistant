import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { Message, Role } from '../types';
import { createChatSession, sendMessageStream } from '../services/geminiService';
import { isTopicRelevant, loadModel } from '../services/topicValidator';
import { GenerateContentResponse, Chat } from '@google/genai';
import { useConfig } from '../contexts/ConfigContext';
import MessageBubble from './MessageBubble';
import gsap from 'gsap';

const ChatInterface: React.FC = () => {
  const { config } = useConfig();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [bgImageError, setBgImageError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<Chat | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize/Reset chat when config.topic changes
  useEffect(() => {
    // 1. Reset messages with new welcome message
    setMessages([{
      id: `welcome-${Date.now()}`,
      role: Role.MODEL,
      text: `Hello! I am ${config.assistantName}. I am here to discuss ${config.topic}. Ask me anything!`,
      timestamp: new Date()
    }]);

    // 2. Reset Chat Session with new System Instruction
    chatSessionRef.current = createChatSession(config);

    // 3. Reset image error state
    setBgImageError(false);

    // 4. Preload validator model (idempotent)
    // We don't await this to avoid blocking the UI
    loadModel().catch(err => console.error("Failed to preload TFJS model", err));

    // Animation for topic change
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, 
        { opacity: 0, scale: 0.98 }, 
        { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" }
      );
    }

  }, [config.topic, config.assistantName, config.topicDescription, config.theme]); // Depend on full config changes

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isValidating, isLoading]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!inputValue.trim() || isLoading || isValidating || !chatSessionRef.current) return;

    const userText = inputValue.trim();
    setInputValue('');
    
    // 1. Add User Message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      text: userText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    
    // 2. Validate Topic using TFJS
    setIsValidating(true);
    let isRelevant = true;
    
    try {
      if (config.theme.keywords && config.theme.keywords.length > 0) {
        isRelevant = await isTopicRelevant(userText, config.theme.keywords);
      }
    } catch (err) {
      console.error("Validation error, allowing message by default:", err);
      isRelevant = true; // Fail open if validator crashes
    } finally {
      setIsValidating(false);
    }

    if (!isRelevant) {
      const rejectionMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        text: `I'm sorry, but that doesn't seem related to **${config.topic}**. \n\nI can only answer questions about ${config.topic.toLowerCase()}. Please try rephrasing or ask something else!`,
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, rejectionMessage]);
      return;
    }

    // 3. Proceed to API Call
    setIsLoading(true);

    const botMessageId = (Date.now() + 1).toString();
    const botMessagePlaceholder: Message = {
      id: botMessageId,
      role: Role.MODEL,
      text: '', 
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, botMessagePlaceholder]);

    try {
      const resultStream = await sendMessageStream(chatSessionRef.current, userText);
      
      let fullText = '';
      
      for await (const chunk of resultStream) {
        const c = chunk as GenerateContentResponse;
        const chunkText = c.text || '';
        fullText += chunkText;
        
        setMessages(prev => prev.map(msg => 
          msg.id === botMessageId 
            ? { ...msg, text: fullText }
            : msg
        ));
      }
      
    } catch (error) {
      console.error(error);
      setMessages(prev => prev.map(msg => 
        msg.id === botMessageId 
          ? { ...msg, text: "I'm having trouble connecting right now. Please check your API key and try again.", isError: true }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="flex flex-col h-[calc(100vh-80px)] md:h-[calc(100vh-140px)] max-w-4xl mx-auto w-full md:rounded-xl md:shadow-lg overflow-hidden border border-slate-200/60 relative bg-white"
    >
      
      {/* Background Image Layer */}
      {config.theme.chatBackgroundImage && !bgImageError && (
        <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden bg-white">
          {/* The Image */}
          <img 
            key={config.theme.chatBackgroundImage}
            src={config.theme.chatBackgroundImage} 
            alt="Topic Background" 
            className="w-full h-full object-cover opacity-100 transition-opacity duration-500 min-w-full min-h-full"
            referrerPolicy="no-referrer"
            onError={() => setBgImageError(true)}
          />
          {/* Dimming Overlay - 90% White */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"></div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 relative z-10 scroll-smooth">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        
        {isValidating && (
           <div className="flex items-center gap-2 text-slate-500 text-sm ml-12 mb-4 font-medium animate-pulse">
             <ShieldCheck size={14} className="text-emerald-500" />
             <span className="text-slate-400">Validating topic relevance...</span>
           </div>
        )}

        {isLoading && messages[messages.length - 1]?.text === '' && (
          <div className="flex items-center gap-2 text-slate-500 text-sm ml-12 mb-4 font-medium animate-pulse">
            <Sparkles size={14} style={{ color: config.theme.primaryColor }} />
            <span style={{ color: config.theme.primaryColor }}>Thinking about {config.topic}...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-transparent border-t border-slate-200/60 relative z-10">
        <form 
          onSubmit={handleSendMessage}
          className="relative flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Ask a question about ${config.topic}...`}
            className="w-full py-3.5 pl-5 pr-12 bg-white border border-slate-300 rounded-full text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all shadow-sm hover:border-slate-400"
            style={{ 
              ['--tw-ring-color' as any]: `${config.theme.primaryColor}40`, 
            }}
            disabled={isLoading || isValidating}
          />
          
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading || isValidating}
            className={`
              absolute right-2 p-2 rounded-full flex items-center justify-center transition-all
              ${!inputValue.trim() || isLoading || isValidating
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                : 'text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
              }
            `}
            style={{
              backgroundColor: (!inputValue.trim() || isLoading || isValidating) ? undefined : config.theme.primaryColor
            }}
          >
            {isLoading || isValidating ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
        <div className="text-center mt-2 flex justify-center items-center gap-3">
            <span className="text-[10px] text-slate-400">
                Project Lab • Powered by Gemini API
            </span>
            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
              <ShieldCheck size={10} /> Topic Guard Active
            </span>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;