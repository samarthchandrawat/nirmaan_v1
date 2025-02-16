import axios from 'axios';

const PERPLEXITY_API_KEY = process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY;
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

interface PerplexityResponse {
  id: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
}

interface FormattedResponse {
  answer: string;
  citations?: {
    url: string;
    text: string;
  }[];
  relevantLaws?: {
    name: string;
    description: string;
    source: string;
  }[];
}

export async function queryLaborLaw(query: string): Promise<FormattedResponse> {
  try {
    const response = await axios.post<PerplexityResponse>(
      PERPLEXITY_API_URL,
      {
        model: "pplx-7b-online",
        messages: [
          {
            role: 'system',
            content: `You are a legal assistant specializing in Indian labor laws and construction worker rights.
            Focus on:
            1. Building and Construction Workers Act
            2. Minimum Wages Act
            3. Payment of Wages Act
            4. Industrial Disputes Act
            5. BOCW Welfare Board regulations
            
            For each response:
            1. Cite specific sections of relevant laws
            2. Include links to official government sources
            3. Provide practical interpretation
            4. Highlight worker rights and protections
            5. Mention relevant court judgments if applicable`
          },
          {
            role: 'user',
            content: query
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Format the response
    return {
      answer: response.data.choices[0].message.content,
      citations: [], // Perplexity doesn't provide citations directly
      relevantLaws: [] // We would need to parse the content to extract these
    };
  } catch (error) {
    console.error('Perplexity API Error:', error);
    throw error;
  }
}

export async function generateDisputeReport(
  disputeData: {
    workerId: string;
    contractorId: string;
    issueType: string;
    description: string;
    evidenceUrls?: string[];
    amount?: number;
    dateReported: string;
  }
): Promise<FormattedResponse> {
  try {
    const prompt = `Generate a detailed labor dispute report for the following case:
    Worker ID: ${disputeData.workerId}
    Contractor ID: ${disputeData.contractorId}
    Issue Type: ${disputeData.issueType}
    Description: ${disputeData.description}
    Amount in Dispute: ${disputeData.amount ? `₹${disputeData.amount}` : 'N/A'}
    Date Reported: ${disputeData.dateReported}
    
    Analyze this case under relevant Indian labor laws and provide:
    1. Applicable legal provisions
    2. Worker's rights in this situation
    3. Recommended resolution steps
    4. Similar precedent cases
    5. Time limits for resolution
    6. Relevant authorities to approach`;

    const response = await axios.post<PerplexityResponse>(
      PERPLEXITY_API_URL,
      {
        model: "pplx-7b-online",
        messages: [
          {
            role: 'system',
            content: 'You are a legal expert generating formal dispute reports for construction worker cases. Focus on accuracy, citations, and actionable recommendations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      answer: response.data.choices[0].message.content,
      citations: [], // Perplexity doesn't provide citations directly
      relevantLaws: [] // We would need to parse the content to extract these
    };
  } catch (error) {
    console.error('Perplexity API Error:', error);
    throw error;
  }
}
