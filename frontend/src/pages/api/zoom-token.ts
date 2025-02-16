import { NextApiRequest, NextApiResponse } from 'next';
import axios, { AxiosResponse } from 'axios';

// In-memory token cache (consider using Redis or another caching solution in production)
let tokenCache: {
  accessToken: string;
  expiresAt: number;
} | null = null;

interface ZoomOAuthResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

async function getNewToken() {
  try {
    if (!process.env.ZOOM_CLIENT_ID || !process.env.ZOOM_CLIENT_SECRET || !process.env.ZOOM_ACCOUNT_ID) {
      throw new Error('Missing required Zoom credentials');
    }

    const credentials = Buffer.from(
      `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
    ).toString('base64');

    const formData = new URLSearchParams();
    formData.append('grant_type', 'account_credentials');
    formData.append('account_id', process.env.ZOOM_ACCOUNT_ID);

    const response: AxiosResponse<ZoomOAuthResponse> = await axios.post(
      'https://zoom.us/oauth/token',
      formData,
      {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    if (!response.data.access_token) {
      console.error('Zoom response:', response.data);
      throw new Error('No access token received from Zoom');
    }

    const { access_token, expires_in } = response.data;
    
    // Cache the token
    tokenCache = {
      accessToken: access_token,
      expiresAt: Date.now() + (expires_in * 1000) - 300000 // Expire 5 minutes early
    };

    return access_token;
  } catch (error: any) {
    console.error('Error getting Zoom access token:', {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    
    throw new Error(
      'Failed to get Zoom access token: ' + 
      (error.response?.data?.message || error.response?.data?.reason || error.message)
    );
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if we have a valid cached token
    if (tokenCache && tokenCache.expiresAt > Date.now()) {
      return res.status(200).json({ accessToken: tokenCache.accessToken });
    }

    // Get new token
    const accessToken = await getNewToken();
    res.status(200).json({ accessToken });
  } catch (error: any) {
    console.error('Token error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    
    res.status(500).json({
      error: 'Failed to get access token',
      details: error.message,
      zoomError: error.response?.data
    });
  }
}
