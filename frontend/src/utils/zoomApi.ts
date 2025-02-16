import axios from 'axios';

interface MediationSession {
  workerId: string;
  contractorId: string;
  disputeId: string;
  preferredTime?: string;
  disputeSummary: string;
}

interface ZoomMeeting {
  id: string;
  join_url: string;
  start_url: string;
  password: string;
  start_time: string;
}

async function getZoomAccessToken(): Promise<string> {
  try {
    const response = await axios.get('/api/zoom-token');
    return response.data.accessToken;
  } catch (error: any) {
    console.error('Error getting Zoom access token:', error.response?.data || error);
    throw new Error('Failed to get Zoom access token: ' + (error.response?.data?.message || error.message));
  }
}

async function getZoomUserId(accessToken: string): Promise<string> {
  try {
    const response = await axios.get('https://api.zoom.us/v2/users/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    return response.data.id;
  } catch (error: any) {
    console.error('Error getting Zoom user ID:', error.response?.data || error);
    throw new Error('Failed to get Zoom user ID: ' + (error.response?.data?.message || error.message));
  }
}

export async function scheduleMediationCall(session: MediationSession): Promise<ZoomMeeting> {
  try {
    // Get OAuth access token
    const accessToken = await getZoomAccessToken();

    // Get user ID
    const userId = await getZoomUserId(accessToken);

    // Format the start time
    const startTime = session.preferredTime 
      ? new Date(session.preferredTime).toISOString()
      : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Schedule meeting using OAuth token
    const response = await axios.post(
      `https://api.zoom.us/v2/users/${userId}/meetings`,
      {
        topic: `Wage Dispute Mediation - Case #${session.disputeId}`,
        type: 2, // Scheduled meeting
        start_time: startTime,
        duration: 60,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          waiting_room: true,
          meeting_authentication: false,
          alternative_hosts: "",
          registrants_email_notification: false,
          agenda: `Wage Dispute Mediation Session\n\nCase ID: ${session.disputeId}\nWorker ID: ${session.workerId}\nContractor ID: ${session.contractorId}\n\nDispute Summary:\n${session.disputeSummary}`
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      id: response.data.id,
      join_url: response.data.join_url,
      start_url: response.data.start_url,
      password: response.data.password,
      start_time: response.data.start_time
    };
  } catch (error: any) {
    console.error('Error scheduling Zoom meeting:', error.response?.data || error);
    throw new Error('Failed to schedule Zoom meeting: ' + (error.response?.data?.message || error.message));
  }
}

export async function notifyParticipants(meeting: ZoomMeeting, session: MediationSession) {
  // This would integrate with your notification system (email, SMS, in-app)
  // For now, we'll just return the meeting details
  return {
    meeting,
    participants: {
      worker: {
        id: session.workerId,
        join_url: meeting.join_url
      },
      contractor: {
        id: session.contractorId,
        join_url: meeting.join_url
      },
      mediator: {
        start_url: meeting.start_url
      }
    }
  };
}
