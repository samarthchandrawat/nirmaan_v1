import { NextApiRequest, NextApiResponse } from 'next';
import { scheduleMediationCall, notifyParticipants } from '@/utils/zoomApi';
import { generateDisputeReport } from '@/utils/perplexityApi';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      workerId,
      contractorId,
      disputeId,
      description,
      preferredTime,
      amount
    } = req.body;

    // Validate required fields
    if (!workerId || !contractorId || !disputeId || !description || !preferredTime) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'All fields (workerId, contractorId, disputeId, description, preferredTime) are required'
      });
    }

    // Validate date format
    if (isNaN(new Date(preferredTime).getTime())) {
      return res.status(400).json({
        error: 'Invalid date format',
        details: 'preferredTime must be a valid ISO date string'
      });
    }

    try {
      // Generate AI dispute report
      console.log('Generating dispute report...');
      const disputeReport = await generateDisputeReport({
        workerId,
        contractorId,
        issueType: 'wage_dispute',
        description,
        amount,
        dateReported: new Date().toISOString()
      });
      console.log('Dispute report generated successfully');

      // Schedule Zoom meeting
      console.log('Scheduling Zoom meeting...');
      const meeting = await scheduleMediationCall({
        workerId,
        contractorId,
        disputeId,
        preferredTime,
        disputeSummary: disputeReport.answer
      });
      console.log('Zoom meeting scheduled successfully:', meeting.id);

      // Notify all participants
      console.log('Notifying participants...');
      const notifications = await notifyParticipants(meeting, {
        workerId,
        contractorId,
        disputeId,
        preferredTime,
        disputeSummary: disputeReport.answer
      });
      console.log('Participants notified successfully');

      res.status(200).json({
        success: true,
        meeting: notifications,
        disputeReport
      });
    } catch (error: any) {
      // Check if it's a Zoom-related error
      if (error.message.includes('Zoom')) {
        console.error('Zoom API error:', error);
        return res.status(503).json({
          error: 'Zoom service unavailable',
          details: 'Unable to schedule Zoom meeting. Please try again later.'
        });
      }

      throw error; // Re-throw other errors
    }
  } catch (error: any) {
    console.error('Mediation scheduling error:', {
      message: error.message,
      response: error.response?.data,
      stack: error.stack
    });

    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || error.message;

    res.status(statusCode).json({
      error: 'Failed to schedule mediation',
      details: errorMessage,
      step: error.step // Track which step failed
    });
  }
}
