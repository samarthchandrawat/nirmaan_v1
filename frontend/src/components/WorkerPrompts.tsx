interface Prompt {
  question: string;
  category: 'earnings' | 'benefits' | 'payments' | 'disputes';
}

const workerPrompts: Prompt[] = [
  {
    question: "How much have I earned this week?",
    category: 'earnings'
  },
  {
    question: "What is my expected payment for this month?",
    category: 'earnings'
  },
  {
    question: "When will my next payment arrive?",
    category: 'payments'
  },
  {
    question: "What government benefits am I eligible for?",
    category: 'benefits'
  },
  {
    question: "How can I apply for BOCW benefits?",
    category: 'benefits'
  },
  {
    question: "How do I report a payment delay?",
    category: 'disputes'
  },
  {
    question: "Can you explain my pending payments?",
    category: 'payments'
  },
  {
    question: "What are my total earnings for this month?",
    category: 'earnings'
  }
];

interface WorkerPromptsProps {
  onPromptClick: (prompt: string) => void;
  suggestedPrompts?: string[];
}

export default function WorkerPrompts({ onPromptClick, suggestedPrompts }: WorkerPromptsProps) {
  return (
    <div className="space-y-4">
      {suggestedPrompts && suggestedPrompts.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Suggested follow-up questions:</h4>
          <div className="space-y-2">
            {suggestedPrompts.map((prompt, index) => (
              <button
                key={`suggested-${index}`}
                onClick={() => onPromptClick(prompt)}
                className="w-full text-left p-2 rounded-lg hover:bg-purple-50 transition-colors border border-purple-200 hover:border-purple-300 bg-purple-50 text-gray-900"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Common questions:</h4>
        <div className="space-y-2">
          {workerPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => onPromptClick(prompt.question)}
              className="w-full text-left p-2 rounded-lg hover:bg-purple-50 transition-colors border border-gray-200 hover:border-purple-200 text-gray-900"
            >
              {prompt.question}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
