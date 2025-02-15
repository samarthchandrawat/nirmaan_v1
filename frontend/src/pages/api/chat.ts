import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Mock database functions (replace with actual database calls)
async function getWorkerData(workerId: string) {
  // Mock data - replace with actual database queries
  return {
    weeklyEarnings: 4200,
    verifiedDays: 4,
    pendingDays: 2,
    totalDaysWorked: 6,
    nextPayment: {
      amount: 1400,
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      method: 'UPI'
    },
    benefits: {
      eligible: true,
      amount: 5000,
      program: 'BOCW Welfare Fund'
    }
  };
}

async function generateWorkerResponse(message: string, workerId: string) {
  try {
    const workerData = await getWorkerData(workerId);

    const systemPrompt = `You are a financial assistant for construction workers. You have access to the following worker data:
    - Weekly Earnings: ₹${workerData.weeklyEarnings}
    - Verified Days: ${workerData.verifiedDays}
    - Pending Days: ${workerData.pendingDays}
    - Total Days Worked: ${workerData.totalDaysWorked}
    - Next Payment: ₹${workerData.nextPayment.amount} via ${workerData.nextPayment.method} on ${workerData.nextPayment.date}
    - Benefits Eligibility: ${workerData.benefits.eligible ? 'Eligible' : 'Not eligible'}
    - Benefits Amount: ₹${workerData.benefits.amount}
    - Benefits Program: ${workerData.benefits.program}

    Provide clear, concise answers about financial matters. Use simple language and always mention amounts in ₹ (INR).
    After answering each question, suggest 2-3 relevant follow-up questions based on the context.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",  
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const answer = response.choices[0]?.message?.content || "I couldn't process your request.";
    
    // Generate follow-up suggestions
    const suggestionsResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",  
      messages: [
        { role: "system", content: "You are a helpful assistant. Generate 2-3 follow-up questions based on the previous conversation. Return them as a JSON array of strings." },
        { role: "user", content: `Previous question: "${message}"\nPrevious answer: "${answer}"\nGenerate 2-3 natural follow-up questions that the worker might want to ask about their financial situation and benefits.` }
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    let suggestions: string[] = [];
    try {
      const content = suggestionsResponse.choices[0]?.message?.content || "[]";
      // Handle both array-only responses and responses that might include explanation
      const match = content.match(/\[.*\]/);
      if (match) {
        suggestions = JSON.parse(match[0]);
      }
    } catch (e) {
      console.error('Error parsing suggestions:', e);
      suggestions = [];
    }

    return {
      answer,
      suggestions
    };

  } catch (error) {
    console.error('Error in generateWorkerResponse:', error);
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, workerId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await generateWorkerResponse(message, workerId || 'default');
    res.status(200).json(response);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'An error occurred while processing your request',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}
