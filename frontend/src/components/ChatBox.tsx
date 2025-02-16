import { useState } from 'react';
import WorkerPrompts from './Prompts';
import MediationRequest from './MediationRequest';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatBoxProps {
  userRole?: string;
  userId?: string;
}

export default function ChatBox({ userRole, userId }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
  const [showMediationRequest, setShowMediationRequest] = useState(false);
  const [currentDispute, setCurrentDispute] = useState<{
    workerId: string;
    contractorId: string;
    description: string;
    amount?: number;
  } | null>(null);

  const checkForMediationRequest = (message: string) => {
    const mediationKeywords = [
      'schedule mediation',
      'request mediation',
      'need mediation',
      'want mediation',
      'arrange mediation',
      'schedule a call',
      'mediation session',
      'mediation call',
      'schedule meeting',
      'arrange meeting',
      'schedule consultation',
      'dispute',
      'mediation',
      'resolve',
      'conflict',
      'payment issue',
    ];

    // Convert message to lowercase for case-insensitive matching
    const lowerMessage = message.toLowerCase();
    
    // Check if the message contains any mediation-related keywords
    return mediationKeywords.some(keyword => lowerMessage.includes(keyword));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: trimmedInput }]);
    setIsLoading(true);
    setSuggestedPrompts([]); // Clear previous suggestions

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: trimmedInput,
          userRole: userRole,
          workerId: userRole === 'worker' ? userId : undefined
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
        
        if (checkForMediationRequest(input)) {
          // Extract amount if mentioned (e.g., "₹5000" or "5000")
          const amountMatch = input.match(/₹?(\d+)/);
          const amount = amountMatch ? parseInt(amountMatch[1]) : undefined;

          setCurrentDispute({
            workerId: userId || 'unknown',
            contractorId: 'pending', // This would come from your actual data
            description: input,
            amount
          });
          setShowMediationRequest(true);
        }

        if (data.suggestions && data.suggestions.length > 0) {
          setSuggestedPrompts(data.suggestions);
        }
      } else {
        const errorMessage = data.details || data.error || 'An error occurred. Please try again.';
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `I apologize, but I encountered an error: ${errorMessage}` 
        }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I encountered a network error. Please check your connection and try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
    setIsMinimized(false);
  };

  const handleMediationSuccess = (meetingDetails: any) => {
    setShowMediationRequest(false);
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `✅ Mediation session scheduled!\n\nMeeting Details:\nDate: ${new Date(meetingDetails.meeting.meeting.start_time).toLocaleString()}\nJoin Link: ${meetingDetails.meeting.participants.worker.join_url}\n\nA mediator will help resolve your dispute. You'll receive a notification with these details as well.`
    }]);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {showMediationRequest && currentDispute && (
        <MediationRequest
          disputeDetails={currentDispute}
          onClose={() => setShowMediationRequest(false)}
          onSuccess={handleMediationSuccess}
        />
      )}
      
      {!isMinimized ? (
        <div className="bg-white rounded-lg shadow-xl w-96 overflow-hidden border border-gray-200">
          <div className="bg-purple-600 p-4 text-white flex justify-between items-center">
            <h3 className="font-medium">Chat Assistant</h3>
            <button
              onClick={() => setIsMinimized(true)}
              className="text-white hover:text-gray-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 5.25l-7.5 7.5-7.5-7.5m15 6l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>
          </div>
          
          <div className="h-96 flex flex-col">
            {/* Messages Container */}
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.length === 0 && (
                <WorkerPrompts 
                  onPromptClick={handlePromptClick} 
                  suggestedPrompts={[]}
                  userRole={userRole}
                  showInitialPrompts={true}
                />
              )}
              {messages.map((message, index) => (
                <div key={index} className="mb-4">
                  <div
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.role === 'assistant' && message.content.includes('Auto-generated Dispute Report:') ? (
                        // Render dispute report with formatting
                        <div className="space-y-2">
                          {message.content.split('\n\n').map((section, sIdx) => {
                            if (section.startsWith('Auto-generated Dispute Report:')) {
                              return (
                                <div key={sIdx} className="border-t border-gray-300 pt-2 mt-2">
                                  <h4 className="font-semibold text-purple-700 mb-2">Dispute Report</h4>
                                  <div className="text-sm whitespace-pre-wrap">
                                    {section.replace('Auto-generated Dispute Report:', '').trim()}
                                  </div>
                                </div>
                              );
                            } else if (section.startsWith('Legal Citations:')) {
                              return (
                                <div key={sIdx} className="border-t border-gray-300 pt-2">
                                  <h4 className="font-semibold text-purple-700 mb-2">Legal Citations</h4>
                                  <div className="text-sm space-y-2">
                                    {section.replace('Legal Citations:', '').trim().split('\n').map((citation, cIdx) => {
                                      if (citation.startsWith('Source:')) {
                                        return (
                                          <a
                                            key={cIdx}
                                            href={citation.replace('Source:', '').trim()}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline block"
                                          >
                                            View Source
                                          </a>
                                        );
                                      }
                                      return (
                                        <p key={cIdx} className="text-gray-600">
                                          {citation}
                                        </p>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            } else if (section.startsWith('Relevant Legal Information:')) {
                              return (
                                <div key={sIdx} className="border-t border-gray-300 pt-2">
                                  <h4 className="font-semibold text-purple-700 mb-2">Legal Information</h4>
                                  <div className="text-sm whitespace-pre-wrap">
                                    {section.replace('Relevant Legal Information:', '').trim()}
                                  </div>
                                </div>
                              );
                            }
                            return (
                              <p key={sIdx} className="text-sm whitespace-pre-wrap">
                                {section}
                              </p>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                  </div>
                  {/* Show suggestions after assistant's message */}
                  {message.role === 'assistant' && suggestedPrompts.length > 0 && index === messages.length - 1 && (
                    <div className="mt-4 ml-4">
                      {suggestedPrompts.map((prompt, promptIndex) => (
                        <div key={`suggested-${promptIndex}`} className="mb-2">
                          <button
                            onClick={() => handlePromptClick(prompt)}
                            className="w-full text-left p-2 rounded-lg hover:bg-purple-50 transition-colors border border-gray-200 hover:border-purple-200 text-gray-900 text-sm"
                          >
                            {prompt}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <p className="text-sm text-gray-900">Typing...</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Input Form */}
            <div className="border-t border-gray-200">
              <form onSubmit={handleSubmit} className="p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-purple-600 text-gray-900"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors flex items-center gap-3 pr-6"
        >
          <div className="bg-purple-600 p-4 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
              />
            </svg>
          </div>
          <span className="font-medium text-gray-900">Need help?</span>
        </button>
      )}
    </div>
  );
}
