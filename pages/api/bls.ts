import { fetchBLSData } from '../../lib/api-helpers';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { seriesId, startYear, endYear } = req.query;
    
    if (!seriesId) {
      return res.status(400).json({ error: 'seriesId is required' });
    }

    const data = await fetchBLSData(
      seriesId as string,
      startYear as string,
      endYear as string
    );

    res.status(200).json(data);
  } catch (error) {
    console.error('BLS API error:', error);
    res.status(500).json({ error: 'Failed to fetch BLS data' });
  }
}