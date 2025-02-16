import { useState } from 'react';
import { useAccount } from 'wagmi';

interface MediationRequestProps {
  disputeDetails: {
    workerId: string;
    contractorId: string;
    description: string;
    amount?: number;
  };
  onClose: () => void;
  onSuccess: (meetingDetails: any) => void;
}

export default function MediationRequest({
  disputeDetails,
  onClose,
  onSuccess
}: MediationRequestProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [preferredTime, setPreferredTime] = useState('');
  const [additionalDescription, setAdditionalDescription] = useState('');
  const [error, setError] = useState('');
  const { address } = useAccount();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!preferredTime) {
      setError('Please select a preferred time for the mediation');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Submitting mediation request:', {
        workerId: disputeDetails.workerId,
        contractorId: disputeDetails.contractorId,
        preferredTime,
        description: disputeDetails.description,
        additionalDescription
      });

      const response = await fetch('/api/mediation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workerId: disputeDetails.workerId,
          contractorId: disputeDetails.contractorId || 'pending',
          disputeId: `${Date.now()}-${address?.slice(-6) || 'unknown'}`,
          description: additionalDescription 
            ? `${disputeDetails.description}\n\nAdditional Details:\n${additionalDescription}`
            : disputeDetails.description,
          preferredTime: new Date(preferredTime).toISOString(),
          amount: disputeDetails.amount
        }),
      });

      const data = await response.json();
      console.log('Mediation API response:', data);

      if (!response.ok) {
        console.error('Mediation request failed:', {
          status: response.status,
          data
        });
        throw new Error(data.details || data.error || 'Failed to schedule mediation');
      }

      onSuccess(data);
    } catch (err: any) {
      console.error('Mediation request error:', {
        error: err.message,
        details: err.response?.data
      });
      
      let errorMessage = err.message || 'An unexpected error occurred';
      if (errorMessage.includes('Failed to get Zoom access token')) {
        errorMessage = 'Unable to connect to Zoom. Please try again later or contact support.';
      }
      
      setError(`Error: ${errorMessage}. Please try again or contact support if the issue persists.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate available time slots (next 7 days, 9 AM to 5 PM)
  const getAvailableTimeSlots = () => {
    const slots = [];
    const now = new Date();
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() + i);
      
      // Only weekdays
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      // 9 AM to 5 PM, hourly slots
      for (let hour = 9; hour <= 17; hour++) {
        date.setHours(hour, 0, 0, 0);
        slots.push(date.toISOString());
      }
    }
    
    return slots;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-semibold mb-4">Schedule Mediation Session</h2>
        
        <div className="mb-4">
          <h3 className="font-medium mb-2">Dispute Summary</h3>
          <p className="text-sm text-gray-600">
            Amount: ₹{disputeDetails.amount || 'Not specified'}<br />
            Description: {disputeDetails.description}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Preferred Time*
            </label>
            <select
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:border-purple-600 text-black"
              required
            >
              <option value="" className="text-black">Select a time slot</option>
              {getAvailableTimeSlots().map((slot) => (
                <option key={slot} value={slot} className="text-black">
                  {new Date(slot).toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Additional Description (Optional)
            </label>
            <textarea
              value={additionalDescription}
              onChange={(e) => setAdditionalDescription(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:border-purple-600 text-black min-h-[100px]"
              placeholder="Add any additional details about your dispute..."
            />
          </div>

          {error && (
            <div className="mb-4 p-2 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Scheduling...' : 'Schedule Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
