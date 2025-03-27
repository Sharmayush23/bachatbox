import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getChatbotResponse } from '../../services/openaiService';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      text: "Hi! I'm your BachatBox Financial Assistant. How can I help you manage your finances today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const sendMessage = async () => {
    if (input.trim() === '') return;
    
    // Add user message to chat
    const userMessage: Message = {
      id: messages.length,
      text: input,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Get response from AI
      const response = await getChatbotResponse(input);
      
      // Add AI response to chat
      const aiMessage: Message = {
        id: messages.length + 1,
        text: response,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast({
        title: "Couldn't get response",
        description: "Sorry, I couldn't process your request. Please try again.",
        variant: "destructive",
      });
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      sendMessage();
    }
  };

  // Format timestamp to show just the time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chatbot button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 w-14 h-14 rounded-full bg-primary shadow-lg flex items-center justify-center"
        aria-label="Chat with financial assistant"
      >
        {isOpen ? (
          <i className="fas fa-times text-white text-xl"></i>
        ) : (
          <i className="fas fa-comment text-white text-xl"></i>
        )}
      </Button>

      {/* Chatbot dialog */}
      {isOpen && (
        <Card className="fixed bottom-20 right-4 w-[350px] max-w-[90vw] h-[500px] max-h-[70vh] flex flex-col rounded-lg overflow-hidden shadow-xl border border-border z-50">
          {/* Header */}
          <div className="bg-primary text-white p-3 flex justify-between items-center">
            <div className="flex items-center">
              <i className="fas fa-robot mr-2"></i>
              <h3 className="font-medium">Financial Assistant</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-white/80 focus:outline-none"
              aria-label="Close chatbot"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          {/* Chat messages area */}
          <div className="flex-1 overflow-y-auto p-4 bg-background">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`mb-4 flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.isUser 
                      ? 'bg-primary text-white rounded-tr-none' 
                      : 'bg-muted rounded-tl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  <span className={`text-xs mt-1 block ${message.isUser ? 'text-white/70' : 'text-muted-foreground'}`}>
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-muted p-3 rounded-lg rounded-tl-none">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Input area */}
          <div className="p-3 border-t border-border bg-card">
            <div className="flex items-center">
              <Input 
                type="text"
                placeholder="Ask about your finances..."
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1 bg-background"
              />
              <Button 
                onClick={sendMessage}
                disabled={isLoading || input.trim() === ''}
                className="ml-2 bg-primary text-white"
                aria-label="Send message"
              >
                <i className="fas fa-paper-plane"></i>
              </Button>
            </div>
            
            {/* Suggested questions */}
            <div className="mt-2 flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setInput("How can I save more money?");
                  setTimeout(() => sendMessage(), 100);
                }}
                disabled={isLoading}
                className="text-xs"
              >
                How can I save more?
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setInput("What are my top spending categories?");
                  setTimeout(() => sendMessage(), 100);
                }}
                disabled={isLoading}
                className="text-xs"
              >
                Top spending?
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setInput("How to budget better?");
                  setTimeout(() => sendMessage(), 100);
                }}
                disabled={isLoading}
                className="text-xs"
              >
                Budget tips
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};

export default ChatBot;