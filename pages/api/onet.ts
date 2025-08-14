import { fetchONetData } from '../../lib/api-helpers';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { onetCode } = req.query;
    
    if (!onetCode) {
      return res.status(400).json({ error: 'onetCode is required' });
    }

    const data = await fetchONetData(onetCode as string);
    res.status(200).json(data);
  } catch (error) {
    console.error('O*NET API error:', error);
    res.status(500).json({ error: 'Failed to fetch O*NET data' });
  }
}