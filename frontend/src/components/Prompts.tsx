interface Prompt {
  question: string;
  category: 'earnings' | 'benefits' | 'payments' | 'disputes' | 'performance';
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

const contractorPrompts: Prompt[] = [
  {
    question: "Who are the workers that need payment today?",
    category: 'payments'
  },
  {
    question: "Show me workers with completed tasks pending approval",
    category: 'performance'
  },
  {
    question: "Can I review pending wage disputes?",
    category: 'disputes'
  },
  {
    question: "How do I generate a smart contract for a new worker?",
    category: 'payments'
  },
  {
    question: "Which workers have the best performance this month?",
    category: 'performance'
  },
  {
    question: "Show me today's attendance and work hours",
    category: 'performance'
  },
  {
    question: "Generate payment report for this week",
    category: 'payments'
  },
  {
    question: "Review pending benefit applications",
    category: 'benefits'
  }
];

interface WorkerPromptsProps {
  onPromptClick: (prompt: string) => void;
  suggestedPrompts?: string[];
  userRole?: string;
  showInitialPrompts?: boolean;
}

export default function WorkerPrompts({ onPromptClick, suggestedPrompts, userRole, showInitialPrompts = true }: WorkerPromptsProps) {
  const prompts = userRole === 'contractor' ? contractorPrompts : workerPrompts;

  const renderPrompt = (text: string, key: string) => (
    <div key={key} className="bg-white rounded-lg border border-gray-200 hover:border-purple-200">
      <button
        onClick={() => onPromptClick(text)}
        className="w-full text-left p-2 rounded-lg hover:bg-purple-50 transition-colors text-gray-900"
      >
        {text}
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      {showInitialPrompts && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Common questions:</h4>
          <div className="space-y-2">
            {prompts.map((prompt, index) => renderPrompt(prompt.question, `initial-${index}`))}
          </div>
        </div>
      )}

      {suggestedPrompts && suggestedPrompts.length > 0 && (
        <div className="space-y-2">
          {suggestedPrompts.map((prompt, index) => renderPrompt(prompt, `suggested-${index}`))}
        </div>
      )}
    </div>
  );
}
