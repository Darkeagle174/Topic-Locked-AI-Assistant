import React, { useRef, useLayoutEffect } from 'react';
import { Message, Role } from '../types';
import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useConfig } from '../contexts/ConfigContext';
import gsap from 'gsap';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { config } = useConfig();
  const isUser = message.role === Role.USER;
  const bubbleRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    // Only animate if it's a new message (we assume mounting means new in this list context)
    // We can use a simple entry animation
    if (!bubbleRef.current) return;

    const ctx = gsap.context(() => {
      if (isUser) {
        // User Message: Pop in from bottom/right
        gsap.from(bubbleRef.current, {
          opacity: 0,
          y: 20,
          scale: 0.9,
          duration: 0.4,
          ease: "back.out(1.7)"
        });
      } else {
        // Bot Message: Slide in from left
        gsap.from(bubbleRef.current, {
          opacity: 0,
          x: -20,
          duration: 0.4,
          ease: "power2.out"
        });
      }
    }, bubbleRef);

    return () => ctx.revert();
  }, [isUser]);

  return (
    <div 
      ref={bubbleRef}
      className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div 
          className={`
            flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors duration-300 shadow-sm
          `}
          style={{
            backgroundColor: isUser ? config.theme.secondaryColor : config.theme.primaryColor
          }}
        >
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        {/* Bubble */}
        <div className={`
          flex flex-col 
          ${isUser ? 'items-end' : 'items-start'}
        `}>
          <div 
            className={`
              px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm transition-colors duration-300
              ${isUser 
                ? 'text-white rounded-tr-none' 
                : message.isError 
                  ? 'bg-red-50 text-red-600 border border-red-200 rounded-tl-none'
                  : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
              }
            `}
            style={isUser ? { backgroundColor: config.theme.secondaryColor } : {}}
          >
            {isUser ? (
              // User messages are rendered as plain text with preserved whitespace
              <div className="whitespace-pre-wrap">{message.text}</div>
            ) : (
              // Bot messages are rendered as Markdown
              <ReactMarkdown
                components={{
                  // Style lists
                  ul: ({ ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                  ol: ({ ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                  li: ({ ...props }) => <li className="" {...props} />,
                  // Style paragraphs
                  p: ({ ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                  // Style bold and italics
                  strong: ({ ...props }) => <span className="font-bold" {...props} />,
                  em: ({ ...props }) => <span className="italic" {...props} />,
                  // Style links
                  a: ({ ...props }) => (
                    <a 
                      className="hover:underline font-medium" 
                      style={{ color: config.theme.primaryColor }}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      {...props} 
                    />
                  ),
                }}
              >
                {message.text}
              </ReactMarkdown>
            )}
          </div>
          
          <span className="text-[10px] text-slate-400 mt-1 px-1">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;