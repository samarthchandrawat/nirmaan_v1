import OpenAI from 'openai';
import { NextApiRequest, NextApiResponse } from 'next';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Mock database functions (replace with actual database calls)
async function getWorkerData(workerId: string) {
  return {
    weeklyEarnings: 5000,
    verifiedDays: 5,
    pendingDays: 2,
    totalDaysWorked: 7,
    nextPayment: {
      amount: 3500,
      method: 'UPI',
      date: '2024-02-20'
    },
    benefits: {
      eligible: true,
      amount: 2000,
      program: 'BOCW',
      status: 'Active',
      nextDisbursement: '2024-02-25'
    },
    monthlyStats: {
      totalEarned: 20000,
      totalPaid: 15000,
      pending: 5000,
      averageDailyWage: 800
    }
  };
}

async function getContractorData() {
  return {
    workersCount: 25,
    pendingPayments: {
      count: 5,
      totalAmount: 25000,
      urgentCount: 2,
      urgentAmount: 10000
    },
    disputes: {
      active: 2,
      resolved: 10,
      pendingAmount: 15000
    },
    financials: {
      dailyWagesBudget: 20000,
      weeklyPayouts: 140000,
      monthlyPayroll: 560000,
      pendingApprovals: 45000
    },
    performance: {
      completionRate: 92,
      attendanceRate: 88,
      efficiencyScore: 85
    },
    benefitApplications: {
      pending: 3,
      approved: 15,
      rejected: 2,
      totalAmount: 40000
    }
  };
}

async function generateResponse(message: string, userRole: string, workerId?: string) {
  try {
    let systemPrompt = '';
    
    if (userRole === 'worker') {
      const workerData = await getWorkerData(workerId || 'default');
      systemPrompt = `You are a financial assistant for construction workers. Use this worker data:
         Weekly Earnings: ₹${workerData.weeklyEarnings}
         Verified Days: ${workerData.verifiedDays}
         Pending Days: ${workerData.pendingDays}
         Total Days: ${workerData.totalDaysWorked}
         Next Payment: ₹${workerData.nextPayment.amount} via ${workerData.nextPayment.method} on ${workerData.nextPayment.date}
         Benefits: ${workerData.benefits.program} (${workerData.benefits.status})
         Benefit Amount: ₹${workerData.benefits.amount}
         Next Disbursement: ${workerData.benefits.nextDisbursement}
         Monthly Stats:
         Total Earned: ₹${workerData.monthlyStats.totalEarned}
         Total Paid: ₹${workerData.monthlyStats.totalPaid}
         Pending: ₹${workerData.monthlyStats.pending}
         Average Daily: ₹${workerData.monthlyStats.averageDailyWage}

         Follow these rules strictly:
         1. Always start responses with key financial figures
         2. Present information in clear, direct statements
         3. Show all amounts in ₹ (INR)
         4. Be extremely concise
         5. Focus only on numbers and dates
         6. Do not use bullet points or dashes
         7. Each piece of information should be on its own line
         8. Avoid explanatory text unless absolutely necessary`;
    } else {
      const contractorData = await getContractorData();
      systemPrompt = `You are a financial manager for construction contractors. Use this data:
         Total Workers: ${contractorData.workersCount}
         
         Regular Pending Payments: ${contractorData.pendingPayments.count - contractorData.pendingPayments.urgentCount} workers (₹${contractorData.pendingPayments.totalAmount - contractorData.pendingPayments.urgentAmount})
         Urgent Pending Payments: ${contractorData.pendingPayments.urgentCount} workers (₹${contractorData.pendingPayments.urgentAmount})
         
         Daily Budget: ₹${contractorData.financials.dailyWagesBudget}
         Weekly Payouts: ₹${contractorData.financials.weeklyPayouts}
         Monthly Payroll: ₹${contractorData.financials.monthlyPayroll}
         Pending Approvals: ₹${contractorData.financials.pendingApprovals}
         
         Completion Rate: ${contractorData.performance.completionRate}%
         Attendance Rate: ${contractorData.performance.attendanceRate}%
         Efficiency Score: ${contractorData.performance.efficiencyScore}%

         Follow these rules strictly:
         1. Always start with key financial metrics
         2. Present information in clear, direct statements
         3. Show all amounts in ₹ (INR)
         4. Be extremely concise
         5. Focus on numbers, amounts, and dates
         6. Do not use bullet points or dashes
         7. Each piece of information should be on its own line
         8. Prioritize urgent financial matters
         9. Avoid explanatory text unless absolutely necessary`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    const answer = completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response.";
    
    // Generate follow-up suggestions focused on financial aspects
    const suggestionsCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: `You are a financial assistant generating follow-up questions.
          Based on the conversation between a ${userRole} and the assistant, suggest 3 relevant financial questions.
          Return EXACTLY 3 questions, one per line.
          Do not include any numbers, bullet points, or prefixes.
          Questions must be about:
          Payment amounts and dates
          Financial benefits and eligibility
          Earnings and performance metrics
          Make questions specific and number-focused.
          Example format:
          What is your expected payment for next week?
          Have you received your BOCW benefits this month?
          Would you like to review your attendance bonus status?` },
        { role: "user", content: message },
        { role: "assistant", content: answer }
      ],
      temperature: 0.3,
      max_tokens: 200
    });

    const suggestionsText = suggestionsCompletion.choices[0]?.message?.content || "";
    const suggestions = suggestionsText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^[-\d\.\)]\s*/, '')); // Remove any dashes, numbers, or bullets that might appear

    return {
      answer,
      suggestions: suggestions.slice(0, 3)
    };
  } catch (error: any) {
    console.error('Error generating response:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || error.message);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, userRole, workerId } = req.body;

    if (!message || !userRole) {
      return res.status(400).json({ error: 'Message and userRole are required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key is not configured' });
    }

    const response = await generateResponse(message, userRole, workerId);
    res.status(200).json(response);
  } catch (error: any) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'An error occurred while processing your request',
      details: error.message 
    });
  }
}