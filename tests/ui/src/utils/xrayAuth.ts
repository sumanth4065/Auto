import axios from 'axios';

export async function getXrayToken(): Promise<string> {
  const response = await axios.post(
    'https://xray.cloud.getxray.app/api/v1/authenticate',
    {
      client_id: process.env.XRAY_CLIENT_ID,
      client_secret: process.env.XRAY_CLIENT_SECRET,
    },
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  return response.data;
}
