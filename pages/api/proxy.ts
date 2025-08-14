import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url, method = 'GET', headers = {}, body } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const response = await fetch(url, {
      method,
      headers: {
        ...headers,
        'User-Agent': 'AI-Career-Assistant/1.0'
      },
      body: method !== 'GET' ? body : undefined
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'Request failed' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}